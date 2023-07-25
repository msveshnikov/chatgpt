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
        `📣 Attention manga lovers! 🎉

        Looking for a platform to unleash your creativity and share your captivating manga stories with the world? Look no further! Introducing Manga TV, the ultimate destination for manga enthusiasts like you.
        
        🖌️ Create Unique Manga Stories: Express your imagination and bring your stories to life with our intuitive and user-friendly editor. Craft visually stunning panels, add captivating dialogues, and explore various art styles to make your manga truly stand out.
        
        🌍 Connect with a Vibrant Community: Join a thriving community of manga artists, writers, and fans from around the globe. Collaborate, share feedback, and learn from fellow creators who share your passion for this captivating art form.
        
        📚 Explore a Diverse Collection: Dive into a treasure trove of manga stories created by talented individuals. Discover new genres, art styles, and narratives that will keep you engaged for hours on end.
        
        💫 Showcase Your Talent: Publish your manga to our global audience and gain recognition for your creative work. Whether you're a seasoned artist or just starting, Manga TV is the perfect platform to showcase your talent and receive valuable feedback.
        
        🔥 Join Manga TV today and unleash your manga creativity like never before! Sign up now at [website URL] and embark on an exciting journey filled with endless possibilities.
        
        💌 Have questions or need assistance? Our dedicated support team is here to help. Feel free to reach out to us anytime at [support email].
        
        Don't miss out on this incredible opportunity to be part of the Manga TV community. Start creating, sharing, and connecting with like-minded manga enthusiasts today!
        
        Spread the word and invite your friends who share a passion for manga. Together, let's take the manga world by storm! 🌟
        
        https://MangaTV.shop/landing/index.html`
    )
        .then(() => {})
        .catch((e) => {
            console.error(e.message);
        });
}, 100);
