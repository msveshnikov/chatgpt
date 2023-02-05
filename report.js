import { readTrial, readOpened, readMoney } from "./db.js";
const REQUEST_PRICE = 0.0063;
let PROMO = ["-1001776618845", "-1001716321937"];

const opened = readOpened();
const trial = readTrial();
const money = readMoney();

const getReport = () => {
    let result = "";
    const add = (s) => {
        result += s + "\n";
    };
    add("Advertising costs");
    add("-----------");
    const adv = Object.keys(trial)
        .filter((t) => !opened[t] || PROMO.includes(t))
        .map((k) => {
            return trial[k] * REQUEST_PRICE;
        })
        .reduce((a, b) => a + b)
        .toFixed(2);
    add("Total " + adv + "$");
    add("");
    add("Operational costs");
    add("------------------");
    const operations = Object.keys(trial)
        .filter((t) => opened[t] && !PROMO.includes(t))
        .map((k) => {
            add(k + " " + trial[k] + " " + (trial[k] * REQUEST_PRICE).toFixed(2) + "$");
            return trial[k] * REQUEST_PRICE;
        })
        .reduce((a, b) => a + b)
        .toFixed(2);
    add("Total " + operations + "$");
    add("");

    add("Money");
    add("------------------");
     const totalMoney=Object.keys(opened)
        .filter((t) => money[t] && !PROMO.includes(t))
        .map((k) => {
            add(k + " " + money[k].toFixed(2) + "$");
            return money[k];
        })
        .reduce((a, b) => a + b)
        .toFixed(2);
    add("Money " + totalMoney + "$");
    add("");

    add("Profit");
    add("------------------");
    const revenue = (Object.keys(opened).length - 3) * 5;
    add(revenue + "$ - " + adv + "$ - " + operations + "$ = " + (revenue - operations - adv).toFixed(2) + "$");

    add("");
    add("Conversion");
    add("------------------");
    add((((Object.keys(opened).length - 3) / Object.keys(trial).length) * 100).toFixed(2) + "%");
    return result;
};

console.log(getReport());
