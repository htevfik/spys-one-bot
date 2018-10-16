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
const fs = require("fs");
const crypto_1 = require("crypto");
const util_1 = require("util");
exports.stat = util_1.promisify(fs.stat);
exports.mkdir = util_1.promisify(fs.mkdir);
exports.unlink = util_1.promisify(fs.unlink);
exports.readFile = util_1.promisify(fs.readFile);
exports.writeFile = util_1.promisify(fs.writeFile);
function md5(data) {
    return crypto_1.createHash('md5').update(data).digest("hex");
}
exports.md5 = md5;
function safeDate() {
    return new Date().toLocaleString().replace(/[\.:]/g, '').replace(/ /, '-');
}
exports.safeDate = safeDate;
function exists(path) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield exports.stat(path);
        }
        catch (err) {
            return false;
        }
    });
}
exports.exists = exists;
function createDir(path, force = false) {
    return __awaiter(this, void 0, void 0, function* () {
        let stats = yield exists(path);
        if (stats) {
            if (!stats.isDirectory()) {
                if (force) {
                    yield exports.unlink(path);
                    stats = null;
                }
                else {
                    throw new Error(`${path} is already exists but it is not a directory!`);
                }
            }
        }
        if (!stats) {
            yield exports.mkdir(path);
        }
    });
}
exports.createDir = createDir;
