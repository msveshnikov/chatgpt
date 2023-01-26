import fs from "fs";

const write = (file, value) => {
    fs.writeFileSync(file, JSON.stringify(value));
};

const read = (file) => {
    try {
        return JSON.parse(fs.readFileSync(file));
    } catch {
        return {};
    }
};

export const writeOpened = (opened) => {
    write("opened.json", opened);
};

export const readOpened = () => {
    return read("opened.json");
};

export const writeTrial = (trial) => {
    write("trials.json", trial);
};

export const readTrial = () => {
    return read("trials.json");
};

export const writeSkip = (skip) => {
    write("skips.json", skip);
};

export const readSkip = () => {
    return read("skips.json");
};

export const writeContext = (context) => {
    write("context.json", context);
};

export const readContext = () => {
    return read("context.json");
};

export const writeHumans = (humans) => {
    write("humans.json", humans);
};

export const readHumans = () => {
    return read("humans.json");
};

export const writeTemp = (temp) => {
    write("temp.json", temp);
};

export const readTemp = () => {
    return read("temp.json");
};

export const writeTime = (temp) => {
    write("time.json", temp);
};

export const readTime = () => {
    return read("time.json");
};
