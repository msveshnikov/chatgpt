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
        `🌟 Unveiling the Latest Manga Marvels at Manga TV! 🌈

        Hold onto your seats because we've just cranked up the excitement! Here's the lowdown on the sensational upgrades that dropped last week:
        
        🚀 Introducing GPT-4 Turbo with April 2023 Magic: Brace yourself for a storytelling revolution! Dive into the future with GPT-4 Turbo, armed with a slick April 2023 cutoff. This state-of-the-art AI powerhouse is set to elevate your manga game with unparalleled text mastery, character evolution, and plot wizardry. Get ready to transport your readers into worlds more immersive and spellbinding than ever!
        
        🗣️ OpenAI Voices for Manga Maestros: Take your manga narratives on a journey of realism and expression! Manga TV now boasts OpenAI voices, injecting life-like dialogues and character dynamics into your stories. Elevate your content with voices that breathe depth and emotion, transforming the way your audience experiences your manga.
        
        💰 Price Drop Extravaganza and Bonus Minutes: Exciting news alert! We're making Manga TV even more irresistible with a sizzling price drop, giving you unbeatable value for your subscription. But that's not all—brace yourself for more minutes to play with! Create and indulge in a treasure trove of content without denting your wallet.
        
        🌈 Unleashing SD XL v1.0 for All Trailblazers: Prepare for an unparalleled adventure! SD XL v1.0 is here, and it's up for grabs for all users. This turbocharged version promises superior performance, jaw-dropping visuals, and enhanced storytelling prowess. Dive into a manga creation and viewing experience that's not just good but downright legendary!
        
        These mind-blowing upgrades are our way of staying true to our commitment to supercharge your manga creation and reading escapades. We're on a mission to equip you with the ultimate tools and features to bring your stories to life.
        
        Happy Manga-Making, Super Creators! 🚀
        https://mangatv.shop  
        
        Warmest regards,
        The Manga TV All-Stars 🌟💖`
    )
        .then(() => {})
        .catch((e) => {
            console.error(e.message);
        });
}, 100);
