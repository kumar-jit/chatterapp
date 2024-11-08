export class MessageBuilder{
    message = null;

    constructor (roomId, messageText, socket, messageType) {
        this.message = {
            roomId : roomId,
            content : messageText,
            time : new Date(),
            type : messageType || "Normal",
            user : {
                _id : socket.user._id,
                name : socket.user.name,
                email : socket.user.email,
                avatar : socket.user.avatar
            },
        }
    }
    getMessage() {
        return this.message;
    }

}