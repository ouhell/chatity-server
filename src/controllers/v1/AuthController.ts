import { NextFunction, Request, RequestHandler } from "express";
import { errorCatch } from "../../utils/errorCatch";
import { z } from "zod";
import prisma from "../../database/databaseClient";
import { ApiError } from "../../errors/ApiError";
import bcrypt from "bcrypt";
import { User, UserRole } from "@prisma/client";
import { applicationBootEnv } from "../../env/environmentProvider";
import logger from "../../utils/logger";

const getUserSession = async (req: Request) => {
  return {
    logged: !!req.session.user,
    sessionUser: req.session.user,
  };
};

const authenticateUser = async (request: Request, user: User) => {
  request.session.user = {
    id: user.id,
    role: user.role,
    username: user.username,
    email: user.email,
    picture_url: user.imageUrl,
  };

  return { ...request.session.user };
};

// ---------------------------------------- credential login ****

const credentialLoginRequest = z.object({
  identifier: z.string().trim().min(1),
  password: z.string().trim().min(0),
});

// * exportable
const credentialLogin: RequestHandler = errorCatch(async (req, res, next) => {
  const loginRequest = credentialLoginRequest.parse(req.body);
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: loginRequest.identifier },
        { email: loginRequest.identifier },
      ],
    },
  });

  if (!user) {
    return next(ApiError.notFound("user not found"));
  }

  if (!user.password)
    return next(ApiError.forbidden("user does not use password credentials"));

  const isMatch = await bcrypt.compare(loginRequest.password, user.password);
  if (!isMatch) {
    return next(ApiError.unAuthorized("incorrect password"));
  }

  const sessionUser = await authenticateUser(req, user);

  res.json(sessionUser);
  return;
});

// -------------------------------- credential signup ****

const credentialSignupRequest = z.object({
  username: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: z.string().trim().min(8),
});

// * exportable
export const credentialSignUp: RequestHandler = errorCatch(
  async (req, res, next) => {
    const body = credentialSignupRequest.parse(req.body);

    const existUsername = await prisma.user.findFirst({
      where: {
        username: body.username,
      },
      select: {
        id: true,
      },
    });

    if (existUsername) {
      return next(ApiError.forbidden("username already used"));
    }

    if (body.email) {
      const existsEmail = await prisma.user.findFirst({
        where: {
          email: body.email,
        },
        select: {
          id: true,
        },
      });

      if (existsEmail) {
        return next(ApiError.forbidden("email already exists"));
      }
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const newUser = await prisma.user.create({
      data: {
        username: body.username,
        email: body.email,
        password: hashedPassword,
        role: UserRole.BASIC,
      },
    });
    const sessionUser = await authenticateUser(req, newUser);
    res.status(201).json(sessionUser);
    return;
  }
);

// ---------------------------- google oauth login/singup

const googleOauthRequestTemplate = z.object({
  code: z.string().trim().min(1),
});

type GoogleOauthRequest = z.infer<typeof googleOauthRequestTemplate>;

const googleOauthTokenRespTemplate = z.object({
  access_token: z.string().trim().min(40),
  expires_in: z.number(),
  id_token: z.string(),
  scope: z.string(),
  token_type: z.string(),
});

const googleUserInfoTemplate = z.object({
  email: z.string().trim().email(),
  email_verified: z.boolean(),
  given_name: z.string().trim().min(1),
  name: z.string().trim().trim(),
  picture: z.string().optional().nullable(),
  sub: z.string(),
});

const fetchUserGoogleInfo = async (req: Request, next: NextFunction) => {
  const body = googleOauthRequestTemplate.parse(req.body);
  const url = new URL("https://oauth2.googleapis.com/token");
  url.searchParams.set("client_id", applicationBootEnv.GOOGLE_CLIENT_ID);
  url.searchParams.set(
    "client_secret",
    applicationBootEnv.GOOGLE_CLIENT_SECRET
  );
  url.searchParams.set("redirect_uri", process.env.GOOGLE_REDIRECT_URI);
  url.searchParams.set("code", body.code);
  url.searchParams.set("grant_type", "authorization_code");

  const codeResp = await fetch(url.toString(), {
    method: "post",
  }).then((res) => {
    if (!res.ok) {
      console.log();
      throw new Error("error while getting google token");
    }
    return res.json();
  });
  const tokenData = googleOauthTokenRespTemplate.parse(codeResp);

  const userInfoResp = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: {
        authorization: `Bearer ${tokenData.access_token}`,
      },
    }
  ).then((res) => {
    if (!res.ok) {
      throw new Error("cant fetch google user info");
    }
    return res.json();
  });
  const userInfo = googleUserInfoTemplate.parse(userInfoResp);
  return userInfo;
};

// * exportable
const googleOauthLogin: RequestHandler = errorCatch(async (req, res, next) => {
  logger.info("entered path");
  const userInfo = await fetchUserGoogleInfo(req, next);
  const sameEmailUser = await prisma.user.findFirst({
    where: {
      email: userInfo.email,
    },
  });

  if (sameEmailUser && sameEmailUser?.oauthIdentifier === userInfo.sub) {
    const sessionUser = await authenticateUser(req, sameEmailUser);
    logger.info("user exists " + sessionUser.username);

    res.json(sessionUser);
    return;
  }

  // create new user

  if (sameEmailUser) {
    return next(ApiError.forbidden("user with this email already exists"));
  }

  let username = userInfo.name;
  const sameUsernameUser = await prisma.user.findFirst({
    where: {
      username: username,
    },
    select: {
      id: true,
    },
  });

  if (sameUsernameUser) {
    username += "777";
  }

  const newUser = await prisma.user.create({
    data: {
      email: userInfo.email,
      username: username,
      role: UserRole.BASIC,
      imageUrl: userInfo.picture,
      oauthIdentifier: userInfo.sub,
    },
  });

  const sessionUser = await authenticateUser(req, newUser);
  logger.info("user logged", sessionUser.username);
  res.status(200).json(sessionUser);
  return;
});

// * export
const fetchSession: RequestHandler = async (req, res, next) => {
  const userSession = await getUserSession(req);
  res.status(200).json(userSession);
};

// * export
const deleteSession: RequestHandler = async (req, res, next) => {
  if (!req.session.user) {
    return next(ApiError.badRequest());
  }

  req.session.destroy(() => {});
  res.sendStatus(204);
  return;
};

export default {
  googleOauthLogin,
  credentialLogin,
  credentialSignUp,
  fetchSession,
  deleteSession,
};
