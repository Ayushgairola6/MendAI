import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import {pool} from './Database.js';
// import { CreateUsersTable } from "./Model/usersTable.js";
// import { CreateMessagesTable } from "./Model/MessagesTable.js";
import { server,app } from "./controller/chatController.js";
import { Register,Login,LoginStateUpdate } from './controller/AuthController.js';
import { getChatHistory } from './controller/chatController.js';
import { verifyToken } from './AuthMiddleware.js';
import { GetAccountData } from './controller/userController.js';
const Router = express.Router()
dotenv.config();
//cors configured to give frontend access to send cookies safely
app.use(cors({
	origin:"http://localhost:5173",credentials:true,
}));
app.use(express.json())
app.use(cookieParser());
// Routes to access the api
Router.post("/api/Register",Register)
.post("/api/Login",Login)
.get("/api/verify/account",verifyToken,LoginStateUpdate)
.get("/api/account/data",verifyToken,GetAccountData)
.get("/api/chat/history/data",verifyToken,getChatHistory)
app.use(Router);

server.listen(process.env.PORT,"0.0.0.0",()=>{
	console.log("server is running on port 8080 , with socket connection on it too")
})
