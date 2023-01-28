import TelegramBot from "node-telegram-bot-api";
import { readTrial } from "./io.js";
import dotenv from "dotenv";
dotenv.config({ override: true });

const bot = new TelegramBot(process.env.TELEGRAM_KEY);
const trial = readTrial();

Object.keys(trial).map((chatId) => {
    console.log(chatId);
    bot.sendMessage(chatId, "Задайте любой вопрос боту в нашей группе: https://t.me/maxsoft_chat_gpt_group 🤗")
        .then(() => {})
        .catch((e) => {
            console.error(e.message);
        });
});
