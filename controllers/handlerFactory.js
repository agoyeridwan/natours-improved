const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIfeatures = require('./../utils/apiFeatures');
exports.deleteOne = (model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError(`No ${model} found with that id`, 404));
    }
    res.status(204).json({
      status: 'success',
      data: 'Tour succesfully deleted',
    });
  });
};
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError(`No ${Model} found with that id`, 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    // console.log(req.params);
    // const id = +req.params.id;
    // const tour = tours.find((e) => e.id === id);
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) {
      return next(new AppError(`No ${Model} found with that id`, 404));
    }
    //const tour = await Tour.findById({_id:req.params.id})
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });

    // console.log(tour);
  });
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // To allow for nestedGET reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    // console.log(req.requestTIme);

    // Building the query
    //1) simple query
    // const queryObject = { ...req.query };
    // const excludeFields = ['page', 'sort', 'limit', 'fields'];
    // excludeFields.forEach((el) => delete queryObject[el]);
    // // console.log(req.query, queryObject);
    // console.log(req.query);
    // // Advanced query
    // let queryStr = JSON.stringify(queryObject);
    // queryStr = queryStr.replace(/\b(gte|lt|lte|gt)\b/g, (match) => `$${match}`);
    // // console.log(JSON.parse(queryStr));
    // console.log('This is the query object', queryObject);
    // let query = Tour.find(JSON.parse(queryStr)); //This returns a query
    // const tours = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');
    // console.log(req.query);
    //Executing the query
    // 2) sorting

    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');
    //   console.log(sortBy);
    //   query = query.sort(sortBy);
    // } else {
    //   // query = query.sort('-createdAt');
    // }
    //3) fields limiting also known as projecting
    // if (req.query.fields) {
    //   const fields = req.query.fields.split(',').join(' ');
    //   console.log('The field is ', fields);
    //   query = query.select(fields);
    // } else {
    //   query = query.select('-__v');
    // }
    // 4) pagination
    // page=2&limit=10 this means that 1-10 are from page 1 and 11-20 are for page 2
    // const page = req.query.page * 1 || 1; //basically a way of defining default value in javascript
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;
    // query = query.skip(skip).limit(limit);
    // if (req.query.page) {
    //   const newTour = await Tour.countDocuments();
    //   if (skip >= newTour) {
    //     throw new Error('This page does not exist');
    //   }
    // }
    //executing the tour            //queryObject,queryString
    // Jonas used Tours.find()
    const features = new APIfeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // console.log(features);
    // cont tours = awiat query
    const doc = await features.query;
    // const doc = await features.query.explain();
    // Sending response
    //Tour.find({price: ${gte:500}})
    //

    // console.log(req.query);

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTIme,
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
