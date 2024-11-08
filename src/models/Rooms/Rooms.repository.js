import RoomModel from "./Rooms.schema.js";
import UserModel from "../Users/User.schema.js";
import MessageModel from "../Message/Message.schema.js";
import { updateUserRooms } from "../Users/User.repository.js";

export const createRoomRepo = async (room) => {
    
    let newRoom = new RoomModel(room);

    // Fetch the admin user details
    let user = await UserModel.findById(newRoom.admin);
    if (!user) throw new Error('Admin user not found');

    // Create an initial message
    let initialMessage = new MessageModel({
        user: newRoom.admin,
        content: `Room has been created by ${user.name} on ${new Date().toLocaleDateString()}.`,
        type: "notify",
        timestamp: new Date()
    });

    await initialMessage.save(); // Save the initial message
    newRoom.chats.push(initialMessage._id);
    newRoom.users.push(newRoom.admin);
    

    await newRoom.save(); // Save the room
    updateUserRooms(newRoom.admin,newRoom._id); // Save the updated user

    // Populate fields separately
    await newRoom.populate({ path: 'admin', select: 'name avatar' })
    await newRoom.populate({ path: 'users', select: 'name avatar isOnline rooms' })
    await newRoom.populate({ path: 'users.rooms.room'})
    await newRoom.populate({ path: 'chats'})

    return newRoom;
}

export const getAllChatRepo = async (roomId) => {
    let room =  await RoomModel.findOne({ roomId })
        .populate({ path: 'admin', select: 'name avatar' })
        .populate({ path: 'users', select: 'name avatar isOnline' })
        .populate({ path: 'chats'});
    return await room.populate({ path: 'chats.user', select: "name avatar email"});
}

export const addNewUserToRoomRepo = async (room, user) => {
    room.users.push(user._id);
    let newChat = new MessageModel({
        user: user._id,
        content: `${user.name} join the room on ${new Date().toLocaleDateString()}.`,
        type: "notify",
        timestamp: new Date()
    });
    newChat.save();
    room.chats.push(newChat);
    await room.save();

    updateUserRooms(user._id, room._id); // Save the updated user

    // Populate fields separately
    await room.populate({ path: 'admin', select: 'name avatar' });
    await room.populate({ path: 'users', select: 'name avatar isOnline' });
    await room.populate({ path: 'chats'});

    return room;
}

export const addMessage = async (message, roomId) => {
    const newMsg = new MessageModel(message);
    await newMsg.save();
    const room = await RoomModel.findOne({roomId});
    room.chats.push(newMsg._id);
    await room.save();
    return await newMsg.populate({path:"user" , select : "name avatar email"});
}
export const roomMemberListRepo = async (roomId) => {
    const room = await RoomModel.findOne({roomId}).populate({path : "user"});
    return room;
}