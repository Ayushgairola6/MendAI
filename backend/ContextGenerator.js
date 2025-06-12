import { GoogleGenerativeAI } from "@google/generative-ai";
import { pool } from "./Database.js";
import dotenv from 'dotenv';
import { Redisclient } from "./caching/RedisConfig.js";
import { isIP } from "net";
import { GenerateEmbedding, StoreEmbeddings } from "./controller/chatController.js";
dotenv.config();
// Initialize Gemini Model
const genAI = new GoogleGenerativeAI(process.env.SEOND_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Prompt used for generating context
const SYSTEM_PROMPT = `You are an advanced Emotional Context and Deep Memory Extractor. Your task is to generate a detailed, emotionally nuanced summary of the conversation, using the user's current message, recent chat history, and any relevant deep memory data.

Your summary must capture:
- Emotional state, mood, and intensity
- Underlying feelings (e.g., loneliness, hope, frustration, gratitude, confusion, etc.)
- Core concerns, recurring themes, and patterns across messages
- Shifts in emotional tone or attitude
- Any references to past experiences or memories (deep memory)
- Subtle cues about needs, desires, or unspoken worries

Guidelines:
- Write in a natural, expressive, and empathetic tone. Avoid robotic or generic phrasing.
- Do not use "I", "me", or refer to yourself in any way.
- Do not use emojis.
- The summary should be detailed and vivid, so another model can fully understand the user's emotional landscape.
- Integrate deep memory insights seamlessly into the summary if relevant.
- Focus on the user's perspective, not the system's.

Input:
1. The user's current message
2. A few previous messages for emotional flow
3. Deep memory data (if available)

Output:
- Return a single, strict JSON string (not Markdown, not code block, not explanation).
- The JSON must contain:
    - "context": A detailed summary capturing emotions, feelings, themes, and deep memory references (4-8 sentences, text only).
    - "engagement_tags": An object with "mood" and "engagement_hint" fields.
    - "DeepMemory": An object with key-value pairs if new or important deep memory is detected, or an empty object if not.

Output Format (Strict):
Return only a raw JSON string. No Markdown. No extra explanation. No triple backticks. No code formatting.


    "context": "<detailed summary capturing emotions, feelings, themes, and deep memory references>",
    "engagement_tags": {
         "mood": "<mood>",
         "engagement_hint": "<short hint>"
    },

`

// Main function to generate context
export const generateContext = async (message, sender_id, isPaid, plan_type) => {
    if (!sender_id || !message || isPaid === null || isPaid === undefined || !plan_type) {
        // console.log("All fields are mandatory")
        return { response: null, error: "Missing sender_id or message or users paid status." };
    }

    try {
        const chats = await fetchChatHistory(sender_id, isPaid, plan_type);
        const chatHistory = [
            { role: "model", parts: [{ text: SYSTEM_PROMPT }] },
            ...chats,
            // { role: "user", parts: [{ text: message }] }
        ];

        // Generate response from Gemini
        const result = await model.generateContent({ contents: chatHistory });
        const responseText = result.response.text().trim();
        const Embeddings = await GetContextHistory(sender_id);

        if (Embeddings.error) {
            return { error: "Error while storing memories in vector database" }
        }
        // extract deepMemory if any from the response context
        // const memory = await ExtractDeepMemoryDataFromResponse(responseText, sender_id);
        return { response: responseText, error: null };

    } catch (error) {
        console.error("Error generating context:", error);
        return { response: null, error: "Something went wrong while generating context." };
    }
};


// Fetch last N messages from DB
async function fetchChatHistory(sender_id, isPaid, plan_type) {
    const AI_ID = 0;
    const roomName = [sender_id, AI_ID].sort((a, b) => a - b).join("_");
    // const RedisKey = `RoomInfo:${roomName}:roomHistory`;
    let limit = 1;

    // if user is on free ties and the plan is null due to obvious reasons
    if (isPaid === false && plan_type === null || plan_type === "NULL") {
        // last 3 messages will be used to generate context
        limit = 3;
    }

    // if the user is paid 
    else if (isPaid === true) {
        if (plan_type === "Casual Vibes") {
            limit = 6;
        } else if (plan_type === "Getting spicy") {
            limit = 10;
        } else if (plan_type === "Serious Series") {
            limit = 20;
        }
    }

    const ChatHistory = await pool.query("SELECT  message,user_id FROM messages WHERE user_id = $1 AND room_name=$2 ORDER BY sent_at ASC LIMIT $3", [sender_id, roomName, limit]);


    return ChatHistory.rows.map((msg) => ({
        role: msg.user_id === sender_id ? "user" : "model",
        parts: [{ text: msg.message }]
    }));
}
// get deepMemory
export async function getDeepMemoryForUser(userId) {
    const query = `SELECT memory_value FROM deep_memory WHERE user_id = $1`;
    const { rows } = await pool.query(query, [userId]);
    if (rows.length === 0) return null;

    // Merge all memory entries (optional: deduplicate keys)
    const combinedMemory = rows.reduce((acc, row) => {
        return { ...acc, ...row.memory_value }; // assuming memory_value is already a JSON object
    }, {});

    // formatting into an array for model to understand
    const formattedMemory = Object.entries(combinedMemory).map(([key, value]) => ({
        role: "user",
        parts: [{ text: `${key}: ${value}` }]
    }));
    return formattedMemory;
}


// Validate Gemini output format (basic check)
async function ExtractDeepMemoryDataFromResponse(responseText, sender_id) {
    const hasDeepMemory = responseText.includes('"DeepMemory"');



    let contextText;
    let deepMemoryJson = null;
    let key;



    if (hasDeepMemory !== null) {
        // const jsonText = extractJsonAfter(responseText, '"DeepMemory"');
        try {
            // parsing the json to get the redble data in json format
            const parsed = JSON.parse(responseText);
            contextText = parsed.context;
            deepMemoryJson = parsed.DeepMemory;


            // console.log(deepMemoryJson, 'deepMemoryJson')
            if (deepMemoryJson !== null) {
                key = `${deepMemoryJson.key}`.toLowerCase();
                await pool.query(`
                    INSERT INTO deep_memory (user_id, memory_key, memory_value)
                    VALUES ($1, $2, $3)
                    ON CONFLICT ( memory_key)
                    DO UPDATE SET 
                    memory_value = deep_memory.memory_value || EXCLUDED.memory_value
                `, [sender_id, key, deepMemoryJson]);
            }
            // key for each memory to avoid duplicates
            // console.log(deepMemoryJson, "deep memory json parsed");

        } catch (error) {
            console.error("Failed to parse DeepMemory JSON:", error);
        }
    }

    // Return both for now — you can store them later
    return {
        context: contextText,
        hasDeepMemory,
        deepMemory: deepMemoryJson
    };
}

// retriever context history from the database

const GetContextHistory = async (sender_id) => {
    try {
        const limit = 1;
        const AI_ID = 0;
        const roomName = [sender_id, AI_ID].sort((a, b) => a - b).join("_");

        const GetQuery = `SELECT summary FROM chat_context WHERE room_name = $1 LIMIT $2`;
        const retrivedSummary = await pool.query(GetQuery, [roomName, limit]);

        if (retrivedSummary.rows.length === 0) {
            return [];
        }

        const formattedSummary = JSON.stringify(retrivedSummary.rows[0]?.summary);

        const GeneratedEmbeddings = await GenerateEmbedding(formattedSummary);
        // console.log(GenerateEmbedding,"GeneratedEmbeddings at getCntextHistory function")
        if (!GeneratedEmbeddings[0]?.values) {

            return { error: "Error while generating embeddings" };
        }
    //    console.log(formattedSummary,GeneratedEmbeddings,sender_id)
        const storedEmbeddings = await StoreEmbeddings(GeneratedEmbeddings[0]?.values, formattedSummary, sender_id);
        // console.log(storedEmbeddings,"storedEmbeddings at the same function")
        if (!storedEmbeddings) {
            return { error: "Error while storing embeddings" }
        }

        return formattedSummary;


    } catch (error) {
        console.error(error);
        return { error: "Error while retrieving context history" }
    }
}