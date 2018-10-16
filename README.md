# spys one bot

## usage

```javascript
const bot = require('spys-one-bot');

bot.run(
  false, // if true bot will return results
         // else bot will save the resuts ./output/{DATE}.json file
  false, // if true output file will be human readable
).then(results => {
  console.log(results);
});
```