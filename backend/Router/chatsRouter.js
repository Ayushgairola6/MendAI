import express from 'express';
import  {chats}  from '../controller/chatController.js';
export const chatsRouter = express.Router();

chatsRouter.get("/chats",chats);