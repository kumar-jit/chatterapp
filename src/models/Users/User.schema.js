import mongoose from "mongoose";
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: {
        type: String, 
        required: true,  // Typo fix: changed "require" to "required"
        unique: true
    },
    avatar: { 
        type: String, 
        default: 'default_profile.png' 
    },
    rooms: [
        {
            room: { 
                type: mongoose.Schema.Types.ObjectId,
                ref: "Room" 
            },
            joinedAt: { 
                type: Date, 
                default: Date.now 
            }
        }
    ],
    isOnline: { 
        type: Boolean, 
        default: true 
    }
}, { timestamps: true }); // Added timestamps for tracking user creation and updates

// Token generation method
userSchema.methods.generateAuthToken = function() {
    console.log(process.env.JWT_SECRET);
    const token = jwt.sign({ _id: this._id.toString(), email: this.email }, process.env.JWT_SECRET);
    return token;
};

const UserModel = mongoose.model('User', userSchema);
export default UserModel;
