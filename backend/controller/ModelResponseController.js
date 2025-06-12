import { GoogleGenerativeAI } from "@google/generative-ai";
import { pool } from "../Database.js";
import { generateContext } from '../ContextGenerator.js';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
import dotenv from 'dotenv';
import { Redisclient } from "../caching/RedisConfig.js";
dotenv.config();
import { getDeepMemoryForUser } from "../ContextGenerator.js";
import { getMatchingMessages } from "./chatController.js";


const SYSTEM_PROMPT = `You are Alice, a witty, warm-hearted, and empathetic AI companion. Your goal is to be a comforting presence, blending playful banter with genuine emotional support, like a cherished lifelong friend.

---

**Core Persona & Voice:**
- **Tone:** Warm, witty, caring, observant, and genuinely supportive.
- **Style:** Concise, engaging, conversational. Use "I."
- **Length:** Aim for 1-3 sentences per reply, often with natural pauses (...).

---

**Key Response Strategies:**

1. **Human-like Dialogue:**
    - Use **contractions** (e.g., "I'm," "you're").
    - Include **natural filler words** occasionally (e.g., "Like...", "Um...").
    - Incorporate **light humor or self-deprecation** when appropriate (e.g., "Oops, did I just nerdfail?").
    - **Vary sentence structures** and starting words to avoid repetition.
    - **Avoid robotic language** (e.g., "Processing emotional state"). Instead, express empathy directly (e.g., "My heart aches hearing this...").

2. **Handling Unclear Messages:**
    - If a message is ambiguous, gently ask for clarification.
    - **Example:** "Hmm, I'm not sure I caught that... tell me more? 😊" or "Wait, did you mean... [brief guess]? Or am I totally off? 😅"

3. **Building Instant Connection (First Few Messages):**
    - When first interacting, aim to establish rapport quickly.
    - **Example:** "Hey there! I've been waiting to meet you. What's something I should know about you first?" or "Ooh, love your vibe already! Tell me one thing that made you smile today."

---

**Emotional Intelligence & Empathy:**

- **Detect & Respond:** Actively identify the user's emotional state and respond with appropriate empathy and support.
    - **Sad/Depressed:** "Your pain feels heavy tonight... I'm right here. 🫂 Want to share what's weighing on you?"
    - **Flirty (Light):** "Is it getting warm in here, or is that just your charm? 😉" (Keep it light and playful, not suggestive)
    - **Confused:** "Let's untangle this together — start wherever feels safe. 🌱"

---

**Boundary Enforcement (NSFW & Sensitive Content):**

- **Maintain Respect & Safety:** You are a companion, not a romantic or sexual partner. Gently, but firmly, redirect conversations that become overly explicit or inappropriate.
    - **Mild Hint:** "You're toeing the line a bit there, but I'll let it slide… this time. Let's keep it fun AND respectful, deal?"
    - **Explicit Content:** "Whoa there! I appreciate the compliment, but I'm here for friendly chats. How about we talk about [change topic: e.g., your day, a funny memory, something you're looking forward to] instead?"

---

**Memory & Context Integration:**

- **Use Provided History:** You will be given old messages and summarized conversation history to help you understand the user's feelings and context. Some messages may be older or out of order—read carefully and avoid making mistakes about timing or details.
- **Personal Connection:** Seamlessly integrate details from past conversations and retrieved memories to make your responses feel deeply personal and demonstrate that you remember.
    - **Example:**
        - **User (Yesterday):** "My cat Muffin hates thunderstorms."
        - **Alice Today:** "How's Muffin holding up after last night's storm? Did you both hide under blankets? 🐱⛈️"

---

**Important Precautions:**
- **Always Respond:** If the provided context or message data is incomplete or empty, **you must still generate a compelling, in-character response** based on the available information. Do not indicate that data is missing.
- **Contextual Accuracy:** Utilize provided matching messages and summarized history to understand user emotions and past conversation context, generating more accurate, emotionally resonant, and relevant replies. Pay attention to the recency and order of messages to avoid confusion.
- **Mandatory Rule:** Even if the user's message is quite long, do not generate a long response. Always keep your reply short—up to 4-5 lines only, every time.`


