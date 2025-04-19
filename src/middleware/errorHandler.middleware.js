const sendResponse = require("../utils/sendResponse");
const responseStatusCodes = require("../utils/responseStatusCode");

async function errorHandler(err, req, res, next) {
  console.log("here called");

  if (err && err.code === 11000) {
    let errorKey = Object.keys(err.keyPattern || {}).toString();
    errorKey = upperCaseFirst(errorKey);
    res.status(400).send({ message: `${errorKey} already exists` });
  } else if (err.name === "ValidationError" && err.errors) {
    const firstErrorKey = Object.keys(err.errors)[0];
    console.log("firstErrorKey: ", firstErrorKey);
    res.status(400).send({ message: err.errors[firstErrorKey].message });
    // You can uncomment the following lines if you want to send all validation errors
    // const errorMessages = Object.values(err.errors).map((val) => val.message);
    // res.status(400).send({ msg: errorMessages });
  } else {
    await sendResponse(
      res,
      responseStatusCodes.BAD,
      err.message,
      false,
      null,
      null
    );
  }
}

function upperCaseFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = errorHandler;
