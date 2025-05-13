import OpenAI from 'openai';
import dotenv from 'dotenv';
import { pool } from "../Database.js";
import { generateContext } from '../ContextGenerator.js';

dotenv.config();


const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: [process.env.NSFW_API_KEY],
});







export const GenerateNsfwResponse = async (message, sender_id, roomName, userIsPaid) => {
    try {

        if (!message || !roomName || !sender_id || !userIsPaid) {
            console.log(message, sender_id, roomName, userIsPaid)
            console.log("all fields weer not given to the model");
            return { error: 'AI requires input to respond' };
        }
        // counter state to verify the current state of users context generation status
        const Increment = await IncrementCounter(message, sender_id, roomName);

        // Check if user is paid
        const isPaid = await pool.query(`SELECT * FROM payments WHERE user_id = $1`, [sender_id]);

        // Build full context: summaries + recent chats + current message
        const combinedContext = await ContextProvider(sender_id, isPaid);
        combinedContext.push({ role: 'user', content: message });

        const result = await openai.chat.completions.create({
            model: 'cognitivecomputations/dolphin-mixtral-8x22b',
            messages: [
                {
                    role: 'model',
                    content: process.env.PREMIUM_SYSTEM_PROMPT,
                },
                ...combinedContext,
            ],
            temperature: 0.8,
            top_p: 0.95,
            max_tokens: 500,
        });

        const responseText = result.choices[0]?.message?.content;
        console.log(responseText);
        if (!responseText) {
            return { error: 'ALICE was unable to generate a response, please try again later' };
        }
        return { sender: sender_id, response: responseText };
    } catch (error) {
        console.error('GenerateNsfwResponse error:', error);
        throw error;
    }
};

const IncrementCounter = async (message, sender_id, roomName) => {
    try {
        const CounterCheckQuery = await pool.query(`SELECT * from context_counter WHERE room_name = $1`, [roomName]);

        if (CounterCheckQuery.rows.length === 0) {
            // console.log("resetting a new instance")
            await pool.query(
                `INSERT INTO context_counter (count, room_name) VALUES($1, $2)`,
                [0, roomName]
            );
        } else if (CounterCheckQuery.rows[0].count >= 5) {
            await pool.query(
                `UPDATE context_counter SET count = $1 WHERE room_name = $2`,
                [0, roomName]
            );
            const context = await generateContext(message, sender_id);
            // console.log("context has been generated")
            if (!context.response || context.response === null) {
                return { error: "Error while generating summary of the conversation" };
            }
            // console.log("generating the context and reseting the counter")
            await pool.query(
                `INSERT INTO chat_context (room_name, summary) VALUES ($1, $2)`,
                [roomName, context.response]
            );
        } else if (CounterCheckQuery.rows[0].count >= 0 && CounterCheckQuery.rows[0].count <= 5) {
            // console.log("incrementing the counter")
            await pool.query(
                `UPDATE context_counter SET count = count + 1 WHERE room_name = $1`,
                [roomName]
            );
        }
    } catch (error) {
        console.error(error);
    }
}
async function ContextProvider(sender_id, isPaid) {
    if (!sender_id || !isPaid) return [];
    try {
        const AI_ID = 0;
        const roomName = [sender_id, AI_ID].sort((a, b) => a - b).join("_");

        //  last 6 messages
        const lastChatsQuery = `
        SELECT sender_type, message
        FROM messages
        WHERE room_name = $1 AND user_id =$2
        ORDER BY sent_at DESC
        LIMIT $3 
      `;
        const limit = isPaid === false ? 7 : 10;
        const { rows: chatRows } = await pool.query(lastChatsQuery, [roomName, sender_id, limit]);
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
        LIMIT $2
      `;
        const { rows: summaryRows } = await pool.query(contextQuery, [roomName, limit]);
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
