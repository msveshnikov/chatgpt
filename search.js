import cheerio from "cheerio";
import axios from "axios";

const searchTerm = "Путин";

const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
];

const results = await scrapeSearchResults();
console.log(results);

// This function scrapes the search results from the HTML of the Google search page
async function scrapeSearchResults() {
    const $ = await fetchData(searchTerm);
    return $(".UDZeY").text();
}

async function fetchData(term) {
    var randomAgent = Math.floor(Math.random() * userAgents.length);
    const result = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(term)}&hl=ru`, {
        headers: {
            "User-Agent": userAgents[randomAgent],
        },
    });
    return cheerio.load(result.data);
}
