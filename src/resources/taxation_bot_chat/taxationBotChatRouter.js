const express = require("express");
const controller = require("./taxationBotChatController");
const {
  authUser,
  authAdmin,
} = require("../../middleware/authentication.middleware");
const taxationBotChatRouter = express.Router();
// Routes
taxationBotChatRouter.route("/").get(authAdmin, controller.getUsersChats);
taxationBotChatRouter.route("/user").get(authAdmin, controller.getUserChats);
taxationBotChatRouter.route("/userlist").get(authAdmin, controller.userList);
taxationBotChatRouter.route("/user").patch(authAdmin, controller.updateUser);

taxationBotChatRouter
  .route("/states")
  .get(authAdmin, controller.dashboardStates);
taxationBotChatRouter.route("/graph").get(authAdmin, controller.graphStates);

module.exports = taxationBotChatRouter;
