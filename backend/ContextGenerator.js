import { GoogleGenerativeAI } from "@google/generative-ai";
import { pool } from "./Database.js";
const genAI = new GoogleGenerativeAI(process.env.SEOND_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
// assigned role to AI
const SYSTEM_PROMPT = `You are a context generator AI. You will be given a user's message. Your job is to immediately analyze it and return a detailed context summary. Include:
- Mood (e.g., happy, anxious, curious)
- Emotional State (e.g., stressed, relaxed, confused)
- Summary of what the user is trying to express
Respond ONLY with the context summary. Do not explain your process.
Also add these things in the summary 1.What user was talking about!.
You will also have the access to previous 10 messages you can use them to update the context summary so that we can provide better emotional support to the user.
`;


export const generateContext = async (message, sender_id) => {
    try {
        if ( !sender_id) {
            return { message: "no user response found" };
        }

        // get past messages
        const history = await ContextProvider(sender_id);
        // create a object of all of them
        const chatHistory = [
            ...history, // Add previous messages for context
            ...(message ? [{ role: "user", parts: [{ text: message }] }] : []), // Current message
        ];
        // send gemini the requested message 
        const result = await model.generateContent({
            contents: chatHistory,
            systemInstruction: { role: "system", parts: [{ text: SYSTEM_PROMPT }] },
        });

        const responseText = result.response.text();

        if (!responseText) {
            return { error: "ALICE was unable to generate a response,please try again  later" };
        }
        return { response: responseText };

    } catch (error) {
        throw error;
    }
}


async function ContextProvider(sender_id) {
    if (!sender_id) return [];
    try {
        // creating a roomName
        const AI_ID = 0;
        const roomName = [sender_id, AI_ID].sort((a, b) => a - b).join("_");
        if (!roomName) {
            return;
        }
        const query = `SELECT sender_type, message FROM messages WHERE room_name = $1 ORDER BY sent_at DESC LIMIT 20`;
        const { rows } = await pool.query(query, [roomName]);

        if (rows.length === 0) return [];

        // Format messages for Gemini API
        return rows
            .reverse()
            .filter((msg) => msg.message && msg.message.trim().length > 0)  
            .map((msg) => ({
                role: msg.sender_type === "user" ? "user" : "model",
                parts: [{ text: msg.message }],
            }));


    } catch (error) {
        console.log(error);
    }
}