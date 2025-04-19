const fs = require("fs");
const { promisify } = require("util");
// import stream from "stream";
// const pipeline = promisify(stream.pipeline);
const writeFile = promisify(fs.writeFile);
const uploadFile = async (file) => {
  try {
    const match = file.match(/^data:(.+);base64,(.+)$/);
    if (!match) {
      throw new Error("Invalid file format");
    }
    const [, fileType, fileData] = match;
    const [fileMainType, fileSubType] = fileType.split("/");
    const fileBuffer = Buffer.from(fileData, "base64");
    const fileName = Date.now() + "." + fileSubType;
    let filePath = null;
    let filePathPrefix = null;
    if (fileMainType === "image") {
      filePathPrefix = "images/";
      filePath = "public/images/" + fileName;
    } else if (fileMainType === "video") {
      filePathPrefix = "videos/";
      filePath = "public/videos/" + fileName;
    } else if (fileMainType === "audio") {
      filePathPrefix = "audios/";
      filePath = "public/audios/" + fileName;
    } else if (fileMainType === "application") {
      filePathPrefix = "application/";
      filePath = "public/application/" + fileName;
    } else {
      filePathPrefix = "files/";
      filePath = "public/files/" + fileName;
    }
    await writeFile(filePath, fileBuffer);
    // const writeStream = fs.createWriteStream(filePath);
    // await pipeline(fileBuffer, writeStream);
    const path = filePathPrefix + fileName;
    return path;
  } catch (err) {
    console.log(err);
    throw err;
    // return null;
  }
};

module.exports = uploadFile;
