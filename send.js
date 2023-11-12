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
        `📣 Welcome to Manga TV! Here are the exciting additions from last week:

        1. GPT-4 Turbo with April 2023 Cutoff: Prepare to be amazed by the power of storytelling! We are thrilled to introduce GPT-4 Turbo, with a cutoff date of April 2023. This cutting-edge AI model takes your manga creation to new heights, offering enhanced text generation, character development, and plot intricacy. Your stories will be more immersive and captivating than ever before.

        2. OpenAI Voices: Take your manga narratives to the next level with realistic and expressive voices. Our platform now supports OpenAI voices, allowing you to infuse lifelike dialogues and character interactions into your manga stories. These voices add depth and emotion to your content, enriching the reading experience.

        3. Price Drop and More Minutes: We have some great news for our users! To make Manga TV even more accessible, we’ve implemented a price drop, giving you more value for your subscription. Additionally, we’re extending the available minutes for all users, allowing you to create and enjoy even more content without breaking the bank.

        4. Amazing SD XL v1.0 for All Users: Get ready for an amazing experience! We’ve released SD XL v1.0, and it’s now available to all users. This enhanced version offers superior performance, visuals, and storytelling capabilities, making manga creation and viewing an even more captivating experience for everyone.

        These additions are part of our ongoing commitment to enhancing your manga creation and reading experience. We’re dedicated to providing you with the best tools and features to bring your stories to life.
                
        Happy manga-making!
        
        Best regards, The Manga TV Team ❤️`
    )
        .then(() => {})
        .catch((e) => {
            console.error(e.message);
        });
}, 100);
