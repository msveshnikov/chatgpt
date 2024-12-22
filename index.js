import fetch from "node-fetch";
import OpenAI from "openai";
import TelegramBot from "node-telegram-bot-api";
import Replicate from "replicate-js";
import { google } from "./search.js";
import {
    writeOpened,
    readOpened,
    writeTrial,
    readTrial,
    writeSkip,
    readSkip,
    writeContext,
    readContext,
    readChatSuffix,
    writeChatSuffix,
    writeTemp,
    readTemp,
    writeTime,
    readTime,
    writeMoney,
    readMoney,
} from "./db.js";
import { getTextGemini } from "./gemini.js";
import dotenv from "dotenv";
import express from "express";
import promClient from "prom-client";
dotenv.config({ override: true });

let CONTEXT_SIZE = 200; // increase can negatively affect your bill, 1 Russian char == 1 token
let MAX_TOKENS = 600;
let MAX_LENGTH = 200;
let PREMIUM = 3.0;
let TRIAL_COUNT = 50;

let MAX_MONEY = 3;
let MAX_GROUP_MONEY = 6;
let PRICE = 5;
let GROUP_PRICE = 10;

let CONTEXT_TIMEOUT = 120;
let OPENAI_PRICE = 0.002;
let IMAGE_PRICE = 0.002;
let CV_PRICE = 0.02;

let PROMO_MAX_PER_MINUTE = 15;
let ALL_MAX_PER_MINUTE = 20;
let PROMO_MAX_PER_HOUR = 3;
let PROMO = [process.env.GROUP_RU_ID];

const replicate = new Replicate({ token: process.env.REPLICATE_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });
const bot = new TelegramBot(process.env.TELEGRAM_KEY, { polling: true });

const context = readContext();
const skip = readSkip();
const trial = readTrial();
const opened = readOpened();
const temp = readTemp();
const time = readTime();
const money = readMoney();
const chatSuffix = readChatSuffix();
const last = {};
const count = {};

// Create a Registry which registers the metrics
const register = new promClient.Registry();

// Add a default metric for measuring uptime
const uptime = new promClient.Gauge({
    name: "telegram_node_uptime",
    help: "Node.js uptime in seconds",
    registers: [register],
});

// Add a custom metric for tracking Telegram bot requests
const telegramRequests = new promClient.Counter({
    name: "telegram_requests_total",
    help: "Total number of Telegram bot requests",
    registers: [register],
});

// Add a custom metric for tracking Telegram bot response time
const responseTime = new promClient.Histogram({
    name: "telegram_bot_response_time_seconds",
    help: "Response time of the Telegram bot in seconds",
    buckets: [0.1, 0.5, 1, 2, 5, 10], // Adjust these buckets as needed
    registers: [register],
});

// Update the uptime metric every minute
setInterval(() => {
    uptime.set(process.uptime());
}, 60000);

// Expose metrics endpoint
const app = express();
app.get("/metrics", async (req, res) => {
    res.set("Content-Type", register.contentType);
    res.send(await register.metrics());
});

app.listen(11111, () => {
    console.log("Metrics server started on port 11111");
});

bot.on("pre_checkout_query", async (query) => {
    if (query.total_amount < PRICE * 100) {
        bot.answerPreCheckoutQuery(query.id, false, {
            error_message: "Please update invoice using /payment command 😊",
        });
        return;
    }
    console.log("Checkout from ", query.from);
    bot.answerPreCheckoutQuery(query.id, true);
});

