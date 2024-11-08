import { getUserByEmail } from "../models/Users/User.repository.js";
import redisServer from '../utils/redisServer.js';
import { ErrorHandler } from "./errorHandler.js";

export const fetchUserDetails = async (socket) => {
    const userEmail = getUserIdFromSocket(socket);
    // finding user in local redis server
    let user = redisServer.getUserByEmail(userEmail);

    if(!user)   // if user not present in  local then fetch user from db
        user = await getUserByEmail(userEmail);
        redisServer.saveUserByEmail(userEmail,user);    // store user in local redis server
    
    if(!user)
        throw new ErrorHandler(404, "User not found. Please register first");

    return user;
}

export const getUserIdFromSocket = (socket) => {
    return socket.handshake.query.userId;
}