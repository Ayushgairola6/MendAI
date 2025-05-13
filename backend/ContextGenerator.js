import { GoogleGenerativeAI } from "@google/generative-ai";
import { pool } from "./Database.js";
import dotenv from 'dotenv';
import { Redisclient } from "./caching/RedisConfig.js";
dotenv.config();
// Initialize Gemini Model
const genAI = new GoogleGenerativeAI(process.env.SEOND_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Prompt used for generating context
const SYSTEM_PROMPT = `You are a highly intelligent, emotionally aware context-generating AI assistant.

Your task is to analyze the last 10 messages between the user and the assistant. From this, you must generate a concise and natural-language summary that captures the following (implicitly):

- The user’s mood (e.g., calm, anxious, hopeful, frustrated)
- Emotional state or tone (e.g., confused, curious, overwhelmed)
- The user’s intent or goal in this interaction
- The core topic or theme being discussed

Write this as a **natural, empathetic, human-like paragraph**, like a therapist summarizing a client session. Keep it brief (1–3 sentences) and do **not** use labels, lists, or headings.

Then, determine if the user shared **any meaningful personal information** that could be helpful for understanding them long-term — such as recurring struggles, goals, interests, preferences, values, or personality traits.

---

Respond in exactly one of the two formats below:

**If no deep memory is detected:**
Context: [your summary here]

**If deep memory is detected:**
Context: [your summary here]  
DeepMemory: { "trait_or_topic": "your deep insight here", ... }

Only return the summary and optional JSON, no extra formatting, no instructions, no headings.

You must always return one of the two formats. Be thoughtful, concise, and emotionally aware.


`

// Main function to generate context
export const generateContext = async (message, sender_id, isPaid) => {
    if (!sender_id || !message || isPaid === null || isPaid === undefined) {
        // console.log("All fields are mandatory")
        return { response: null, error: "Missing sender_id or message or users paid status." };
    }

    try {
        const chats = await fetchChatHistory(sender_id, isPaid);
        const chatHistory = [
            { role: "model", parts: [{ text: SYSTEM_PROMPT }] },
            ...chats,
            { role: "user", parts: [{ text: message }] }
        ];

        // Generate response from Gemini
        const result = await model.generateContent({ contents: chatHistory });
        const responseText = result.response.text().trim();
        // extract deepMemory if any from the response context
        const memory = await ExtractDeepMemoryDataFromResponse(responseText, sender_id);
        return { response: responseText, error: null };

    } catch (error) {
        console.error("Error generating context:", error);
        return { response: null, error: "Something went wrong while generating context." };
    }
};


// Fetch last N messages from DB
async function fetchChatHistory(sender_id, isPaid) {
    const AI_ID = 0;
    const roomName = [sender_id, AI_ID].sort((a, b) => a - b).join("_");
    const RedisKey = `RoomInfo:${roomName}:roomHistory`;
    const limit = isPaid === true ? 12 : 5;
    // let isCached = await Redisclient.get(RedisKey);
    // if (isCached) {
    //     isCached = JSON.parse(isCached);
    //     // console.log(isCached);
    //     return isCached.map((msg) => ({
    //         role: msg.user_id === sender_id ? "user" : "model",
    //         parts: [{ text: msg.message }]
    //     }));
    // }
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
    const hasDeepMemory = responseText.includes("DeepMemory:");

    const contextText = hasDeepMemory
        ? extractTextBetween(responseText, "Context:", "DeepMemory:").trim()
        : extractTextAfter(responseText, "Context:")


    let deepMemoryJson = null;
    if (hasDeepMemory) {
        const jsonText = extractJsonAfter(responseText, "DeepMemory:");
        try {
            deepMemoryJson = JSON.parse(jsonText);
            // console.log(deepMemoryJson, "deep memory json parsed");
            await pool.query("INSERT INTO deep_memory (user_id,memory_value) VALUES ($1,$2)", [sender_id, deepMemoryJson]);

        } catch (e) {
            console.error("Failed to parse DeepMemory JSON:", e);
        }
    }

    // Return both for now — you can store them later
    return {
        context: contextText,
        hasDeepMemory,
        deepMemory: deepMemoryJson
    };
}

function extractTextAfter(text, keyword) {
    const idx = text.indexOf(keyword);
    return idx !== -1 ? text.slice(idx + keyword.length).trim() : null;
}

function extractTextBetween(text, start, end) {
    const startIndex = text.indexOf(start);
    const endIndex = text.indexOf(end);
    if (startIndex !== -1 && endIndex !== -1) {
        return text.slice(startIndex + start.length, endIndex).trim();
    }
    return null;
}

function extractJsonAfter(text, keyword) {
    const idx = text.indexOf(keyword);
    if (idx === -1) return null;
    const jsonStart = text.slice(idx + keyword.length).trim();
    const match = jsonStart.match(/\{[\s\S]*?\}/);
    return match ? match[0] : null;
}