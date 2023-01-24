import { readTrial, readOpened } from "./io.js";

const opened = readOpened();
const trial = readTrial();

const getReport = () => {
    let result = "";
    const add = (s) => {
        result += s + "\n";
    };
    add("Advertising");
    add("-----------");
    add(
        "Total " +
            Object.keys(trial)
                .filter((t) => !opened[t] && t != "148315039" && t != "1049277315" && t != "5966638424")
                .map((k) => {
                    return trial[k] * 0.005;
                })
                .reduce((a, b) => a + b)
                .toFixed(2) +
            "$"
    );
    add("");
    add("Paid subscriptions");
    add("------------------");
    add(
        "Total " +
            Object.keys(trial)
                .filter((t) => opened[t] && t != "148315039" && t != "1049277315")
                .map((k) => {
                    add(k + " " + trial[k] + " " + (trial[k] * 0.005).toFixed(2) + "$");
                    return trial[k] * 0.005;
                })
                .reduce((a, b) => a + b)
                .toFixed(2) +
            "$"
    );
    return result;
};

console.log(getReport());
