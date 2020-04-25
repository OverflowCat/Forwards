const CRAWLER = require("crawler");
const fetch = require("node-fetch");
const dotkanji = /(\.)([\u3400-\u4DB5\u4E00-\u9FEA\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29\u{20000}-\u{2A6D6}\u{2A700}-\u{2B734}\u{2B740}-\u{2B81D}\u{2B820}-\u{2CEA1}\u{2CEB0}-\u{2EBE0}])/gu; 

//function delEnding(t, char){
// if (t.slice(-char.length, ) == char){
//   return t.slice(0, t.length - char.length)
//  }
//}
function delEnding(str, ending) {
  var l = ending.length;
  if (str.substr(-l) == ending) return str.substring(0, str.length - l);
  return str;
}

Array.prototype.insert = function(index, item) {
  return this.splice(index, 0, item);
};

Array.prototype.max = function() {
  var max = this[0];
  for (var i = 1; i < this.length; i++) if (this[i] > max) max = this[i];
  return max;
};

function insertStr(str, start, newStr) {
  return str.substring(0, start) + newStr + str.substring(start);
}

var c = new CRAWLER({
  maxConnections: 5
  // This will be called for each crawled page
});

function iciba(ctx) {
  var w = ctx.message.text;
  c.queue({
    uri: "http://dict.youdao.com/m/search?keyfrom=dict.mresult&q=" + w,
    callback: function(error, res, done) {
      if (error) {
        console.log(error);
        return ctx.reply(error);
      } else {
        try {
          var $ = res.$;
          var listtrans = $("div.content#listtrans ul");
          var netexplanations = listtrans.slice(0, 1);
          var netex = netexplanations
            .text()
            .replace(/\s/g, " ")
            .trim();
          var eg = listtrans
            .slice(1)
            .text()
            .trim()
            .split("\n")
            .map(i => {
              i = i.trim();
              const srcURLre = /[^a-zA-Z0-9-_.](https?:\/\/)?[a-zA-Z0-9._-]+\.[a-zA-Z]{2,}$/gmu;
              var match = i.match(srcURLre);
              if (match) {
                match = match[0];
              } else {
                var match = "";
              }
              i = i.replace(srcURLre, "") + match.substring(0, 1);
              var dot = i.indexOf(".");
              if (dot >= 1) i = insertStr(i, i.indexOf(".") + 1, " ").trim();
              return i;
            })
            .join("\n")
            .trim();
          var explanations = $("div.content")
            .slice(0, 1)
            .html()
            .split(" ")
            .join("")
            .split("\n")
            .join("")
            .split("<br>")
            .map(i => {
              return insertStr(i, i.indexOf(".") + 1, " ").trim();
            })
            .join("\n");
          var ex = unescape(
            explanations.replace(/&#x/g, "%u").replace(/;/g, "")
          ).trim();
          if (ex.indexOf("<ul>") != -1) ex = "";
          //console.log(ex,eg)
          var reply =
            "<code>" + ex + "</code>" + "\n\n<b>►网络释义</b>\n" + netex;
          if (eg) reply += "<b>\n\n►例句\n</b>" + eg;
          reply = reply.replace("“", "「");
          reply = reply.replace("”", "」");
          reply = reply.replace(dotkanji, "$1 $2")
          yandex(w, reply2 =>
            ctx.replyWithHTML(reply + (reply2 == ""? "" : ("\n\n►近义词 @Yandex\n" + reply2)))
          );
        } catch (err) {
          return ctx.reply(err);
        }
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
      } else {
        resolve(res);
      }
      done();
    };
    c.queue(options);
  });
}

function asyncYoudao(w, callback) {
  crawlerPromise({
    uri: "http://dict.youdao.com/m/search?keyfrom=dict.mresult&q=" + w
  })
    .then(res => {
      //doStuff(res)
      try {
        var $ = res.$;
        var listtrans = $("div.content#listtrans ul");
        var netexplanations = listtrans.slice(0, 1);
        var netex = netexplanations
          .text()
          .replace(/\s/g, " ")
          .trim();
        var eg = listtrans
          .slice(1)
          .text()
          .trim()
          .split("\n")
          .map(i => {
            i = i.trim();
            const srcURLre = /[^a-zA-Z0-9-_.](https?:\/\/)?[a-zA-Z0-9._-]+\.[a-zA-Z]{2,}$/gmu;
            var match = i.match(srcURLre);
            if (match) {
              match = match[0];
            } else {
              var match = "";
            }
            i = i.replace(srcURLre, "") + match.substring(0, 1);
            var dot = i.indexOf(".");
            if (dot >= 1) i = insertStr(i, i.indexOf(".") + 1, " ").trim();
            return i;
          })
          .join("\n")
          .trim();
        var explanations = $("div.content")
          .slice(0, 1)
          .html()
          .split(" ")
          .join("")
          .split("\n")
          .join("")
          .split("<br>")
          .map(i => {
            return insertStr(i, i.indexOf(".") + 1, " ").trim();
          })
          .join("\n");
        var ex = unescape(
          explanations.replace(/&#x/g, "%u").replace(/;/g, "")
        ).trim();
        if (ex.indexOf("<ul>") != -1) ex = "";
        var reply =
          "<code>" + ex + "</code>" + "\n\n<b>►网络释义</b>\n" + netex;
        if (eg) reply += "<b>\n\n►例句\n</b>" + eg;
        return callback(reply);
      } catch (err) {
        return callback(err);
      }
    })
    .catch(error => {
      console.log(error);
    });
}

var ox_enabled = false;
if (ox_enabled) {
  var oxford = require("oxford-dictionary-api");
  var app_id = process.env.OX_ID;
  var app_key = process.env.OX_KEY;
  var oxdict = new oxford(app_id, app_key);
  function ox(word, callback) {
    oxdict.find(word, function(error, data) {
      if (error) return console.log(error);
      callback(data);
    });
  }
}

function yandex(i, callback) {
  //fetch Yandex Dict
  var yandexAPIkey = process.env.YANDEX;
  var lang = "en-en";
  var res = fetch(
    "https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=" +
      yandexAPIkey +
      "&lang=" +
      lang +
      "&text=" +
      i
  )
    .then(rrr => rrr.json())
    .then(res => {
      var yandex = res;
      if (yandex == '{"head":{},"def":[]}')
        return "No definition found in the dictionary.";
      //var yandex = '{"head":{},"def":[{"text":"do","pos":"verb","ts":"duː","fl":"did, done","tr":[{"text":"execute","pos":"verb","syn":[{"text":"achieve","pos":"verb"},{"text":"fulfil","pos":"verb"},{"text":"accomplish","pos":"verb"},{"text":"carry","pos":"verb"},{"text":"perform","pos":"verb"},{"text":"fulfill","pos":"verb"},{"text":"effectuate","pos":"verb"}]},{"text":"doeth","pos":"noun","syn":[{"text":"dress","pos":"noun"}]},{"text":"commit","pos":"verb","syn":[{"text":"perpetrate","pos":"verb"},{"text":"do away","pos":"verb"}]},{"text":"act","pos":"noun","syn":[{"text":"function","pos":"noun"},{"text":"fiddle","pos":"noun"}]},{"text":"engage","pos":"verb","syn":[{"text":"engage in","pos":"verb"},{"text":"go in","pos":"verb"},{"text":"draw","pos":"verb"},{"text":"work over","pos":"verb"}]},{"text":"will make","pos":"verb","syn":[{"text":"pass","pos":"verb"},{"text":"proceed","pos":"verb"},{"text":"come down","pos":"verb"},{"text":"befall","pos":"verb"}]},{"text":"deal","pos":"noun","syn":[{"text":"work","pos":"noun"},{"text":"affair","pos":"noun"},{"text":"duty","pos":"noun"},{"text":"event","pos":"noun"}]},{"text":"create","pos":"verb","syn":[{"text":"produce","pos":"verb"},{"text":"generate","pos":"verb"},{"text":"beget","pos":"verb"}]},{"text":"play","pos":"verb","syn":[{"text":"behave","pos":"verb"},{"text":"serve","pos":"verb"}]},{"text":"arrange","pos":"verb","syn":[{"text":"set","pos":"verb"},{"text":"make out","pos":"verb"}]},{"text":"exercise","pos":"noun","syn":[{"text":"charge","pos":"noun"},{"text":"commitment","pos":"noun"}]},{"text":"practise","pos":"verb"},{"text":"occur","pos":"verb","syn":[{"text":"come about","pos":"verb"},{"text":"transpire","pos":"verb"}]},{"text":"need","pos":"noun","syn":[{"text":"order","pos":"noun"},{"text":"command","pos":"noun"}]},{"text":"cope","pos":"verb","syn":[{"text":"manage","pos":"verb"},{"text":"get by","pos":"verb"}]},{"text":"cause","pos":"verb","syn":[{"text":"prosecute","pos":"verb"},{"text":"invoke","pos":"verb"},{"text":"bring on","pos":"verb"}]},{"text":"progress","pos":"noun","syn":[{"text":"advance","pos":"noun"}]},{"text":"get on","pos":"verb"},{"text":"cook","pos":"verb","syn":[{"text":"cut","pos":"verb"},{"text":"put through","pos":"verb"}]},{"text":"stick","pos":"noun","syn":[{"text":"whip","pos":"noun"}]},{"text":"practice","pos":"noun"},{"text":"enrich","pos":"verb","syn":[{"text":"beautify","pos":"verb"}]},{"text":"portray","pos":"verb","syn":[{"text":"impersonate","pos":"verb"},{"text":"imitate","pos":"verb"}]},{"text":"answer","pos":"noun","syn":[{"text":"curry","pos":"noun"}]},{"text":"result","pos":"noun"},{"text":"bother","pos":"verb"},{"text":"pretty","pos":"noun"},{"text":"hap","pos":"noun"}]}]}';
      //'{"head":{},"def":[{"text":"telegram","pos":"noun","ts":"ˈtelɪgræm","tr":[{"text":"cablegram","pos":"noun","syn":[{"text":"wire","pos":"noun"},{"text":"cable","pos":"noun"}]},{"text":"despatch","pos":"noun","syn":[{"text":"dispatch","pos":"noun"}]}]}]}';
      var j = yandex; //JSON.parse(yandex);
      var o = "";
      j.def.forEach(function(def) {
        o +=
          "<b>" +
          def.text +
          "</b>  <i>" +
          def.pos +
          ".</i>  " +
          "📢 /" +
          def.ts +
          "/     ";
        if (def.hasOwnProperty("fl")) o += " (" + def.fl + ") ";
        var i = 1;
        def.tr.forEach(function(meaning) {
          o += "&#10;" + i++ + ". <b>" + meaning.text + "</b>";

          //DEAL WITH SYN
          //Not all meanings contain a "syn".
          if (meaning.hasOwnProperty("syn")) {
            o += ": ";

            meaning.syn.forEach(function(syn) {
              o += syn.text + ", ";
            });
          }
          o = delEnding(o, ", ");
          //SYN END
        });
      });
      
      callback(o);
    });
}

module.exports = {
  iciba,
  asyncYoudao,
  yandex
};
