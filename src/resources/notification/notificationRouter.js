const express = require("express");
const controller = require("./notificationController");

const {
  authUser,
  authAdmin,
} = require("../../middleware/authentication.middleware");
const notificationRouter = express.Router();
// Routes
notificationRouter
  .route("/")
  .post(authAdmin, controller.create)
  .get(authUser, controller.getAll);
notificationRouter.route("/:id").get(authUser, controller.getOne);

module.exports = notificationRouter;
