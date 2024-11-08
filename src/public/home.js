let token = localStorage.getItem("jwttoken"); // Replace with your actual token
let url = window.location.origin
const socket = io.connect(url, {
    auth: { token } // Pass token using auth property
});

const userInformation = {
    email : null,
    name : null,
    imgUrl : null
}

const loadChatRooms = () => {
    let userDetails = httpGetCall("");
}

window.addEventListener("load", ()=>{
    getUserInformation();
});

const checkIsLoggedIn = () => {
    if(localStorage.getItem("jwttoken") && localStorage.getItem("email"))
        return
    else
        window.location.href = "/chatterApp/login.html"
}

socket.on("connect", () => {
    console.log(socket.id);
});

const getUserInformation = async () => {
    let user = await httpGetCall("/api/user/getMyInfo");
    renderChatRoomInfoContainer(user);
}

// making HTTP call using axios
const httpGetCall = async (url, params = {}, filters = {}) => {
    return new Promise((resolve, reject) => {
        axios.get(url, {
            params: {
                ...params, // Spread any additional query parameters
                ...filters  // Add any filters as additional parameters
            },
            headers: {
                Authorization: `Bearer ${localStorage.getItem("jwttoken")}`  // Include the authorization key in the headers
            }
        })
        .then(response => {
            resolve(response.data); // Resolve with the response data directly
        })
        .catch(error => {
            console.log("Error occurred:", error.message);
            resolve({ data: undefined }); // Return undefined data on error
        });
    });
};

/**
 * function to gide or unhide the element
 * @param {object} elementObject 
 */
function toggleElementViewDisplay (elementObject, isVisable) {
    // if display visibility spicif mention
    if(isVisable != undefined){
        if(isVisable)
            elementObject.classList.remove("disPlayNone");
        if(!isVisable)
            elementObject.classList.add("disPlayNone")
    }
    // if not mention then toggole the view
    else{
        if(elementObject.classList.contains("disPlayNone"))
            elementObject.classList.remove("disPlayNone")
        else
            elementObject.classList.add("disPlayNone");
    }
}
/* --------------------------- All socket function -------------------------- */

// Function to join an existing room
const joinRoom = (roomId) => {
    if (roomId) {
        socket.emit("join-room", roomId);
        console.log(`Attempting to join room: ${roomId}`);
    } else {
        console.error("Room ID cannot be empty");
    }
}

// Function to create a new room
const createRoom = (roomInfo) => {
    if (roomInfo) {
        socket.emit("create-room", roomInfo); // Emit a 'create-room' event to the server
        console.log(`Attempting to create room: ${roomInfo.roomName}`);
    } else {
        console.error("Room ID cannot be empty");
    }
}

const sendMessage = (roomId, message) => {
    socket.emit("send-msg", {roomId : roomId, message : message});
}

// Listen for notifications of other users joining
socket.on("user-joined", (rooms) => {
    if(rooms.isNew)
        renderRoomContainer([{room : rooms.room}], true);
    afterRoomJoindOrCreate(rooms.room);
});

// Listen for notifications of other users joining
socket.on("room-created", (rooms) => {
    afterRoomJoindOrCreate(rooms);
    renderRoomContainer([{room : rooms}], true);
});

const afterRoomJoindOrCreate = (rooms) => {
    renderGroupinfoContainer(rooms);
    renderChatRoomForFirstTime(rooms);
    const dialogBoxElemnt = document.getElementById("roomDialogBox");
    toggleElementViewDisplay(dialogBoxElemnt, false);
    document.getElementById("inputRoomId").value = "";
    document.getElementById("inputRoomName").value = "";
    document.getElementById("inputRoomDesc").value = "";
}

socket.on("message-brodcust", (messageDetails) => {
    renderChat(messageDetails, false);
})

socket.on("room-member-list-update", rooms => {
    renderMemberList(rooms.users);
})

socket.on("inform-user-to-update-room-member-List", ({ userId, activeStatus}) => {
    updateUserStatus(userId,activeStatus);
})

const onLogout = () =>{
    socket.emit("disconnect");
}
/* --------------------------- all button function -------------------------- */

const toggoleRoomDialogBox = () =>{
    const dialogBoxElemnt = document.getElementById("roomDialogBox");
    toggleElementViewDisplay(dialogBoxElemnt)
}

const onJoinRoomBtn = (oEvent) => {
    const roomInput = document.getElementById("inputRoomId");
    const roomId = roomInput.value;
    joinRoom(roomId);
    sessionStorage.setItem("roomId",roomId);
}

const onCreateRoomBtn = (oEvent) => {
    const roomInput = document.getElementById("inputRoomName");
    const roomDesc = document.getElementById("inputRoomDesc");
    createRoom({roomName : roomInput.value, roomDesc : roomDesc.value });
}

const onSendMessage = (onEvent) => {
    const messageElelemnt = document.getElementById("message-input");
    const message = messageElelemnt.value;
    // brdocasting messae
    sendMessage(sessionStorage.getItem("roomId"), message);
    // rendering the chat
    // renderChat({text : message, time : new Date()}, {email : localStorage.getItem("name"), name : localStorage.getItem("name")} , true);
}

const onLogoutBtn = (oEvent) => {
    localStorage.clear();
    checkIsLoggedIn();
    onLogout();
}

