import type { UserRole } from "@prisma/client";
import express = require("express");

export type SessionUser = {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  picture_url?: string | null;
};

declare module "express-session" {
  interface SessionData {
    user: SessionUser | undefined;
  }
}

export {};
