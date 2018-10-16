import * as request from "request-promise";
import * as cheerio from "cheerio";
import { join, resolve } from "path";
import { createDir, exists, writeFile, readFile, md5, safeDate } from "./helpers";

interface FormData {
  xpp?: number,
  xf1?: number,
  xf2?: number,
  xf4?: number,
  xf5?: number
}

interface Options {
  // request options
  formData?: FormData

  // cache options
  cache?: boolean
  cachePath?: string

  // output options
  output: boolean
  outputPath?: string

  // save options
  humanReadable?: boolean
}

export class Bot {
  async request(url: string, formData?: FormData) {
    return request({
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
  }

  crawl(body: string) {
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

  private get defaults(): Options {
    return {
      formData: {
        xpp: 5,
        xf1: 0,
        xf2: 0,
        xf4: 2,
        xf5: 0
      },
      cache: false,
      cachePath: resolve("cache"),
      output: false,
      outputPath: resolve("output"),
      humanReadable: false
    };
  }

  async run(options?: Options) {
    const { defaults } = this;

    let { formData, cache, output, cachePath, outputPath, humanReadable } = { ...defaults, ...options };
    let url = "http://spys.one/free-proxy-list/TR/", hash = md5(JSON.stringify({ url, formData }));
    let cacheFileName = join(cachePath, hash + ".html"), outputFileName = join(outputPath, safeDate() + ".json");
    let body;

    cache = cache && !!cachePath;
    formData = { ...defaults.formData, ...formData };

    if (cache && await exists(cacheFileName)) {
      body = await readFile(cacheFileName);
    } else {
      body = await this.request(url, formData);
    }

    if (cache) {
      await createDir(cachePath);
      await writeFile(cacheFileName, body);
    }

    const results = this.crawl(body);

    if (output) {
      const json = JSON.stringify(results, null, humanReadable ? 2 : null);
      await createDir(outputPath);
      await writeFile(outputFileName, json);
    }

    return results;
  }
}