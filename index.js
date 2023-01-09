import fetch from "node-fetch";
import { Configuration, OpenAIApi } from "openai";
import TelegramBot from "node-telegram-bot-api";
import Replicate from "replicate-js";
import google from "./search.js";

let CONTEXT_SIZE = 200; // increase can negatively affect your bill, 1 Russian char == 1 token
let TEMPERATURE = 38.5;

const replicate = new Replicate({ token: process.env.REPLICATE_KEY });
const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_KEY }));
const bot = new TelegramBot(process.env.TELEGRAM_KEY, { polling: true });

const context = {};
const skip = {};
const count = {};
const last = {};
const opened = new Set([-1001596727979, -1001624504120, 1049277315]);

bot.on("message", async (msg) => {
    try {
        // Technical stuff
        const chatId = msg.chat.id;
        const msgL = msg.text?.toLowerCase();
        if (msg.text) {
            if (processCommand(chatId, msgL)) {
                return;
            }
        }
        if (!opened.has(chatId)) {
            console.log("Unauthorized access: ", chatId, msg.text);
            return;
        }

        // Brain activity
        context[chatId] = context[chatId]?.slice(-CONTEXT_SIZE) ?? "";
        if (msg.photo) {
            // visual hemisphere (left)
            visualToText(chatId, msg);
        }
        if (!msg.text) {
            return;
        }
        console.log(chatId, msg.text);
        if (msgL.startsWith("погугли") || msgL.startsWith("загугли")) {
            textToGoogle(chatId, msg.text.slice(8));
        } else {
            if (msgL.startsWith("нарисуй") || msgL.startsWith("draw") || msgL.startsWith("paint")) {
                // visual hemisphere (left)
                textToVisual(chatId, msgL);
            } else {
                // audio hemisphere (right)
                textToText(chatId, msg);
            }
        }
    } catch (e) {
        console.error(e.message);
    }
});

const processCommand = (chatId, msg) => {
    if (msg.startsWith("/start")) {
        bot.sendMessage(
            chatId,
            "Talk to me. Any language. I also can Paint <anything>. Понимаю команду Нарисуй что-то 😊"
        );
        return true;
    }
    if (msg === "сезам откройся") {
        bot.sendMessage(chatId, "Бот активирован");
        opened.add(chatId);
        return true;
    }
    if (msg === "сезам закройся") {
        bot.sendMessage(chatId, "Бот деактивирован");
        opened.delete(chatId);
        return true;
    }
    if (msg === "сброс") {
        bot.sendMessage(chatId, "Личность уничтожена");
        context[chatId] = "";
        return true;
    }
    if (msg.startsWith("глубина контекста ")) {
        CONTEXT_SIZE = +msg.slice(18);
        bot.sendMessage(chatId, "Глубина контекста установлена в " + CONTEXT_SIZE);
        return true;
    }
    if (msg.startsWith("пропуск ")) {
        skip[chatId] = +msg.slice(8);
        bot.sendMessage(chatId, "Отвечать раз в " + skip[chatId]);
        return true;
    }
    if (msg.startsWith("отвечать раз в ")) {
        skip[chatId] = +msg.slice(15);
        bot.sendMessage(chatId, "Отвечать раз в " + skip[chatId]);
        return true;
    }
    if (msg.startsWith("температура ")) {
        TEMPERATURE = +msg.slice(12);
        bot.sendMessage(chatId, "Температура установлена в " + TEMPERATURE);
        return true;
    }
};

const visualToText = async (chatId, msg) => {
    bot.sendChatAction(chatId, "typing");
    let prompt = await getPrompt(msg.photo, chatId);
    if (prompt) {
        // link between left and right hemisphere (computer vision)
        bot.sendChatAction(chatId, "typing");
        last[chatId] = prompt;
        prompt = await getText("Переведи на русский: " + prompt);
        prompt = prompt?.replace(/.*/, "")?.substr(1);
        if (prompt) {
            context[chatId] = context[chatId] + prompt;
            bot.sendMessage(chatId, prompt);
        }
    }
};

const textToVisual = async (chatId, text) => {
    bot.sendChatAction(chatId, "typing");
    if (text === "нарисуй" || text === "draw" || text === "paint") {
        // link between right and left hemisphere (painting)
        text = last[chatId];
    }
    const prompt = await getText("Переведи на английский: " + text.replace("ребенка", ""));
    if (!prompt) {
        return;
    }
    bot.sendChatAction(chatId, "typing");
    const photo = await getArt(
        prompt +
            ", deep focus, highly detailed, digital painting, artstation, 4K, smooth, sharp focus, illustration, by ryan yee, by clint cearley"
    );
    if (photo) {
        bot.sendPhoto(chatId, photo);
    }
};

const textToText = async (chatId, msg) => {
    context[chatId] = context[chatId] + msg.text + ".";
    count[chatId] = (count[chatId] ?? 0) + 1;
    if (count[chatId] % (skip[chatId] ?? 1) != 0) {
        return;
    }
    bot.sendChatAction(chatId, "typing");
    const response = await getText(context[chatId]);
    if (response) {
        last[chatId] = response;
        context[chatId] = context[chatId] + response;
        bot.sendMessage(chatId, response);
    }
};

const textToGoogle = async (chatId, msg) => {
    bot.sendChatAction(chatId, "typing");
    const response = await google(msg);
    if (response) {
        last[chatId] = response;
        context[chatId] = context[chatId] + response;
        bot.sendMessage(chatId, response);
    }
};

const getText = async (prompt) => {
    try {
        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            max_tokens: 1000,
            temperature: (TEMPERATURE - 36.5) / 10 + 0.5,
        });
        const response = completion?.data?.choices?.[0]?.text;
        console.log(response);
        return response;
    } catch (e) {
        console.error(e.message);
    }
};

const getArt = async (prompt) => {
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
        console.error(`Stability AI error: ${await response.text()}`);
        return;
    }

    return response.buffer();
};

const getPrompt = async (photo, chatId) => {
    const file_id = photo[photo.length - 1].file_id;
    const fileUri = await bot.getFileLink(file_id);
    bot.sendChatAction(chatId, "typing");
    const img2prompt = await replicate.models.get("methexis-inc/img2prompt");
    return img2prompt.predict({ image: fileUri });
};

process.env["NTBA_FIX_350"] = 1;
process.env["NODE_NO_WARNINGS"] = 1;
