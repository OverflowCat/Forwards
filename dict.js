const CRAWLER = require("crawler");

Array.prototype.insert = function (index, item) {
  return this.splice(index, 0, item)
}

Array.prototype.max = function () {
  var max = this[0];
  for (var i = 1; i < this.length; i++)
    if (this[i] > max) max = this[i]
  return max
}

function insertStr(str, start, newStr) {
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
        return ctx.reply(error)
      }
      else {
        try {
        var $ = res.$
        var listtrans = $("div.content#listtrans ul")
        var netexplanations = listtrans.slice(0, 1)
        var netex = netexplanations.text().replace(/\s/g, ' ').trim()
        var eg = listtrans.slice(1).text().trim().split("\n").map(i => {
          i = i.trim()
          const srcURLre = /[^a-zA-Z0-9-_.](https?:\/\/)?[a-zA-Z0-9._-]+\.[a-zA-Z]{2,}$/gmu
          var match = i.match(srcURLre)
          if (match) {
            match = match[0]
          }
          else {
            var match = ""
          }
          i = i.replace(srcURLre, '') + match.substring(0, 1)
          var dot = i.indexOf('.')
          if (dot >= 1) i = insertStr(i, i.indexOf('.') + 1, ' ').trim()
          return i
        }).join('\n').trim()
        var explanations = $("div.content").slice(0, 1).html().split(' ').join('').split("\n").join('').split('<br>').map(i => {
          return (insertStr(i, i.indexOf(".") + 1, " ").trim())
        }).join('\n')
        var ex = unescape(explanations.replace(/&#x/g, '%u').replace(/;/g, '')).trim()
        if (ex.indexOf("<ul>") != -1) ex = ''
        //console.log(ex,eg)
        var reply = "<code>" + ex + "</code>" + "\n\n<b>►网络释义</b>\n" + netex
        if (eg) reply += "<b>\n\n►例句\n</b>" + eg
        ctx.replyWithHTML(reply)
        }catch(err){return ctx.reply(err)}
      }
      
      done();
    }
  });
}


function crawlerPromise(options) {
  return new Promise((resolve, reject) => {
    options.callback = (err, res, done) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(res);
      }
      done();
    }
    c.queue(options);
  });
}

function asyncYoudao(w, callback) {
  crawlerPromise({
      uri: "http://dict.youdao.com/m/search?keyfrom=dict.mresult&q=" + w
    })
    .then((res) => {
      //doStuff(res)
      try{
      var $ = res.$
      var listtrans = $("div.content#listtrans ul")
      var netexplanations = listtrans.slice(0, 1)
      var netex = netexplanations.text().replace(/\s/g, ' ').trim()
      var eg = listtrans.slice(1).text().trim().split("\n").map(i => {
        i = i.trim()
        const srcURLre = /[^a-zA-Z0-9-_.](https?:\/\/)?[a-zA-Z0-9._-]+\.[a-zA-Z]{2,}$/gmu
        var match = i.match(srcURLre)
        if (match) {
          match = match[0]
        }
        else {
          var match = ""
        }
        i = i.replace(srcURLre, '') + match.substring(0, 1)
        var dot = i.indexOf('.')
        if (dot >= 1) i = insertStr(i, i.indexOf('.') + 1, ' ').trim()
        return i
      }).join('\n').trim()
      var explanations = $("div.content").slice(0, 1).html().split(' ').join('').split("\n").join('').split('<br>').map(i => {
        return (insertStr(i, i.indexOf(".") + 1, " ").trim())
      }).join('\n')
      var ex = unescape(explanations.replace(/&#x/g, '%u').replace(/;/g, '')).trim()
      if (ex.indexOf("<ul>") != -1) ex = ''
      var reply = "<code>" + ex + "</code>" + "\n\n<b>►网络释义</b>\n" + netex
      if (eg) reply += "<b>\n\n►例句\n</b>" + eg
      //ctx.replyWithHTML(reply)
      return callback(reply)
      }catch(err) {return callback(err)}
    })
    .catch((error) => {
      console.log(error)
    });
}


var oxford = require("oxford-dictionary-api");
var app_id = process.env.OX_ID;
var app_key = process.env.OX_KEY;
var oxdict = new oxford(app_id, app_key);
function ox(word, callback){
  oxdict.find(word, function(error,data){
  if(error) return console.log(error); 
  callback(data); 
});
}


module.exports = {
  iciba,
  asyncYoudao,
  ox
}