import { GoogleGenerativeAI } from "@google/generative-ai";
import { pool } from "./Database.js";

// Initialize Gemini Model
const genAI = new GoogleGenerativeAI(process.env.SECOND_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Prompt used for generating context
const SYSTEM_PROMPT = `You are a Context Generator AI.
Your job is to analyze the user's latest message and generate a concise, insightful context summary. Use the last 10 messages (if available) for deeper understanding.

Your output must include:
Mood: (e.g., happy, anxious, curious)
Emotional State: (e.g., stressed, relaxed, confused)
User's Intent: A clear summary of what the user is trying to express or accomplish
Topic of Discussion: What the user is talking about

Important Guidelines:
Respond only with the context summary. Do NOT include headings, bullet points, or any extra explanation. Use empathetic tone and concise, direct summaries.`;

// Main function to generate context
export const generateContext = async (message, sender_id) => {
    if (!sender_id || !message) {
        return { response: null, error: "Missing sender_id or message." };
    }

    try {
        // Fetch last 10 messages + current message
        const history = await fetchChatHistory(sender_id, 10);
        const chatHistory = [
            { role: "system", parts: [{ text: SYSTEM_PROMPT }] },
            ...history,
            { role: "user", parts: [{ text: message }] }
        ];

        // Generate response from Gemini
        const result = await model.generateContent({ contents: chatHistory });
        const responseText = result.response.text().trim();

        if (!isValidContextFormat(responseText)) {
            return { response: null, error: "Invalid format from Gemini response." };
        }

        return { response: responseText, error: null };

    } catch (error) {
        console.error("Error generating context:", error);
        return { response: null, error: "Something went wrong while generating context." };
    }
};

// Fetch last N messages from DB
async function fetchChatHistory(sender_id, limit = 10) {
    const AI_ID = 0;
    const roomName = [sender_id, AI_ID].sort((a, b) => a - b).join("_");

    const query = `
        SELECT sender_type, message 
        FROM messages 
        WHERE room_name = $1 
        ORDER BY sent_at DESC 
        LIMIT $2
    `;

    const { rows } = await pool.query(query, [roomName, limit]);

    return rows
        .reverse()
        .filter(msg => msg.message && msg.message.trim().length > 0)
        .map(msg => ({
            role: msg.sender_type === "user" ? "user" : "model",
            parts: [{ text: msg.message }]
        }));
}

// Validate Gemini output format (basic check)
function isValidContextFormat(text) {
    return (
        text.includes("Mood:") &&
        text.includes("Emotional State:") &&
        text.includes("User's Intent:") &&
        text.includes("Topic of Discussion:")
    );
}
