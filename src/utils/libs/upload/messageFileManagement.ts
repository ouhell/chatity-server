import { Request } from "express";
import { generateImageScalers } from "../img/imageScaling";
import sharp from "sharp";
import fs from "fs";

type ImageMetaData = {
  height: number;
  width: number;
  size: number;
  name: string;
  format: string;
  key?: string;
};

export type ImageData = {
  downSizedImage?: Buffer;
  blurHash?: string;
  originalImage: Buffer;
  metaData: ImageMetaData;
};

type FilesData = {
  images: ImageData[];
  audio?: Buffer;
};

export const parseMessageFiles = async (
  request: Request
): Promise<FilesData | null> => {
  const uploads = request.files;

  const imagesData: ImageData[] = [];
  if (uploads && !Array.isArray(uploads)) {
    const images = uploads.images;
    if (images && images.length > 0) {
      for (const img of images) {
        const { data, info } = await sharp(img.path).toBuffer({
          resolveWithObject: true,
        });

        const width = info.width;
        const height = info.height;
        const size = info.size;
        const name = img.filename || img.originalname;
        const format = info.format;
        const scallers = await generateImageScalers(data, {
          height,
          width,
          name,
          size,
        });

        imagesData.push({
          blurHash: scallers.blurHash,
          downSizedImage: scallers.downSizedImg,
          originalImage: img.buffer,
          metaData: {
            height,
            width,
            size,
            name: img.originalname,
            format,
          },
        });
      }
    }

    const audioFile = uploads.audio?.at(0)?.buffer;

    const files = uploads.files;

    if (files && files.length > 0) {
      for (const file of files) {
        console.log("uploaded file ", file.filename);
      }
    }

    return {
      images: imagesData,
      audio: audioFile,
    };
  }
  return null;
};
