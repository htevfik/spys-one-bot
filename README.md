# spys one bot

## usage

```javascript
const bot = require("./dist");

bot.run({
  formData: {
    xpp: 5,
    xf1: 0,
    xf2: 0,
    xf4: 2,
    xf5: 0
  },
  cache: false,
  cachePath: "./cache",
  output: false,
  outputPath: "./output",
  humanReadable: false
}).then(results => {
  console.log(results[0]);
});
```