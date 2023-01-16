import {
    writeOpened,
    readOpened,
    writeTrial,
    readTrial,
    writeSkip,
    readSkip,
    writeContext,
    readContext,
} from "./io.js";
import LanguageDetect from "languagedetect";

const lngDetector = new LanguageDetect();
// let context = readContext();
// for (let c in context) {
//     console.log(lngDetector.detect(context[c],1)[0]?.[0], '-', context[c]);
// }

let opened = readOpened();
// var d = new Date();
// d.setMonth(d.getMonth() + 1);
// opened["-1001596727979"] = d;
// writeOpened(opened);
console.log(new Date(opened["371797596"]));
console.log(new Date());
console.log(new Date(opened["371797596"]) > new Date());
if (!(new Date(opened["371797594"]) > new Date())) {
    console.log("closed");
}
console.log("-1001624504120" > 0);
console.log("-1001624504120" < 0);
