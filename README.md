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
  
  // {
  //   "proxy_address_port": "78.188.32.195",
  //   "proxy_type": "SOCKS5",
  //   "anonymity": "HIA",
  //   "country_city_region": "TR Istanbul",
  //   "hostname_org": "78.188.32.195.static.ttnet.com.tr (Turk Telekom)",
  //   "latency": 13.4,
  //   "speed": 23.33,
  //   "uptime": "63% (31) -",
  //   "check_date_gmt_04": "16-oct-2018 01:30 (2 hours ago)"
  // }
});
```