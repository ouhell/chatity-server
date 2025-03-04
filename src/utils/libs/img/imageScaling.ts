import sharp, { ResizeOptions } from "sharp";
import { encode } from "blurhash";
import fs from "fs";
export type ImageScalers = {
  downSizedImg?: Buffer;
  blurHash?: string;
  original: Buffer;
};

export type ScallingMeta = {
  width: number;
  height: number;
  size: number;
  name: string;
};

const maxImageSize = 1024 * 1024; // 1 mb

const resizeImage = async (imageBuffer: Buffer, metadata: ScallingMeta) => {
  const factor = Number.parseFloat((maxImageSize / metadata.size).toFixed(2));

  const resizeOptions: ResizeOptions = {
    height: Math.ceil(metadata.height * factor),
    width: Math.ceil(metadata.width * factor),
  };

  const resized = await sharp(imageBuffer)
    .resize(resizeOptions)
    .toBuffer({ resolveWithObject: true });
  console.log("comparing ", {
    new: resized.info.size,
    old: metadata.size,
    factor,
  });
  return resized.data;
};

export const generateImageScalers = async (
  imageBuffer: Buffer,
  metadata: ScallingMeta
): Promise<ImageScalers> => {
  console.log("generating image scallers for : ", metadata);
  let downSized: Buffer | undefined = undefined;
  if (metadata.size > maxImageSize) {
    console.log("resizing :::::::::::::;");
    downSized = await resizeImage(imageBuffer, metadata);
  }
  const raw = await sharp(downSized || imageBuffer)
    .raw()
    .resize({ width: 100, height: 100 })
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });
  console.log("begin hashing ::::::::::::::");
  const blurHash = encode(
    new Uint8ClampedArray(raw.data),
    raw.info.width,
    raw.info.height,
    4,
    4
  );

  return {
    blurHash,
    downSizedImg: downSized,
    original: imageBuffer,
  };
};
