import TelegramBot from "node-telegram-bot-api";
import { readTrial, readOpened } from "./db.js";
import dotenv from "dotenv";
dotenv.config({ override: true });

const bot = new TelegramBot(process.env.TELEGRAM_KEY);
const trial = readTrial();
const opened = readOpened();

const users = Object.keys(trial); //.filter((chatId) => !opened[chatId]);
// every 100 milliseconds pop one element from trial
console.log(users.length);
setInterval(() => {
    const chatId = users.pop();
    if (!chatId) return;
    console.log(chatId);
    bot.sendMessage(
        chatId,
        `🌟 Unveiling the Latest Manga Marvels at Manga TV! 🌈

        Discover the latest updates that will revolutionize your manga experience:

        1️⃣ Own Video Clip Upload:
        Now, it's your turn to shine! Bring your stories to life with personalized video clips. Upload your creations directly to Manga TV and captivate your audience with a personal touch.

        2️⃣ Stable AI Video Diffusion:
        Experience seamless transitions as images effortlessly transform into 4-second clips. Our latest update ensures dynamic content delivery, guaranteeing an uninterrupted viewing experience for your readers.

        3️⃣ Video Effects (Instagram-like Filters):
        Elevate your videos with Instagram-like filters! Explore a variety of effects to add style and flair to your content, making your manga stories even more engaging and visually stunning.

        ✨ Plus, we've added Webtoons to Manga TV for smoother navigation and enhanced user experience! ✨

        Don't miss out on these exciting additions from last week. Stay tuned for more updates and keep exploring Manga TV for an unforgettable manga journey! 🌟📺 #MangaTV #WhatsNew 
        Happy Manga-Making, Super Creators! 🚀
        https://mangatv.shop  
        `
    )
        .then(() => {})
        .catch((e) => {
            console.error(e.message);
        });
}, 100);
