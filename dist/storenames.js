import * as cheerio from "cheerio";
import * as https from "https";
import * as fs from "fs";
process.on("uncaughtException", (error) => {
    console.log(error);
});
/**
 * stores product names from a gmarket query
 * @param filename name for the file to be stored
 * @param query query to send to gmarket
 * @param pages amount of pages to be searched
 */
export async function storenames({ filename = "names.txt", query = "%EB%83%89%EC%9E%A5%EA%B3%A0", options = "c:200002212", pages = 100 }, progressfn) {
    function istag(element) {
        return element?.type == "tag";
    }
    // console.log("a");
    let names = [];
    let progress = Array(pages).fill(0);
    let crawlled = [];
    // console.log("a");
    for (let idx = 1; idx <= pages; idx++) {
        crawlled.push((async () => {
            return new Promise(async (resolve, reject) => {
                https.get({
                    host: "browse.gmarket.co.kr",
                    path: `/search?keyword=${query}&p=${idx}&f=${options}`,
                    headers: { "User-Agent": "Mozilla/5.0" },
                }, (res) => {
                    res.on("data", (data) => {
                        fs.writeFileSync(`./response/response_${idx}.txt`, data, { flag: "a" });
                    });
                    res.on("close", () => {
                        // calculate names for the product
                        fs.readFile(`./response/response_${idx}.txt`, (err, buffer) => {
                            cheerio
                                .load(buffer)(".text__item")
                                .toArray()
                                .forEach((element) => {
                                if (istag(element)) {
                                    names.push(element.attribs.title);
                                }
                            });
                            fs.rm(`./response/response_${idx}.txt`, () => { });
                            progress[idx - 1] = true;
                            progressfn(progress);
                            resolve();
                        });
                    });
                    if (res.statusCode != 200) {
                        console.error(idx, ": response ", res.statusCode);
                    }
                });
            });
        })());
        if (crawlled.length >= 20) {
            await Promise.all(crawlled);
            await new Promise((resolve, reject) => {
                setTimeout(resolve, 10000);
            });
            crawlled = [];
        }
    }
    await Promise.all(crawlled);
    fs.writeFileSync(filename, [...new Set(names)].sort().join("\n"));
}
