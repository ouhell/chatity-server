import express from "express";
import {
  credentialLogin,
  credentialSignUp,
} from "../../controllers/v1/AuthController";
export const AuthRouter = express.Router();

AuthRouter.post("/api/v1/auth/login", credentialLogin);
AuthRouter.post("/api/v1/auth/signup", credentialSignUp);
