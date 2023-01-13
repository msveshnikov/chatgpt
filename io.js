import fs from "fs";

export const writeOpened = (opened) => {
    fs.writeFileSync("opened", [...opened].join(" "));
};

export const readOpened = () => {
    return new Set(
        fs
            .readFileSync("opened")
            .toString()
            .split(" ")
            .map((a) => +a)
    );
};

export const writeTrials = (trials) => {
    fs.writeFileSync("trials", JSON.stringify(trials));
};

export const readTrials = () => {
    try {
        return JSON.parse(fs.readFileSync("trials").toString());
    } catch {
        return {};
    }
};

export const writeSkips = (skips) => {
    fs.writeFileSync("skips", JSON.stringify(skips));
};

export const readSkips = () => {
    try {
        return JSON.parse(fs.readFileSync("skips").toString());
    } catch {
        return {};
    }
};

export const writeContext = (context) => {
    fs.writeFileSync("context", JSON.stringify(context));
};

export const readContext = () => {
    try {
        return JSON.parse(fs.readFileSync("context").toString());
    } catch {
        return {};
    }
};
