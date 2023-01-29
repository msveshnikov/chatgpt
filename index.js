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
    writeTemp,
    readTemp,
    writeTime,
    readTime,
} from "./io.js";
import dotenv from "dotenv";
dotenv.config({ override: true });

let CONTEXT_SIZE = 200; // increase can negatively affect your bill, 1 Russian char == 1 token
let MAX_TOKENS = 1000;
let TRIAL_COUNT = 0;
let MAX_LENGTH = 300;
let MAX_REQUESTS = 600;
let MAX_CALLS_PER_MINUTE = 20;
let CONTEXT_TIMEOUT = 3600;

const replicate = new Replicate({ token: process.env.REPLICATE_KEY });
const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_KEY }));
const bot = new TelegramBot(process.env.TELEGRAM_KEY, { polling: true });
const detector = new LanguageDetect();

const context = readContext();
const skip = readSkip();
const trial = readTrial();
const opened = readOpened();
const humans = readHumans();
const temp = readTemp();
const time = readTime();
const last = {};

const chatSuffix = {
    "-1001776618845": ";Отвечай вежливо - ведь ты художник и хочешь продать подписку $5😊",
    // 1049277315: ";Отвечай максимально дерзко",
};

bot.on("pre_checkout_query", async (query) => {
    console.log("Checkout from ", query.from);
    bot.answerPreCheckoutQuery(query.id, true);
});

