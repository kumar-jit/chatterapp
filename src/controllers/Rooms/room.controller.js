import { createRoomRepo, getAllChatRepo, addNewUserToRoomRepo, addMessage,roomMemberListRepo, deleteUserFromRooms } from '../../models/Rooms/Rooms.repository.js';
import { ErrorHandler } from '../../utils/errorHandler.js';
import { generateRandomSixDigitNumber } from '../../utils/roomIdGenerate.js';

export const createRoom = async (roomName, desc, socket) => {
    let roomId = generateRandomSixDigitNumber();
    let roomObjec = {
        name : roomName || "Default Room",
        roomId : roomId,
        description: desc,
        admin : socket.user._id
    }
    try{
        let newRoom = await createRoomRepo(roomObjec);
        return newRoom;
    }
    catch(error){
        return await createRoom(roomName, desc, socket);
    }
}

export const getAllMsgByRoom = async (roomId) => {
    try{
        return await getAllChatRepo(roomId);
    }
    catch(error){
        next(new ErrorHandler(401, "chat room not found"));
    }
}

export const handelUserJoin = async (roomId, socket) => {
    try {
        let user = socket.user;
        const roomDetails = await getAllChatRepo(roomId);
        if(!roomDetails)
            throw new Error("Room not found");
        let memberIndex = roomDetails.users.findIndex(member => member._id.toString() === user._id.toString());
        if(memberIndex >= 0)
            return {room : roomDetails, isNew : false};
        else
            return {room : await addNewUserToRoomRepo(roomDetails, user), isNew : true};
    } catch (error) {
        socket.emit("error", error);
        return undefined;
    }
}

export const saveMessage = async (message, roomId, userId, type = "normal") => {
    if(!message)
        return undefined;
    try {
        let msg = {
            user: userId,
            content: message,
            type: type,
            timestamp: new Date()
        }
        return await addMessage(msg,roomId);
    } catch (error) {
        throw error;
    }
}

export const getRoomMemberList = async (roomId) => {
    try{
        return await roomMemberListRepo(roomId);
    }
    catch(error){
        throw error
    }
}

export const removeUserFromGroup = async (roomId, socket) => {
    try {
        let user = socket.user;
        let roomAndUser = await deleteUserFromRooms(roomId,user._id);
        let msg = {
            user: user._id,
            content: user.name + " has left the room.",
            type: "notify",
            timestamp: new Date()
        }
        let newMsg = await addMessage(msg,roomId);
        return {roomAndUser, newMsg}
            
    } catch (error) {
        console.log(error);
    }
}