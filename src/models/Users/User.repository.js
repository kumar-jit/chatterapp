import path from "path";
import UserModel from "./User.schema.js";

export const userRegisterRepo = async (user) => {
    const newUSer = new UserModel(user);
    return await newUSer.save();
}

export const userLoginRepo = async (email) => {
    return await UserModel.findOne({ email }).populate({
        path: "rooms.room", 
        select: "name roomId" 
    });
}

export const getUserByEmail = async (email) => {
    // Fetch the user by email and populate the room details
    let user = await UserModel.findOne({ email }).populate({
        path: "rooms.room", 
        select: "name roomId" 
    });
    return user;
}

export const updateUserRooms = async (userId, roomId) => {
    // updating user
    let updatedUser = await UserModel.findById(userId);
    updatedUser.rooms.push({room: roomId});
    return await updatedUser.save();
}

export const updateActiveStatusRepo = async (userId, status) => {
    const user = await UserModel.findById(userId);
    user.isOnline = status;
    return await user.save();
}