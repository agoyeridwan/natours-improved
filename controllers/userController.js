// const APIfeatures = require("./../utils/apiFeatures");
const multer = require('multer'); //for multipart form data i.e file upload
const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const sharp = require('sharp'); //Image processing library for nodejs
// The storage is a complete definition of how we want to store our files
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     // user-id-currenttimestamp.jpg
//     // e.g user-123456788765-34567654324.jpg
//     const ext = file.mimetype.split('/')[1]; //ext stands for extension
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });
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
const filterObj = function (obj, ...allowedFields) {
  const newObject = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObject[el] = obj[el];
    }
  });
  return newObject;
};
//Photo is the name of the field i.e html form field that holds the file
exports.uploadUserPhoto = upload.single('photo');
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  // This means that if there is no image upload, the route should continue to the next middleware
  if (!req.file) return next();
  // The stored buffer is then availaible on req.file.buffer
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});
exports.getAllUsers = factory.getAll(User);
exports.getme = (req, res, next) => {
  req.params.id = req.user.id;
  console.log(req.user.id);
  console.log('getting the current user');
  next();
};

exports.getUser = factory.getOne(User);
// Do not update password with this
exports.deleteUser = factory.deleteOne(User);
exports.updateUser = factory.updateOne(User);
exports.createUser = function (req, res) {
  res.status(200).json({
    status: 'success',
    message: 'This route is not defined! please use /signup instead',
  });
};
exports.updateMe = catchAsync(async function (req, res, next) {
  // 1) Create error if user posts password data
  console.log(req.file);
  console.log(req.body);
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'This route is not for password updates please use /updateMyPassword',
        400
      )
    );
  // 3) Filtering out unwanted field names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;
  // 3)Update user's document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'sucess',
    user: updatedUser,
  });
});
/*
const filterObj = function(obj,...others){
const newObj = {};
others.forEach(el =>{
  if(object.keys(obj).includes(el)) newObj[el] = obj[el]
})
return newObj
}
*/
exports.deleteMe = catchAsync(async function (req, res, next) {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
