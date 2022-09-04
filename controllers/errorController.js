const AppError = require('./../utils/appError');
const handleDuplicateFieldsDB = function (err) {
  const value = err.message.match(/([""])(\\?.)*?\1/)[0];
  console.log(value);
  const message = `Duplicate field value : ${value}. please use another value`;
  return new AppError(message, 400);
};
const handleJWTExpiredError = () =>
  new AppError('Your token has expired please log in again', 401);
const handleValidationErrorDB = function (err) {
  const errors = Object.values(err.errors).map((data) => data.message);
  const message = `invalid Input data ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const handleCastErrorDB = (err) => {
  const message = `Invlaid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
const handleJWTError = (err) =>
  new AppError('Invalid token. Please log in again', 401);
const sendErrorForDev = function (err, req, res) {
  // API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  } else {
    // Rendered website
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
};
const sendErrorForProd = function (err, req, res) {
  // Operational error i.e trusted error: send message to client
  // const err = err;
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
      //   // Programming or other unknown eror: don't want to leak the details to the client
    }
    // 1) log Error
    console.error(err);
    // 2) send a generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
  // For rendered website
  if (err.isOperational) {
    console.log('error nla');
    console.log(err);
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
    //   // Programming or other unknown eror: don't want to leak the details to the client
  }
  // 1) log Error
  // 2) send a generic message
  return res.status(500).render({
    title: 'Something went wrong',
    msg: 'Please try again later.',
  });
};
module.exports = (err, req, res, next) => {
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorForDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError(err);
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorForProd(error, req, res);
  }
};
