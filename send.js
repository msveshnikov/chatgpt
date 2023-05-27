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

        • Upload Your Own Images – Resize with ImageMagick: In response to user feedback, we have implemented the ability to upload custom images for use in stories. Additionally, we have integrated ImageMagick to provide automatic resizing, ensuring that uploaded images are properly adjusted for optimal display within the Manga TV platform.
        • Google Images in addition to Generation – Proper Size/Resize: To enrich the content creation experience, we have enhanced the previous image generation process with direct integration with Google Images. This update ensures that users have access to a wider range of images in the proper size and resolution
        • Custom Visual Settings (Global): We are excited to introduce the global custom visual settings feature on Manga TV. We offer stylization options for all slides within a story. Users can apply consistent visual effects, filters, or styles to every slide, creating a cohesive and visually captivating storytelling experience. This feature enables users to enhance the overall aesthetic appeal of their stories and engage their audience in a more immersive way.
        • “+” Button to Create a New Story: We have made it even easier for users to create new stories on Manga TV. The addition of a “+” button allows users to quickly initiate the story creation process and start bringing their ideas to life.
        • Reduced Blurring Dramatically: We have significantly improved the blurring effect on Manga TV. The updated algorithm dramatically reduces blurring, resulting in sharper visuals and better overall image quality.
        • SD XL and GPT-4 for Silver Plan Too: We have expanded the features available to Silver plan subscribers. In addition to the existing benefits, Silver plan users now have access to the SD XL model and the advanced GPT-4 capabilities. This enables them to create higher-quality content and explore more advanced storytelling possibilities.
        • Greek Language: We’re thrilled to announce that Manga TV now supports the Greek language. Users can now navigate and interact with the platform in Greek, providing a more personalized experience.
        • Feedback Page on Site: To encourage user engagement and gather valuable insights, we have introduced a dedicated Feedback page on the site. Users can now provide feedback, suggestions, and report any issues they encounter, helping us enhance the Manga TV experience for everyone.

         That’s it for now! Stay tuned for more exciting features and updates in the coming weeks!
         So don't wait, go to https://MangaTV.shop and enjoy AI comics!`
    )
        .then(() => {})
        .catch((e) => {
            console.error(e.message);
        });
}, 100);
