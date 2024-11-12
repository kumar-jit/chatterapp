const container = document.getElementById("container");
const registerBtn = document.getElementById("register");
const loginBtn = document.getElementById("login");


window.addEventListener("load", ()=>{
    checkIsLoggedIn();
});


const checkIsLoggedIn = () => {
    if(localStorage.getItem("jwttoken") && localStorage.getItem("email"))
        window.location.href = "/home.html"
    else
        return;
}

// Toggle between sign-in and sign-up forms
registerBtn.addEventListener("click", () => {
    container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
    container.classList.remove("active");
});

// Handle the form submission for registration
const signUpForm = document.getElementById('signUpForm');
signUpForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent form from submitting the traditional way

    // Collect form data
    const name = signUpForm.name.value;
    const email = signUpForm.email.value;
    const avatar = signUpForm.avatar.value;

    // Make HTTP POST request using Axios
    let response = await httpPostCall('/api/user/register',{
        name: name,
        email: email,
        avatar: avatar
    });
    if(verifyPayload(response.data, "signup"))
        afterUSerVerified(response.data);
});

// Handle the form submission for login
const signInForm = document.getElementById('loginForm');
signInForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent form from submitting the traditional way

    // Collect form data
    const email = signInForm.email.value;
    let response = await httpPostCall('/api/user/login',{email:email});
    if(verifyPayload(response.data, "login"))
        afterUSerVerified(response.data);
});

// making HTTP call using axios
const httpPostCall = async (url,payload) => {
    return new Promise( (resolve, reject) => {
        axios.post(url,payload)
        .then(response => {
            resolve(response);
        })
        .catch(error => {
            console.log(error);
            resolve(error.response);
        });
        
    });
}

function verifyPayload(data, action) {
    if(data.success != undefined && data.success == false){
        if(action == 'login'){
            document.getElementById("loginErrorSpan").innerText = data.error;
            document.getElementById("signUpErrorSpan").innerText = "";
        }  
        else if(action == "signup"){
            document.getElementById("signUpErrorSpan").innerText = data.error;
            document.getElementById("loginErrorSpan").in = "";
        }
        return false;
    }
    else{
        document.getElementById("loginErrorSpan").innerText = "";
        document.getElementById("signUpErrorSpan").innerText = "";
        return true;
    }
        
}

// handel afeter user data recive
function afterUSerVerified (data, action) {
    if(data){
        localStorage.setItem("email",data.user.email);
        localStorage.setItem("name",data.user.name);
        localStorage.setItem("jwttoken",data.token);
        window.location.href = "home.html";
    }
    else{
        throw new Error("Please provide valid email");
    }
}