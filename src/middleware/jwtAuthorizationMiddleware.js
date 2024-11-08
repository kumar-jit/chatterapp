import jwt from 'jsonwebtoken';
import { getUserByEmail } from '../models/Users/User.repository.js';
import { errorHandlerMiddleware,errorHandelMiddlewareOfSocket } from './errHandalerMiddleware.js';
import { ErrorHandler } from '../utils/errorHandler.js';

import redisServer from '../utils/redisServer.js';


export const authenticateUserViaSocket = async (socket,next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) errorHandelMiddlewareOfSocket(new ErrorHandler(403,'Unauthorized! Please login again'), socket);
    proccessJWT(token,next,socket);
}

export const authenticateUserViaHttp = async ( req,res,next) => {
    try {
        if(!req.headers.authorization) return next(new ErrorHandler(403, "Please login first"));
        const jwtToken = req.headers.authorization.substring(7);
        if(!jwtToken){
            return next(new ErrorHandler(403, 'Unauthorized! Please login again'))
        }
        proccessJWT(jwtToken,next,req);
    } catch (error) {
        errorHandlerMiddleware( new ErrorHandler(403,'Unauthorized! Please login again'),req);
    }
}

const proccessJWT = (jwtToken, next, req)=>{
    try{
        const screatKey = process.env.JWT_SECRET;
        jwt.verify(jwtToken, screatKey, async (err, jwtUserinfo) => {
            if (err) return next(new ErrorHandler(401, "Not a valid session"))
            else {
                req.jwtToken = jwtToken;

                // check redis in cache
                let userMetadata = redisServer.getUserByEmail(jwtUserinfo.email);
                // check in data base
                if (!userMetadata) {
                    const userRawDetails = await getUserByEmail(jwtUserinfo.email, jwtToken);
                    if(userRawDetails){
                        userMetadata = userRawDetails.toObject();
                        redisServer.saveUserByEmail(jwtUserinfo.email, userMetadata);
                    } 
                }

                if (!userMetadata) {
                    return next(new ErrorHandler(401, "Not a valid session. Please login again"));
                }

                req.user = userMetadata;

                next();
            }
        })
    }
    catch(error){
        errorHandlerMiddleware(error, next);
    }
}
