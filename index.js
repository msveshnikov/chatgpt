import fetch from "node-fetch";
import { Configuration, OpenAIApi } from "openai";
import TelegramBot from "node-telegram-bot-api";
process.env["NTBA_FIX_350"] = 1;

const engineId = "stable-diffusion-512-v2-1";
const apiHost = "https://api.stability.ai";
const stabilityKey = process.env.STABILITY_KEY;
const url = `${apiHost}/v1alpha/generation/${engineId}/text-to-image`;
const configuration = new Configuration({ apiKey: process.env.OPENAI_KEY });
const openai = new OpenAIApi(configuration);
const bot = new TelegramBot(process.env.TELEGRAM_KEY, { polling: true });

bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    console.log(msg.text);
    if (msg.text.startsWith("Нарисуй") || msg.text.startsWith("Draw") || msg.text.startsWith("Paint")) {
        const prompt = await gptResponse("Переведи на английский:" + msg.text);
        const stream = await draw(
            prompt +
                " ,deep focus, highly detailed, digital painting, artstation, smooth, sharp focus, illustration, art by magali villeneuve, ryan yee, rk post, clint cearley, daniel ljunggren, zoltan boros, gabor szikszai, howard lyon, steve argyle, winona nelson"
        );
        bot.sendPhoto(chatId, stream);
    } else {
        bot.sendMessage(chatId, await gptResponse(msg.text + "."));
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
        console.log(completion.data.choices[0].text);
        return completion.data.choices[0].text;
    } catch (error) {
        return "Ошибка, сорян";
    }
};

const draw = async (text) => {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "image/png",
                Authorization: stabilityKey,
            },
            body: JSON.stringify({
                cfg_scale: 7,
                clip_guidance_preset: "FAST_BLUE",
                height: 512,
                width: 512,
                samples: 1,
                steps: 20,
                text_prompts: [
                    {
                        text: text,
                        weight: 1,
                    },
                ],
            }),
        });

        if (!response.ok) {
            console.error(`Non-200 response: ${await response.text()}`);
            return;
        }

        return response.buffer();
    } catch (e) {
        console.error(e);
    }
};
