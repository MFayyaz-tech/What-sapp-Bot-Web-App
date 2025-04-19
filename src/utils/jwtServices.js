const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const jwtServices = {
  create: async (data, expiresIn) => {
    const jwtKey = process.env.JWTKEY;
    if (!jwtKey) {
      throw new Error("JWT secret key not found in environment variables");
    }
    if (process.env.NODE_ENV === "development") {
      expiresIn = "365d";
    }
    const expiredIn = expiresIn || "365d";
    console.log(data);
    const token = jwt.sign(data, jwtKey, { expiresIn: expiredIn });
    return token;
  },
  authenticate: async (token) => {
    const jwtKey = process.env.JWTKEY;
    if (!jwtKey) {
      throw new Error("JWT secret key not found in environment variables");
    }
    const verifyToken = jwt.verify(token, jwtKey);
    return verifyToken;
  },
};
module.exports = jwtServices;
