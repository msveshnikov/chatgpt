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

export const google = async (term, lang) => {
    const fetchData = async (term, lang) => {
        const result = await fetch(`https://www.google.com/search?q=${encodeURIComponent(term)}&hl=${lang}`, {
            headers: { "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)] },
        });
        return load(await result.text());
    };
    const $ = await fetchData(term, lang);
    return (
        $(".UDZeY span")
            .map((i, element) => $(element).text())
            .get()
            .join(" ")
            .replaceAll("Описание", "")
            .replaceAll("ЕЩЁ", "") + $(".LGOjhe span").text()
    );
};

//console.log(await google("Java", "en"));

export const googleImages = async (term, lang) => {
    const fetchData = async (term, lang) => {
        const result = await fetch(
            `https://www.google.com/search?q=${term}&oq=${term}&hl=${lang}&tbm=isch&asearch=ichunk&async=_id:rg_s,_pms:s,_fmt:pc&sourceid=chrome&ie=UTF-8`,
            {
                headers: { "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)] },
            }
        );
        return load(await result.text());
    };
    const $ = await fetchData(term, lang);
    let images_results = [];
    $("div.rg_bx").each((i, el) => {
        let json_string = $(el).find(".rg_meta").text();
        images_results.push({
            title: $(el).find(".iKjWAf .mVDMnf").text(),
            source: $(el).find(".iKjWAf .FnqxG").text(),
            link: JSON.parse(json_string).ru,
            original: JSON.parse(json_string).ou,
            thumbnail: $(el).find(".rg_l img").attr("src")
                ? $(el).find(".rg_l img").attr("src")
                : $(el).find(".rg_l img").attr("data-src"),
        });
    });

    return images_results;
};

const cookie = `language=cs; pvc_visits_3[0]=1685090729b28; cc_cookie={"level":["necessary","performance","tracking"],"revision":0,"data":null,"rfc_cookie":false}; _fbp=fb.1.1684394896497.1689359607; SSESS8cc46d9546d5f41d63f434244f7db91b=jb4kcavmg8c7fehms7v08e8odp; _gid=GA1.2.402932138.1685087132; _gat_UA-52097878-1=1; _ga_98NQ5DH3GF=GS1.1.1685087131.8.1.1685087135.0.0.0; _ga=GA1.1.1798575518.1670080859`;

export const a2 = async () => {
    const fetchData = async () => {
        const result = await fetch(`https://cestina-pro-cizince.cz/trvaly-pobyt/a2/online-prihlaska/?progress=1`, {
            headers: { "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)], Cookie: cookie },
        });
        return load(await result.text());
    };
    const $ = await fetchData();
    return (
        (
            $("li")
                .text()
                .match(/Obsazeno/g) || []
        ).length < 21
    );
};
