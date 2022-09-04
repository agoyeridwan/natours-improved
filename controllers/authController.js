const { promisify } = require('util');
const crypto = require('crypto');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

const createSendToken = function (user, statuscode, res) {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // so that the cookie can only be sent over secured http i.e https
    // secure: true,
    // So that the cookie can't be modified by the browser
    httpOnly: true, //This means that we cannot manipulate the cookie in any way, not even destroy it
  };
  const token = signToken(user._id);
  // const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
  //   expiresIn: process.env.JWT_EXPIRES_IN,
  // });
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  // Remaove the password from the output
  user.password = undefined;
  res.status(statuscode).json({
    status: 'Success',
    token,
    data: {
      user,
    },
  });
};
const signToken = function (id) {
  return (token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  }));
};
/*
if(!this.password.isModified) next();
userSchema.pre("save", function(next){
  this.password = bcrypt.hash(this.password,14);
this.passwordConfirm = undefined
next(); 
})
*/
exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    // passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
  // const token = signToken(newUser._id);
  // const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
  //   expiresIn: process.env.JWT_EXPIRES_IN,
  // });
  // res.status(201).json({
  //   status: 'Success',
  //   token,
  //   data: {
  //     user: newUser,
  //   },
  // });
  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url);

  const sentEmail = await new Email(newUser, url).sendWelcome();
  if (!(await sentEmail))
    return next(new AppError('There is a problem sending a mail', 404));
  createSendToken(newUser, 201, res);
});
exports.login = catchAsync(async function (req, res, next) {
  const { email, password } = req.body;
  // 1. Check if email and password actually exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  //2. check if user exist and if password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3. If everything is ok send the token to the client

  // const token = signToken(user._id);
  // res.status(200).json({
  //   status: 'Success',
  //   token,
  // });
  createSendToken(user, 200, res);
});
// logging out user
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status('200').json({ status: 'success' });
};
// Only for rendered pages and there will be no error
exports.isLoggedIn = async (req, res, next) => {
  try {
    // 1). Getting the token and check if it exits
    if (req.cookies.jwt) {
      // console.log(token);

      // 2). Verification of the token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      console.log(decoded);
      //3) Check if the user still exist
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      // 4)Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      // There is a logged in user
      // This is just like parsing data into templates using the render function
      res.locals.user = currentUser;
      // req.user = currentUser;
      // return next();
    }
  } catch (error) {
    return next();
  }

  next();
};
// The protect middleware is to ensure that only logged in users are able to get access to the
// routes in which the protect middleware is attached it is just like a passport used for sending the
// jwt token to actually verify the user
exports.protect = catchAsync(async (req, res, next) => {
  // 1). Getting the token and check if it exits
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // console.log(token);
  if (!token)
    next(new AppError('You are not logged in please login to get access', 401));
  // 2). Verification of the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);
  //3) Check if the user still exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user with this token no longer exist', 401));
  }
  // 4)Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password please log in again', 401)
    );
  }
  // Grant access to protscted route
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});
// Start from here next time
exports.restrictTo = function (...roles) {
  return (req, res, next) => {
    // roles is an array ["admin","lead-guide"]. role = "user"
    if (!roles.includes(req.user.role)) {
      next(new AppError('You do not have permission to perform thus action'));
    }
    next();
  };
};
exports.forgotPassword = catchAsync(async function (req, res, next) {
  const { email } = req.body;
  // get user based on posted email
  const user = await User.findOne({ email });
  console.log(user);
  if (!user)
    return next(
      new AppError('There is no user with the specified email address', 404)
    );
  // generate the random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // const message = `Forgot your password? submit a patch request with your new
  // password and passwordConfirm to the ${resetURL}.\n if you didn't
  // forget your password please ignore this email`;
  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: ' Your password reset token (valid for 10 mins)',
    //   message,
    // });
    // send it to user's email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (error) {
    user.createPasswordResetToken = undefined;
    user.createPasswordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(error);
    return next(
      new AppError('There was an error sending the email. Try again later', 500)
    );
  }
});
exports.resetPassword = catchAsync(async function (req, res, next) {
  // 1.) Get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2.)If token as not expired and user exist, then set the new password
  if (!user) return next(new AppError('Token is invalid or has expired', 400));
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3.)Update the changedPasswordAt property for the current user

  // 4).Log the user in i.e sending the web token to the client
  // const token = signToken(user._id);
  // res.status(200).json({
  //   status: 'success',
  //   token,
  // });
  createSendToken(user, 200, res);
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1 update the user from the collection
  const user = await User.findById(req.user.id).select('+password');
  // 2) Check if the posted password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
    return next(new AppError('Your current password is wrong', 401));
  // 3)If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will not work
  // 4) Log user in, send jwt
  const token = signToken(user._id);
  // res.status(400).json({
  //   status: 'success',
  //   token,
  // });
  createSendToken(user, 200, res);
});
