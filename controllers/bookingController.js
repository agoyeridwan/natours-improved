const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const Tour = require('../models/tourModel');
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  // 2) Create checkout session
  //   Information about the session itself
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    // Information about the product a user is about to purchase
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
  });
  // Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});
// name: `${tour.name} Tour`,
// description: tour.summary,
// images: [
//   `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
// ],
// amount: tour.price * 100,
// currency: 'usd',
// quantity: 1,
exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // This is only temporary because it is unsecure so everyone can make a booking without paying
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });
  // originalUrl is the entire url in which the request is made
  // redirect creates a new request to the specified url
  res.redirect(req.originalUrl.split('?')[0]);
});
