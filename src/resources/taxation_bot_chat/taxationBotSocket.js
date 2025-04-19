const { socketListener } = require("../../utils/socketListener");
const taxationBotChatModel = require("./taxationBotChatModel");
const axios = require("axios");
const taxationKeyWordsModel = require("./taxationKeyWordsModel");
const userService = require("../user/userService");

const taxationBotSocket = async (socket, io) => {
  socket.on(socketListener.BOTCHAT, async (data, callback) => {
    try {
      const { user } = data;
      if (!user) {
        callback({ message: "Data missing", success: false });
        return;
      }
      const chats = await taxationBotChatModel
        .find({ user })
        .sort({ createdAt: -1 });
      io.to(user.toString()).emit(
        socketListener.PREVIOUSBOTCHAT,
        JSON.stringify(chats)
      );
      callback({ message: "Bot Chat created", success: true, data: chats });
      return;
    } catch (error) {
      io.emit(socketListener.ERROR, JSON.stringify({ msg: error.message }));
      callback({ message: "Failed", success: false });
    }
  });

  socket.on(socketListener.SENDPROMPT, async (data, callback) => {
    try {
      const { user, request } = data;
      const userDetails = await userService.getOne(user);
      if (!userDetails) {
        callback({ success: false, message: "User not found" });
        return;
      }

      // Check if required fields are missing
      if (!user || !request) {
        callback({ success: false, message: "Field missing" });
        return;
      }
      const promptLower = request.toLowerCase();
      console.log("promptLower", promptLower);
      const matchedKeyword = await taxationKeyWordsModel.find({
        $text: { $search: promptLower },
      });

      if (matchedKeyword.length === 0) {
        callback({
          success: false,
          message: "Your query is not related to taxation.",
        });
        return;
      }
      let language = "English";
      // let country = "Pakistan";
      let promptSetting = `Answer the following taxation-related question in ${language} for ${userDetails?.country}: ${promptLower}.Ensure the response is in ${language} and includes relevant tax laws, regulations, and examples specific to ${userDetails?.country}.`;

      promptSetting = promptSetting.toLowerCase();
      console.log("promptSetting", promptSetting);

      // Prepare the options for the RapidAPI request
      const options = {
        method: "GET",
        url: "https://google-search72.p.rapidapi.com/search",
        params: {
          q: promptSetting,
          lr: "en-US",
          num: "3",
        },
        headers: {
          "x-rapidapi-key": process.env.RAPID_API_KEY,
          "x-rapidapi-host": "google-search72.p.rapidapi.com",
          "Content-Type": "application/json",
        },
      };

      // Perform the API request to get the search result
      const response = await axios.request(options);
      console.log("response", response);

      // You can customize what data you want from the API response
      let apiData = response.data; // This is the data you get back from the Google search API
      if (apiData?.status === "success") {
        const response = apiData.items.map((item) => item.snippet).join("");

        // Collect all links into a separate string for `reference`
        const reference = apiData.items.map((item) => item.link).join(", ");
        // Prepare message payload for the chat
        const msgPayload = {
          user: user, // Replace with the user who sent the message
          request: request,
          response: response, // Use API data in the message
          refrence: reference,
        };

        // Create a new message in the chat system
        const newData = new taxationBotChatModel(msgPayload);
        const newMessage = await newData.save();

        // If the message is created, emit to the room
        if (newMessage) {
          io.to(user.toString()).emit(
            socketListener.NEWRESPONSE,
            JSON.stringify(newMessage)
          );

          // Send a success response back
          callback({ success: true, message: "Success", data: newMessage });
          return;
        }
      } else {
        // If the message could not be created, emit an error
        io.emit(
          socketListener.ERROR,
          JSON.stringify({ success: false, message: "Try Again!" })
        );
        callback({ success: false, message: "Try Again!" });
        return;
      }
    } catch (error) {
      console.log("error", error);
      // In case of any error, emit the error and send it to the callback
      io.emit(
        socketListener.ERROR,
        JSON.stringify({ success: false, message: error.message })
      );
      callback({ success: false, message: error.message });
      return;
    }
  });
};
module.exports = taxationBotSocket;