bot.on("message", async (msg) => {
    try {
        if (protection(msg)) {
            return;
        }
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
            bot.sendMessage(1049277315, "Произведена оплата от " + msg?.from?.username + " " + msg?.from?.id);
            return;
        }
        trial[chatId] = (trial[chatId] ?? 0) + 1;
        writeTrial(trial);
        const trialCount = chatId > 0 ? TRIAL_COUNT : 0;
        if (!(new Date(opened[chatId]) > new Date())) {
            if (trial[chatId] > trialCount) {
                if (trial[chatId] == trialCount + 1) {
                    console.log("Unauthorized access: ", chatId, msg?.from?.username, msg.text);
                    sendInvoice(chatId);
                    return;
                }
                if (trial[chatId] == trialCount + 2) {
                    bot.sendMessage(
                        chatId,
                        "https://vc.ru/u/1075657-denis-zelenykh/576110-kak-oplatit-podpisku-midjourney-iz-rossii"
                    );
                    return;
                }
                if (processHumans(chatId, msg)) {
                    trial[chatId] = trial[chatId] - 1;
                    return;
                } else {
                    pairRandom(chatId);
                    processHumans(chatId, msg);
                    return;
                }
            }
        }
        if (chatId > 0 && trial[chatId] > MAX_REQUESTS) {
            console.log("Abuse detected for ", chatId);
            bot.sendMessage(
                chatId,
                "Hello! Unfortunately, you have exceeded your subscription request count 😏 That's not a problem - you can always purchase a new one! ❤️"
            );
            trial[chatId] = 0;
            opened[chatId] = new Date();
            return;
        }

        // Brain activity
        context[chatId] = context[chatId]?.slice(-CONTEXT_SIZE * premium(chatId)) ?? "";
        if (time[chatId] && new Date() - new Date(time[chatId]) > CONTEXT_TIMEOUT * 1000) {
            context[chatId] = "";
        }
        time[chatId] = new Date();
        writeTime(time);
        writeContext(context);

        if (msg.photo) {
            // visual hemisphere (left)
            visualToText(chatId, msg);
        }
        if (!msg.text) {
            return;
        }
        console.log(chatId, msg?.from?.username, msg.text);
        msg.text = msg.text?.substring(0, MAX_LENGTH * premium(chatId));
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
    if (msg.startsWith("/command") || msg.startsWith("/help")) {
        bot.sendMessage(
            chatId,
            "Paint <some>\nDraw <some>\nGoogle <some>\nReset\nTemperature 36,5 .. 41,5\nНарисуй <что-то>\nЗагугли/Погугли <что-то>\nСброс\nТемпература 36,5 .. 41,5\nПропуск <x>\n/payment\n/terms\n/support"
        );
        return true;
    }
    if (msg.startsWith("/start")) {
        bot.sendMessage(
            chatId,
            "Feel free to speak to me in any language. I can Paint <anything> you want. You can also send me an image, and I will translate it to text (this may take up to 30 seconds). I can search Google for any information you need. Use the /commands for more options. Понимаю команду Нарисуй <что-то> 😊 Наша группа: https://t.me/maxsoft_chat_gpt_group"
        );
        return true;
    }
    if (msg.startsWith("/terms")) {
        bot.sendMessage(
            chatId,
            "After making a payment of $5, you will have access to the ChatGPT bot for one month, with full features including Paint, Photo2Text, Google, and more"
        );
        return true;
    }
    if (msg.startsWith("/payment")) {
        if (detector.detect(context[chatId], 1)?.[0]?.[0] !== "english") {
            bot.sendMessage(
                chatId,
                "https://vc.ru/u/1075657-denis-zelenykh/576110-kak-oplatit-podpisku-midjourney-iz-rossii"
            );
        }
        sendInvoice(chatId);
        return true;
    }
    if (msg.startsWith("/support")) {
        bot.sendMessage(chatId, "For any inquiries regarding refunds and cancellations please contact @Extender777");
        return true;
    }
    if (msg.startsWith("/usage")) {
        bot.sendMessage(chatId, getReport());
        return true;
    }
    if (msg === "сезам приоткройся") {
        bot.sendMessage(chatId, "Бот активирован до 01.01.2024");
        opened[chatId] = "2024-01-01T00:00:00.000Z";
        writeOpened(opened);
        return true;
    }
    if (msg === "сброс") {
        // bot.sendMessage(chatId, "Личность уничтожена");
        context[chatId] = "";
        return true;
    }
    if (msg === "reset") {
        bot.sendMessage(chatId, "Context cleared");
        context[chatId] = "";
        return true;
    }
    // if (msg.startsWith("глубина контекста ")) {
    //     CONTEXT_SIZE = +msg.slice(18);
    //     bot.sendMessage(chatId, "Глубина контекста установлена в " + CONTEXT_SIZE);
    //     return true;
    // }
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
    if (msg.startsWith("температура ") || msg.startsWith("temperature ")) {
        temp[chatId] = +msg.slice(12)?.replace(",", ".");
        writeTemp(temp);
        bot.sendMessage(chatId, "Температура установлена в " + temp[chatId]);
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
                amount: chatId > 0 ? 500 : 1000,
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
            prompt = await getText("Переведи на русский: " + prompt, 0.5, MAX_TOKENS);
        }
        prompt = prompt?.replace(/.*/, "")?.substr(1);
        if (prompt) {
            context[chatId] = context[chatId] + prompt;
            writeContext(context);
            bot.sendMessage(chatId, prompt)
                .then(() => {})
                .catch((e) => {
                    console.error(e.message);
                });
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
        text = await getText("Переведи на английский: " + text?.replace("ребенка", ""), 0.5, MAX_TOKENS);
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
    context[chatId] += msg.text + ".";
    if (
        !(msg.text.startsWith("Отвечай") || msg.text.startsWith("Ответь")) &&
        trial[chatId] % (skip[chatId] ?? 1) != 0
    ) {
        return;
    }
    bot.sendChatAction(chatId, "typing");
    const response = await getText(
        context[chatId] + (chatSuffix[chatId] ?? ""),
        ((temp[chatId] ?? 36.5) - 36.5) / 10 + 0.5,
        MAX_TOKENS * premium(chatId)
    );
    if (response) {
        last[chatId] = response;
        context[chatId] = context[chatId] + response;
        writeContext(context);
        bot.sendMessage(chatId, response)
            .then(() => {})
            .catch((e) => {
                console.error(e.message);
            });
    }
};

const textToGoogle = async (chatId, msg) => {
    bot.sendChatAction(chatId, "typing");
    const response = await google(msg);
    if (response) {
        last[chatId] = response;
        context[chatId] = context[chatId] + response;
        writeContext(context);
        bot.sendMessage(chatId, response)
            .then(() => {})
            .catch((e) => {
                console.error(e.message);
            });
    }
};

const getText = async (prompt, temperature, max_tokens) => {
    try {
        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            max_tokens: max_tokens,
            temperature: temperature,
        });
        const response = completion?.data?.choices?.[0]?.text;
        console.log(response);
        return response;
    } catch (e) {
        console.error(e.message);
        if (e.message?.includes("429")) {
            bot.sendMessage(1049277315, e.message);
        }
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
    console.log("Photo sent:", fileUri);
    bot.sendChatAction(chatId, "typing");
    const img2prompt = await replicate.models.get("methexis-inc/img2prompt");
    return img2prompt.predict({ image: fileUri });
};

const processHumans = (chatId, msg) => {
    bot.sendChatAction(chatId, "typing")
        .then(() => {})
        .catch((e) => {
            console.error(e.message);
        });
    if (humans[chatId] && !opened[humans[chatId]]) {
        console.log("Human2Human", chatId, humans[chatId], msg.text);
        if (msg.photo) {
            const file_id = msg.photo[msg.photo.length - 1].file_id;
            console.log("Human2Human photo", chatId, file_id);
            bot.sendPhoto(humans[chatId], file_id)
                .then(() => {})
                .catch((e) => {
                    console.error(e.message);
                });
        } else {
            if (msg.text) {
                bot.sendMessage(humans[chatId], msg.text)
                    .then(() => {})
                    .catch((e) => {
                        console.error(e.message);
                    });
            }
        }
        return true;
    }
};

const pairRandom = (chatId) => {
    if (chatId < 0) {
        return;
    }
    const otherId = Object.keys(trial)
        .filter((key) => trial[key] > TRIAL_COUNT + 3)
        .filter((key) => !humans[key] && !opened[key] && key != chatId && key > 0)[0];

    if (otherId) {
        humans[chatId] = +otherId;
        humans[otherId] = +chatId;
        console.log("Pair created", chatId, otherId);
        writeHumans(humans);
    }
};

const premium = (chatId) => {
    if (opened[chatId] && chatId > 0) {
        return 2;
    } else {
        return 1;
    }
};

const blacklist = ["5889128020", "junklz", "drovorub_UI", "lucky_12345_lucky", "BELIAL_00", "SUPREME"];
let callsTimestamps = [];

const protection = (msg) => {
    // ignore blacklist
    if (blacklist.includes(msg?.from?.username) || blacklist.includes(msg?.from?.id)) {
        return true;
    }

    // DDOS protection, call not more than 20 per minute for msg.chat.id "-1001776618845"
    if (msg.chat.id == "-1001776618845") {
        // do not reply if msg?.from?.id not in trials
        if (!trial[msg?.from?.id]) {
            return true;
        }
        callsTimestamps.push(Date.now());
        callsTimestamps = callsTimestamps.filter((stamp) => Date.now() - stamp < 60000);
        if (callsTimestamps.length >= MAX_CALLS_PER_MINUTE) {
            console.log("Too many requests, switching off");
            opened[msg.chat.id] = false;
            return true;
        }
    }
};

const getReport = () => {
    let result = "";
    const add = (s) => {
        result += s + "\n";
    };
    add("Advertising costs");
    add("-----------");
    const adv = Object.keys(trial)
        .filter((k) => context[k])
        .filter((t) => !opened[t] || t == "-1001776618845")
        .map((k) => {
            return trial[k] * 0.005;
        })
        .reduce((a, b) => a + b)
        .toFixed(2);
    add("Total " + adv + "$");
    add("");
    add("Operational costs");
    add("------------------");
    const operations = Object.keys(trial)
        .filter((t) => opened[t] && t != "1049277315" && t != "-1001776618845")
        .map((k) => {
            add(k + " " + trial[k] + " " + (trial[k] * 0.005).toFixed(2) + "$");
            return trial[k] * 0.005;
        })
        .reduce((a, b) => a + b)
        .toFixed(2);
    add("Total " + operations + "$");
    add("");
    add("Profit");
    add("------------------");
    const revenue = (Object.keys(opened).length - 1) * 5;
    add(revenue + "$ - " + adv + "$ - " + operations + "$ = " + (revenue - operations - adv).toFixed(2) + "$");

    add("");
    add("Conversion");
    add("------------------");
    add((((Object.keys(opened).length - 1) / Object.keys(context).length) * 100).toFixed(2) + "%");
    return result;
};

process.env["NTBA_FIX_350"] = 1;
process.env["NODE_NO_WARNINGS"] = 1;
