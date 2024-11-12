import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';

import {errorHandlerMiddleware, errorHandelMiddlewareOfSocket} from './src/middleware/errHandalerMiddleware.js'
import userRouter from './src/routes/user.routes.js';
import {authenticateUserViaHttp,authenticateUserViaSocket} from './src/middleware/jwtAuthorizationMiddleware.js';
import { MessageBuilder } from './src/utils/msgBuilder.js';
import { createRoom, getAllMsgByRoom, getRoomMemberList, handelUserJoin, saveMessage,removeUserFromGroup } from './src/controllers/Rooms/room.controller.js';
import { updateActiveStatus } from './src/controllers/User/users.contorller.js';

dotenv.config();

const app = express();

app.use(cors({
    origin: '*',
    methods: [
        'GET',
        'POST',
    ],

    allowedHeaders: [
        'Content-Type',
    ],
    }
));

export const server = http.createServer(app);

app.use(express.json());

app.use("/chatterApp", express.static("./src/public/"));

// app.use()
app.use("/api/user", userRouter);

const io = new Server(server, {
    cors : {
        origin : "*",
        methods:["GET","POST"],
        allowedHeaders: [
            'Content-Type','Authorization'
        ]
    }
});

io.use(authenticateUserViaSocket);
io.on("connection", async (socket) => {
    console.log("connection done");
    console.log(socket)

    // update user active status online
    const user = await updateActiveStatus(socket.user._id, true);
        
    // rerender member list 
    io.emit("inform-user-to-update-room-member-List",{roomList : user.rooms, userId : user._id, activeStatus : "online"});

    // Handle room creation
    socket.on("create-room", async (roomInfo) => {
        let room = await createRoom(roomInfo.roomName, roomInfo.roomDesc, socket);
        socket.join(room.roomId);

        // notifying user
        // let chats = await getAllMsgByRoom(room.roomId);
        socket.emit("room-created", room);
    });

    // Handle joining a room
    socket.on("join-room", async (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
        const room = await handelUserJoin(roomId, socket);
        
        if(!room) return;

        if(room.isNew){
            // Notify others in the room
            let oMessage = new MessageBuilder(roomId, `${socket.user.name} join the room on ${new Date().toDateString()}`, socket, "notify");
            socket.to(roomId).emit("message-brodcust",oMessage.getMessage());
        }

        // notify the user who joind the chat
        socket.emit("user-joined", room);
        socket.to(roomId).emit("room-member-list-update",room.room);
        
    });

    socket.on("send-msg", async (messageInfo) => {
        let message = await saveMessage(messageInfo.message, messageInfo.roomId, socket.user._id);
        if(!message)
            return;
        let msg  = message.toJSON();
        msg["roomId"] = messageInfo.roomId;
        io.to(messageInfo.roomId).emit("message-brodcust", msg);    // sending the message to every one
        socket.to(messageInfo.roomId).emit("on-typing","")   // stoping the typing status
    })

    socket.on("typing", (typingInfo) => {
        if(typingInfo. typingStatus){
            socket.to(typingInfo.roomId).emit("on-typing", socket.user.name)
        }
        else{
            socket.to(typingInfo.roomId).emit("on-typing","")
        }
    })

    socket.on("exit-room", async ({roomId}) => {
        const removeInfo = await removeUserFromGroup(roomId, socket);
        socket.to(roomId).emit("message-brodcust",removeInfo.newMsg);
        socket.to(roomId).emit("update-room-memberList", removeInfo.roomAndUser.room);
        socket.emit("update-user-roomList", removeInfo.roomAndUser.user);

    })

    socket.on("error", (error) => {
        console.log(error);
    })
    
    
    socket.on("disconnect", async ()=>{
        // update user active status offline
        const user = await updateActiveStatus(socket.user._id, false);
        
        // rerender member list 
        io.emit("inform-user-to-update-room-member-List",{roomList : user.rooms, userId : user._id, activeStatus : "offline"});
        // console.log("connection break");
    })
});

app.use(errorHandlerMiddleware);
// io.use(errorHandelMiddlewareOfSocket);
