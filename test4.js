import { TranslationServiceClient } from "@google-cloud/translate";
const translationClient = new TranslationServiceClient();

process.env["GOOGLE_APPLICATION_CREDENTIALS"] = "./google.json";

const projectId = "burger-20dea";
const location = "global";

async function translate(text, target) {
    const request = {
        parent: `projects/${projectId}/locations/${location}`,
        contents: [text],
        mimeType: "text/plain",
        targetLanguageCode: target,
    };

    const [response] = await translationClient.translateText(request);
    return response.translations[0].translatedText;
}

console.log(await translate("Hello, world!", "ru"));
