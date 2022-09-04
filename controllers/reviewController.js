const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
exports.setTourUser = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  console.log('Here is my name');
  console.log('The parameters are', req.params.id, req.user.id);
  next();
};
exports.reviewBookedTour = catchAsync(async (req, res, next) => {
  // const bookedTour = [];
  const bookedUser = await Booking.find({ user: req.user.id });
  console.log('The booked tour is', bookedUser);
  // bookedUser.forEach((el) => {
  //   bookedTour.push(el.tour.id);
  // });
  const bookedTour = bookedUser.map((el) => {
    return el.tour.id;
  });
  // console.log(bookedTour);
  // console.log(req.params.tourId);
  if (!bookedTour.includes(req.params.tourId))
    return next(
      new AppError('You are unable to review tour, please book tour to review ')
    );
  next();
});
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
