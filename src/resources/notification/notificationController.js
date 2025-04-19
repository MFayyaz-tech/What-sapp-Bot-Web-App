const asyncHandler = require("express-async-handler");
const notificationService = require("./notificationService");
const sendResponse = require("../../utils/sendResponse");
const responseStatusCodes = require("../../utils/responseStatusCode");

//* Create notification
const create = asyncHandler(async (req, res) => {
  const { title, body, data } = req.body;
  req.body.user = req.user.id;
  const notification = await notificationService.addNew(
    title,
    body,
    "system",
    user,
    data
  );
  if (notification) {
    return sendResponse(
      res,
      responseStatusCodes.CREATED,
      "Notification Created",
      true,
      notification,
      null
    );
  }
  return sendResponse(
    res,
    responseStatusCodes.BAD,
    "Failed to create notification",
    false,
    null,
    null
  );
});

//* Get all notifications
const getAll = asyncHandler(async (req, res) => {
  const { user, type, page, limit } = req.query;
  const notifications = await notificationService.getAll(
    user || req.user._id,
    type,
    page,
    limit
  );
  return sendResponse(
    res,
    responseStatusCodes.OK,
    "Notifications Retrieved",
    true,
    notifications,
    null
  );
});

//* Get one notification
const getOne = asyncHandler(async (req, res) => {
  const notification = await notificationService.getOne(req.params.id);
  if (notification) {
    return sendResponse(
      res,
      responseStatusCodes.OK,
      "Notification Retrieved",
      true,
      notification,
      null
    );
  }
  return sendResponse(
    res,
    responseStatusCodes.NOTFOUND,
    "Notification Not Found",
    false,
    null,
    null
  );
});

//* Update notification
const update = asyncHandler(async (req, res) => {
  const result = await notificationService.update(req.params.id, req.body);
  if (result) {
    return sendResponse(
      res,
      responseStatusCodes.OK,
      "Notification Updated",
      true,
      null,
      null
    );
  }
  return sendResponse(
    res,
    responseStatusCodes.BAD,
    "Failed to update notification",
    false,
    null,
    null
  );
});

//* Delete notification
const deleteNotification = asyncHandler(async (req, res) => {
  const result = await notificationService.delete(req.params.id);
  if (result) {
    return sendResponse(
      res,
      responseStatusCodes.OK,
      "Notification Deleted Successfully",
      true,
      null,
      null
    );
  }
  return sendResponse(
    res,
    responseStatusCodes.BAD,
    "Failed to delete notification",
    false,
    null,
    null
  );
});

module.exports = { create, getAll, getOne, update, deleteNotification };
