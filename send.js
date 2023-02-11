import TelegramBot from "node-telegram-bot-api";
import { readTrial, readOpened } from "./db.js";
import dotenv from "dotenv";
dotenv.config({ override: true });

const bot = new TelegramBot(process.env.TELEGRAM_KEY);
const trial = readTrial();
const opened = readOpened();

const users = Object.keys(trial).filter((chatId) => !opened[chatId]);
// every 100 milliseconds pop one element from trial
setInterval(() => {
    const chatId = users.pop();
    if (!chatId) return;
    console.log(chatId);
    bot.sendMessage(
        chatId,
        `Добрый день!

Мы рады пригласить Вас присоединиться к нашей группе. Мы предлагаем Вам возможность общения с другими людьми, а также принять участие в различных интересных мероприятиях. У нас можно узнать много нового и интересного. Мы будем рады Вас приветствовать в нашей группе.

Присоединяйтесь к нам!

С наилучшими пожеланиями,
https://t.me/maxsoft_chat_gpt_group 🤗`
    )
        .then(() => {})
        .catch((e) => {
            console.error(e.message);
        });
}, 100);


