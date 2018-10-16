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
const crypto_1 = require("crypto");
const path_1 = require("path");
const util_1 = require("util");
const fs_1 = require("fs");
class Bot {
    static safeDate() {
        return new Date().toLocaleString().replace(/[\.:]/g, '').replace(/ /, '-');
    }
    static hash(data) {
        return crypto_1.createHash('md5').update(data).digest("hex");
    }
    exists(path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield util_1.promisify(fs_1.stat)(path);
                return true;
            }
            catch (err) {
                return false;
            }
        });
    }
    createDir(path, force = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let stats;
            try {
                stats = yield util_1.promisify(fs_1.stat)(path);
            }
            catch (err) { }
            if (stats) {
                if (!stats.isDirectory()) {
                    yield util_1.promisify(fs_1.unlink)(path);
                }
                else {
                    return;
                }
            }
            else {
                yield util_1.promisify(fs_1.mkdir)(path);
            }
        });
    }
    get(url, formData) {
        return __awaiter(this, void 0, void 0, function* () {
            const hour = Bot.safeDate().replace(/\d{4}$/, '');
            const dirPath = path_1.join(__dirname, "cache"), filePath = path_1.join(dirPath, Bot.hash(url + hour) + ".html");
            if (yield this.exists(filePath)) {
                return util_1.promisify(fs_1.readFile)(filePath);
            }
            const body = yield request(Object.assign({ url, gzip: true, headers: {
                    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
                    'accept-encoding': "gzip",
                    'accept-language': "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7,ru;q=0.6",
                    'cache-control': "max-age=0",
                    'upgrade-insecure-requests': "1",
                    'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36",
                } }, formData));
            yield this.createDir(dirPath);
            yield util_1.promisify(fs_1.writeFile)(filePath, body);
            return body;
        });
    }
    crawl() {
        return __awaiter(this, void 0, void 0, function* () {
            const body = yield this.get("http://spys.one/free-proxy-list/TR/", {
                xpp: 5,
                xf1: 0,
                xf2: 0,
                xf4: 2,
                xf5: 0
            });
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
        });
    }
    run(hr = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let results = yield this.crawl();
            if (results.length == 0) {
                console.log("NO RESULT FOUND");
                return;
            }
            const json = JSON.stringify(results, null, hr ? 2 : null), dirPath = path_1.join(__dirname, "output"), filePath = path_1.join(dirPath, Bot.safeDate() + ".json");
            yield this.createDir(dirPath);
            yield util_1.promisify(fs_1.writeFile)(filePath, json);
        });
    }
}
exports.Bot = Bot;
