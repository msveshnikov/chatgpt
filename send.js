import TelegramBot from "node-telegram-bot-api";
import { readTrial, readOpened } from "./db.js";
import dotenv from "dotenv";
dotenv.config({ override: true });

const bot = new TelegramBot(process.env.TELEGRAM_KEY);
const trial = readTrial();
const opened = readOpened();

const users = Object.keys(trial)//.filter((chatId) => !opened[chatId]);
// every 100 milliseconds pop one element from trial
console.log(users.length);
setInterval(() => {
    const chatId = users.pop();
    if (!chatId) return;
    console.log(chatId);
    bot.sendMessage(
        chatId,
        `Привет от Манга ТВ!

        Последние истории о Пригожине уже на Манге! 😊
        Так что не ждите, заходите на https://MangaTV.shop/landing/index.html и наслаждайтесь комиксами с искусственным интеллектом!`
    )
        .then(() => {})
        .catch((e) => {
            console.error(e.message);
        });
}, 100);
