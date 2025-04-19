//room id generator
const generateRoomId = (sender, receiver) => {
  if (sender < receiver) return sender + receiver;
  else return receiver + sender;
};

module.exports = {
  generateRoomId,
};
