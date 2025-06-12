import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import cookie from 'cookie'
import { Server } from 'socket.io';
import { pool } from "../Database.js";
import { GetAIResponse } from "./ModelResponseController.js";
import { GenerateNsfwResponse } from './NsfwController.js';
import { generateContext } from "../ContextGenerator.js";
import { Redisclient } from "../caching/RedisConfig.js";
import { GoogleGenAI } from "@google/genai";
import { QdrantClient } from "@qdrant/js-client-rest";
import { v4 as uuidv4 } from 'uuid';
import e from "express";
dotenv.config();
export const app = express();


const qdrntclient = new QdrantClient({ url: 'https://27e55a12-d837-4fd5-95fc-a24126e9e6cb.us-east4-0.gcp.cloud.qdrant.io', apiKey: process.env.QDRNT_API_KEY });
// creating an http server for both socket and api
export const server = http.createServer(app);

// creating a collection in vector databases
async function createCollectionD() {
    try {
        await qdrntclient.createCollection("message_summaries", {
            vectors: {
                size: 3072, // Match your embedding dimensions
                distance: "Cosine",
            }
        });
        // console.log("Collection created successfully");

        // 2. Create payload index with explicit schema
        await qdrntclient.createPayloadIndex("message_summaries", {
            field_name: "sender_id",
            field_schema: {
                type: "integer" // Explicitly specify the type
            }
        });
        console.log("Payload index for sender_id created");

        // 3. Create index for message field (optional but recommended)
        await qdrntclient.createPayloadIndex("message_summaries", {
            field_name: "message",
            field_schema: {
                type: "text" // For full-text search capabilities
            }
        });
        // console.log("Payload index for message created");

        // 4. Create index for timestamp (optional but useful for filtering)
        await qdrntclient.createPayloadIndex("message_summaries", {
            field_name: "timestamp",
            field_schema: {
                type: "datetime" // For time-based filtering
            }
        });
        console.log("Payload index for timestamp created");

        return true;
    } catch (error) {
        console.error("Setup error:", error);
        return false;
    }
}
// createCollectionD()

// creating a new socket io server
export const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "https://mendai.netlify.app"],
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"]
    }, transports: ['websocket', 'polling']
});//new socket io instance object


