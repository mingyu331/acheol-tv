import { storenames } from "./storenames.js";
import * as readline from "readline";
let callnum = 0;
console.clear();
await storenames({ filename: "refrigerator.txt", pages: 1000 }, (e) => {
    readline.cursorTo(process.stdout, 0, 0);
    e.forEach((e, i) => {
        if (i % 5 != 0)
            process.stdout.write(e ? "■" : " ");
    });
    process.stdout.write("\n");
    callnum++;
});
