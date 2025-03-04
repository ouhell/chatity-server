import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { ImageData } from "./messageFileManagement";

type ObjectUploadData = {
  key: string;
  name: string;
  format: string;
};

export type UploadedImageData = {
  original: ObjectUploadData;
  backup?: ObjectUploadData;
  metaData: ImageData["metaData"];
  blurhash?: string;
};

const bucketName = process.env.AWS_S3_BUCKET_NAME;
const bucketRegion = process.env.AWS_S3_BUCKET_REGION;
const accessKey = process.env.AWS_ACCESS_KEY;
const secretKey = process.env.AWS_SECRET_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
  region: bucketRegion,
});

export class OnlineStorage {
  public static async storeImage(data: ImageData): Promise<UploadedImageData> {
    console.log("uploading ", data);
    const key = crypto.randomUUID() + data.metaData.name;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: data.originalImage,
      ContentType: "image/" + data.metaData.format,
    });
    const resp: UploadedImageData = {
      original: { key, name: data.metaData.name, format: data.metaData.format },
      blurhash: data.blurHash,
      metaData: data.metaData,
    };

    if (data.downSizedImage) {
      const backupName = data.metaData.name + " (downsized)";
      const backupKey = crypto.randomUUID() + backupName;
      const newCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: backupKey,
        Body: data.downSizedImage,
        ContentType: "image/" + data.metaData.format,
      });

      await s3.send(newCommand);
      resp.backup = {
        name: backupName,
        key: backupKey,
        format: data.metaData.format,
      };
    }

    await s3.send(command);
    return resp;
  }
}