//async socket handler
const asyncHandler = fn => (socket, ...args) => {
    fn(socket, ...args).catch(error => {
        console.error('Socket handler error:', error);
        socket.emit('error', 'Internal server error');
    });
};

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
io.on("connection", asyncHandler(async (socket) => {
    const today = new Date().toISOString().split("T")[0];//month day and year format
    // Get tomorrow's date for resetting the limit
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = tomorrow.toISOString().split('T')[0];
    const AI_ID = 0;

    const isPaid = await pool.query("SELECT user_id,plan_type,status,validity FROM payments WHERE user_id = $1 ORDER BY created_at  DESC LIMIT 1", [socket.user.userId]);
    // console.log(isPaid.rows)
    if (isPaid.rows.length === 0) {
        socket.userIsPaid = false;
        socket.userplanType = "Free";
        socket.userStatus = "inactive";
    } else {
        if (isPaid.rows[0].status === "active") {
            socket.userIsPaid = true;
            socket.userplanType = isPaid.rows[0].plan_type;
            socket.userStatus = "active";
        } else {
            socket.userIsPaid = false;
            socket.userplanType = "Free";
            socket.userStatus = "inactive";
        }
        // console.log("user has paid")
    }
    socket.on("message", async (data) => {
        if (!data.message || !data.user_id || !data.sender_name) {
            console.log("message is incomplete")
            return;
        }
        // console.log(data)
        const sender_id = socket.user.userId;
        const sender_name = data.sender_name;


        // Create room name by sorting IDs
        const roomName = [sender_id, AI_ID].sort((a, b) => a - b).join("_");


        // join the room so that the users in the room can see the live messages
        socket.join(roomName);

        const messagesSentUntilNow = await CheckMessageLimitStatus(sender_id);
        const totalSent = messagesSentUntilNow?.total_sent;
        // Define limits per plan type
        const limits = {
            free: 50,
            'Casual Vibes': 200,
            'Getting spicy': 500,
            'Serious Series': 1000
        };

        // Check if user reached their daily limit
        if (totalSent.total_sent >= limits[socket.userplanType] ||
            (socket.userIsPaid === false && totalSent.total_sent >= limits.free)) {

            // Update the date to tomorrow to reset the counter
            await pool.query(
                "UPDATE rate_limit SET date = $1, message_sent = 0 WHERE user_id = $2",
                [tomorrowFormatted, sender_id]
            );

            io.to(roomName).emit("newMessage", {
                message: "You've reached your daily limit. Please wait until tomorrow or upgrade your plan.",
                name: "Alice",
                user_id: 0
            });
            return;
        }
        // If no record exists, create one
        if (totalSent.total_sent == 0) {

            await pool.query(
                "INSERT INTO rate_limit (user_id, date, message_sent) VALUES ($1, $2, 1)",
                [sender_id, today]
            );
        }
        // Otherwise increment the counter
        else {
            await pool.query(
                "UPDATE rate_limit SET message_sent = message_sent + 1 WHERE user_id = $1 AND date = $2",
                [sender_id, today]
            );
        }

        // generating embedding for the message
        const embeddings = await GenerateMatchingChatHistoryEmbedding(data.message);

        if (embeddings.length === 0 || !embeddings[0].values || embeddings.error) {
            console.log("Embedding was not generated", embeddings);
            io.to(roomName).emit("newMessage", { message: "The Server has a lots of users right now so there are some issues , please try again later! ", name: "Alice", user_id: AI_ID });
            return;
        }

        // console.log(embeddings[0])
        // const storedUserMessageVectorDimensions = await StoreEmbeddings(embeddings, data.message, sender_id)
        // if (storedUserMessageVectorDimensions?.error) {
        //     console.log(storedUserMessageVectorDimensions.error);
        //     return;
        // }
        const UserResponse = await pool.query(
            "INSERT INTO messages (room_name, user_id, message,sender_type) VALUES ($1, $2, $3,$4) RETURNING *",
            [roomName, sender_id, data.message, 'user'], (err, res) => {
                if (err) {
                    io.to(roomName).emit("newMessage", { message: "The Server is very  busy right now ", name: "Alice", user_id: AI_ID });
                    console.log("Could not insert the user messgae in the database")
                    return;
                }
            });

        // caching the data
        const cachedUserMessage = await InsertChatsIntoMemory(roomName, data.message, sender_name, sender_id);

        await InvokeContextGenerator(roomName, data.message, sender_id, socket.userIsPaid, socket.userplanType);


        // emitting the message after insetion to the users in that particular room
        io.to(roomName).emit("newMessage", { message: data.message, name: sender_name, user_id: sender_id });

        // generating ai response based on isPaid status , if user does not have a subscription use gemini for basic chats and companionship
        let aiResponse;
        // if (socket.userIsPaid === true) {
        aiResponse = await GetAIResponse(data.message, sender_id, roomName, socket.userIsPaid, embeddings);
        // console.log("gemini is responding", aiResponse)

        // } 
        // else {
        //     // else use counterAi api with uncensored ai models
        //     aiResponse = await GenerateNsfwResponse(data.message, sender_id, roomName, socket.userIsPaid);
        //     console.log("counterAI  is responding")
        //     console.log(aiResponse);
        // }
        if (aiResponse?.error) {
            // console.log(aiResponse);
            console.log("Ai response generation error", aiResponse.error);
            io.to(roomName).emit("newMessage", { message: "The Server has a lots of users right now so there are some issues , please try again later! ", name: "Alice", user_id: AI_ID });
            return;
        }

        // const AiEmbedding = await GenerateEmbedding(aiResponse.response);
        // if (!AiEmbedding || !AiEmbedding[0]?.values || embeddings.error) {
        //     console.log("Error while creting embedding for the ai response", AiEmbedding)
        //     io.to(roomName).emit("newMessage", { message: "The Server has a lots of users right now so there are some issues , please try again later! ", name: "Alice", user_id: AI_ID });
        //     return { error: "Error while creting embedding for the ai response" }
        // }

        // const storedAiResponseVectorDimensions = await StoreEmbeddings(AiEmbedding, aiResponse.response, AI_ID)

        // if (storedAiResponseVectorDimensions?.error) {
        //     console.log(storedAiResponseVectorDimensions.error);
        //     return;
        // }
        // then store in the database
        const modelResponse = await pool.query(
            "INSERT INTO messages (room_name, message,sender_type) VALUES ($1, $2,CAST($3 AS VARCHAR(10))) RETURNING *",
            [roomName, aiResponse.response, 'model'], (err, res) => {
                if (err) {
                    io.to(roomName).emit("newMessage", { message: "The Server is busy very right now", name: "Alice", user_id: AI_ID })
                    console.log("Could not insert the ai messgae in the database")
                    return;
                }
            });
        // const modelResponse = await storeMessage(roomName, AI_ID, aiResponse.response, 'model')

        // store the ai response in the databse
        const cachedAiResposne = await InsertChatsIntoMemory(roomName, aiResponse.response, "Alice", AI_ID);
        const context = await InvokeContextGenerator(roomName, aiResponse.response, AI_ID, socket.userIsPaid);
        // console.log(context)
        // then emit the ai response to the users in that room
        io.to(roomName).emit("newMessage", { message: aiResponse.response, name: "Alice", user_id: AI_ID });


    });

    // disconnect event for socket cleanup
    socket.on("disconnect", () => {
        // console.log("User has been disconnected");
    });
}));

