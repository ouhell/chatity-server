import multer from "multer";
import fs from "fs";
import path from "path";
import logger from "@/utils/logger";

const destination = path.join(__dirname, "..", "..", "..", "..", "storage");

console.log("destination for upload is ::: ", destination);

const twoHoursInMs = 1000 * 60 * 60 * 2; // 2 hours ago in ms

export const multerStorage: multer.StorageEngine = multer.diskStorage({
  destination: destination,
});

const storageClear = async () => {
  logger.info("started file cleanup");
  const now = Date.now();

  const files = fs.readdirSync(destination, {
    // withFileTypes : true
  });
  files.forEach((file) => {
    if (typeof file !== "string") return;
    const filePath = path.join(destination, file);
    const fileStats = fs.statSync(filePath);
    const creationTime = fileStats.birthtime.getTime();

    const difference = now - creationTime;

    if (difference >= twoHoursInMs) {
      if (file === "info.md") return;
      fs.unlinkSync(filePath);
    }
  });

  logger.info("completed file cleanup ");
};

setInterval(storageClear, twoHoursInMs);
