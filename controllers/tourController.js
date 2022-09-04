/* eslint-disable no-console */
// const express = require('express');
const { query } = require('express');
const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const Tour = require('./../models/tourModel');
const APIfeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage(); //Using this, the image will be stored as a buffer
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images', 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]); //This will be availaible on req.files
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  console.log(req.files);
  if (!req.files.images || !req.files.imageCover) return next();
  // Processing the cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333) //3 to 2 ratio i.e 3:2
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);
  // Processing images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpg`;
      // req.body.images.push(filename)
      await sharp(file.buffer)
        .resize(2000, 1333) //3 to 2 ratio i.e 3:2
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    })
  );
  next();
});
// upload.arr("images",5)//req.files
// const app = require('../app');
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );
// exports.checkId = (req, res, next, val) => {
// const id = +req.params.id;
// if (val > tours.length)
//   return res.status(404).json({
//     status: 'fail',
//     message: 'Invalid Id',
//   });
//   console.log(`Tour id is ${val}`);
//   next();
// };
// exports.checkBody = (req, res, next) => {
//   console.log(req.body);

//   const keysArray = Object.keys(req.body);
//   console.log(keysArray);
//   console.log(!keysArray.includes('name') && !keysArray.includes('name'));
//   // from Jonas
//   // if(!req.body.name || !req.body.price )
//   if (!keysArray.includes('name') || !keysArray.includes('price'))
//     return res.status(400).json({
//       status: 400,
//       message: 'Bad request',
//     });
//   next();
// };
exports.aliasTopTours = function (req, res, next) {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};
exports.getAllTours = factory.getAll(Tour);

exports.createTour = factory.createOne(Tour);
// console.log(req.body);
// fs.writeFile(`${}`)
// console.log(tours);
// console.log(tours[tours.length - 1].id);
// console.log(req.body);

// const newId = tours[tours.length - 1].id + 1;
// const newTour = { id: newId, ...req.body };
// console.log(newTour);

// tours.push(newTour);

// fs.writeFile(
//   `${__dirname}/../dev-data/data/tours-simple.json`,
//   // JSON.stringify(tours),
//   (err) => {
//     res.status(201).json({
//       status: 'success',
//       data: {
//         tour: newTour,
//       },
//     });
//   }
// );
// res.send('Done!!');
// try {

// } catch (err) {
//   res.status(400).json({
//     status: 'fail',
//     message: err,
//   });
// }

exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.updateTour = factory.updateOne(Tour);
// console.log(app);

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(new AppError('No tour found with that id', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: 'Tour succesfully deleted',
//   });
// });
exports.deleteTour = factory.deleteOne(Tour);
exports.getTourStats = catchAsync(async function (req, res, next) {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        // _id: null,
        // _id: '$ratingsAverage', //just the name of any field can be null if you want to get for all
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRatings: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);
  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = +req.params.year; //2021
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStart: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStart: -1 },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'success',
    results: plan.length,
    data: { plan },
  });
});
// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/-40,45/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng)
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat.lng',
        400
      )
    );
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  }); //radius must be in radians
  console.log(distance, lat, lng, unit);
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng)
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat.lng',
        400
      )
    );
  const distances = await Tour.aggregate([
    //  For geospatial aggregation, there is only one single stage called geoNear
    // geoNear always needs to be the first stage
    // and atleast one of the fields must have a geospatial index in our case the startLocation has it
    {
      $geoNear: {
        near: {
          type: 'point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    // results: tours.length,
    data: {
      data: distances,
    },
  });
});
