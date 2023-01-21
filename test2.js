import { writeTrial, readTrial, writeHumans, readHumans } from "./io.js";

const TRIAL_COUNT = 10;

const trial = readTrial();
const humans = readHumans();

const pairRandom = (chatId) => {
    const otherId = Object.keys(trial)
        .filter((key) => trial[key] > TRIAL_COUNT + 2)
        .filter((key) => !humans[key])[0];

    if (otherId) {
        humans[chatId] = +otherId;
        humans[otherId] = +chatId;
        console.log("Pair created", chatId, otherId);
        writeHumans(humans);
    }
};

pairRandom(58602360);
