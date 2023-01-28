import { readTrial, readOpened, readContext } from "./io.js";

const opened = readOpened();
const trial = readTrial();
const context = readContext();

const getReport = () => {
    let result = "";
    const add = (s) => {
        result += s + "\n";
    };
    add("Advertising costs");
    add("-----------");
    const adv = Object.keys(trial)
        .filter((k) => context[k])
        .filter((t) => !opened[t] && t != "1049277315")
        .map((k) => {
            return trial[k] * 0.005;
        })
        .reduce((a, b) => a + b)
        .toFixed(2);
    add("Total " + adv + "$");
    add("");
    add("Operational costs");
    add("------------------");
    const operations = Object.keys(trial)
        .filter((t) => opened[t] && t != "1049277315")
        .map((k) => {
            add(k + " " + trial[k] + " " + (trial[k] * 0.005).toFixed(2) + "$");
            return trial[k] * 0.005;
        })
        .reduce((a, b) => a + b)
        .toFixed(2);
    add("Total " + operations + "$");
    add("");
    add("Profit");
    add("------------------");
    const revenue = (Object.keys(opened).length - 3) * 5;
    add(revenue + "$ - " + adv + "$ - " + operations + "$ = " + (revenue - operations - adv).toFixed(2) + "$");

    add("");
    add("Conversion");
    add("------------------");
    add((((Object.keys(opened).length - 3) / Object.keys(context).length) * 100).toFixed(2) + "%");
    return result;
};

console.log(getReport());
console.log(
`Добрый день!

Мы рады пригласить Вас присоединиться к нашей группе. Мы предлагаем Вам возможность общения с другими людьми, а также принять участие в различных интересных мероприятиях. У нас можно узнать много нового и интересного. Мы будем рады Вас приветствовать в нашей группе.

Присоединяйтесь к нам!

С наилучшими пожеланиями,
https://t.me/maxsoft_chat_gpt_group 🤗`);