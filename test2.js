import { readTrial, readOpened } from "./io.js";

const opened = readOpened();
const trial = readTrial();

console.log("Advertising");
console.log("-----------");
console.log(
    "Total " +
        Object.keys(trial)
            .filter((t) => !opened[t] && t != "148315039" && t != "1049277315")
            .map((k) => {
                //    console.log(k, trials[k], trials[k] * 0.005 + "$");
                return trial[k] * 0.005;
            })
            .reduce((a, b) => a + b)
            .toFixed(2),
    "$"
);
console.log();
console.log("Paid subscriptions");
console.log("------------------");
console.log(
    "Total " +
        Object.keys(trial)
            .filter((t) => opened[t] && t != "148315039" && t != "1049277315")
            .map((k) => {
                console.log(k, trial[k], trial[k] * 0.005 + "$");
                return trial[k] * 0.005;
            })
            .reduce((a, b) => a + b)
            .toFixed(2),
    "$"
);