bot.on("message", async (msg) => {
    // Increment the request counter
    telegramRequests.inc();
    // Track response time
    const end = responseTime.startTimer();
    try {
        try {
            if (protection(msg)) {
                return;
            }
            // Technical stuff
            const chatId = msg.chat.id;
            const msgL = msg.text?.toLowerCase();
            if (msgL) {
                if (processCommand(chatId, msgL, msg.from?.language_code)) {
                    return;
                }
            }
            if (msg.successful_payment) {
                console.log("Payment done for ", chatId, msg.successful_payment.invoice_payload);
                var d = new Date();
                d.setMonth(d.getMonth() + 1);
                opened[msg.successful_payment.invoice_payload ?? chatId] = d;
                writeOpened(opened);
                bot.sendMessage(
                    msg.successful_payment.invoice_payload ?? chatId,
                    msg.from?.language_code == "ru"
                        ? "Оплата произведена! Спасибо. Бот теперь доступен на один месяц ❤️"
                        : "Payment complete! Thank you. This bot is now available for a period of one month ❤️"
                );
                bot.sendMessage(
                    process.env.ADMIN_ID,
                    "Произведена оплата от " +
                        msg?.from?.username +
                        " " +
                        msg?.from?.id +
                        " " +
                        msg.successful_payment.invoice_payload
                );
                return;
            }

            trial[chatId] = (trial[chatId] ?? 0) + 1;
            writeTrial(trial);

            if (process.env.STRIPE_KEY) {
                if (!(new Date(opened[chatId]) > new Date())) {
                    if (trial[chatId] > TRIAL_COUNT) {
                        bot.sendMessage(
                            chatId,
                            msg.from?.language_code == "ru"
                                ? `Полная функциональность появится после оплаты ❤️ Приглашаем вас присоединиться к нашей группе и попробовать бота в ней 😊 ${process.env.GROUP_RU}`
                                : `Full functionality will appear after payment ❤️ We invite you to join our group to try the bot 😊`
                        )
                            .then(() => {})
                            .catch((e) => {
                                console.error(e.message);
                            });
                        sendInvoice(chatId, msg.from?.language_code);
                        return;
                    }
                }
                if (
                    !PROMO.includes(String(chatId)) &&
                    ((chatId > 0 && money[chatId] > MAX_MONEY) || (chatId < 0 && money[chatId] > MAX_GROUP_MONEY))
                ) {
                    console.error("Abuse detected for paid account", chatId);
                    bot.sendMessage(
                        chatId,
                        msg.from?.language_code == "ru"
                            ? "Привет! К сожалению, вы превысили лимит запросов 😏 Это не проблема - вы всегда можете приобрести новую подписку! ❤️"
                            : "Hello! Unfortunately, you have exceeded your subscription request count 😏 That's not a problem - you can always purchase a new one! ❤️"
                    );
                    bot.sendMessage(
                        process.env.ADMIN_ID,
                        "Abuse detected for paid account " +
                            chatId +
                            " trials= " +
                            trial[chatId] +
                            " money= " +
                            money[chatId]
                    );
                    trial[chatId] = 0;
                    opened[chatId] = new Date();
                    money[chatId] = 0;
                    writeTrial(trial);
                    writeOpened(opened);
                    writeMoney(money);
                    return;
                }
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
                await visualToText(chatId, msg);
            }
            if (!msg.text) {
                return;
            }

            // console.log(chatId, msg?.from?.username, msg.text);

            msg.text = msg.text?.substring(0, MAX_LENGTH * premium(chatId));
            if (msgL.startsWith("погугли") || msgL.startsWith("загугли") || msgL.startsWith("google")) {
                await textToGoogle(chatId, msg.text.slice(7), msg.from?.language_code);
            } else {
                if (msgL.startsWith("нарисуй") || msgL.startsWith("draw") || msgL.startsWith("paint")) {
                    // visual hemisphere (left)
                    await textToVisual(chatId, msgL, msg.from?.language_code);
                } else {
                    // audio hemisphere (right)
                    await textToText(chatId, msg);
                }
            }
        } catch (e) {
            console.error(e.message);
        }
    } finally {
        end(); // Stop the timer and observe the response time
    }
});

