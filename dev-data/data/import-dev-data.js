const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const Tour = require('./../../models/tourModel');
const Review = require('./../../models/reviewModel');
const User = require('./../../models/userModel');
// const DB = process.env.DATABASE.replace(
//   '<PASSWORD>',
//   process.env.DATABASE_PASSWORD
// );
const DB = `mongodb+srv://Agoye:skoHV5rVkcrTvHUp@cluster0.tyegv.mongodb.net/natours?retryWrites=true&w=majority`;
const DBLocal = process.env.DATABASE_LOCAL;

mongoose
  .connect(DB, {
    // .connect(DBLocal, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    // console.log(con.connection);
    console.log('DB connection successful');
  });
//   Read JSON file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);
// console.log(tours);
// import data into database
const importData = async () => {
  try {
    await Tour.create(tours, { validateBeforeSave: false });
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Data successfully imported');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
// Delete all data from collection
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted!!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
// importData();
if (process.argv.includes('--import')) importData();
if (process.argv.includes('--delete')) deleteData();
// console.log(process.argv);
