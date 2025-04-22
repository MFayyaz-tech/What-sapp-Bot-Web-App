const express = require("express");
const controller = require("./userController");
const { validateRequest } = require("../../utils/validateRequest");
const userValidator = require("./userValidator");
const { authUser } = require("../../middleware/authentication.middleware");
const userRouter = express.Router();
// Routes
userRouter.patch("/resetPassword/:id", controller.resetPassword);
userRouter
  .route("/signup")
  .post(validateRequest(userValidator.signup), controller.webSignup);
userRouter
  .route("/login")
  .post(validateRequest(userValidator.login), controller.webLogin);
userRouter.route("/").get(controller.getAll);
userRouter.post("/requestOtp", controller.sendOtp);
userRouter.post("/verifyOtp", controller.verifyOtp);
userRouter.patch("/forgotPassword", controller.forgotPassword);
userRouter.post("/refreshToken", controller.refreshToken);
userRouter
  .route("/:id")
  .get(controller.getOne)
  .patch(authUser, validateRequest(userValidator.update), controller.update)
  .delete(controller.deleteUser);

module.exports = userRouter;
