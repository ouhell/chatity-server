import sharp, { ResizeOptions } from "sharp";
import { encode } from "blurhash";
export type ImageScalers = {
  downSizedImg?: Buffer;
  blurHash: string;
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

  const resized = await sharp(imageBuffer).resize(resizeOptions).toBuffer();
  return resized;
};

export const generateImageScalers = async (
  imageBuffer: Buffer,
  metadata: ScallingMeta
): Promise<ImageScalers> => {
  let downSized: Buffer | undefined = undefined;
  if (metadata.size > maxImageSize) {
    downSized = await resizeImage(imageBuffer, metadata);
  }

  const blurHash = encode(
    new Uint8ClampedArray(imageBuffer),
    metadata.width,
    metadata.height,
    4,
    4
  );

  return {
    blurHash,
    downSizedImg: downSized,
    original: imageBuffer,
  };
};
