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
        `🎉 Exciting News! 🎉

        🌟 The Trial Period is BACK on ChatGPT bot! 🌟
        🚀 Gemini Pro 1.5 connected! Try it now ❤️
        
        💬 Plus, NEW features added to Manga TV recently:
        
        ✨ Comments on Stories
        🎨 Google Studio voices
        🎙️ Collaboration with ElevenLabs and Own Voices
        🔊 Voice Manager for Silver+ Users
        Don't miss out! Start your manga journey today on Manga TV! 🚀
        
        #MangaTV #FreeTrial #MangaExperience 📖✨
        `
    )
        .then(() => {})
        .catch((e) => {
            console.error(e.message);
        });
}, 100);
