const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const colors = require("colors");
// Connect to MongoDB using the provided URI from the environment variables
mongoose
  .connect(process.env.DATABASE)
  .then(() => {
    console.log(colors.yellow.bold("Database connected"));
  })
  .catch((err) => {
    console.error(colors.red.bold("MongoDB connection error:"), err);
  });
