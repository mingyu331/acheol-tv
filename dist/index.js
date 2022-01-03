import * as cheerio from "cheerio";
import * as https from "https";
import * as fs from "fs";
// initial request for page number
if (false) {
    await (async () => {
        return new Promise((resolve, reject) => {
            https.get({
                host: "browse.gmarket.co.kr",
                path: "/search?keyword=%EB%83%89%EC%9E%A5%EA%B3%A0",
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
let response = fs.readFileSync("./response/response.txt");
let idx = response.indexOf("text__item-count");
let pageCount = Math.ceil(parseInt(response.slice(idx + 18, idx + 25).toString()) / 100);
console.log("Crawling product names: ");
let crawlled = [];
let names = [];
const isTag = (element) => {
    return element?.attribs !== undefined;
};
function appendnames(idx) {
    cheerio
        .load(fs.readFileSync(`./response/response_${idx}.txt`).toString())(".text__item")
        .toArray()
        .forEach((element) => {
        if (isTag(element)) {
            names.push(element.attribs.title);
        }
    });
}
// get all names
if (false) {
    for (let idx = 1; idx <= 10; idx++) {
        crawlled.push((async () => {
            return new Promise((resolve, reject) => {
                https.get({
                    host: "browse.gmarket.co.kr",
                    path: `/search?keyword=%EB%83%89%EC%9E%A5%EA%B3%A0&p=${idx}`,
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
    }
    await Promise.all(crawlled);
}
for (let idx = 1; idx <= 10; ++idx)
    appendnames(idx);
fs.writeFileSync("names.txt", [...new Set(names)].sort().join("\n"));
