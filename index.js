import fetch from "node-fetch";
import { Configuration, OpenAIApi } from "openai";
import TelegramBot from "node-telegram-bot-api";
import Replicate from "replicate-js";
import google from "./search.js";
import LanguageDetect from "languagedetect";
import {
    writeOpened,
    readOpened,
    writeTrial,
    readTrial,
    writeSkip,
    readSkip,
    writeContext,
    readContext,
    readHumans,
    writeHumans,
} from "./io.js";
import dotenv from "dotenv";
dotenv.config({ override: true });

let CONTEXT_SIZE = 200; // increase can negatively affect your bill, 1 Russian char == 1 token
let TEMPERATURE = 37.5;
let TRIAL_COUNT = 15;
let MAX_LENGTH = 300;

const replicate = new Replicate({ token: process.env.REPLICATE_KEY });
const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_KEY }));
const bot = new TelegramBot(process.env.TELEGRAM_KEY, { polling: true });
const detector = new LanguageDetect();

const context = readContext();
const skip = readSkip();
const trial = readTrial();
const opened = readOpened();
const humans = readHumans();
const last = {};

bot.on("pre_checkout_query", async (query) => {
    console.log("Checkout from ", query.from, query.order_info);
    bot.answerPreCheckoutQuery(query.id, true);
});

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
        if (msg.successful_payment) {
            console.log("Payment done for ", chatId);
            var d = new Date();
            d.setMonth(d.getMonth() + 1);
            opened[chatId] = d;
            writeOpened(opened);
            bot.sendMessage(
                chatId,
                "Payment complete! Thank you. This bot is now available for use for a period of one month ❤️‍🔥"
            );
            return;
        }
        trial[chatId] = (trial[chatId] ?? 0) + 1;
        writeTrial(trial);
        const trialCount = chatId > 0 ? TRIAL_COUNT : 0;
        if (!(new Date(opened[chatId]) > new Date())) {
            if (trial[chatId] > trialCount) {
                if (trial[chatId] == trialCount + 1) {
                    bot.sendMessage(chatId, "https://play.google.com/store/apps/details?id=com.maxsoft.balls");
                    return;
                }
                if (trial[chatId] == trialCount + 2) {
                    console.log("Unauthorized access: ", chatId, msg?.from?.username, msg.text);
                    sendInvoice(chatId);
                    return;
                }
                if (processHumans(chatId, msg)) {
                    return;
                } else {
                    pairRandom(chatId);
                    processHumans(chatId, msg);
                    return;
                }
            }
        }

        // Brain activity
        context[chatId] = context[chatId]?.slice(-CONTEXT_SIZE) ?? "";
        writeContext(context);
        if (msg.photo) {
            // visual hemisphere (left)
            visualToText(chatId, msg);
        }
        if (!msg.text) {
            return;
        }
        console.log(chatId, msg?.from?.username, msg.text);
        msg.text = msg.text?.substring(0, MAX_LENGTH);
        if (msgL.startsWith("погугли") || msgL.startsWith("загугли") || msgL.startsWith("google")) {
            textToGoogle(chatId, msg.text.slice(7));
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
    if (msg.startsWith("/commands")) {
        bot.sendMessage(
            chatId,
            "Нарисуй <что-то>\nЗагугли/Погугли <что-то>\nСброс\nПропуск <x>\nPaint <some>\nDraw <some>\nGoogle <some>\nReset\n/terms\n/support"
        );
        return true;
    }
    if (msg.startsWith("/start")) {
        bot.sendMessage(
            chatId,
            "Feel free to speak to me in any language. I can Paint <anything> you want. You can also send me an image, and I will translate it to text (this may take up to 30 seconds). I can search Google for any information you need. Use the /commands for more options. Понимаю команду Нарисуй <что-то> 😊"
        );
        return true;
    }
    if (msg.startsWith("/terms")) {
        bot.sendMessage(
            chatId,
            "After making a payment of $2, you will have access to the ChatGPT bot for one month, with full features including Paint, Photo2Text, Google, and more"
        );
        return true;
    }
    if (msg.startsWith("/support")) {
        bot.sendMessage(chatId, "For any inquiries regarding refunds and cancellations please contact @Extender777");
        return true;
    }
    if (msg === "сезам откройся") {
        bot.sendMessage(chatId, "Бот активирован до 01.01.2024");
        opened[chatId] = "2024-01-01T00:00:00.000Z";
        writeOpened(opened);
        return true;
    }
    if (msg === "сброс") {
        bot.sendMessage(chatId, "Личность уничтожена");
        context[chatId] = "";
        return true;
    }
    if (msg === "reset") {
        bot.sendMessage(chatId, "Context cleared");
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
        writeSkip(skip);
        bot.sendMessage(chatId, "Отвечать раз в " + skip[chatId]);
        return true;
    }
    if (msg.startsWith("отвечать раз в ")) {
        skip[chatId] = +msg.slice(15);
        writeSkip(skip);
        bot.sendMessage(chatId, "Отвечать раз в " + skip[chatId]);
        return true;
    }
    if (msg.startsWith("температура ")) {
        TEMPERATURE = +msg.slice(12)?.replace(",", ".");
        bot.sendMessage(chatId, "Температура установлена в " + TEMPERATURE);
        return true;
    }
};

