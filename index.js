import fetch from "node-fetch";
import { Configuration, OpenAIApi } from "openai";
import TelegramBot from "node-telegram-bot-api";
process.env["NTBA_FIX_350"] = 1;

const url = `https://api.stability.ai/v1alpha/generation/stable-diffusion-512-v2-1/text-to-image`;
const configuration = new Configuration({ apiKey: process.env.OPENAI_KEY });
const openai = new OpenAIApi(configuration);
const bot = new TelegramBot(process.env.TELEGRAM_KEY, { polling: true });
const CONTEXT_SIZE = 500; // increase can negatively affect your bill
let context = [];

bot.on("message", async (msg) => {
    try {
        const chatId = msg.chat.id;
        if (!msg.text) {
            return;
        }
        console.log(msg.text);
        context[chatId] = context[chatId]?.slice(-CONTEXT_SIZE) ?? "";
        if (msg.text.startsWith("/start")) {
            bot.sendMessage(
                chatId,
                "Just start talking to me. Any language. I also can Draw or Paint anything. Понимаю команду Нарисуй что-то 😊"
            );
            return;
        }
        if (msg.text === "Сброс") {
            bot.sendMessage(chatId, "Личность уничтожена");
            context[chatId] = "";
            return;
        }

        if (msg.text.startsWith("Нарисуй") || msg.text.startsWith("Draw") || msg.text.startsWith("Paint")) {
            // visual hemisphere (left)
            const prompt = await gptResponse("Переведи на английский:" + msg.text);
            if (!prompt) {
                return;
            }
            const stream = await draw(
                prompt +
                    " ,deep focus, highly detailed, digital painting, artstation, smooth, sharp focus, illustration, art by magali villeneuve, ryan yee, rk post, clint cearley, daniel ljunggren, zoltan boros, gabor szikszai, howard lyon, steve argyle, winona nelson"
            );
            bot.sendPhoto(chatId, stream);
        } else {
            // audio hemisphere (right)
            context[chatId] = context[chatId] + msg.text;
            const response = await gptResponse(context[chatId] + msg.text + ".");
            if (response) {
                context[chatId] = context[chatId] + response;
                bot.sendMessage(chatId, response);
            }
        }
    } catch (e) {
        console.error(e.message);
    }
});

const gptResponse = async (prompt) => {
    try {
        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            max_tokens: 1000,
            temperature: 0.8,
        });
        const response = completion.data.choices[0].text;
        console.log(response);
        return response;
    } catch (e) {
        console.error(e.message);
    }
};

const draw = async (text) => {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "image/png",
                Authorization: process.env.STABILITY_KEY,
            },
            body: JSON.stringify({
                cfg_scale: 7,
                clip_guidance_preset: "FAST_BLUE",
                height: 512,
                width: 512,
                samples: 1,
                steps: 30,
                text_prompts: [
                    {
                        text: text,
                        weight: 1,
                    },
                ],
            }),
        });

        if (!response.ok) {
            console.error(`Stability-AI error: ${await response.text()}`);
            return;
        }

        return response.buffer();
    } catch (e) {
        console.error(e.message);
    }
};
