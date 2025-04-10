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
        origin: ["http://localhost:5173", 'https://mendai.netlify.app'], credentials: true
    }
});//new socket io instance object

//verifying and getting user token when a socket connection is established
io.use((socket, next) => {
    const cookieToken = socket.handshake.headers.cookies?cookie.parse(socket.handshake.headers.cookies):{};
    console.log(cookieToken);
    const authHeader = socket.handshake.auth.token;
    let token;

    // Prefer cookie token, fallback to Bearer token
    if (cookieToken) {
        token = cookieToken;
    } else if (authHeader) {
        token = authHeader
    } else {
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        next();
    } catch (error) {
        console.error("Token verification failed:", error.message);
        return
    }
})

// starting a new socket connection
io.on("connection", (socket) => {
    const AI_ID = 0;
    let counter = 0;

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

        //check for the counter condition
        const result = await pool.query(`
            INSERT INTO context_counter (room_name, count, created_at)
            VALUES ($1, 1, NOW())
            ON CONFLICT (room_name)
            DO UPDATE SET count = context_counter.count + 1, created_at = NOW()
            RETURNING count;
        `, [roomName]);
        const messageCount = result.rows[0].count;
        let context;
        // generate context
        if (messageCount >= 9) {
            context = await generateContext(data.message, sender_id);
            const query = `INSERT INTO chat_context (room_name,summary) VALUES ($1,$2)`;
            const res = await pool.query(query, [roomName, context.response]);
            // Reset the counter
            await pool.query(`UPDATE context_counter SET count = 0 WHERE room_name = $1`, [roomName]);
        } else {
            context = { response: data.message };
        }
        // // **AI Response Logic (if applicable)**
        if (!context) {
            console.log("context not found")
            return;
        }

        const aiResponse = await GetAIResponse(data.message, sender_id, context.response, roomName);
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


        counter++;
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