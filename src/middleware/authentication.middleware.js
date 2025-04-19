const expressAsyncHandler = require("express-async-handler");
const jwtServices = require("../utils/jwtServices");
const responseStatusCodes = require("../utils/responseStatusCode");
const sendResponse = require("../utils/sendResponse");
const userService = require("../resources/user/userService");
const jwt = require("jsonwebtoken");

// Assuming you have defined a type or interface for encryptData

exports.authentication = async (req, res, next) => {
  if (
    req.url.startsWith("/api/test") ||
    req.url.endsWith("refreshToken") ||
    req.url.endsWith("login") ||
    req.url.endsWith("register")
  ) {
    console.log("if case");
    next();
    return;
  } else {
    console.log("else case");
    const authorization = req.headers.authorization;
    if (authorization) {
      try {
        const token = authorization.slice(7); // Remove "Bearer " prefix
        if (token) {
          const tokenData = await jwtServices.authenticate(token);
          if (tokenData) {
            req.query.userId = tokenData?.userId;
            req.query.role = tokenData?.type;
            next();
            return;
          } else {
            await sendResponse(
              res,
              responseStatusCodes.UNAUTHORIZED,
              "Authentication failed!",
              false,
              null,
              null
            );
            return;
          }
        } else {
          await sendResponse(
            res,
            responseStatusCodes.UNAUTHORIZED,
            "Authentication failed!",
            false,
            null,
            null
          );
          return;
        }
      } catch (error) {
        console.log("error: ", error);
        if (error.message === "jwt expired") {
          await sendResponse(
            res,
            responseStatusCodes.UNAUTHORIZED,
            "Authentication failed!",
            false,
            null,
            null
          );
          return;
        } else {
          await sendResponse(
            res,
            responseStatusCodes.UNAUTHORIZED,
            error.message,
            false,
            null,
            null
          );
          res.status(401).send({ msg: error.message });
          return;
        }
      }
    } else {
      await sendResponse(
        res,
        responseStatusCodes.UNAUTHORIZED,
        "Authentication failed!",
        false,
        null,
        null
      );
      return;
    }
  }
};
exports.authUser = expressAsyncHandler(async (req, res, next) => {
  try {
    // Get token from Authorization header and remove "Bearer"
    const authorizationHeader = req.header("Authorization");
    const token = authorizationHeader ? authorizationHeader.slice(7) : null;

    // Check if token exists
    if (!token) {
      return await sendResponse(
        res,
        responseStatusCodes.UNAUTHORIZED,
        "No Token. Access Denied",
        false,
        null,
        null
      );
    }

    // Verify token
    jwt.verify(token, process.env.JWTKEY, async (error, decodedUser) => {
      if (error) {
        return await sendResponse(
          res,
          responseStatusCodes.UNAUTHORIZED,
          "Invalid Authorization. Access Denied",
          false,
          null,
          error.message
        );
      }
      console.log("decodedUser", decodedUser);

      // Find user by ID
      const userData = await userService.getOne(decodedUser.userId);

      // Check if user or admin user exists
      if (!userData) {
        return await sendResponse(
          res,
          responseStatusCodes.UNAUTHORIZED,
          "Authentication Failed!",
          false,
          null,
          null
        );
      }
      // Check if the user's email is verified
      if (userData && userData.status === "blocked") {
        return await sendResponse(
          res,
          responseStatusCodes.UNAUTHORIZED,
          "Account blocked. Authentication Failed!",
          false,
          null,
          null
        );
      }

      // If authentication is successful, attach user to request and proceed
      req.user = userData;
      next();
    });
  } catch (error) {
    console.error(error);
    return await sendResponse(
      res,
      responseStatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error",
      false,
      null,
      error.message
    );
  }
});

exports.authAdmin = expressAsyncHandler(async (req, res, next) => {
  try {
    // Get token from Authorization header and remove "Bearer"
    const authorizationHeader = req.header("Authorization");
    const token = authorizationHeader ? authorizationHeader.slice(7) : null;

    // Check if token exists
    if (!token) {
      return await sendResponse(
        res,
        responseStatusCodes.UNAUTHORIZED,
        "No Token. Access Denied",
        false,
        null,
        null
      );
    }

    // Verify token
    jwt.verify(token, process.env.JWTKEY, async (error, decodedUser) => {
      if (error) {
        return await sendResponse(
          res,
          responseStatusCodes.UNAUTHORIZED,
          "Invalid Authorization. Access Denied",
          false,
          null,
          null
        );
      }

      // Find user in adminUserServices by user ID
      const userData = await userService.getOne(decodedUser?.userId);
      if (!userData) {
        return await sendResponse(
          res,
          responseStatusCodes.UNAUTHORIZED,
          "Authentication Failed!",
          false,
          null,
          null
        );
      }

      // Check if the user has a role
      // if (userData?.role !== "admin") {
      //   return await sendResponse(
      //     res,
      //     responseStatusCodes.UNAUTHORIZED,
      //     "Access Denied.",
      //     false,
      //     null,
      //     null
      //   );
      // }

      // Attach user and role to request object
      req.user = userData;
      next();
    });
  } catch (error) {
    console.error(error);
    return await sendResponse(
      res,
      responseStatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error",
      false,
      null,
      error.message
    );
  }
});
