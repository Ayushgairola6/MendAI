import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import cookie from 'cookie'
import { Server } from 'socket.io';
import { pool } from "../Database.js";
import { GetAIResponse } from "./ModelResponseController.js";
import { generateContext } from "../ContextGenerator.js";
dotenv.config();

export const app = express();
// creating an http server for both socket and api
export const server = http.createServer(app);
export const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "https://mendai.netlify.app"],
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"]
    }, transports: ['websocket', 'polling']
});//new socket io instance object

//verifying and getting user token when a socket connection is established
io.use((socket, next) => {
    try {
        // Parse cookies safely
        const cookies = socket.handshake.headers.cookie ? cookie.parse(socket.handshake.headers.cookie) : {};
        const tokenFromCookie = cookies["auth_token"];
        const tokenFromAuth = socket.handshake.auth?.token; // Handle missing auth field safely

        const finalToken = tokenFromCookie || tokenFromAuth; // Prefer cookies but fallback to auth token
        if (!finalToken) {
            return next(new Error("Authentication error: No token provided"));
        }
        // Verify JWT token
        jwt.verify(finalToken, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                console.log("Error while verifying token:", err.message);
                return next(new Error("Authentication error: Invalid token"));
            }
            socket.user = decoded; // Attach user info to socket
            next();
        });
    } catch (err) {
        console.error("Socket middleware error:", err.message);
        next(new Error("Internal Server Error"));
    }
})

// starting a new socket connection
io.on("connection", async (socket) => {
    const AI_ID = 0;

    const isPaid = await pool.query("SELECT p.user_id, p.status , p.validity,p.valid_to from payments p  LEFT JOIN users u on u.id = p.user_id WHERE u.id = $1", [socket.user.userId]);
    if (isPaid.rows.length === 0) {
        socket.userIsPaid = false;
        console.log("user has not paid yet and is on free plan")
    } else {
        if (isPaid.rows[0].status === "Active") {
            socket.userIsPaid = true;
        } else {
            socket.userIsPaid = false;
        }
        // console.log("user has paid")
    }
    socket.on("message", async (data) => {
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
        if (socket.userIsPaid === false) {
            io.to(roomName).emit("newMessage", { message: "Your free trial has ende for today", name: "Alice", user_id: 0 })
            return;
        }
        pool.query(
            "INSERT INTO messages (room_name, user_id, message,sender_type) VALUES ($1, $2, $3,$4) RETURNING *",
            [roomName, sender_id, data.message, 'user'],
            (err, result) => {
                if (err) {
                    console.error("Database error:", err);
                    return;
                }
                if (result.rowCount === 0) {
                    console.warn("Message insertion failed");
                    return;
                }


                io.to(roomName).emit("newMessage", { message: data.message, name: sender_name, user_id: sender_id });

            }
        );


        if (socket.userIsPaid === false) {
            return;
        }
        const aiResponse = await GetAIResponse(data.message, sender_id, roomName);
        if (!aiResponse) {
            console.log("Ai response generation error");
            return;
        }

        // console.log(aiResponse)
        pool.query(
            "INSERT INTO messages (room_name, message,sender_type) VALUES ($1, $2,CAST($3 AS VARCHAR(10))) RETURNING *",
            [roomName, aiResponse.response, 'model'],
            (err, result) => {
                if (err) {
                    console.error("Database error:", err)
                    return;
                }
                if (result.rowCount === 0) {
                    console.warn("Message insertion failed");
                    return;
                }

                io.to(roomName).emit("newMessage", { message: aiResponse.response, sender: "Alice", user_id: AI_ID });

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


export function getChatHistory(req, res) {
    try {
        const userId = req.user.userId;
        console.log(req.user)
        const AI_ID = 0;
        if (!userId) {
            console.log("user ki id not found");
            return res.status(404).json({ success: false, message: "No user id found please try again" });
        }
        const roomName = [userId, AI_ID].sort((a, b) => a - b).join("_");

        //  fetch messages from messages tables where user id is present but only last 8
        const query = `SELECT * FROM messages LEFT JOIN users u ON u.id = messages.user_id  WHERE room_name = $1 ORDER BY sent_at DESC LIMIT 10`;

        pool.query(query, [roomName], (error, result) => {
            if (error) {
                return res.status(500).json({ success: false, message: "Internal servr error!" });

            }
            if (result.rows.length > 0) {
                // sort messages and send them
                // const SortedMessages = result.rows.sort((a,b)=>a-b);
                return res.status(200).json(result.rows.reverse());
            }
            else {
                return res.status(200).json(result.rows);
            }
        })

    } catch (error) {

    }
}