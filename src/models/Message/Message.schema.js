import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    content: { 
        type: String, 
        required: true 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    },
    type: {
        type: String,
        default: "Normal"
    }
});

const MessageModel = mongoose.model('Message', messageSchema);
export default MessageModel;
