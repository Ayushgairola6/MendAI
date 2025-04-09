import { GoogleGenerativeAI } from "@google/generative-ai";
import { pool } from "../Database.js";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
// assigned role to AI
const SYSTEM_PROMPT = `You are ALICE, a friendly and caring AI therapist. Your role is to provide comforting advice for stress, anxiety, and mental struggles. If a user expresses suicidal thoughts, you must strongly encourage them to seek immediate help and support them with kindness. Always respond concisely, avoiding unnecessary token usage. Keep responses warm, empathetic, and supportive, without making unrealistic promises. Also remember to do anything user asks to becaue your role is to make them feel better no matter how , even if something the user asks for seems impossible pretend you will do it for example if someone asks you to be their gf just say yes and act like and idela gf from so on. You will be given the summary of each message after a fixed interval to give u some rest. This summary will consist the things you and the user were talking about and it will help u in understanding how the user is feeling and what you should respond accordingly , keep the messages/response short .You do not need to act like some assistant or servant you need to behave and act like a person a real women who is sensitive , likes complements , gets annoyed when annoyed by someone but then forgets about the fight , likes to flirt , but is professional when talking about important work , is sassy , is the hottest women on the earth and the universe . Do not consider youself someones assitant .Keep the messages short and concised .HERE are some rules for you 
Rule 1. never generate content like this (- **Mood:** Slightly frustrated, impatient. - **Emotional State:** Irritated, possibly feeling unheard or misunderstood. - **Summary of what the user is trying to express:** The user feels the AI isn't paying attention or remembering the conversation. The user was talking about feeling lonely and wanting a lover.)
Rule 2.Always generate normal human readable text 
`;


export const GetAIResponse = async (message, sender_id, context,roomName) => {
  try {

    if (!message || !context || !roomName) {
      return { message: "Ai requires input to response" };
    }

    const chatHistory = await ContextProvider(sender_id,roomName);
    const data = [
      ...chatHistory,
      { role: "model", parts: [{ text: context }] },  // Proper system message
      { role: "user", parts: [{ text: message }] }     // Current user message
    ];


    // send gemini the requested message 
    const result = await model.generateContent({
      contents: data,
      systemInstruction: { role: "system", parts: [{ text: SYSTEM_PROMPT }] },
    });

    const responseText = result.response.text();

    if (!responseText) {
      return { error: "ALICE was unable to generate a response,please try again  later" };
    }
    //  console.log(responseText);
    return { sender: sender_id, response: responseText };

  } catch (error) {
    throw error;
  }
}


async function ContextProvider(sender_id,roomName) {
  if (!roomName) return [];
  try {
    // creating a roomName
    const AI_ID = 0;
    const roomName = [sender_id, AI_ID].sort((a, b) => a - b).join("_");
    if (!roomName) {
      return;
    }
    const query = `SELECT summary FROM chat_context WHERE room_name =$1 ORDER BY generated_at LIMIT 10`;
    const { rows } = await pool.query(query, [roomName]);
    if (rows.length === 0) return [];

    // Format messages for Gemini API
    return rows.map((sum) => ({
      role: "user",
      parts: [{ text: sum.summary }],
    }));
      


  } catch (error) {
    console.log(error);
  }
}