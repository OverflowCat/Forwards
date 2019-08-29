const CRAWLER = require("crawler");
Array.prototype.insert = function (index, item) {
  this.splice(index, 0, item);
  return this
};
var c = new CRAWLER({
    maxConnections : 5,
    // This will be called for each crawled page
})
function iciba(ctx){
  var w = ctx.message.text
  c.queue({
    uri: "http://dict.youdao.com/m/search?keyfrom=dict.mresult&q="  + w
    ,callback: function (error, res, done) {
        if(error){
            console.log(error)
        }else{
          var $ = res.$
          var listtrans = $("div.content#listtrans ul")
          var netexplanations = listtrans.slice(0,1)
          var netex = netexplanations.text().replace(/\s/g, ' ')
          var eg = listtrans.slice(1).text().split("\n").map(i=> {
            i.trim()
         const srcURLre = "/[-A-Za-z0-9+:,.;]+[A-Za-z]$/"
          i = i.replace(srcURLre, '')
          }).join('\n').trim()
          var explanations = $("div.content").slice(0, 1).html().split(' ').join('').split("\n").map(i=>i.trim()).join('').split("<br>").map(i=>i.trim().split(".").insert(1, " ").join("")).join('\n')
          var ex = unescape(explanations.replace(/&#x/g,'%u').replace(/;/g,'')) 
          console.log(ex,eg, listtrans.slice(1).text())
          var reply =  ex + netex + eg
          ctx.reply(reply)
        }
        done();
    }
});
}
module.exports = {iciba}
