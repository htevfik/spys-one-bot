import * as request from "request-promise";
import * as cheerio from "cheerio";
import { createHash } from "crypto";
import { join } from "path";
import { promisify } from "util";
import { writeFile, stat, Stats, unlink, mkdir, readFile } from "fs";

export class Bot {
  public static safeDate() {
    return new Date().toLocaleString().replace(/[\.:]/g, '').replace(/ /, '-');
  }

  public static hash(data: string) {
    return createHash('md5').update(data).digest("hex");
  }

  async exists(path) {
    try {
      await promisify(stat)(path);
      return true;
    } catch (err) {
      return false;
    }
  }

  async createDir(path: string, force = false) {
    let stats: Stats;

    try {
      stats = await promisify(stat)(path);
    } catch (err) { }

    if (stats) {
      if (!stats.isDirectory()) {
        await promisify(unlink)(path);
      } else {
        return;
      }
    } else {
      await promisify(mkdir)(path);
    }
  }

  async get(url: string, formData?) {
    const hour = Bot.safeDate().replace(/\d{4}$/, '');
    const
      dirPath = join(__dirname, "cache"),
      filePath = join(dirPath, Bot.hash(url + hour) + ".html");

    if (await this.exists(filePath)) {
      return promisify(readFile)(filePath);
    }

    const body = await request({
      url,
      gzip: true,
      headers: {
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        'accept-encoding': "gzip",
        'accept-language': "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7,ru;q=0.6",
        'cache-control': "max-age=0",
        'upgrade-insecure-requests': "1",
        'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36",
      },
      ...formData
    });

    await this.createDir(dirPath);
    await promisify(writeFile)(filePath, body);

    return body;
  }

  async crawl() {
    const body = await this.get("http://spys.one/free-proxy-list/TR/", {
      xpp: 5,
      xf1: 0,
      xf2: 0,
      xf4: 2,
      xf5: 0
    });

    const
      $ = cheerio.load(body),
      fields = [],
      rows = [];

    $(".spy1x, .spy1xx").each((i, e) => {
      if (i == 0) return;

      const row = {};

      $(e).children().each((j, f) => {
        if (i == 1) {
          let field = $(f).text().replace(/\W+/g, '_').replace(/(^_|_$)/g, '').toLowerCase();
          fields.push(field);
        } else {
          let key = fields[j], value = $(f).text();

          if (key == 'speed') {
            value = +($(f).find("table").first().attr("width") / 30 * 100).toFixed(2);
          } else if (value == +value) {
            value = +value;
          } else if (typeof value == 'string') {
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

  async run(hr: boolean = false) {
    let results = await this.crawl();

    if (results.length == 0) {
      console.log("NO RESULT FOUND")
      return;
    }

    const
      json = JSON.stringify(results, null, hr ? 2 : null),
      dirPath = join(__dirname, "output"),
      filePath = join(dirPath, Bot.safeDate() + ".json");

    await this.createDir(dirPath);
    await promisify(writeFile)(filePath, json);
  }
}