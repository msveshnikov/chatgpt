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
        `📣 Exciting News! The highly anticipated SDXL 1.0 is finally here, exclusively released on Manga TV! 🎉🎉

        Are you ready to immerse yourself in a world of captivating stories and stunning visuals? Look no further than SDXL 1.0, powered by the cutting-edge GPT-4 AI comics generator from mangatv.shop. With just one prompt, prepare to witness an entire video story unfold before your eyes!
        
        Experience the next level of storytelling as SDXL 1.0 takes you on thrilling adventures, heartwarming tales, and epic battles. Each panel is meticulously crafted, ensuring the highest quality and attention to detail. You'll be amazed by the lifelike characters, intricate backgrounds, and dynamic action sequences that will leave you on the edge of your seat.
        
        Whether you're a long-time manga fan or new to the world of comics, SDXL 1.0 guarantees an unforgettable experience. Dive into a vast library of genres, including fantasy, sci-fi, romance, and more. Let your imagination run wild as you explore diverse worlds and meet fascinating characters brought to life by the incredible GPT-4 AI technology.
        
        With Manga TV's user-friendly interface, accessing SDXL 1.0 has never been easier. Simply visit mangatv.shop and prepare to be transported into a realm of unlimited possibilities. Get ready to lose yourself in the magic of storytelling like never before.
        
        Don't miss out on this groundbreaking release! Visit mangatv.shop now and witness the exceptional quality of SDXL 1.0. Get ready to embark on an extraordinary journey that will leave you craving for more. 🌟`
    )
        .then(() => {})
        .catch((e) => {
            console.error(e.message);
        });
}, 100);
