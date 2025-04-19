const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schema = new Schema(
  {
    userId: String,
    uuid: String,
  },
  { timestamps: true }
);
const authIdModel = new mongoose.model("AuthId", schema);
const authServices = {
  add: async (userId, uuid) => {
    const result = await authIdModel.findOneAndUpdate(
      { userId },
      { uuid },
      { upsert: true, new: true }
    );
    // if (result) {
    return result;
    // }
    // const newAuthId = new authIdModel({ userId, uuid });
    // console.log("newAuthId: ", newAuthId);
    // return await authIdModel.save(newAuthId);
  },

  findByUUID: async (uuid) => {
    const result = await authIdModel.findOne({ uuid });
    return result;
  },
};
module.exports = authServices;
