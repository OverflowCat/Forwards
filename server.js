const Telegraf = require('telegraf')
const gt = require("@k3rn31p4nic/google-translate-api");
var async = require('async');
const fs = require("fs")
const d = require("./dict")
//var wordfreq = fs.readFileSync('wordfreq.txt');
const bot = new Telegraf(process.env.BOT_TOKEN)
const nedb = require('nedb');

const db = new nedb({
  filename: './log.db',
  autoload: true
});
var doc = {
  today: new Date(),
  r: "start"
};
db.findOne({
  r: "start"
}, function (err, docs) {
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
function gtranslate(ctx, lang) {
  var repeat = false
  if (!lang) {
    var lang = 'en'
    var repeat = true
  }
  var o
  gt(ctx.message.text, {
    to: lang
  }).then(res => {
    //ctx.reply(ctx.message)
    if (res.text == ctx.message.text && repeat) return gtranslate(ctx, "zh-CN")
    ctx.reply(res.text)
  }).catch(err => {
    return ctx.reply(err)
     
  });
  console.log(ctx.message)
}

bot.on('inline_query',
  async({
    inlineQuery,
    answerInlineQuery
  }) => {
    const q = inlineQuery.query
    console.log(q)
    //if (q.length <= 2) return; //Typed content is obviously shorter than a normal WORD
    async.parallel({
      youdao: function (done) {
        if (!(/^[a-zA-Z]+$/).test(q)) {
          done(null, undefined)
        }
        else {
          d.asyncYoudao(q, (result) => {
            const o = {
              type: "article",
              id: Math.random(),
              title: "Youdao Dictionary",
              description: result.replace(/<[^>]+>/g, '').replace("\n", " "),
              input_message_content: {
                message_text: result,
                parse_mode: "HTML"
              }
            }
            done(null, o)

          })
        }

      },
      
      oxford: function (done){
        done();
        if (false){
        d.ox(q, result => {
          const o = {
              type: "article",
              id: Math.random(),
              title: "Oxford Dictionary",
              description: result,
              input_message_content: {
                message_text: result
              }
          }
          done(null, o)
        })
        }
      },
      toEN: function (done) {
        if (false){
        try {
          gt(q, {
            to: "en"
          }).then(res => {
            const o = {
              type: "article",
              id: Math.random(),
              title: "Translate to English",
              description: res.text,
              input_message_content: {
                message_text: res.text
              }
            }
            done(null, o)
          })
        }
        catch (err) {}
        }done(null, undefined)
      },
      toCN: function (done) {
        if (false){
        try {
          gt(q, {
            to: "zh-CN"
          }).then(res => {
            const o = {
              type: "article",
              id: Math.random(),
              title: "Translate to Simplified Chinese",
              description: res.text,
              input_message_content: {
                message_text: res.text
              }
            }
            done(null, o)
          })
        }
        catch (err) {

        }
        }done(null, undefined)
      }
    }, function (error, r) {

      {
        var results = [r.youdao] //r.oxford] //, r.toEN, r.toCN]
        results = results.filter(function (el) {
          return el != undefined;
        });
        console.log(results)
        return answerInlineQuery(results)
      }

    });
  })

bot.help((ctx) => ctx.reply('Send me some foreign text.'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))

bot.on('text', (ctx) => {
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
  if (t == "/start") {
    return ctx.replyWithHTML('欢迎使用 @OverflowCat 的词典 bot。词典数据来源<b>有道</b>。输入单词即可查询；输入整句可以进行翻译。\n<a href="github.com/OverflowCat/Forwords/">Github repo</a>\n如果你想要查询近义词，可以使用 Forword Bot ʟᴇɢᴀᴄʏ @forwordybot')
  }

  (/^[a-zA-Z]+$/).test(t) ? d.iciba(ctx) : gtranslate(ctx)
})
///^[a-zA-Z]+$/.test(t) 
//1bot.command("start", (ctx) => ctx.reply("欢迎使用 @OverflowCat 的词典 bot。词典数据来源有道。输入单词即可查询；输入整句可以进行翻译。\nGitHub repo github.com/OverflowCat/Forwords\n如果你想要查询近义词，可以使用Forword Bot ʟᴇɢᴀᴄʏ @forwordybot"))
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

//console.log(d.asyncYoudao("ingress"))