import { JWT } from "google-auth-library";
import { VertexAI } from "@google-cloud/vertexai";
import dotenv from "dotenv";
dotenv.config({ override: true });

const API_ENDPOINT = "us-central1-aiplatform.googleapis.com";
const IMAGEN_URL = `https://${API_ENDPOINT}/v1/projects/${process.env.GOOGLE_KEY}/locations/us-central1/publishers/google/models/imagegeneration:predict`;
const vertex_ai = new VertexAI({ project: process.env.GOOGLE_KEY, location: "us-central1" });
const model = "gemini-pro";

export const getIdToken = async () => {
    const client = new JWT({
        keyFile: "./google.json",
        scopes: [
            "https://www.googleapis.com/auth/cloud-platform",
            "https://www.googleapis.com/auth/firebase.messaging",
        ],
    });
    const idToken = await client.authorize();
    return idToken.access_token;
};

export const getImagen2 = async (prompt) => {
    try {
        const headers = {
            Authorization: `Bearer ` + (await getIdToken()),
            "Content-Type": "application/json",
        };

        const data = {
            instances: [
                {
                    prompt: prompt,
                },
            ],
            parameters: {
                sampleCount: 1,
            },
        };

        const response = await fetch(IMAGEN_URL, {
            method: "POST",
            headers,
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error("Imagen2 Error:" + response.statusText);
        }

        const result = await response.json();
        return Buffer.from(result?.predictions?.[0]?.bytesBase64Encoded, "base64");
    } catch (e) {
        console.error(e.message, `prompt:` + prompt);
        return null;
    }
};

export const getTextGemini = async (prompt, temperature) => {
    const generativeModel = vertex_ai.preview.getGenerativeModel({
        model: model,
        generation_config: {
            max_output_tokens: 2048,
            temperature: temperature || 0.5,
            top_p: 0.8,
        },
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ],
    });

    const chat = generativeModel.startChat({});
    const result = await chat.sendMessage([{ text: prompt }]);
    return result?.response?.candidates?.[0].content?.parts?.[0]?.text;
};
