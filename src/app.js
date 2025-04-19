const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const errorHandler = require("./middleware/errorHandler.middleware");

//import dotenv
dotenv.config();
require("./db/db");
const sendResponse = require("./utils/sendResponse");
const responseStatusCodes = require("./utils/responseStatusCode");
const userRouter = require("./resources/user/userRouter");
const taxationBotChatRouter = require("./resources/taxation_bot_chat/taxationBotChatRouter");

const axios = require("axios");
const AppUser = require("./resources/taxation_bot_chat/appUserModel"); // Import user schema
const ErrorLog = require("./resources/taxation_bot_chat/errorModel"); // Import error log schema
const taxationBotChatModel = require("./resources/taxation_bot_chat/taxationBotChatModel");

const app = express();

const corsOptions = {
  origin: "*", // or specify the allowed origins
};
app.use(cors(corsOptions));
app.use(express.static("public"));
app.use(express.json({ limit: "100mb" }));
app.use(morgan("dev"));

//default route
app.get("/", (req, res) => {
  res.status(200).send({ msg: "Welcome To What'sapp Bot Server" });
});

// WhatsApp Webhook
app.get("/whatsapp-webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // Check the verification token
  if (mode && token === process.env.FB_ACCESS_TOKEN) {
    // Respond with the challenge to verify the webhook
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403); // Forbidden
  }
});
app.post("/whatsapp-webhook", async (req, res) => {
  const data = req.body;
  console.log("Received Data:", JSON.stringify(data, null, 2));

  // Ensure the webhook is from WhatsApp Business API
  if (data.object !== "whatsapp_business_account") {
    return res.sendStatus(400); // Bad request if the object is incorrect
  }

  try {
    for (const entry of data.entry) {
      for (const change of entry.changes) {
        if (change.value.messages) {
          const message = change.value.messages[0];
          const userPhoneNumber = message.from; // Sender's WhatsApp number
          const receivedMessage = message.text?.body || ""; // Message text

          console.log(
            "Received message:",
            receivedMessage,
            "from",
            userPhoneNumber
          );

          // ✅ Store user data in MongoDB
          let user = await AppUser.findOne({ userId: userPhoneNumber });

          if (!user) {
            user = new AppUser({
              userId: userPhoneNumber,
              username: `User-${userPhoneNumber}`,
              engagement: { newUser: true, oldUser: false },
            });
            await user.save();
            console.log("New user saved:", user);
          } else {
            user.engagement.oldUser = true;
            user.engagement.newUser = false;
            await user.save();
          }

          // ✅ Send request to AI chat service
          let responseMessage = "Sorry, I couldn't process your request.";
          try {
            const response = await axios.post(
              `http://82.25.105.2:8000/chat_endpoint?user_id=${user?._id.toString()}&message=${receivedMessage}`,
              {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                },
              }
            );

            console.log("Chat API Response:", response.data);

            // ✅ Ensure response is valid before storing
            responseMessage = response.data || "I'm here to assist you!";
          } catch (error) {
            console.error(
              "Error fetching AI response:",
              error.response?.data || error.message
            );

            // ✅ Log error in MongoDB
            await ErrorLog.create({
              errorType: "AI Chat API Error",
              severity: "High",
              message: error.message || "Failed to fetch AI response",
            });
          }

          // ✅ Store chat message in MongoDB
          console.log("responseMessage", responseMessage);
          const chatEntry = new taxationBotChatModel({
            user: user._id,
            request: receivedMessage,
            response: responseMessage,
          });
          await chatEntry.save();
          // ✅ Check environment variables
          if (!process.env.FB_ACCESS_TOKEN || !process.env.WHATSAPP_NUMBER_ID) {
            console.error("Missing environment variables!");
            return res.sendStatus(500);
          }

          // ✅ Send WhatsApp Message
          try {
            const sendMessageResponse = await axios.post(
              `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_NUMBER_ID}/messages`,
              {
                messaging_product: "whatsapp",
                to: userPhoneNumber,
                text: { body: responseMessage },
              },
              {
                headers: {
                  Authorization: `Bearer ${process.env.FB_ACCESS_TOKEN}`,
                  "Content-Type": "application/json",
                },
              }
            );

            console.log(
              "WhatsApp Response sent successfully:",
              sendMessageResponse.data
            );
          } catch (error) {
            console.error(
              "Error sending WhatsApp message:",
              error.response?.data || error.message
            );

            // ✅ Log error in MongoDB
            await ErrorLog.create({
              errorType: "WhatsApp Message Error",
              severity: "High",
              message: error.message || "Failed to send WhatsApp message",
            });
          }
        }
      }
    }
  } catch (err) {
    console.error("Error processing webhook:", err.message);

    // ✅ Log error in MongoDB
    await ErrorLog.create({
      errorType: "Webhook Processing Error",
      severity: "Critical",
      message: err.message,
    });
  }

  res.sendStatus(200); // Acknowledge receipt of the event
});

app.use((req, res, next) => {
  console.log(`Route called: ${req.originalUrl}`);
  next();
});
//sendEmail();

//middleware
//app.use(authentication);
//apis routes
app.use("/api/user", userRouter);
app.use("/api/chat", taxationBotChatRouter);

// app.use("/api/submodule", submoduleRouter);

// Error handling middleware
app.use(errorHandler);

// 404 handler (should come after all your specific route handlers)
app.use(async (req, res) => {
  await sendResponse(
    res,
    responseStatusCodes.NOTFOUND,
    "Not Found",
    false,
    null,
    null
  );

  return;
});

module.exports = app;
