import * as cheerio from "cheerio";
import * as https from "https";
import * as fs from "fs";
import * as readline from "readline";
const chunk_size = 20;
const display_amount = 100;
const pageCount = 100;
const gradient = " □▤▥▨▧▦▩■";
function appendnames(idx) {
    cheerio
        .load(fs.readFileSync(`./response/response_${idx}.txt`))(".text__item")
        .toArray()
        .forEach((element) => {
        if (istag(element)) {
            names.push(element.attribs.title);
        }
    });
    fs.rm(`./response/response_${idx}.txt`, () => { });
    finished[Math.floor(((idx - 1) / pageCount) * display_amount)]++;
    updateprogress(idx);
}
function updateprogress(idx) {
    console.clear();
    readline.cursorTo(process.stdout, 0, 0);
    process.stdout.write("[");
    for (let idx = 0; idx < display_amount; ++idx) {
        process.stdout.write(gradient.charAt(Math.floor((finished[idx] / pageCount) * display_amount * (gradient.length - 1))));
    }
    process.stdout.write("]\n");
    console.log(idx, "finished");
}
console.clear();
// initial request for page number
if (false) {
    await (async () => {
        return new Promise((resolve, reject) => {
            https.get({
                host: "browse.gmarket.co.kr",
                path: "/search?keyword=%EB%83%89%EC%9E%A5%EA%B3%A0&f=c:200002212",
                headers: { "User-Agent": "Mozilla/5.0" },
            }, (res) => {
                res.on("data", (data) => {
                    fs.writeFileSync(`./response/response.txt`, data, { flag: "a" });
                });
                res.on("close", () => {
                    resolve();
                });
            });
        });
    })();
}
function istag(element) {
    return element?.type == "tag";
}
function istext(element) {
    return element?.type == "text";
}
let e = cheerio.load(fs.readFileSync("./response/response.txt"))(".text__item-count")[0];
let ppageCount = 0, finished = Array(0).fill(0);
if (istag(e) && istext(e.children[0])) {
    ppageCount = Math.ceil(parseInt(e.children[0].data?.split(",").join("") ?? "0") / 100);
    finished = Array(pageCount).fill(0);
}
console.log(`Page total ${ppageCount}, crawling: `);
let crawlled = [];
let names = [];
// get all names
for (let idx = 1; idx <= 100; idx++) {
    crawlled.push((async () => {
        return new Promise((resolve, reject) => {
            https.get({
                host: "browse.gmarket.co.kr",
                path: `/search?keyword=%EB%83%89%EC%9E%A5%EA%B3%A0&p=${idx}&f=c:200002212`,
                headers: { "User-Agent": "Mozilla/5.0" },
            }, (res) => {
                res.on("data", (data) => {
                    fs.writeFileSync(`./response/response_${idx}.txt`, data, { flag: "a" });
                });
                res.on("close", () => {
                    // calculate names for the product
                    appendnames(idx);
                    resolve();
                });
                if (res.statusCode != 200) {
                    console.log(idx, ": error code", res.statusCode);
                }
            });
        });
    })());
    if (!(idx % chunk_size)) {
        console.log("Page", idx);
        await Promise.all(crawlled);
        crawlled = [];
    }
}
await Promise.all(crawlled);
fs.writeFileSync("names.txt", [...new Set(names)].sort().join("\n"));