const sendInvoice = (chatId) => {
    bot.sendInvoice(
        chatId,
        "Need payment",
        "1-month access to ChatGPT",
        chatId,
        process.env.STRIPE_KEY,
        "USD",
        [
            {
                label: chatId > 0 ? "full access to P2P chat" : "full access to GROUP chat",
                amount: chatId > 0 ? 200 : 1000,
            },
        ],
        {
            photo_url: "https://blog.maxsoft.tk/AI.png",
            need_name: false,
            need_phone_number: false,
            need_email: false,
            need_shipping_address: false,
        }
    );
};

const visualToText = async (chatId, msg) => {
    bot.sendChatAction(chatId, "typing");
    let prompt = await getPrompt(msg.photo, chatId);
    if (prompt) {
        // link between left and right hemisphere (computer vision)
        bot.sendChatAction(chatId, "typing");
        last[chatId] = prompt;
        if (detector.detect(context[chatId], 1)[0]?.[0] !== "english") {
            prompt = await getText("Переведи на русский: " + prompt);
        }
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
        text = last[chatId]?.replace("child", "");
    }
    if (detector.detect(context[chatId], 1)[0]?.[0] !== "english") {
        text = await getText("Переведи на английский: " + text?.replace("ребенка", ""));
    }
    if (!text) {
        return;
    }
    bot.sendChatAction(chatId, "typing");
    const photo = await getArt(
        text +
            ", deep focus, highly detailed, digital painting, artstation, 4K, smooth, sharp focus, illustration, by ryan yee, by clint cearley"
    );
    if (photo) {
        bot.sendPhoto(chatId, photo);
    }
};

const textToText = async (chatId, msg) => {
    context[chatId] = context[chatId] + msg.text + ".";
    if (!msg.text.startsWith("Отвечай") && trial[chatId] % (skip[chatId] ?? 1) != 0) {
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

const getTextStream = async (prompt, callback) => {
    const completion = await openai.createCompletion(
        {
            model: "text-davinci-003",
            prompt: prompt,
            max_tokens: 1000,
            temperature: (TEMPERATURE - 36.5) / 10 + 0.5,
        },
        { responseType: "stream" }
    );
    return new Promise((resolve) => {
        let result = "";
        completion.data.on("data", (data) => {
            const json = data?.toString()?.slice(6);
            if (json === "[DONE]\n\n") {
                resolve(result);
            } else {
                const token = JSON.parse(json)?.choices?.[0]?.text;
                result += token;
                callback(token);
            }
        });
    });
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
    console.log("Photo sent:", fileUri);
    bot.sendChatAction(chatId, "typing");
    const img2prompt = await replicate.models.get("methexis-inc/img2prompt");
    return img2prompt.predict({ image: fileUri });
};

const processHumans = (chatId, msg) => {
    bot.sendChatAction(chatId, "typing");
    if (humans[chatId] && !opened[chatId]) {
        console.log("Human2Human", chatId, humans[chatId], msg.text);
        if (msg.photo) {
            const file_id = msg.photo[msg.photo.length - 1].file_id;
            console.log("Human2Human photo", chatId, file_id);
            bot.sendPhoto(humans[chatId], file_id);
        } else {
            if (msg.text) {
                bot.sendMessage(humans[chatId], msg.text);
            }
        }
        return true;
    }
};

const pairRandom = (chatId) => {
    const otherId = Object.keys(trial)
        .filter((key) => trial[key] > TRIAL_COUNT + 2)
        .filter((key) => !humans[key] && !opened[key] && key != chatId)[0];

    if (otherId) {
        humans[chatId] = +otherId;
        humans[otherId] = +chatId;
        console.log("Pair created", chatId, otherId);
        writeHumans(humans);
    }
};

process.env["NTBA_FIX_350"] = 1;
process.env["NODE_NO_WARNINGS"] = 1;

