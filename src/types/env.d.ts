declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      SESSION_SECRET: string; // the secret used to encrypt the session id
      GOOGLE_CLIENT_SECRET: string; // google oauth client secret
      GOOGLE_CLIENT_ID: string; // google oauth client id
      GOOGLE_REDIRECT_URI: string; // google redirect uri
      GITHUB_CLIENT_SECRET: string; // gihub client secret
      GITHUB_CLIENT_ID: string;
      AWS_S3_BUCKET_NAME: string;
      AWS_S3_BUCKET_REGION: string;
      AWS_ACCESS_KEY: string;
      AWS_SECRET_KEY: string;
    }
  }
}

export {};
