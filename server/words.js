import fs from "fs";

const rawdata = fs.readFileSync("./wordlist/list.json");
const words = JSON.parse(rawdata).words;

export default words;

