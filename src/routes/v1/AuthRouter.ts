import express from "express";
import AuthController from "../../controllers/v1/AuthController";
export const AuthRouter = express.Router();

AuthRouter.post("/api/v1/auth/login", AuthController.credentialLogin);
AuthRouter.post("/api/v1/auth/signup", AuthController.credentialSignUp);
AuthRouter.post("/api/v1/auth/google", AuthController.googleOauthLogin);