const processCommand = (chatId, msg, language_code) => {
    if (msg.startsWith("/command") || msg.startsWith("/help")) {
        bot.sendMessage(
            chatId,
            language_code == "ru"
                ? "Нарисуй <что-то>\nЗагугли/Погугли <что-то>\nСброс\nТемпература 36.5 - 41.5\nПропуск <x>\nОтвечай\nРежим <притворись что ты ...>\n/payment\n/terms\n/terms_group\n/status\n/support"
                : "Paint <some>\nDraw <some>\nGoogle <some>\nReset\nTemperature 36.5 - 41.5\nSkip <x>\nAnswer\nMode <pretend you are ...>\n/payment\n/terms\n/terms_group\n/status\n/support"
        );
        return true;
    }
    if (msg.startsWith("/start")) {
        bot.sendMessage(
            chatId,
            language_code == "ru"
                ? `Привет! Я ChatGPT бот. Я могу говорить с вами на любом языке. Я могу нарисовать все что вы хотите. Вы также можете отправить мне изображение, и я переведу его в текст. Я могу искать в Google любую информацию, которая вам нужна. Используйте /help для списка команд 😊 \n\nНаша группа: ${process.env.GROUP_RU}`
                : `Hello! I'm ChatGPT. Feel free to speak to me in any language. I can Paint <anything> you want. You can also send me an image, and I will translate it to text. I can search Google for any information you need. Use /help for more options 😊`
        );
        return true;
    }
    if (msg.startsWith("/terms_group")) {
        bot.sendMessage(
            chatId,
            language_code == "ru"
                ? `После оплаты подписки $${GROUP_PRICE} вы можете использовать все функции ChatGPT бота в течение месяца для всей группы (без ограничения количества людей), включая Нарисуй, Загугли, и другие.`
                : `After making a payment of $${GROUP_PRICE}, you will have access to the ChatGPT bot for one month for entire group (unlimited numer of people), with full features (including Paint, Photo2Text, Google, and more)`
        );
        return true;
    }
    if (msg.startsWith("/terms")) {
        bot.sendMessage(
            chatId,
            language_code == "ru"
                ? `После оплаты подписки $${PRICE} в течение месяца вы можете использовать все функции бота, включая Нарисуй, Загугли, и другие без каких-либо ограничений`
                : `After making a payment of $${PRICE}, you will have access to the ChatGPT bot for one month, with full features (including Paint, Photo2Text, Google, and more) without any limitations`
        );
        return true;
    }

    if (msg.startsWith("/payment")) {
        sendInvoice(chatId, language_code);
        return true;
    }
    if (msg.startsWith("/support")) {
        bot.sendMessage(
            chatId,
            language_code == "ru"
                ? `Если у вас возникли проблемы с оплатой, пожалуйста, напишите мне в личные сообщения @${process.env.ADMIN}`
                : `For any inquiries regarding refunds and cancellations please contact @${process.env.ADMIN}`
        );
        return true;
    }
    if (msg.startsWith("/usage")) {
        bot.sendMessage(chatId, getReport());
        return true;
    }
    if (msg.startsWith("/status")) {
        bot.sendMessage(
            chatId,
            language_code == "ru"
                ? opened[chatId] && new Date(opened[chatId]) > new Date()
                    ? "Ваша подписка активна до " + opened[chatId]
                    : "У вас нет подписки"
                : opened[chatId] && new Date(opened[chatId]) > new Date()
                ? "You have an active subscription until " + opened[chatId]
                : "You have no subscription"
        );
        return true;
    }
    if (msg === "сброс") {
        bot.sendMessage(chatId, "Личность уничтожена");
        context[chatId] = "";
        chatSuffix[chatId] = "";
        writeChatSuffix(chatSuffix);
        return true;
    }
    if (msg === "reset") {
        bot.sendMessage(chatId, "Context cleared");
        context[chatId] = "";
        chatSuffix[chatId] = "";
        writeChatSuffix(chatSuffix);
        return true;
    }
    if (msg.startsWith("пропуск ")) {
        skip[chatId] = +msg.slice(8);
        writeSkip(skip);
        bot.sendMessage(chatId, "Отвечать раз в " + skip[chatId]);
        return true;
    }
    if (msg.startsWith("skip ")) {
        skip[chatId] = +msg.slice(5);
        writeSkip(skip);
        bot.sendMessage(chatId, "Skip " + skip[chatId]);
        return true;
    }
    if (msg.startsWith("отвечать раз в ")) {
        skip[chatId] = +msg.slice(15);
        writeSkip(skip);
        bot.sendMessage(chatId, "Отвечать раз в " + skip[chatId]);
        return true;
    }

    if (msg === "режим" || msg === "режим обычный") {
        chatSuffix[chatId] = "";
        context[chatId] = "";
        writeChatSuffix(chatSuffix);
        bot.sendMessage(chatId, "Режим обычный");
        return true;
    }
    if (msg.startsWith("режим ")) {
        chatSuffix[chatId] = "(" + msg.substring(6, 100) + ")";
        context[chatId] = "";
        writeChatSuffix(chatSuffix);
        bot.sendMessage(chatId, "Режим установлен");
        return true;
    }
    if (msg === "mode" || msg === "mode usual") {
        chatSuffix[chatId] = "";
        context[chatId] = "";
        writeChatSuffix(chatSuffix);
        bot.sendMessage(chatId, "Usual mode");
        return true;
    }
    if (msg.startsWith("mode ")) {
        chatSuffix[chatId] = "(" + msg?.substring(5, 100) + ")";
        context[chatId] = "";
        writeChatSuffix(chatSuffix);
        bot.sendMessage(chatId, "Mode set");
        return true;
    }

    if (msg.startsWith("температура ")) {
        temp[chatId] = +msg.slice(12)?.replace(",", ".");
        writeTemp(temp);
        bot.sendMessage(chatId, "Температура установлена в " + temp[chatId]);
        return true;
    }

    if (msg.startsWith("temperature ")) {
        temp[chatId] = +msg.slice(12)?.replace(",", ".");
        writeTemp(temp);
        bot.sendMessage(chatId, "Temperature set to " + temp[chatId]);
        return true;
    }
};

