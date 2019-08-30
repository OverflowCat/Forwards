const Telegraf = require('telegraf')
const gt = require("@k3rn31p4nic/google-translate-api");
const fs = require("fs")
const d = require("./dict")
//var wordfreq = fs.readFileSync('wordfreq.txt');
const bot = new Telegraf(process.env.BOT_TOKEN)
const nedb = require('nedb');

// 实例化连接对象（不带参数默认为内存数据库）
const db = new nedb({
  filename: './log.db',
  autoload: true
});
 var doc = { today: new Date(),
            r: "start"
               };
db.find({ r: "start" }, function (err, docs) {
  // If no document is found, docs is equal to []
  console.log(docs, "found!")
});
db.insert(doc, function (err, newDoc) {   
  console.log(newDoc)
});
// 插入单项
//db.insert({
//  name: 'tom'
//}, (err, ret) => {});
//d.iciba("ingress")
function gtranslate(ctx, lang){
  var repeat = false
  if(!lang) {
    var lang = 'en'
    var repeat = true
    }
  var o
  gt(ctx.message.text, { to: lang }).then(res => {
  //ctx.reply(ctx.message)
  if (res.text == ctx.message.text && repeat) return gtranslate(ctx, "zh-CN")
  ctx.reply(res.text)
}).catch(err => {
  ctx.reply(err)
  
});
  console.log(ctx.message)
}

bot.help((ctx) => ctx.reply('Send me some foreign text.'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.on('message', (ctx) => {
  db.update({
    uid: ctx.from
  }, {
    $push: {
      msg: ctx.message
    } 
  }, {}, function () {
    i => console.log(i)
});
  var t = ctx.message.text;
  /^[a-zA-Z]+$/.test(t) ? d.iciba(ctx) : gtranslate(ctx)
})
///^[a-zA-Z]+$/.test(t) 
bot.command("start", (ctx) => ctx.reply(""))
bot.launch()  

const http = require('http');
const express = require('express');
const app = express();
app.get("/", (request, response) => {
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);