import { readTrial, writeHumans, readHumans, readOpened } from "./io.js";

const TRIAL_COUNT = 0;

const trial = readTrial();
const humans = readHumans();
const opened = readOpened();
const trials = readTrial();

const pairRandom = (chatId) => {
    const otherId = Object.keys(trial)
        .filter((key) => trial[key] > TRIAL_COUNT + 2)
        .filter((key) => !humans[key] && !opened[key] && key != chatId)[0];

    if (otherId) {
        humans[chatId] = +otherId;
        humans[otherId] = +chatId;
        console.log("Pair created", chatId, otherId);
        writeHumans(humans);
    }
};

Object.keys(trial)
    .filter((t) => opened[t] && t != "148315039" && t != "1049277315")
    .map((k) => console.log(k, trials[k], trials[k] * 0.005 + "$"));
