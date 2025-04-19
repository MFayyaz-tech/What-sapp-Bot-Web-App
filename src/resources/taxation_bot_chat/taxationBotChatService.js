const { default: axios } = require("axios");
const chatModel = require("./taxationBotChatModel");
const appUserModel = require("./appUserModel");
const errorModel = require("./errorModel");
const taxationBotChatService = {
  dashboardStates: async () => {
    // Total Queries
    const totalQueries = await chatModel.countDocuments();

    // Active Users
    const activeUsers = await appUserModel.countDocuments({
      "engagement.oldUser": true,
    });

    // Success Rate
    const totalChats = await chatModel.countDocuments();
    const totalError = await errorModel.countDocuments();
    const uptimePercentage =
      totalError === 0 ? 100 : ((totalChats - totalError) / totalChats) * 100;

    const correctChats = await chatModel.countDocuments({
      correctAnswer: true,
    });
    const successRate =
      totalChats === 0 ? 0 : (correctChats / totalChats) * 100;

    // System Health (Error Logs)
    const errorLogs = await errorModel.countDocuments();
    const systemHealth = errorLogs === 0 ? "healthy" : "issues detected";

    // User Engagement (New vs Old Users)
    const newUserCount = await appUserModel.countDocuments({
      "engagement.newUser": true,
    });
    const oldUserCount = await appUserModel.countDocuments({
      "engagement.oldUser": true,
    });

    const errorLogsList = await errorModel
      .find({
        severity: { $in: ["Medium", "High"] },
      })
      .sort({ timestamp: -1 })
      .limit(5);

    const lastDownTime = await errorModel
      .find({})
      .limit(1)
      .sort({ createAt: -1 });

    const avgResponse = await chatModel.aggregate([
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: "$responseTime" },
        },
      },
    ]);

    const averageResponseTime = avgResponse[0]?.avgResponseTime || 0;

    const chatLogs = await chatModel.find().sort({ timestamp: -1 }).limit(5);

    return {
      totalQueries,
      activeUsers,
      successRate,
      systemHealth,
      uptimePercentage,
      averageResponseTime,
      lastDownTime: lastDownTime[0]?.timestamp,
      userEngagement: {
        newUsers: newUserCount,
        oldUsers: oldUserCount,
      },
      errorLogsList,
      chatLogs,
    };
  },
  updateUser: async (user, status) => {
    return await appUserModel.findOneAndUpdate(
      { _id: user },
      { status },
      { new: true }
    );
  },
  getChat: async (sender, receiver, room) => {
    let isNew = false;
    const result = await chatModel.findOne({ room }).lean();
    if (result) {
      return { chat: result, isNew };
    } else {
      await chatModel.create({ room, sender, receiver });
      isNew = true;
      const result = await chatModel.findOne({ room }).lean();
      return { chat: result, isNew };
    }
  },
  processPrompt: async (prompt, country) => {
    let language = "English";
    // let country = "Pakistan";
    let promptSetting = `Answer the following taxation-related question in ${language} for ${country}: ${prompt}.Ensure the response is in ${language} and includes relevant tax laws, regulations, and examples specific to ${country}.`;

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
        request: prompt,
        response: response, // Use API data in the message
        refrence: reference,
      };
      return msgPayload;
    } else {
      return false;
    }
  },
  newMessage: async (room, message, sender, receiver) => {
    const data = new chatModel({ room, sender, receiver, message });
    const result = await data.save();
    if (result) {
      return await chatModel
        .findOne({ room })
        .populate({ path: "sender", select: "name" })
        .populate({ path: "receiver", select: "name" })
        .lean();
    }
    return false;
  },

  userChats: async (user, page = 1, limit = 30) => {
    let query = {};
    if (user) {
      query.user = user;
    }

    const result = await chatModel
      .find(query)
      .populate({ path: "user" })
      .sort({ created: -1 })
      .skip((page - 1) * limit) // Skip the documents for the current page
      .limit(limit); // Limit the results to the specified limit
    const total = await chatModel.countDocuments(query);

    return {
      total, // Total records
      totalPages: limit ? Math.ceil(total / limit) : 1, // Total pages
      currentPage: page ? parseInt(page) : null,
      data: result,
    };
  },

  userList: async (page = 1, limit = 10) => {
    const result = await appUserModel
      .find()
      .sort({ created: -1 })
      .skip((page - 1) * limit) // Skip the documents for the current page
      .limit(limit); // Limit the results to the specified limit
    const total = await appUserModel.countDocuments();

    return {
      total, // Total records
      totalPages: limit ? Math.ceil(total / limit) : 1, // Total pages
      currentPage: page ? parseInt(page) : null,
      data: result,
    };
  },

  usersChats: async (page = 1, limit = 30) => {
    const skip = (Number(page) - 1) * Number(limit); // Skip the previous pages

    const result = await chatModel.aggregate([
      {
        $sort: { timestamp: -1 }, // Sort by timestamp in descending order (most recent first)
      },
      {
        $group: {
          _id: "$user", // Group by user
          lastRequest: { $first: "$request" }, // Get the last request (most recent one)
          lastResponse: { $first: "$response" }, // Get the last response
          correctAnswer: { $first: "$correctAnswer" }, // Get the correctAnswer flag of the last request
          timestamp: { $first: "$timestamp" }, // Get the timestamp of the last request
        },
      },
      {
        $lookup: {
          from: "appusers", // Join with the "User" collection (replace with your actual collection name if different)
          localField: "_id", // The field in the Chat collection to match
          foreignField: "_id", // The field in the User collection to match
          as: "userDetails", // The alias for the joined data
        },
      },
      {
        $unwind: "$userDetails", // Unwind the user details array to get user info
      },
      {
        $project: {
          user: "$_id", // Rename _id to user
          lastRequest: 1,
          lastResponse: 1,
          correctAnswer: 1,
          timestamp: 1,
          //userDetails: { name: 1, email: 1 }, // Adjust according to the fields in your "User" model
        },
      },
      {
        $skip: skip, // Skip the previous pages based on the page number
      },
      {
        $limit: Number(limit), // Limit the number of results to the page size
      },
    ]);

    const totalUsers = await chatModel.aggregate([
      {
        $group: {
          _id: "$user", // Group by user
        },
      },
      {
        $count: "totalUsers", // Count the total number of unique users
      },
    ]);
    const total = totalUsers.length > 0 ? totalUsers[0].totalUsers : 0;

    return {
      total, // Total records
      totalPages: limit ? Math.ceil(total / limit) : 1, // Total pages
      currentPage: page ? parseInt(page) : null,
      data: result,
    };
  },

  getChats: async () => {
    const chatList = await chatModel.aggregate([
      {
        $sort: { updatedAt: -1 }, // Sort messages by latest first
      },
      {
        $group: {
          _id: "$room",
          message: { $first: "$message" },
          updatedAt: { $first: "$updatedAt" },
          sender: { $first: "$sender" },
          receiver: { $first: "$receiver" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "sender",
          foreignField: "_id",
          as: "senderDetails",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "receiver",
          foreignField: "_id",
          as: "receiverDetails",
        },
      },
      {
        $unwind: { path: "$senderDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$receiverDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: 0,
          room: "$_id",
          message: 1,
          updatedAt: 1,
          sender: {
            _id: "$senderDetails._id",
            name: "$senderDetails.name",
            email: "$senderDetails.email",
            country: "$senderDetails.country",
          },
          receiver: {
            _id: "$receiverDetails._id",
            name: "$receiverDetails.name",
            email: "$receiverDetails.email",
            country: "$receiverDetails.country",
          },
        },
      },
      {
        $sort: { updatedAt: -1 }, // Sort by latest updated rooms first
      },
    ]);

    return chatList;
  },
  getMonthlyQueries: async (year) => {
    const result = await chatModel.aggregate([
      // Match documents that belong to the specified year
      {
        $match: {
          timestamp: {
            $gte: new Date(`${year}-01-01T00:00:00.000Z`), // Start of the year
            $lt: new Date(`${year + 1}-01-01T00:00:00.000Z`), // Start of the next year
          },
        },
      },
      // Group by month and count total queries
      {
        $group: {
          _id: {
            month: { $month: "$timestamp" },
            year: { $year: "$timestamp" },
          },
          totalQueries: { $sum: 1 }, // Count total queries
        },
      },
      // Project the result to have month and totalQueries fields
      {
        $project: {
          _id: 0, // Exclude the _id field
          month: "$_id.month",
          year: "$_id.year",
          totalQueries: 1,
        },
      },
      // Sort by month
      {
        $sort: { month: 1 },
      },
    ]);

    const fullYearData = [];
    for (let i = 1; i <= 12; i++) {
      const monthData = result.find((entry) => entry.month === i);
      fullYearData.push({
        month: i,
        year: year,
        totalQueries: monthData ? monthData.totalQueries : 0,
      });
    }

    return fullYearData;
  },
};

module.exports = taxationBotChatService;
