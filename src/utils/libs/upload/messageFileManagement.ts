import { Request } from "express";
import { generateImageScalers } from "../img/imageScaling";

type ImageData = {
  downSizedImage?: Buffer;
  blurHash?: string;
  originalImage: Buffer;
  metaData: {
    height: number;
    width: number;
    type: string;
  };
};

type FilesData = {
  images: ImageData[];
  audio?: Buffer;
};

export const parseMessageFiles = async (request: Request) => {
  const uploads = request.files;
  if (uploads && !Array.isArray(uploads)) {
    const images = uploads.images;
    if (images && images.length > 0) {
      for (const img of images) {
        console.log("image uploaded", img.originalname);
        const scallers = generateImageScalers(img.buffer);
      }
    }

    const audio = uploads.audio;

    if (audio && audio.length > 0) {
      const audioFile = audio[0];
      console.log("audio file uploaded", audioFile.filename);
    }

    const files = uploads.files;

    if (files && files.length > 0) {
      for (const file of files) {
        console.log("uploaded file ", file.filename);
      }
    }
  }
};
