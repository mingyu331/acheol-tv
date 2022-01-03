import * as fs from "fs";
const text = fs.readFileSync("./words.txt").toString();
// const words = [
//     ...new Set(
//         text
//             .split("\n")
//             .map((e) => {
//                 return e.split(" ").filter((e) => e != "");
//             })
//             .reduce((pre, cur) => {
//                 return pre.concat(cur);
//             })
//     ),
// ].sort();
const words = text.replaceAll("\n", " ");
fs.writeFileSync("./words_spaces.txt", words);
