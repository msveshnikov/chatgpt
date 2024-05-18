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
        `Introducing AllChat: Your All-in-One AI Assistant [🚀 Product Hunt Launch!]
        Tired of juggling between different AI models? Say hello to AllChat, the ultimate AI assistant app that brings the power of Gemini Pro, Claude, OpenAI, and more under one roof! 🤯
        
        Here's what makes AllChat special:
        
        Chat with your favorite AI models: Gemini Pro 1.5, Claude 3, OpenAI GPT-3.5 & 4, and even custom GPTs (perfect for Llama-3) are all at your fingertips.
        Supercharged features:
        Multimodal input: Chat with text, audio (Gemini), and even video (Gemini)!
        Memory & Scheduling: AllChat remembers your preferences and can schedule actions to run automatically.
        Content creation powerhouse: Generate images with SDXL, summarize YouTube videos, and even create PowerPoint presentations!
        File uploads: Seamlessly integrate PDFs, Word documents, and Excel spreadsheets into your conversations.
        Markdown formatting & code execution: Enjoy beautiful formatting and run Python code directly in the app.
        Web tools: Access real-time information like weather, stock prices, and news. Automate emails and Telegram messages.
        Connect with the world: Use "Web Tools" to fetch data, send emails, and more, all within your AI conversations.
        Open-source & customizable: Contribute to the project on GitHub or tailor the app to your needs.
        Mobile-friendly: Access AllChat on your phone or tablet with the PWA or Android app.
        **AllChat is your one-stop shop for all things AI. Upvote AllChat on Product Hunt: https://www.producthunt.com/posts/allchat-3 ⬆️
        
        Ready to experience the future of AI? 
        
        Get AllChat today! [https://allchat.online/]
        
        P.S. We're always looking for feedback and suggestions! Join the discussion on our Discord server: https://discord.com/invite/JTk2fHtv
        
        #AI #AllChat #Chatbot #OpenAI #Gemini #Claude #Productivity #Launch
        `
    )
        .then(() => {})
        .catch((e) => {
            console.error(e.message);
        });
}, 100);
