const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const tourModel = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');
exports.getOverview = catchAsync(async (req, res, next) => {
  // 1 get all tour data from the collection
  const tours = await Tour.find();
  // 2 build template

  // Render the tour template using the tour data from step 1
  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});
exports.getTour = catchAsync(async (req, res, next) => {
  //1. get the data from the requested tour including the lead and guide
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'review rating user',
  });
  if (!tour) return next(new AppError('There is no tour with that name', 404));
  console.log('The slug is', req.params.slug);
  console.log(tour);
  // 2. Build template

  // 3.Render template using data from 1
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});
exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};
exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'sign up to start experiencing natours',
  });
};
exports.getMe = (req, res) => {
  res.status(200).render('account', {
    title: 'My profile',
  });
};
exports.updateUserData = catchAsync(async (req, res) => {
  // console.log('Updating password', req.body);
  console.log(req.user);
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  console.log('The updated user is', updatedUser);
  res.status(200).render('account', {
    title: 'my profile',
    user: updatedUser,
  });
});
exports.getMyTours = catchAsync(async (req, res, next) => {
  // console.log(req.user.id);
  // const bookedTour = await Booking.find({ user: req.user.id }).select('tour');
  // res.status(200).json({
  //   status: 'success',
  //   bookedTour,
  // });
  // console.log('The bookedTour is', bookedTour);
  const bookings = await Booking.find({ user: req.user.id });
  const tourIDs = bookings.map((el) => el.tour);
  // The $in operator is similar to the javascript includes
  const tours = await Tour.find({ _id: { $in: tourIDs } });
  console.log('The tours are', tours);
  res.status(200).render('overview', {
    title: 'My tours',
    tours,
  });
});
/*The bookedTour is [
  {
    _id: 6310096a681c062de4d0f66f,
    tour: {
      guides: [Array],
      _id: 5c88fa8cf4afda39709c2955,
      name: 'The Sea Explorer',
      duartionWeeks: NaN,
      id: '5c88fa8cf4afda39709c2955'
    },
    user: {
      photo: 'user-1.jpg',
      role: 'admin',
      _id: 5c8a1d5b0190b214360dc057,
      name: 'Jonas  Schmedtmann',
      email: 'admin@natours.io',
      __v: 0
    }
  }
]
query took 6 milliseconds
[
  {
    guides: [ [Object], [Object] ],
    _id: 5c88fa8cf4afda39709c2955,
    name: 'The Sea Explorer',
    duartionWeeks: NaN,
    id: '5c88fa8cf4afda39709c2955'
  }
]
query took 7 milliseconds
[
  {
    startLocation: {
      type: 'Point',
      description: 'Miami, USA',
      coordinates: [Array],
      address: '301 Biscayne Blvd, Miami, FL 33132, USA'
    },
    ratingsAverage: 4.8,
    ratingsQuantity: 6,
    images: [ 'tour-2-1.jpg', 'tour-2-2.jpg', 'tour-2-3.jpg' ],
    createdAt: 2022-08-22T19:38:53.477Z,
    startDates: [
      2021-06-19T09:00:00.000Z,
      2021-07-20T09:00:00.000Z,
      2021-08-18T09:00:00.000Z
    ],
    secretTour: false,
    guides: [ [Object], [Object] ],
    _id: 5c88fa8cf4afda39709c2955,
    name: 'The Sea Explorer',
    duration: 7,
    maxGroupSize: 15,
    difficulty: 'medium',
    price: 497,
    summary: 'Exploring the jaw-dropping US east coast by foot and by boat',
    description: 'Consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n' +
      'Irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident,
sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    imageCover: 'tour-2-cover.jpg',
    locations: [ [Object], [Object], [Object], [Object] ],
    slug: 'the-sea-explorer',
    __v: 0,
    duartionWeeks: 1,
    id: '5c88fa8cf4afda39709c2955'
  }
]
The tours are [
  {
    startLocation: {
      type: 'Point',
      description: 'Miami, USA',
      coordinates: [Array],
      address: '301 Biscayne Blvd, Miami, FL 33132, USA'
    },
    ratingsAverage: 4.8,
    ratingsQuantity: 6,
    images: [ 'tour-2-1.jpg', 'tour-2-2.jpg', 'tour-2-3.jpg' ],
    createdAt: 2022-08-22T19:38:53.477Z,
    startDates: [
      2021-06-19T09:00:00.000Z,
      2021-07-20T09:00:00.000Z,
      2021-08-18T09:00:00.000Z
    ],
    secretTour: false,
    guides: [ [Object], [Object] ],
    _id: 5c88fa8cf4afda39709c2955,
    name: 'The Sea Explorer',
    duration: 7,
    maxGroupSize: 15,
    difficulty: 'medium',
    price: 497,
    summary: 'Exploring the jaw-dropping US east coast by foot and by boat',
    description: 'Consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n' +
      'Irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident,
sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    imageCover: 'tour-2-cover.jpg',
    locations: [ [Object], [Object], [Object], [Object] ],
    slug: 'the-sea-explorer',
    __v: 0,
    duartionWeeks: 1,
    id: '5c88fa8cf4afda39709c2955'
  }
] */
