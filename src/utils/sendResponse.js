const sendResponse = async (res, statusCode, message, status, data, logId) => {
  if (data) {
    res.status(statusCode).send({ message, status, data });
    return;
  } else {
    res.status(statusCode).send({ message, status });
    return;
  }
};

module.exports = sendResponse;
