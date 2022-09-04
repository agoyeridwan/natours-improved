const mongoose = require('mongoose');
const dotenv = require('dotenv');
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION Shutting down......');
  process.exit(1);
});
dotenv.config({ path: './config.env' });
const app = require('./app');
const port = process.env.PORT || 3000;
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
const DBLocal = process.env.DATABASE_LOCAL;
mongoose
  // .connect(DB, {
  .connect(DBLocal, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    // console.log(con.connection);
    console.log('DB connection successful');
  });
// .catch(() => console.log('ERROR'));
// 7UerckibpyYKbG8Q
// skoHV5rVkcrTvHUp
// const port = 3000;

// const testTour = new Tour({
//   name: 'The Park Camper',
//   price: 997,
// });
// testTour
//   .save()
//   .then((doc) => console.log(doc))
//   .catch((err) => console.log(err));
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
// console.log(process.env.NODE_ENV);
// Handling unhandled rejected promise
process.on('unhandledRejection', (err) => {
  console.log(err);
  console.log('UNHANDLED REJECTION Shutting down......');
  server.close(() => {
    process.exit(1);
  });
});
// Handling uncaught exceptions