// function to store messages in the database
const storeMessage = async (roomName, senderId, message, senderType) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const res = await client.query(
            `INSERT INTO messages 
       (room_name, user_id, message, sender_type) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
            [roomName, senderId, message, senderType]
        );

        await client.query(
            `UPDATE rate_limit 
       SET message_sent = message_sent + 1 
       WHERE user_id = $1 AND date = $2`,
            [senderId, new Date().toISOString().split('T')[0]]
        );

        await client.query('COMMIT');
        return res.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};


// this function wiill insert data intot  memory
async function InsertChatsIntoMemory(roomName, message, sender_name, sender_id) {
    try {

        if (!roomName || !message || !sender_name || sender_id === null || sender_id === undefined) {
            // console.log(roomName, message, sender_name, sender_id);
            return { error: "All the fields are necessary to cache the chats" };
        }
        const RedisKey = `RoomInfo:${roomName}:roomHistory`;

        const messageData = {
            message: message, name: sender_name, user_id: sender_id,
        };
        let pastConvos = await Redisclient.get(RedisKey);

        if (pastConvos) {
            pastConvos = JSON.parse(pastConvos);
            pastConvos.push(messageData);

            //  update the cache of chat history
            await Redisclient.set(RedisKey, JSON.stringify(pastConvos), 'EX', 400)
            return;
        } else {
            // If there’s no cached chat history, it means this is the user's first message
            await Redisclient.set(RedisKey, JSON.stringify([messageData]), 'EX', 400);
            return;

        }
    } catch (error) {
        console.error(error);
        return { error: "Something went wrong while caching the chats" }
    }
}


// function to invoke context generator
export const InvokeContextGenerator = async (roomName, message, sender_id, isPaid, plan_type) => {
    try {
        if (!roomName || !sender_id || isPaid === null || isPaid === undefined || !message) {
            return { error: "All the data was not given to the increment counter" };
        }

        // Normalize plan_type for easier comparison
        const normalizedPlan = (plan_type || "").toLowerCase();
        console.log(plan_type, normalizedPlan, "plan with normalized plan");
        // Determine interval based on user status and plan
        let interval = 15; // default for free/unpaid
        if (isPaid) {
            if (normalizedPlan === "casual vibes") interval = 10;
            else if (normalizedPlan === "getting spicy") interval = 7;
            else if (normalizedPlan === "serious series") interval = 3; // or 4 if you want, change here
        } else {
            // If plan_type is null, undefined, or "NULL" (string), treat as free
            if (!plan_type || normalizedPlan === "null") interval = 15;
        }

        // Check current counter
        const CounterCheckQuery = await pool.query(`SELECT * from context_counter WHERE room_name = $1`, [roomName]);
        const counterRow = CounterCheckQuery.rows[0];

        if (!counterRow) {
            // No counter exists, create one
            console.log("Inserting a new counter value in the database")
            await pool.query(
                `INSERT INTO context_counter (count, room_name) VALUES($1, $2)`,
                [0, roomName]
            );
        } else if (counterRow.count >= interval) {
            // Reset counter and generate context
            await pool.query(
                `UPDATE context_counter SET count = $1 WHERE room_name = $2`,
                [0, roomName]
            );
            console.log("resetting the counter value in the db")
            const context = await generateContext(message, sender_id, isPaid, plan_type);
            if (!context) {
                return { error: "Error while generating summary of the conversation" };
            }
            await pool.query(
                `INSERT INTO chat_context (room_name, summary) VALUES ($1, $2)`,
                [roomName, context]
            );
        } else if (counterRow.count >= 0 && counterRow.count < interval) {
            // Increment the counter
            console.log("Incrementing the  counter value in the db")

            await pool.query(
                `UPDATE context_counter SET count = count + 1 WHERE room_name = $1`,
                [roomName]
            );
        }
    } catch (error) {
        console.error(error);
    }
}



export async function getChatHistory(req, res) {
    try {
        const userId = req.user.userId;
        const AI_ID = 0;
        if (!userId) {
            console.log("user ki id not found");
            return res.status(404).json({ success: false, message: "No user id found please try again" });
        }
        const roomName = [userId, AI_ID].sort((a, b) => a - b).join("_");

        // if the chat history as been cached
        const RedisKey = `RoomInfo:${roomName}:roomHistory`;
        await Redisclient.del(RedisKey);
        // let previousChats = await Redisclient.get(RedisKey);
        // if (previousChats) {
        //     previousChats = JSON.parse(previousChats);
        //     return res.status(200).json(previousChats);
        // }
        const currentDate = new Date();
        //  fetch messages from messages tables where user id is present but only last 8
        const User_isPaid = await pool.query(`SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC`, [userId])
        const dbDate = new Date(User_isPaid.rows[0].valid_to); // From DB (UTC)

        //   dynamically set limit based on subscription type
        let query;
        if (User_isPaid.rows.length === 0) {
            query = `SELECT * FROM messages LEFT JOIN users u ON u.id = messages.user_id  WHERE room_name = $1 ORDER BY sent_at DESC LIMIT 5`;
        } else if (User_isPaid.rows[0].status === "active" && User_isPaid.rows[0].plan_type === "Casual Vibes" && currentDate.getTime() < dbDate.getTime()) {


            query = `SELECT * FROM messages LEFT JOIN users u ON u.id = messages.user_id  WHERE room_name = $1 ORDER BY sent_at DESC LIMIT 8`;
        } else if (User_isPaid.rows[0].status === "active" && User_isPaid.rows[0].plan_type === "Getting spicy" && currentDate.getTime() < dbDate.getTime()) {

            query = `SELECT * FROM messages LEFT JOIN users u ON u.id = messages.user_id  WHERE room_name = $1 ORDER BY sent_at DESC LIMIT 15`;

        } else if (User_isPaid.rows[0].status === "active" && User_isPaid.rows[0].plan_type === "Serious Series" && currentDate.getTime() < dbDate.getTime()) {
            query = `SELECT * FROM messages LEFT JOIN users u ON u.id = messages.user_id  WHERE room_name = $1 ORDER BY sent_at DESC LIMIT 20`;
        } else if (User_isPaid.rows[0].status === "active" && currentDate.getTime() > dbDate.getTime()) {

            await pool.query(`UPDATE payments SET status = $1 WHERE user_id = $2`, ["Inactive", userId]);
            query = `SELECT * FROM messages LEFT JOIN users u ON u.id = messages.user_id  WHERE room_name = $1 ORDER BY sent_at DESC LIMIT 5 `;
        }

        const chats = await pool.query(query, [roomName]);
        if (chats.rows.length === 0) {
            return res.status(200).json([]);
        }
        // await Redisclient.set(RedisKey, JSON.stringify(chats.rows), 'EX', 350); //around 11 mins
        return res.status(200).json(chats.rows.reverse());

    } catch (error) {
        console.log(error);
    }
}



// this function will keep checking the limit of messages sent until now by a particular user

const CheckMessageLimitStatus = async (sender_id) => {
    try {
        const today = new Date().toISOString().split("T");
        const limit = await pool.query("SELECT  COUNT(message_sent) AS total_sent  FROM rate_limit WHERE user_id = $1 AND date = $2", [sender_id, today]);
        // console.log(limit.rows)
        if (limit.rows.length === 0) {
            return { total_sent: "0" };
        } else {
            return { total_sent: limit.rows[0] }
        }


    } catch (error) {
        console.log(error);
        return { issue: error };
    }
}

// function to geenrate vector embeddin fot eh user message or the ai message

export const GenerateEmbedding = async (message) => {
    try {
        if (!message?.trim()) {
            // console.error(message, "Empty message recieved")
            return { error: "A message is required to generate an embedding" };
        }
        const ai = new GoogleGenAI({
            apiKey: process.env.SEOND_API_KEY,
            timeout: 5000 // Add timeout
        });
        const retries = 2;
        for (let i = 0; i < retries; i++) {
            try {
                const response = await ai.models.embedContent({
                    model: 'gemini-embedding-exp-03-07',
                    contents: message,
                    config: { taskType: "SEMANTIC_SIMILARITY" }
                });

                if (!response.embeddings || response.error) {
                    return { error: "No embeddings were generated , maybe the tokens have been exhausted" }
                }
                // console.log(response.embeddings,"response embeddings at generte embeddings function")
                return response.embeddings;

            } catch (error) {
                if (i === retries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    } catch (error) {
        console.error("Embedding generation failed:", error.message);
        throw error; // Re-throw for upstream handling
    }
}
// generate embeddings for the current users message
const GenerateMatchingChatHistoryEmbedding = async (message) => {
    try {
        if (!message?.trim()) {
            // console.error(message, "Empty message recieved")
            return { error: "A message is required to generate an embedding" };
        }
        const ai = new GoogleGenAI({
            apiKey: process.env.SEOND_API_KEY,
            timeout: 5000 // Add timeout
        });
        const retries = 2;
        for (let i = 0; i < retries; i++) {
            try {
                const response = await ai.models.embedContent({
                    model: 'gemini-embedding-exp-03-07',
                    contents: message,
                    config: { taskType: "SEMANTIC_SIMILARITY" }
                });

                if (!response.embeddings || response.error) {
                    return { error: "No embeddings were generated , maybe the tokens have been exhausted" }
                }

                return response.embeddings;

            } catch (error) {
                if (i === retries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    } catch (error) {
        console.error("Embedding generation failed:", error.message);
        throw error; // Re-throw for upstream handling
    }

}
//  function to insert the embeddings into qdrnt databasee

export const StoreEmbeddings = async (embeddings, message, sender_id) => {
    try {
        if (!embeddings || !message || sender_id === null || sender_id === undefined) {
            // console.log(embeddings, message, sender_id)
            return { error: "An array of vector dimensions is a must to proceed any further" };
        }
        const newId = uuidv4();


// console.log(embeddings , message,sender_id)
        const storedValues = await qdrntclient.upsert("message_summaries", {
            points: [{
                id: newId,//generated unique uuid
                vector: embeddings,
                payload: {
                    message: message, // text
                    sender_id: parseInt(sender_id), // integer
                    timestamp: new Date().toISOString() // datetime
                }
            }]
        });
        // console.log(storedValues,"Message stored successfully");
        return true;
    } catch (error) {
        console.error("Insert error:", error);
        return false;
    }
}

export const getMatchingMessages = async (message, sender_id, embeddings) => {
    try {
        if (!message || sender_id === null || sender_id === undefined || !embeddings) {
            return { error: "A message or sender_id is missing from the inputs" };
        }
        // console.log("Embeddings length:", embeddings.length);

        try {

            const results = await qdrntclient.search("message_summaries", {
                vector: embeddings[0].values,
                limit: 8,
                with_payload: true,
                filter: {
                    must: [{
                        key: "sender_id",
                        match: {
                            value: parseInt(sender_id) // Must match integer type
                        }
                    }]
                }
            });

            if (!results || results.length === 0) {
                return [];
            }
            console.log(results)
            const FormattedResulsts = results.map((msg) => ({
                role: msg.payload.user_id === sender_id ? "user" : "model",
                parts: [{ text: msg.payload.message }]
            }));

            return FormattedResulsts;

        } catch (error) {
            console.error("Search error:", error);
            throw error;
        }



    } catch (err) {
        console.error(err)
        return { error: err }
    }
}