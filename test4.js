import { TranslationServiceClient } from "@google-cloud/translate";
const translationClient = new TranslationServiceClient();

process.env["GOOGLE_APPLICATION_CREDENTIALS"] = "./google.json";

const translate = async (text, target) => {
    const request = {
        parent: `projects/burger-20dea/locations/global`,
        contents: [text],
        mimeType: "text/plain",
        targetLanguageCode: target,
    };

    const [response] = await translationClient.translateText(request);
    return response.translations[0]?.translatedText;
};

console.log(await translate("Hello, world!", "ru"));
