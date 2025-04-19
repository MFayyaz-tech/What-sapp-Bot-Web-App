module.exports = (data) => {
  if (process.env.LOGGER == true || process.env.LOGGER == "true")
    console.log(data);
};
