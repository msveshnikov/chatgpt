import { Configuration, OpenAIApi } from "openai";

const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_KEY }));

const completion = await openai.createCompletion(
    {
        model: "text-davinci-003",
        prompt: "Какая самая высокая гора в африке?",
        max_tokens: 200,
        stream: true,
        temperature: 0.5,
    },
    { responseType: "stream" }
);
completion.data.on("data", (data) => {
    const d = data?.toString()?.slice(6);
    if (d.slice(0, 6) !== "[DONE]") {
        const c = JSON.parse(d);
        process.stdout.write(c?.choices?.[0]?.text);
    }
});
