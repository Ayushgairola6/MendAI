import { ElevenLabsClient, stream } from '@elevenlabs/elevenlabs-js'
import { Readable } from 'stream';
import dotenv from 'dotenv';
dotenv.config();

const client = new ElevenLabsClient({
    apiKey: ""
})


export const generateSpeechToText = async (voice) => {
    try {
        await client.speechToText.convert({
            modelId: process.env.ELEVENLABS_VOICEAGENT_ID
        })
    } catch (error) {
        console.error(error);
    }
}




const generateTextFromSpeech = async () => {

}