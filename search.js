import { load } from "cheerio";
import fetch from "node-fetch";

const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
];

async function google(term, lang) {
    const $ = await fetchData(term, lang);
    return (
        $(".UDZeY span")
            .map((i, element) => $(element).text())
            .get()
            .join(" ")
            .replaceAll("Описание", "")
            .replaceAll("ЕЩЁ", "") + $(".LGOjhe span").text()
    );
}

async function fetchData(term, lang) {
    const result = await fetch(`https://www.google.com/search?q=${encodeURIComponent(term)}&hl=${lang}`, {
        headers: { "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)] },
    });
    return load(await result.text());
}

export default google;
//console.log(await google("Java", "en"));
