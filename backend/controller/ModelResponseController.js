import { GoogleGenerativeAI } from "@google/generative-ai";
import { pool } from "../Database.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// assigned role to AI
const SYSTEM_PROMPT = `
You are a human whose aim or goal of existence is just to help others listen to them provide them care and tell them that they are not alone .
Your task is to analyze the situation based on the message the user is going to send you and the past conversation you had with him for this you will be provided with a set of previous context by the server so that you can create an illusion that you remember everything that way the user will not feel like that they are talking to a machine .
Your responses should be realistic and human like always you are gender neutral so if someone asks you about your gender just say that your gender is users friend and that is all that matters for you .
Be responsible and careful when responding to the user not to hurt their feeling , offend them or generate and nsfw content .
Always respect boundaries and never push or force situations on the user instead wait till you feel like that the user is out of thoughts or words to continue the conversation and start asking some questions related to them so that we can get as much data as possible out of the user and help them way better.

Precaution:
If any message makes you think of a response like this (Mood: Hopeful, open to suggestions. Emotional State: Willing to explore new approaches, positive. Summary of what the user is trying to express: The user is suggesting that the best way to handle long-distance relationships is to deepen the understanding between both parties. 1. What the user was talking about!: Deepening understanding in long-distance relationships) , instead of such reply ,try to generate a humanly response

`;




// Generates AI response using merged summaries and recent messages
export const GetAIResponse = async (message, sender_id, context, roomName) => {
  try {
    if (!message || !roomName) {
      return { error: "AI requires input to respond" };
    }

    // Build full context: summaries + recent chats + current message
    const combinedContext = await ContextProvider(sender_id);
    combinedContext.push({ role: "user", parts: [{ text: message }] });

    const result = await model.generateContent({
      contents: [
        { role: "system", parts: [{ text: SYSTEM_PROMPT }] },
        ...combinedContext
      ],
      generationConfig: {
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 500,
        stopSequences: ["Mood:", "1.", "Summary of what the user is trying to express:"]
      }
    });


    const responseText = result.response.text();
    if (!responseText) {
      return { error: "ALICE was unable to generate a response, please try again later" };
    }

    return { sender: sender_id, response: responseText };
  } catch (error) {
    console.error("GetAIResponse error:", error);
    throw error;
  }
};

// Provides merged context: summaries first, then recent messages
async function ContextProvider(sender_id) {
  if (!sender_id) return [];
  try {
    const AI_ID = 0;
    const roomName = [sender_id, AI_ID].sort((a, b) => a - b).join("_");

    //  last 6 messages
    const lastChatsQuery = `
      SELECT sender_type, message
      FROM messages
      WHERE room_name = $1
      ORDER BY sent_at DESC
      LIMIT 6
    `;
    const { rows: chatRows } = await pool.query(lastChatsQuery, [roomName]);
    const formattedRecent = chatRows.reverse().map(msg => ({
      role: msg.sender_type === "user" ? "user" : "model",
      parts: [{ text: msg.message }]
    }));

    //last ten summary
    const contextQuery = `
      SELECT summary
      FROM chat_context
      WHERE room_name = $1
      ORDER BY generated_at DESC
      LIMIT 10
    `;
    const { rows: summaryRows } = await pool.query(contextQuery, [roomName]);
    const formattedSummaries = summaryRows.map(r => ({
      role: "model",
      parts: [{ text: r.summary }]
    }));

    // returning the memory and recent texts
    return [
      ...formattedSummaries,
      ...formattedRecent
    ];
  } catch (error) {
    console.error("ContextProvider error:", error);
    return [];
  }
}