const onRoomSelect = (oEvent) => {
    // Store the selected room ID in session storage
    sessionStorage.setItem("roomId", oEvent.target.value);

    // Remove the active class from all room labels
    document.querySelectorAll('.rooms-list').forEach(label => {
        label.classList.remove('active');
    });

    // Add the active class to the parent label of the selected radio button
    oEvent.target.closest('.rooms-list').classList.add("active");

    joinRoom(oEvent.target.value);
};
/* --------------------------- all render function -------------------------- */

const renderChatRoomInfoContainer = (user) => {
    renderRoomContainer(user.rooms);
    renderUserFullInfo(user);
}

const renderGroupinfoContainer = (group) => {
    const groupContainer = document.getElementById("groupContainer");
    renderMemberList(group.users);
    renderGroupInfoHead(group);
    toggleElementViewDisplay(groupContainer, true);
}

// render user details section
const renderUserFullInfo = (user) => {
    renderUserFullName(user.name);
}

const renderChatRoomForFirstTime = (rooms) => {
    const chatCanvasContainer = document.getElementById("chatCanvasContainer");
    document.getElementById("chatCanvas").innerHTML = "";   // clearing the canvas
    renderChatRoomTitle(rooms.name);
    rooms.chats.map(chat => {
        renderChat(chat);
    });
    toggleElementViewDisplay(chatCanvasContainer, true);
}

const renderChatRoomTitle = (roomName) => {
    const chatRoomTtitle = document.getElementById("chatRoomTtitle");
    chatRoomTtitle.innerHTML = "";
    chatRoomTtitle.insertAdjacentHTML("beforeend",`<span>${roomName}</span>`);    
}

// render rooms info
const renderRoomContainer = (rooms=[], addToPrevious) => {
    const roomContainerElement = document.getElementById("roomContainer");
    if(!addToPrevious)
        roomContainerElement.innerHTML = ""
    else
        roomContainerElement.childNodes.forEach(child => {
            child.classList.remove("active");
        })
    rooms.forEach(room => {
        roomContainerElement.insertAdjacentHTML("beforeend",
            `<label class="rooms-list ${addToPrevious ? "active" : ""}">
                <input type="radio" name="room" onchange="onRoomSelect(event)" class="room-radio" value=${room.room.roomId} />
                <span class="room-name">${room.room.name}</span>
            </label>`
        );
    })
}

// render user name
const renderUserFullName = (name) => {
    const userNameContainerElemetn = document.getElementById("userFullNameContainer");
    userNameContainerElemetn.innerHTML = "";
    const fullNameSpan = document.createElement("span");
    fullNameSpan.innerHTML = name;
    userNameContainerElemetn.appendChild(fullNameSpan);
}

// render Chat
const renderChat = (message, isCurrentUser) => {
    let user = message.user;
    const chatContainer = document.getElementById("chatCanvas");
    if(message.type && message.type == "notify")
        chatContainer.insertAdjacentHTML("beforeend", renderNotificationMessage(message));
    else{
        isCurrentUser = (user.email == localStorage.getItem("email")) ? true : isCurrentUser; 
        chatContainer.insertAdjacentHTML("beforeend",renderMessage(user.name , message.content, message.timestamp, isCurrentUser, user.avatar));    
    }
   chatContainer.scrollTop += 500;
}

// render left chat
const renderMessage = (name, message, time, isRight, imgUrl ="https://image.flaticon.com/icons/svg/327/327779.svg", ) => {
    time = new Date(time)
    return `<div class="msg ${isRight? "right-msg" : "left-msg"}">
            <div class="msg-img"
                style="background-image: url(${imgUrl})"></div>
            <div class="msg-bubble">
                <div class="msg-info">
                <div class="msg-info-name">${name}</div>
                <div class="msg-info-time">${time.toLocaleDateString()} - ${time.toLocaleTimeString()}</div>
            </div>
                <div class="msg-text">${message}</div>
            </div>
        </div>`
}

const renderNotificationMessage = (message) => {
    return `<div class="msg center-msg">
                <div class="msg-specialInfo">
                    <div class="msg-text">${message.content}</div>
                </div>
            </div>`
}

/**
 * render the group member
 * @param {*} memberList 
 */
const renderMemberList = (memberList) => {
    const groupMemberList = document.getElementById("groupMemberList");
    groupMemberList.innerHTML = "";
    memberList.map(user => {
        let memberListHTML = `<div class="member-profile">
            <div id="${user._id}" class="member-profile-img ${user.isOnline? "onlineMember" : ""}">
                <img alt="profile imge" src="${user.avatar}">
            </div>
            <span>${user.name}</span>
        </div>`
        groupMemberList.insertAdjacentHTML("beforeend",memberListHTML);
    })
}

/**
 * Render group info
 * @param {*} group 
 */
const renderGroupInfoHead = (group) => {
    const groupInfoHead = document.getElementById("groupInfoHead");
    groupInfoHead.innerHTML = "";
    groupInfoHead.insertAdjacentHTML("beforeend",
        `<span class="group-info-title">${group.name}</span>
        <span class="goup-info-desc">${group.description}</span>
        <span class="gourp-admin-details">Id : ${group.roomId}</span>
        <span class="gourp-admin-details">Create by ${group.admin.name}</span>`
    )
}

const updateUserStatus = (userId, active) => {
    const groupMemberList = document.getElementById(userId);
    if(!groupMemberList) return;
    if(active == "offline")
        groupMemberList.classList.remove("onlineMember");
    else if(active == "online" && !groupMemberList.classList.contains("onlineMember"))
        groupMemberList.classList.add("onlineMember");
}