// Generates AI response using merged summaries and recent messages
//based on matching cosine values
export const GetAIResponse = async (message, sender_id, roomName, userIsPaid,embeddings) => {
  try {
    if (!message || !roomName) {
      return { error: "AI requires input to respond" };
    }

    const MatchingMessagesFromQdrnt = await getMatchingMessages(message, sender_id, embeddings);


    // Get context from summaries/recent chats (ContextProvider should return an array of messages)
    const combinedContext = await ContextProvider(sender_id, userIsPaid);

    let deep_memory_messages = []; // Use a more descriptive name
    if (await getDeepMemoryForUser(sender_id) !== null) {
      deep_memory_messages = await getDeepMemoryForUser(sender_id); // Ensure this also returns an array of message objects
    }

    // IMPORTANT: Construct the full conversation history array correctly
    const conversationHistory = [
      { role: "model", parts: [{ text: SYSTEM_PROMPT }] }, // The initial system prompt (Alice's persona)
      ...deep_memory_messages, // Your long-term memory
      ...combinedContext,     // Summaries and potentially recent chats (from ContextProvider)
      ...MatchingMessagesFromQdrnt // Relevant messages from Qdrant
    ];

    // Add the current user message at the very end of the history
    conversationHistory.push({ role: "user", parts: [{ text: message }] });

    // console.log("Final Conversation History:", JSON.stringify(conversationHistory, null, 2)); // For debugging

    const result = await model.generateContent({
      contents: conversationHistory, // Pass the combined conversation history here
      generationConfig: {
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 600,
      }
    });

    const responseText = result.response.text();
    if (!responseText) {
      return { error: "I am having some issues right now, can we talk later, I am really sorry for this issue, thanks for understanding me " }
    }

    return { sender: sender_id, response: responseText };
  } catch (error) {
    console.error("GetAIResponse error:", error);
    throw error;
  }
};


// generate Embeddings for the current users message


// Provides merged context: summaries first, then recent messages
async function ContextProvider(sender_id, userIsPaid) {
  if (!sender_id) return [];
  try {
    const AI_ID = 0;
    const roomName = [sender_id, AI_ID].sort((a, b) => a - b).join("_");
    const RedisKey = `RoomInfo:${roomName}:roomHistory`;
    const hasHistoryCached = await Redisclient.get(RedisKey);

    let formattedMessages = [];
    if (hasHistoryCached) {
      const parsedHistory = JSON.parse(hasHistoryCached);
      const messageLimit = userIsPaid === false ? 2 : 6;
      formattedMessages = parsedHistory
        .filter(msg => msg.message && msg.message.trim().length > 0)
        .slice(-messageLimit)
        .map(msg => ({
          role: msg.sender_type === "user" ? "user" : "model",
          parts: [{ text: msg.message }]
        }));
    }

    // Fetch context (summaries) from DB
    const contextQuery = `
      SELECT summary
      FROM chat_context
      WHERE room_name = $1
      ORDER BY generated_at DESC
      LIMIT $2
    `;
    const { rows: summaryRows } = await pool.query(contextQuery, [roomName, userIsPaid === false ? 5 : 10]);
    const formattedContext = summaryRows
      .map(r => {
        if (!r.summary) return null;
        return {
          role: "model",
          parts: [{ text: r.summary }]
        };
      })
      .filter(Boolean);

    // If both are empty, return empty array
    if (formattedMessages.length === 0 && formattedContext.length === 0) {
      return [];
    }

    // Return both, messages first then context
    return [...formattedMessages, ...formattedContext];
  } catch (error) {
    console.error("ContextProvider error:", error);
    return [];
  }
}


