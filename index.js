import fetch from "node-fetch";
import { Configuration, OpenAIApi } from "openai";
import TelegramBot from "node-telegram-bot-api";
import Replicate from "replicate-js";

let CONTEXT_SIZE = 200; // increase can negatively affect your bill
let TEMPERATURE = 38.5;

const replicate = new Replicate({ token: process.env.REPLICATE_KEY });
const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_KEY }));
const bot = new TelegramBot(process.env.TELEGRAM_KEY, { polling: true });

const context = {};
const skip = {};
const count = {};
const opened = new Set();

bot.on("message", async (msg) => {
    try {
        const chatId = msg.chat.id;
        if (msg.text.startsWith("/start")) {
            bot.sendMessage(
                chatId,
                "Talk to me. Any language. I also can Paint <anything>. Понимаю команду Нарисуй что-то 😊"
            );
            return;
        }
        if (msg.text === "Сезам откройся") {
            bot.sendMessage(chatId, "Бот активирован");
            opened.add(chatId);
            return;
        }
        if (msg.text === "Сезам закройся") {
            bot.sendMessage(chatId, "Бот деактивирован");
            opened.delete(chatId);
            return;
        }
        if (!opened.has(chatId)) {
            return;
        }
        if (msg.photo) {
            let prompt = await getPrompt(msg.photo);
            if (prompt) {
                // link between left and right hemisphere (computer vision)
                prompt = await getText("Переведи на русский: " + prompt);
                prompt = prompt.replace(/.*/, "").substr(1);
                context[chatId] = context[chatId] + prompt;
                bot.sendMessage(chatId, prompt);
            }
            return;
        }
        if (!msg.text) {
            return;
        }
        console.log(msg.text);
        context[chatId] = context[chatId]?.slice(-CONTEXT_SIZE) ?? "";
        if (msg.text.toLowerCase() === "сброс") {
            bot.sendMessage(chatId, "Личность уничтожена");
            context[chatId] = "";
            return;
        }
        if (msg.text.toLowerCase().startsWith("глубина контекста ")) {
            CONTEXT_SIZE = +msg.text.slice(18);
            bot.sendMessage(chatId, "Глубина контекста установлена в " + CONTEXT_SIZE);
            return;
        }
        if (msg.text.toLowerCase().startsWith("пропуск ")) {
            skip[chatId] = +msg.text.slice(8);
            bot.sendMessage(chatId, "Отвечать раз в " + skip[chatId]);
            return;
        }
        if (msg.text.toLowerCase().startsWith("температура ")) {
            TEMPERATURE = +msg.text.slice(12);
            bot.sendMessage(chatId, "Температура установлена в " + TEMPERATURE);
            return;
        }
        if (
            msg.text.toLowerCase().startsWith("нарисуй") ||
            msg.text.toLowerCase().startsWith("draw") ||
            msg.text.toLowerCase().startsWith("paint")
        ) {
            // visual hemisphere (left)
            let prompt;
            if (
                msg.text.toLowerCase() === "нарисуй" ||
                msg.text.toLowerCase() === "draw" ||
                msg.text.toLowerCase() === "paint"
            ) {
                // link between right and left hemisphere
                prompt = await getText(context[chatId] + " Переведи на английский своё последнее сообщение");
            } else {
                prompt = await getText("Переведи на английский:" + msg.text);
            }
            if (!prompt) {
                return;
            }
            const stream = await getArt(
                prompt +
                    ", deep focus, highly detailed, digital painting, artstation, smooth, sharp focus, illustration, art by magali villeneuve, ryan yee, rk post, clint cearley, daniel ljunggren, zoltan boros, gabor szikszai, howard lyon, steve argyle, winona nelson"
            );
            if (stream) {
                bot.sendPhoto(chatId, stream);
            }
        } else {
            // audio hemisphere (right)
            context[chatId] = context[chatId] + msg.text;
            count[chatId] = (count[chatId] ?? 0) + 1;
            if (count[chatId] % (skip[chatId] ?? 1) != 0) {
                return;
            }
            const response = await getText(context[chatId] + msg.text + ".");
            if (response) {
                context[chatId] = context[chatId] + response;
                bot.sendMessage(chatId, response);
            }
        }
    } catch (e) {
        console.error(e.message);
    }
});

const getText = async (prompt) => {
    try {
        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            max_tokens: 1000,
            temperature: (TEMPERATURE - 36.5) / 10 + 0.5,
        });
        const response = completion.data.choices[0].text;
        console.log(response);
        return response;
    } catch (e) {
        console.error(e.message);
    }
};

const getArt = async (prompt) => {
    try {
        const response = await fetch(
            "https://api.stability.ai/v1alpha/generation/stable-diffusion-512-v2-1/text-to-image",
            {
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
                            text: prompt,
                            weight: 1,
                        },
                    ],
                }),
            }
        );

        if (!response.ok) {
            console.error(`Stability-AI error: ${await response.text()}`);
            return;
        }

        return response.buffer();
    } catch (e) {
        console.error(e.message);
    }
};

const getPrompt = async (photo) => {
    const file_id = photo[photo.length - 1].file_id;
    const fileUri = await bot.getFileLink(file_id);
    const img2prompt = await replicate.models.get("methexis-inc/img2prompt");
    return img2prompt.predict({ image: fileUri });
};

process.env["NTBA_FIX_350"] = 1;
process.env["NODE_NO_WARNINGS"] = 1;
