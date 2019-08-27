const Telegraf = require('telegraf')
const gt = require("@k3rn31p4nic/google-translate-api");
const fs = require("fs")
var wordfreq = fs.readFileSync('wordfreq.txt');
const bot = new Telegraf(process.env.BOT_TOKEN)

function gtranslate(ctx){
  var o
  gt(ctx.message.text, { to: 'en' }).then(res => {
  //ctx.reply(ctx.message)
  ctx.reply(res.text)
}).catch(err => {
  ctx.reply(err)
  
});
  console.log(ctx.message)
}

bot.help((ctx) => ctx.reply('Send me some foreign text.'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.on('message', (ctx) => gtranslate(ctx))

bot.launch()  