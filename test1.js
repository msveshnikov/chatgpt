import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";
dotenv.config({ override: true });

const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_KEY }));

const getText = async (prompt, callback) => {
    const completion = await openai.createCompletion(
        {
            model: "text-davinci-003",
            prompt: prompt,
            max_tokens: 1000,
            stream: true,
        },
        { responseType: "stream" }
    );
    return new Promise((resolve) => {
        let result = "";
        completion.data.on("data", (data) => {
            const lines = data
                ?.toString()
                ?.split("\n")
                .filter((line) => line.trim() !== "");
            for (const line of lines) {
                const message = line.replace(/^data: /, "");
                if (message == "[DONE]") {
                    resolve(result);
                } else {
                    let token;
                    try {
                        token = JSON.parse(message)?.choices?.[0]?.text;
                    } catch {
                        console.log("ERROR", json);
                    }
                    result += token;
                    if (token) {
                        callback(token);
                    }
                }
            }
        });
    });
};

console.log(await getText("Расскажи смешной анекдот", (c) => process.stdout.write(c)));
