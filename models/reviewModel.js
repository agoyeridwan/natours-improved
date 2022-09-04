const mongoose = require('mongoose');
const Tour = require('./../models/tourModel');
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  //this keyword here points to the current model in this case the review model
  // if it is the schema.methods, then this points to the document created from the schema
  console.log(tourId);
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour', //this is also the tour id but have been changed to tour in match
        nRating: { $sum: 1 }, //Calculating the numbers of reviews in the tour
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};
reviewSchema.post('save', function () {
  // this points to the current review
  // The constructor is the model which created that document that is review
  // Post middleware doens't get access to next
  this.constructor.calcAverageRatings(this.tour);
});
reviewSchema.pre(/^findOneAnd/, async function (next) {
  console.log('The first constructor in query is', this.constructor);
  next();
});
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // console.log('The first constructor in query is', this.constructor);
  this.r = await this.findOne();
  // console.log(this.r);
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  // this.findOne does not work here because the query has already executed
  // console.log('The query constructor is', this.r.constructor);
  await this.r.constructor.calcAverageRatings(this.r.tour);
});
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
/*reviewSchema.statics.calcAverageRatings = function(tourId){

  this.aggregate([
    {$match:{tour: tourId}},
    {$group:{
      _id: null,
      nRatings: {sum: 1},
      avgRatings:{$avg:"$ratings"}
    }}
  ])
  this.findByIdAndUpdate(tourId,{
 
  })
}
  reviewSchema.post("save", function(){
    this.constructor.calcAverageRatings(this.tour)
  })
*/
