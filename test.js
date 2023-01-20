import { Configuration, OpenAIApi } from "openai";

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
            const json = data?.toString()?.slice(6);
            if (json === "[DONE]\n\n") {
                resolve(result);
            } else {
                const token = JSON.parse(json)?.choices?.[0]?.text;
                result += token;
                callback(token);
            }
        });
    });
};

console.log(await getText("Расскажи смешной анекдот", (c) => process.stdout.write(c)));
