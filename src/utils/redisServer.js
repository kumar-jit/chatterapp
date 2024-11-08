const users = {};

const getUserByEmail = (userEmail) => {
    return users[userEmail];
}

const saveUserByEmail = (userEmail, body) => {
    users[userEmail] = body;
}


// use for all device logout
const removeUserByEmail = (userEmail) => {
    delete users[userEmail];
}

const redisServer = {getUserByEmail, saveUserByEmail, removeUserByEmail}
export default redisServer;