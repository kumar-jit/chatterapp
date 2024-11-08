import express from 'express';
import { login, register,getLoginUserInfo } from '../controllers/User/users.contorller.js';
import {authenticateUserViaHttp} from '../middleware/jwtAuthorizationMiddleware.js';

const userRouter = express.Router();

userRouter.route("/register").post(register);
userRouter.route("/login").post(login);
userRouter.route("/getMyInfo").get(authenticateUserViaHttp, getLoginUserInfo);

export default userRouter;