import { GoogleGenerativeAI } from "@google/generative-ai";
import { pool } from "../Database.js";
import { generateContext } from '../ContextGenerator.js';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
import dotenv from 'dotenv';
import { Redisclient } from "../caching/RedisConfig.js";
dotenv.config();
import { getDeepMemoryForUser } from "../ContextGenerator.js";

// Generates AI response using merged summaries and recent messages
export const GetAIResponse = async (message, sender_id, roomName, userIsPaid) => {
  try {
    if (!message || !roomName) {
      return { error: "AI requires input to respond" };
    }

    // if (userIsPaid !== false) {
    //   console.log(userIsPaid);
    //   return { error: "This User has a Premium Subscription " };
    // }


    // Build full context: summaries + recent chats + current message
    const combinedContext = await ContextProvider(sender_id, userIsPaid);
    combinedContext.push({ role: "user", parts: [{ text: message }] });
    let deep_memory;
    if (await getDeepMemoryForUser(sender_id) === null) {
      deep_memory = [];
    } else {
      deep_memory = await getDeepMemoryForUser(sender_id);
    }
    // sending the conext to the model
    // console.log(deep_memory);
    const result = await model.generateContent({
      contents: [
        { role: "model", parts: [{ text: process.env.SYSTEM_PROMPT }] },
        ...combinedContext,
        ...deep_memory
      ],
      generationConfig: {
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 600,
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
async function ContextProvider(sender_id, userIsPaid) {
  if (!sender_id) return [];
  try {
    const AI_ID = 0;
    const roomName = [sender_id, AI_ID].sort((a, b) => a - b).join("_");
    const RedisKey = `RoomInfo:${roomName}:roomHistory`;
    const hasHistoryCached = await Redisclient.get(RedisKey);
    if (hasHistoryCached) {
      const parsedHistory = JSON.parse(hasHistoryCached);
      return parsedHistory
        .filter(msg => msg.message && msg.message.trim().length > 0)
        .map(msg => ({
          role: msg.sender_type === "user" ? "user" : "model",
          parts: [{ text: msg.message }]
        }));
    }
    // console.log(hasHistoryCached);
    //  last 6 messages
    // const lastChatsQuery = `
    //   SELECT sender_type, message
    //   FROM messages
    //   WHERE room_name = $1
    //   ORDER BY sent_at DESC
    //   LIMIT $2
    // `;
    // const { rows: chatRows } = await pool.query(lastChatsQuery, [roomName, userIsPaid === false ? 5 : 20]);
    // const formattedRecent = chatRows.reverse().map(msg => {
    //   if (!msg.message) return null;
    //   return {
    //     role: msg.sender_type === "user" ? "user" : "model",
    //     parts: [{ text: msg.message }]
    //   };
    // }).filter(Boolean); // removes null




    //last ten summary
    const contextQuery = `
      SELECT summary
      FROM chat_context
      WHERE room_name = $1
      ORDER BY generated_at DESC
      LIMIT $2
    `;
    const { rows: summaryRows } = await pool.query(contextQuery, [roomName, userIsPaid === false ? 5 : 10]);
    const formattedSummaries = summaryRows.map(r => {
      if (!r.summary) return null;
      return {
        role: "model",
        parts: [{ text: r.summary }]
      };
    }).filter(Boolean);

    // returning the memory and recent texts
    return [
      ...formattedSummaries,
      // ...formattedRecent,
      // ...parsedHistory
    ];
  } catch (error) {
    console.error("ContextProvider error:", error);
    return [];
  }
}