const sendInvoice = (chatId, language_code) => {
    bot.sendInvoice(
        chatId,
        language_code == "ru" ? "Требуется оплата" : "Need payment",
        language_code == "ru" ? "Подписка ChatGPT на 1 месяц" : "1-month access to ChatGPT",
        chatId,
        process.env.STRIPE_KEY,
        "USD",
        [
            {
                label:
                    chatId > 0
                        ? language_code == "ru"
                            ? "Полный доступ к P2P чату"
                            : "full access to P2P chat"
                        : language_code == "ru"
                        ? "Полный доступ к групповому чату"
                        : "full access to GROUP chat",
                amount: chatId > 0 ? PRICE * 100 : GROUP_PRICE * 100,
            },
        ],
        {
            photo_url: "https://blog.mangatv.shop/AI.png",
            need_name: false,
            need_phone_number: false,
            need_email: false,
            need_shipping_address: false,
        }
    )
        .then(() => {})
        .catch((e) => {
            console.error(e.message);
        });
};

const visualToText = async (chatId, msg) => {
    if (!(new Date(opened[chatId]) > new Date())) {
        return;
    }
    bot.sendChatAction(chatId, "typing");
    const intervalId = setInterval(() => {
        bot.sendChatAction(chatId, "typing")
            .then(() => {})
            .catch((e) => {
                console.error(e.message);
            });
    }, 5000);
    try {
        let prompt = await getPrompt(msg.photo);
        if (prompt) {
            // link between left and right hemisphere (computer vision)
            money[chatId] = (money[chatId] ?? 0) + CV_PRICE;
            writeMoney(money);
            bot.sendChatAction(chatId, "typing");
            last[chatId] = prompt;
            if (msg.from?.language_code == "ru") {
                prompt = await getText("Переведи на русский: " + prompt, 0.5, MAX_TOKENS, chatId);
            }
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
    } finally {
        clearInterval(intervalId);
    }
};

const textToVisual = async (chatId, text, language_code) => {
    if (!(new Date(opened[chatId]) > new Date())) {
        return;
    }
    bot.sendChatAction(chatId, "typing");
    if (text === "нарисуй" || text === "draw" || text === "paint") {
        // link between right and left hemisphere (painting)
        text = last[chatId]?.replace("child", "");
    }
    if ((language_code == "ru" && !text?.startsWith("draw")) || text?.startsWith("нарисуй")) {
        text = await getText("Translate to English: " + text?.replace("ребенка", ""), 0.5, MAX_TOKENS, chatId);
    }
    if (!text) {
        return;
    }
    bot.sendChatAction(chatId, "typing");
    const photo = await getArt(
        text +
            (text?.startsWith("draw")
                ? ""
                : ", deep focus, highly detailed, digital painting, artstation, 4K, smooth, sharp focus, illustration")
    );
    if (photo) {
        money[chatId] = (money[chatId] ?? 0) + IMAGE_PRICE;
        writeMoney(money);
        bot.sendPhoto(chatId, photo);
    }
};

const textToText = async (chatId, msg) => {
    count[chatId] = (count[chatId] ?? 0) + 1;
    context[chatId] += msg.text + ".";
    if (
        !(
            msg.text?.toLowerCase()?.startsWith("отвечай") ||
            msg.text?.toLowerCase()?.startsWith("ответь") ||
            msg.text?.toLowerCase()?.startsWith("answer")
        ) &&
        count[chatId] % (skip[chatId] ?? 1) != 0
    ) {
        trial[chatId] = trial[chatId] - 1;
        return;
    }
    bot.sendChatAction(chatId, "typing");
    const intervalId = setInterval(() => {
        bot.sendChatAction(chatId, "typing")
            .then(() => {})
            .catch((e) => {
                console.error(e.message);
            });
    }, 5000);
    try {
        let prompt = context[chatId] + chatSuffix[chatId] ?? "";
        let response;
        if (prompt) {
            response = await getText(
                prompt,
                ((temp[chatId] ?? 36.5) - 36.5) / 10 + 0.5,
                MAX_TOKENS * premium(chatId),
                chatId
            );
        }
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
    } finally {
        clearInterval(intervalId);
    }
};

const textToGoogle = async (chatId, msg, language_code) => {
    bot.sendChatAction(chatId, "typing");
    const response = await google(msg, language_code);
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

const getText = async (prompt, temperature, max_tokens, chatId) => {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            max_tokens: max_tokens,
            temperature: temperature,
        });
        const response = completion.choices?.[0]?.message?.content;
        const spent = (completion?.usage?.total_tokens / 1000) * OPENAI_PRICE;
        if (spent) {
            money[chatId] = (money[chatId] ?? 0) + spent;
            writeMoney(money);
        }
        // console.log(response);
        return response;
    } catch (e) {
        console.error(e.message);
        // if (e.message?.includes("429")) {
        //     bot.sendMessage(process.env.ADMIN_ID, e.message);
        // }
    }
};

