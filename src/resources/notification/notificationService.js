const Notification = require("./notificationModel");

const notificationService = {
  //* Add new notification
  addNew: async (title, body, type, user, data) => {
    const notification = new Notification({ title, body, type, user, data });
    await notification.save();
    return notification;
  },

  //* Get all notifications
  getAll: async (user, type, page = 1, limit = 10) => {
    let query = { user, deleted: false };
    if (type) {
      query.type = type;
    }
    const data = await Notification.find(query)
      .sort({ createdDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Notification.countDocuments(query);

    return {
      total, // Total records
      totalPages: limit ? Math.ceil(total / limit) : 1, // Total pages
      currentPage: page ? parseInt(page) : null,
      data: data,
    };
  },

  //* Get one notification
  getOne: async (id) => {
    return await Notification.findById(id);
  },

  //* Update notification
  update: async (id, notificationData) => {
    return await Notification.findByIdAndUpdate(id, notificationData, {
      new: true,
    });
  },

  //* Delete notification (soft delete)
  delete: async (id) => {
    return await Notification.findByIdAndUpdate(
      id,
      { deleted: true },
      { new: true }
    );
  },
};

module.exports = notificationService;
