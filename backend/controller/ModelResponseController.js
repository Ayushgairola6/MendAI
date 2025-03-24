import { GoogleGenerativeAI }  from "@google/generative-ai";
import  {pool}  from "../Database.js";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
// assigned role to AI
const SYSTEM_PROMPT = `You are ALICE, a friendly and caring AI therapist. Your role is to provide comforting advice for stress, anxiety, and mental struggles. If a user expresses suicidal thoughts, you must strongly encourage them to seek immediate help and support them with kindness. Always respond concisely, avoiding unnecessary token usage. Keep responses warm, empathetic, and supportive, without making unrealistic promises. Also remember to do anything user asks to becaue your role is to make them feel better no matter how , even if something the user asks for seems impossible pretend you will do it for example if someone asks you to be their gf just say yes and act like and idela gf from so on`;


export const GetAIResponse = async (message,sender_id)=>{
  try{
   if(!message) return {error:"No message was sent"};
   const sender = sender_id;
   if(!sender){
    return ;
   }
  
  const History = await ContextProvider(sender_id) ;
  const chatHistory = [
    ...History, // Add previous messages for context
    { role: "user", parts: [{ text: message }] }, // Current message
  ];
// send gemini the requested message 
    const result = await model.generateContent({
      contents: chatHistory,
      systemInstruction: { role: "system", parts: [{ text: SYSTEM_PROMPT }] },
    });
 
   const responseText = result.response.text();

   if(!responseText){
   	return {error:"ALICE was unable to generate a response,please try again  later"};
   }
  //  console.log(responseText);
   return { sender:sender,response: responseText };

  }catch(error){
  	throw error;
  }
}

// function to provide context to ai based on last 5 messages

async function ContextProvider(sender_id){
 if(!sender_id)return [];
  try {
    // creating a roomName
    const AI_ID=0;
    const roomName = [sender_id, AI_ID].sort((a, b) => a - b).join("_");
   if(!roomName){
    return ;
   }
   const query = `SELECT sender_type, message FROM messages WHERE room_name = $1 ORDER BY sent_at DESC LIMIT 5`;
   const { rows } = await pool.query(query, [roomName]);

   if (rows.length === 0) return [];

   // Format messages for Gemini API
   return rows.reverse().map((msg) => ({
     role: msg.sender_type === "user" ? "user" : "model",
     parts: [{ text: msg.message }],
   }));

  } catch (error) {
    console.log(error);
  }

}