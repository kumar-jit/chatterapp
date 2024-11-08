import { logger } from "./loggingMiddlware.js";


export class customErrorHandler extends Error{
    constructor(message, status) {
        super(message);
        this.status = status;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandlerMiddleware = (err, req, res, next) => {
    try{
        let message = `${err.message || "server error! Try later!!" } , requestUrl : ${req.originalUrl}`; 
        logger.error(message);
        
        err.message = err.message || "Internal server error";
        err.statusCode = err.statusCode || 500;
        res.status(err.statusCode).json({ success: false, error: err.message });
    }
    catch(error){
        next(err);
    }
    
};

export const errorHandelMiddlewareOfSocket = (err, socket) => {
    let message = `${err.message || "server error! Try later!!" }`; 
    logger.error(message);
    
    err.message = err.message || "Internal server error";
    err.statusCode = err.statusCode || 500;
}

// handling handleUncaughtError  Rejection
export const handleUncaughtError = () => {
    process.on("uncaughtException", (err) => {
        console.log(`Error: ${err}`);
        console.log("shutting down server bcz of uncaughtException");
    });
};