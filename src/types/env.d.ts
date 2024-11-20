declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      SESSION_SECRET: string;
      GOOGLE_CLIENT_SECRET: string;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_REDIRECT_URI: string;
      GITHUB_CLIENT_SECRET: string;
      GITHUB_CLIENT_ID: string;
    }
  }
}

export {};
