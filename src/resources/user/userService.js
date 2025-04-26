const uploadFile = require("../../utils/uploadFile");
const userModel = require("./userModel");
const bcrypt = require("bcrypt");
const userService = {
  create: async (body) => {
    const salt = await bcrypt.genSalt(10);
    body.password = await bcrypt.hash(body.password, salt);
    const object = new userModel(body);
    return await object.save();
  },
  validatePassword: async (password, realPassword) => {
    const valid = await bcrypt.compare(password, realPassword);
    return valid;
  },

  update: async (_id, body) => {
    if (body.image) {
      body.image = await uploadFile(body.image);
    }
    return await userModel.findOneAndUpdate({ _id }, body, { new: true });
  },
  updateFcm: async (email, fcmToken, country) => {
    return await userModel
      .findOneAndUpdate({ email }, { fcmToken, country }, { new: true })
      .lean();
  },

  requestOtp: async (email, otp, type) => {
    const otpExpiry = new Date(new Date().getTime() + 5 * 60 * 1000);
    return await userModel.findOneAndUpdate(
      { email },
      { otp: otp, otpExpiry: otpExpiry, otp_type: type },
      { new: true }
    );
  },
  get: async (page = 1, limit = 10, search) => {
    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
            { password: { $regex: search, $options: "i" } }, // Be cautious with searching passwords
          ],
        }
      : {};
    const result = await userModel
      .find(searchQuery)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await userModel.countDocuments(searchQuery);
    return {
      total,
      page,
      data: result,
    };
  },

  otpExpiryValidation: async (email) => {
    const result = await userModel.findOne({
      email,
      otpExpiry: { $gte: new Date() }, // Make sure this matches your field name
    });
    return result;
  },
  isValidOtp: async (otp, email) => {
    const result = await userModel.findOneAndUpdate(
      { email: email, otp: otp },
      { otp: null, otp_type: null }
    );
    return result;
  },

  isExist: async (email) => {
    return await userModel.findOne({ email: email, deleted: false });
  },

  isExistAdmin: async () => {
    return await userModel.findOne({ role: "admin" });
  },

  resetPassword: async (_id, password) => {
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    return await userModel.findOneAndUpdate({ _id }, { password });
  },
  forgotPassword: async (email, password) => {
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    return await userModel.findOneAndUpdate({ email }, { password });
  },

  getOne: async (_id) => {
    return await userModel.findOne({ _id });
  },
  getByEmail: async (email) => {
    return await userModel.findOne({ email, deleted: false }).lean();
  },

  delete: async (_id) => {
    return await userModel.deleteOne({ _id });
  },
};

module.exports = userService;
