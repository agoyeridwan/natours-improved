const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoute');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');
// start express app
const app = express();
const cookieParser = require('cookie-parser');
// setting the view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// 1) GLOBAL MIDDLEWARES
// Serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));
// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); //body-parser
app.use(express.urlencoded({ extended: true, limit: '10kb' })); //for parsing formdata
app.use(cookieParser()); //for parsing cookie to the browser
// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  // console.log(req.cookies);
  next();
});

// 3) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/bookings', bookingRouter);
//3 routes
app.use('/api/v1/tours', tourRouter); //it is called mounting a new router on a route
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
// app.get('/', (req, res) => {
//   //   res.status(200).send('hello from the server side');
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side!', App: 'Natours' });
// });
// app.post('/', (req, res) => {
//   res.send('You can post to this endpoint');
// });
//(req,res) function is called the route handler

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
//get response with a unique identifier
// /api/v1/tours/:id/:da/:cool?
// app.get('/api/v1/tours/:id', getTour);
// //Handling patch request
// app.patch('/api/v1/tours/:id', updateTour);

// app.delete('/api/v1/tours/:id', deleteTour);
//Routes
//start server
app.all('*', function (req, res, next) {
  // res.status(404).json({
  //   status: 'Fail',
  //   message: `can't find ${req.originalUrl} on this server`,
  // });

  // Creating an error
  // const err = new Error(`can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});
// Error handling middleware
app.use(globalErrorHandler);
// console.log('The date is', Date.now().getTime());
module.exports = app;
