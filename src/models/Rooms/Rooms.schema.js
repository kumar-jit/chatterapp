import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        maxLength: 100,
        required: true // Typo fix: changed "require" to "required"
    },
    roomId:{
        type: String,
        required: true,
        minLength: 6,
        maxLength: 10
    },
    description: {
        type: String
    },
    chats: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        }
    ],
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    admin : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true }); // Added timestamps for automatic 'createdAt' and 'updatedAt'

const RoomModel = mongoose.model('Room', roomSchema);
export default RoomModel;