const getArt = async (prompt, xl) => {
    const response = await fetch(`https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "image/png",
            Authorization: process.env.STABILITY_KEY,
        },
        body: JSON.stringify({
            cfg_scale: 7,
            height: 1024,
            width: 1024,
            samples: 1,
            steps: 30,
            text_prompts: [
                {
                    text: prompt,
                    weight: 1,
                },
            ],
        }),
    });

    if (!response.ok) {
        console.error(`Stability AI error: ${(await response.text())?.split("\n")?.[0]?.substring(0, 200)}`);
        return;
    }

    return response.buffer();
};

const getPrompt = async (photo) => {
    const file_id = photo[photo.length - 1].file_id;
    const fileUri = await bot.getFileLink(file_id);
    const img2prompt = await replicate.models.get("methexis-inc/img2prompt");
    return img2prompt.predict({ image: fileUri });
};

const premium = (chatId) => {
    if (opened[chatId] && chatId > 0) {
        return PREMIUM;
    } else {
        return 1;
    }
};

let callsTimestamps = [];
let groupUsers = {};
let allUsers = {};

// once per 3 hours clean groupUsers
setInterval(() => {
    groupUsers = {};
}, 1000 * 60 * 60 * 3);

// every minute clean allUsers
setInterval(() => {
    allUsers = {};
}, 1000 * 60);

const protection = (msg) => {
    //if user is admin, allow all and switch on server
    if (msg?.from?.username == process.env.ADMIN || msg?.from?.username == process.env.ADMIN2) {
        var d = new Date();
        d.setMonth(d.getMonth() + 1);
        opened[msg.chat.id] = d;
        writeOpened(opened);
        //  groupUsers = {};
        return false;
    }

    if (msg?.text?.toLowerCase()?.startsWith("/usage")) {
        return true;
    }

    // global rate limit
    allUsers[msg.chat.id] = (allUsers[msg.chat.id] ?? 0) + 1;
    if (allUsers[msg.chat.id] > ALL_MAX_PER_MINUTE) {
        return true;
    }

    // DDOS protection, call not more than 15 per minute for msg.chat.id
    if (PROMO.includes(String(msg.chat.id))) {
        // if reply, return true
        if (msg?.reply_to_message) {
            return true;
        }

        if (msg.photo) {
            return true;
        }

        //if msg contains оежим or сброс, return true
        if (
            msg?.text?.toLowerCase()?.startsWith("режим") ||
            msg?.text?.toLowerCase()?.startsWith("сброс") ||
            msg?.text?.toLowerCase()?.startsWith("пропуск") ||
            msg?.text?.toLowerCase()?.startsWith("mode") ||
            msg?.text?.toLowerCase()?.startsWith("reset") ||
            msg?.text?.toLowerCase()?.startsWith("skip")
        ) {
            return true;
        }

        if (
            msg?.text?.toLowerCase()?.startsWith("нарисуй") ||
            msg?.text?.toLowerCase()?.startsWith("draw") ||
            msg?.text?.toLowerCase()?.startsWith("paint")
        ) {
            groupUsers["draw"] = (groupUsers["draw"] ?? 0) + 1;
            if (groupUsers["draw"] > PROMO_MAX_PER_HOUR) {
                return true;
            }
        }

        groupUsers[msg?.from?.id] = (groupUsers[msg?.from?.id] ?? 0) + 1;
        if (groupUsers[msg?.from?.id] > PROMO_MAX_PER_HOUR) {
            return true;
        }

        callsTimestamps.push(Date.now());
        callsTimestamps = callsTimestamps.filter((stamp) => Date.now() - stamp < 60000);
        if (callsTimestamps.length >= PROMO_MAX_PER_MINUTE) {
            console.error("Abuse [1 minute] detected for ", msg.chat.id);
            bot.sendMessage(process.env.ADMIN_ID, "Abuse [1 minute] detected for " + chatId);
            opened[msg.chat.id] = new Date();
            return true;
        }
    }
};

const getReport = () => {
    let result = "";
    const add = (s) => {
        result += s + "\n";
    };

    add("Operational costs");
    add("------------------");
    const totalMoney = Object.keys(opened)
        .filter((t) => money[t])
        .map((k) => {
            add(k + " " + money[k].toFixed(2) + "$");
            return money[k];
        })
        .reduce((a, b) => a + b);
    add("Total " + totalMoney.toFixed(2) + "$");
    add("");

    add("Profit");
    add("------------------");
    const revenue = Object.keys(opened).length * PRICE;
    add(revenue + "$ - " + totalMoney.toFixed(2) + "$ = " + (revenue - totalMoney).toFixed(2) + "$");

    return result;
};

// Game URLs
const gameUrls = {
    puzzle: "https://allchat.online/landing/puzzle.html",
    game2048: "https://allchat.online/landing/2048.html",
    spacebubble: "https://allchat.online/landing/spacebubble.html",
    seabattle: "https://allchat.online/landing/seabattle.html",
    bejewelled: "https://allchat.online/landing/bejewelled.html",
    women: "https://allchat.online/landing/women.html",
};

// Handle inline queries
bot.on("inline_query", (query) => {
    const gameShortNames = ["puzzle", "game2048", "spacebubble", "seabattle", "bejewelled", "women"];

    if (gameShortNames.includes(query.query)) {
        const result = gameShortNames.map((game, index) => ({
            type: "game",
            id: (index + 1).toString(),
            game_short_name: game,
        }));

        bot.answerInlineQuery(query.id, result);
    }
});

// Handle game queries
bot.on("callback_query", (callbackQuery) => {
    const gameShortName = callbackQuery.game_short_name;
    if (gameUrls.hasOwnProperty(gameShortName)) {
        bot.answerCallbackQuery(callbackQuery.id, {
            url: gameUrls[gameShortName],
        });
    }
});

process.env["NTBA_FIX_350"] = 1;
process.env["NODE_NO_WARNINGS"] = 1;
process.env["GOOGLE_APPLICATION_CREDENTIALS"] = "./google.json";
