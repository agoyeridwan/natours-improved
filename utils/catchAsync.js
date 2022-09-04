module.exports = (fn) => {
  return (req, res, next) => {
    // Calling the async function
    fn(req, res, next).catch(next);
  };
};
