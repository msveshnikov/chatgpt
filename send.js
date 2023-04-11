import TelegramBot from "node-telegram-bot-api";
import { readTrial, readOpened } from "./db.js";
import dotenv from "dotenv";
dotenv.config({ override: true });

const bot = new TelegramBot(process.env.TELEGRAM_KEY);
const trial = readTrial();
const opened = readOpened();

const users = Object.keys(trial).filter((chatId) => !opened[chatId]);
// every 100 milliseconds pop one element from trial
console.log(users.length);
setInterval(() => {
    const chatId = users.pop();
    if (!chatId) return;
    console.log(chatId);
    bot.sendMessage(
        chatId,
        `А ну че, ребята, слышали про сайт Mangatv.shop? Там есть такая фишка - AI комиксы! Ай-ай-ай, какая крутая штука! А вот изображения генерирует она так себе, но зато сколько веселья и приключений в комиксах! Там есть все - от боевиков до романтических историй. Я сам не могу оторваться от чтения! Так что не зевайте, заходите на https://Mangatv.shop и наслаждайтесь AI комиксами!`
    )
        .then(() => {})
        .catch((e) => {
            console.error(e.message);
        });
}, 100);
