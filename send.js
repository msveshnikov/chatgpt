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
        `Hello from Manga TV!

        Welcome to our monthly newsletter, where we keep you up-to-date on the latest additions and updates to our platform. Here are some exciting features that were added last month:
        •	Watercolor and Finearts styles: Manga TV has added two new styles to its collection of artistic filters. Users can now choose between Watercolor and Finearts to give their videos a unique and creative look.
        •	Editor’s pick: To showcase the best content on Manga TV, the site now features an Editor’s Pick section. This section highlights the most impressive and popular videos on the site, as chosen by the Manga TV editorial team.
        •	PDF export –  Manga TV now offers a PDF export feature for its paid users. This allows users to export their video scripts as PDF files for easier sharing and collaboration.
        •	Edit script – Button Continue Story: Manga TV now offers an easier way to edit scripts for stories. Users can add rows with just one last click, and the new Continue Story button makes it easy to pick up where they left off.
        •	Sweden language: Manga TV is now available in Swedish, adding to the growing list of languages supported on the site.
        •	More voices (WaveNet+Standard): Manga TV has expanded its voice-over options, adding both WaveNet and Standard voices to the platform.
        •	Dark theme: For users who prefer a darker interface, Manga TV has added a Dark Theme option. This feature makes it easier on the eyes to view and navigate the site in low-light conditions.
        •	Category galleries (in search): Users can now easily browse through various categories of videos on Manga TV using the Category Galleries feature. This feature allows users to filter their searches based on categories such as action, romance, comedy, etc.
        
         That’s it for this month! Stay tuned for more exciting features and updates in the coming weeks!
         So don't wait, go to https://MangaTV.shop and enjoy AI comics!`
    )
        .then(() => {})
        .catch((e) => {
            console.error(e.message);
        });
}, 100);
