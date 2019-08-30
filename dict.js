const CRAWLER = require("crawler");

Array.prototype.insert = function (index, item) {
  return this.splice(index, 0, item)
}

function insertStr(str, start, newStr){
  return str.substring(0, start) + newStr + str.substring(start)
}

var c = new CRAWLER({
  maxConnections: 5,
  // This will be called for each crawled page
})

function iciba(ctx) {
  var w = ctx.message.text
  c.queue({
    uri: "http://dict.youdao.com/m/search?keyfrom=dict.mresult&q=" + w,
    callback: function (error, res, done) {
      if (error) {
        console.log(error)
      } else {
        var $ = res.$
        var listtrans = $("div.content#listtrans ul")
        var netexplanations = listtrans.slice(0, 1)
        var netex = netexplanations.text().replace(/\s/g, ' ').trim()
        var eg = listtrans.slice(1).text().split("\n").map(i => {
          i = i.trim()
          const srcURLre = "/[-A-Za-z0-9+:,.;]+[A-Za-z]$/"
          i = i.replace(srcURLre, '')
          i = insertStr(i, i.indexOf('.', ' ')).trim()
          var index = i.lastIndexOf("。")
          return index >= 0 ? i.substring(0, index ) : i
        }).join('\n').trim()
        var explanations = $("div.content").slice(0, 1).html().split(' ').join('').split("\n").join('').split('<br>').map(i => {
          return (insertStr(i, i.indexOf(".") + 1, " ").trim())
        }).join('\n')
        var ex = unescape(explanations.replace(/&#x/g, '%u').replace(/;/g, '')).trim()
        //console.log(ex,eg, listtrans.slice(1).text())
        var reply = ex + "\n►网络释义\n" + netex + "\n►例句\n" + eg
        const extra = require('telegraf/extra')
        const md = extra.markdown()

        ctx.reply(reply)
      }
      done();
    }
  });
}
module.exports = {
  iciba
}