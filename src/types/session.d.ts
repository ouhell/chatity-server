import express = require("express");

export type SessionUser = {
  id: string;
  username: string;
  email?: string;
};

declare module "express-session" {
  interface SessionData {
    user: SessionUser | undefined;
  }
}

export {};
