import { GoogleGenerativeAI } from "@google/generative-ai";
import { pool } from "./Database.js";
import dotenv from 'dotenv';
import { Redisclient } from "./caching/RedisConfig.js";
dotenv.config();
// Initialize Gemini Model
const genAI = new GoogleGenerativeAI(process.env.SEOND_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Prompt used for generating context
const SYSTEM_PROMPT = `You are an emotional context extractor. Analyze ONLY the user's current message below:

contetx -> You will be given the users current message as well few previous messages for analyzing the motion to extract DeepMemory from it so that we can understand the user better and for future personalized behavious and contextualization

# **Instructions**  
1. **Context Summary** (1 sentence):  
   - Detect mood/tone (e.g., "lonely", "excited")  
   - Identify core theme (e.g., "social anxiety", "career stress")  
   - Use natural phrasing: "Feeling [mood] about [theme]"  
   - Do not use  any emoji's  in any response  !


2. **DeepMemory Check** (ONLY if ALL are true):  
   - Contains personal revelation (hobbies, relationships, trauma,name, relatives ,relativeType,Insecurities , confidence boosters , features , looks , etc..)  
   - Emotionally significant (intensity ≥ 0.4)  
   - Not transient ("I'm tired" vs "I've been depressed for years")  

3. Core Memory Keys (This is a set of examples you can use to generate deep_memory keys  for the users message after analyzing it)
Category	Subcategory	Key Format	Examples
Users_name user username
Relationship	Pets	relationship_pet_[name]_[type]	relationship_pet_muffin_cat
Ex-Partners	relationship_romantic_ex_[name]	relationship_romantic_ex_john
Current Partners	relationship_romantic_[status]_[name]	relationship_romantic_girlfriend_emma
Personal Trait	Names/Nicknames	personal_trait_name_[type]_[name]	personal_trait_preferred_name_alex
Core Values	personal_trait_value_[concept]	personal_trait_value_honesty
Life Event	Breakups	life_event_breakup_[year]_[name]	life_event_breakup_2023_john
Milestones	life_event_[type]_[year]	life_event_promotion_2024

4. **Output Format** (STRICT):  

Rule->Do not wrap the output in triple backticks. Do not return markdown. Return only a plain string without formatting.
{
  "context": "<summary>", 
  "DeepMemory": {
    "category": "<personal_trait | relationship | life_event>",
    "key": "<category>_<unique_identifier>",
    "content": "<1-2 sentence essence>",
    "emotional_weight": "<0.4 - 0.9>"
  }
}
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
            // ...chats,
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
    // const RedisKey = `RoomInfo:${roomName}:roomHistory`;
    const limit = isPaid === true ? 8 : 4;

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

    const jsonStartIdx = text.indexOf('{', idx);
    const jsonEndIdx = text.lastIndexOf('}');
    if (jsonStartIdx === -1 || jsonEndIdx === -1) return null;

    const jsonSubstring = text.slice(jsonStartIdx, jsonEndIdx + 1);

    try {
        return JSON.parse(jsonSubstring);
    } catch (err) {
        console.error("JSON parse error:", err, "\nExtracted text:\n", jsonSubstring);
        return null;
    }
}