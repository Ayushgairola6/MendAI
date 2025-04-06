import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { pool } from "../Database.js";
import { GetAIResponse } from "./ModelResponseController.js";
dotenv.config();


export const app = express();
// creating an http server for both socket and api
export const server = http.createServer(app);
export const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173",'https://mendai.netlify.app']
    }
});//new socket io instance object

//verifying and getting user token when a socket connection is established
io.use((socket,next) =>{
    try {const token = socket.handshake.cookies;

    if(token) {
        console.log("token not found")
        return ; 
        }
    
        const verified = jwt.verify(token,process.env.JWT_SECRET,(err,result)=>{
            if(err)return;
         socket.user = result;    
        })
        next();
    } catch (error) {
        throw error;
    }
})

// starting a new socket connection
io.on("connection", (socket) => {
    const AI_ID = 0;

    socket.on("message", async(data) => {

        if (!data.message || !data.user_id || !data.sender_name) {
            console.log("message is incomplete")
            return;
        }

        const sender_id = data.user_id;
        const sender_name = data.sender_name;

        if (!sender_id || !data.user_id) {
            console.error("User ID not found in socket session");
            return;
        }

        // Create room name by sorting IDs
        const roomName = [sender_id, AI_ID].sort((a, b) => a - b).join("_");

        socket.join(roomName);

        pool.query(
            "INSERT INTO messages (room_name, user_id, message,sender_type) VALUES ($1, $2, $3,$4) RETURNING *",
            [roomName, sender_id, data.message,'user'],
            (err, result) => {
                if (err) {
                    console.error("Database error:", err);
                    return;
                }
                if (result.rowCount === 0) {
                    console.warn("Message insertion failed");
                    return;
                }

                io.to(roomName).emit("newMessage", { message: data.message, name: sender_name,user_id:sender_id });

            }
        );

// // **AI Response Logic (if applicable)**
const aiResponse = await GetAIResponse(data.message,sender_id);
if(!aiResponse){
    console.log("Ai response generation error");
}
// console.log(aiResponse)
pool.query(
    "INSERT INTO messages (room_name, message,sender_type) VALUES ($1, $2,CAST($3 AS VARCHAR(10))) RETURNING *",
    [roomName, aiResponse.response,'model'],
    (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return;
        }
        if (result.rowCount === 0) {
            console.warn("Message insertion failed");
            return;
        }

        io.to(roomName).emit("newMessage", { message: aiResponse.response, sender: "Alice" ,user_id:AI_ID});

    }
);



});

    socket.on("disconnect", () => {
        console.log("User has been disconnected");
    });
});

// Mock AI response function (Replace with actual AI logic)
function generateAIResponse(userMessage) {
    return `AI response to: "${userMessage}"`;
}


export function getChatHistory(req,res){
    try {
        const userId = req.user.userId;
        console.log(req.user)
         const AI_ID = 0;
        if(!userId){
            console.log("user ki id not found");
            return res.status(404).json({success:false,message:"No user id found please try again"});
        }
        const roomName = [userId, AI_ID].sort((a, b) => a - b).join("_");
   
        //  fetch messages from messages tables where user id is present but only last 8
         const query = `SELECT * FROM messages LEFT JOIN users u ON u.id = messages.user_id  WHERE room_name = $1 ORDER BY sent_at DESC LIMIT 10`;
        
          pool.query(query,[roomName],(error,result)=>{
            if(error){
                return res.status(500).json({success:false,message:"Internal servr error!"});

            }
            if(result.rows.length>0){
                // sort messages and send them
                // const SortedMessages = result.rows.sort((a,b)=>a-b);
                return res.status(200).json(result.rows.reverse());
            }
            else{
                return res.status(200).json(result.rows);
            }
          })

    } catch (error) {
        
    }
}