"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request-promise");
const cheerio = require("cheerio");
const path_1 = require("path");
const helpers_1 = require("./helpers");
class Bot {
    request(url, formData) {
        return __awaiter(this, void 0, void 0, function* () {
            return request(Object.assign({ url, gzip: true, headers: {
                    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
                    'accept-encoding': "gzip",
                    'accept-language': "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7,ru;q=0.6",
                    'cache-control': "max-age=0",
                    'upgrade-insecure-requests': "1",
                    'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36",
                } }, formData));
        });
    }
    crawl(body) {
        const $ = cheerio.load(body), fields = [], rows = [];
        $(".spy1x, .spy1xx").each((i, e) => {
            if (i == 0)
                return;
            const row = {};
            $(e).children().each((j, f) => {
                if (i == 1) {
                    let field = $(f).text().replace(/\W+/g, '_').replace(/(^_|_$)/g, '').toLowerCase();
                    fields.push(field);
                }
                else {
                    let key = fields[j], value = $(f).text();
                    if (key == 'speed') {
                        value = +($(f).find("table").first().attr("width") / 30 * 100).toFixed(2);
                    }
                    else if (value == +value) {
                        value = +value;
                    }
                    else if (typeof value == 'string') {
                        value = value.replace(/^\d+ /, '');
                    }
                    row[key] = value;
                }
            });
            if (Object.keys(row).length) {
                rows.push(row);
            }
        });
        return rows;
    }
    get defaults() {
        return {
            formData: {
                xpp: 5,
                xf1: 0,
                xf2: 0,
                xf4: 2,
                xf5: 0
            },
            cache: false,
            cachePath: path_1.resolve("cache"),
            output: false,
            outputPath: path_1.resolve("output"),
            humanReadable: false
        };
    }
    run(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { defaults } = this;
            let { formData, cache, output, cachePath, outputPath, humanReadable } = Object.assign({}, defaults, options);
            let url = "http://spys.one/free-proxy-list/TR/", hash = helpers_1.md5(JSON.stringify({ url, formData }));
            let cacheFileName = path_1.join(cachePath, hash + ".html"), outputFileName = path_1.join(outputPath, helpers_1.safeDate() + ".json");
            let body;
            cache = cache && !!cachePath;
            formData = Object.assign({}, defaults.formData, formData);
            if (cache && (yield helpers_1.exists(cacheFileName))) {
                body = yield helpers_1.readFile(cacheFileName);
            }
            else {
                body = yield this.request(url, formData);
            }
            if (cache) {
                yield helpers_1.createDir(cachePath);
                yield helpers_1.writeFile(cacheFileName, body);
            }
            const results = this.crawl(body);
            if (output) {
                const json = JSON.stringify(results, null, humanReadable ? 2 : null);
                yield helpers_1.createDir(outputPath);
                yield helpers_1.writeFile(outputFileName, json);
            }
            return results;
        });
    }
}
exports.Bot = Bot;
