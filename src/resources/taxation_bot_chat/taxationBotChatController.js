const asyncHandler = require("express-async-handler");
const taxationBotChatService = require("./taxationBotChatService");
const sendResponse = require("../../utils/sendResponse");
const responseStatusCodes = require("../../utils/responseStatusCode");
const taxationKeyWordsModel = require("./taxationKeyWordsModel");
const expressAsyncHandler = require("express-async-handler");

//* Create chat
const create = asyncHandler(async (req, res) => {
  const { prompt, country } = req.query;
  if (!prompt || !country) {
    return sendResponse(
      res,
      responseStatusCodes.BAD,
      "Fields missing",
      false,
      null,
      null
    );
  }
  const promptLower = prompt.toLowerCase();
  const matchedKeyword = await taxationKeyWordsModel.find({
    $text: { $search: promptLower },
  });

  if (matchedKeyword.length === 0) {
    return sendResponse(
      res,
      responseStatusCodes.BAD,
      "Your query is not related to taxation.",
      false,
      null,
      null
    );
  }
  const chat = await taxationBotChatService.processPrompt(promptLower, country);
  if (chat) {
    return sendResponse(res, responseStatusCodes.OK, "Chat", true, chat, null);
  }
  return sendResponse(
    res,
    responseStatusCodes.BAD,
    "Failed to create chat",
    false,
    null,
    null
  );
});
//* Get all chats
const getAll = expressAsyncHandler(async (req, res) => {
  const chats = await taxationBotChatService.getChats();
  return sendResponse(
    res,
    responseStatusCodes.OK,
    "Chats Retrieved",
    true,
    chats,
    null
  );
});
const getUserChats = expressAsyncHandler(async (req, res) => {
  const chats = await taxationBotChatService.userChats(
    req.query.user,
    req.query.page,
    req.query.limit
  );
  return sendResponse(
    res,
    responseStatusCodes.OK,
    "Chats Retrieved",
    true,
    chats,
    null
  );
});

const getUsersChats = expressAsyncHandler(async (req, res) => {
  const chats = await taxationBotChatService.usersChats(
    req.query.user,
    req.query.page,
    req.query.limit
  );
  return sendResponse(
    res,
    responseStatusCodes.OK,
    "Chats Retrieved",
    true,
    chats,
    null
  );
});

const userList = expressAsyncHandler(async (req, res) => {
  const users = await taxationBotChatService.userList(
    req.query.page,
    req.query.limit
  );
  return sendResponse(
    res,
    responseStatusCodes.OK,
    "Users Retrieved",
    true,
    users,
    null
  );
});
const updateUser = expressAsyncHandler(async (req, res) => {
  const user = await taxationBotChatService.updateUser(
    req.body.user,
    req.body.status
  );
  if (user) {
    return sendResponse(
      res,
      responseStatusCodes.OK,
      "Users Update",
      true,
      user,
      null
    );
  } else {
    return sendResponse(
      res,
      responseStatusCodes.BAD,
      "Failed",
      false,
      user,
      null
    );
  }
});

module.exports = { create, getUserChats, getUsersChats, userList, updateUser };
