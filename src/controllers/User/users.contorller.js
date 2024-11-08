import { userRegisterRepo,userLoginRepo, getUserByEmail, updateActiveStatusRepo } from "../../models/Users/User.repository.js";
import { ErrorHandler } from "../../utils/errorHandler.js";


export const login = async (req,res,next) => {
    try{
        const {email} = req.body;
        const user = await userLoginRepo(email);
        if(user)
            res.status(200).json({user, "token": user.generateAuthToken()});
        else
            next(new ErrorHandler(401, "User not found."));
    }
    catch(err){
        next(err);
    }
    
}

export const register = async (req, res, next) => {
    try{
        let {name, email, avatar} = req.body;
        avatar = avatar || "https://wallpapers.com/images/hd/default-profile-picture-6uzr8dqc41tkonlc.jpg";
        const user = await userRegisterRepo({name, email, avatar});

        if(user)
            res.status(201).json({user, "token": user.generateAuthToken()});
        else
            next(new ErrorHandler(400,"Ragistration faild"));
    }
    catch(err){
        next(err);
    }
}

export const getLoginUserInfo = async (req,res,next) => {
    try{
        const user = req.user;
        if(!user) next(new ErrorHandler(401, "Unauthorize! please login first"));
        let getUser = await getUserByEmail(user.email);
        res.status(200).json(getUser);
    }
    catch(error){
        next(new ErrorHandler(400,"User not found"));
    }
}

export const updateActiveStatus = async (userId, activeStatus) => {
    try{
        return await updateActiveStatusRepo(userId,activeStatus);
    }
    catch(error){
        throw error
    }
}
