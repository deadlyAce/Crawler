
var superagent = require('superagent');    //引入我们安装好的模块
var request = require("request");
var cheerio = require('cheerio');
var fs = require('fs');                   //引入文件读取模块
var async = require("async");  //异步流程控制
var eventproxy = require('eventproxy');

var pageUrls = []; //用于存放所有的链接地址
var imgArr = []; //用于存放真正的图片地址
var totle=0;

for(var i=2;i<9;i++){
  pageUrls.push('http://jandan.net/ooxx/page-'+i+'#comments');
  fs.mkdir('./images/'+i, function (err) {
    if(err) {
      console.log(err);
    }
  })
}

var download = function(url, callback){
  request.head(url, function(err, res, body){
    console.log(url);
    var item=url.split('-')
    //先对流操作进行判断，如果出现错误就显示，但是不抛出异常
    request(item[0]).on('error', function(e){callback(new Error('something bad happened'));}).pipe(fs.createWriteStream('./images/' +item[1] + "/" + item[0].split('/')[4])).on('close', callback);
  });
};


function start(){

  var curCount = 0;
  function mainFn(url,callback){
    var pages=url.replace(/[^0-9]/g,"");
    //延迟毫秒数
    var delay = parseInt((Math.random() * 60000000) % 1000, 10);
    curCount++;
    console.log('现在的并发数是', curCount, '，正在抓取的是', url, '，耗时' + delay + '毫秒'); 
    superagent.get(url)    
    .end(function(err,docs){
          // 常规的错误处理
          if (err) {
            console.log(err);
            return;
          }
          var $ = cheerio.load(docs.text);    //docs.text就是爬取到的数据，把它经过cheerio转换

          $('.view_img_link').each(function(index,element){
            var $el = $(element).attr('href');
            imgArr.push('http:'+$el+'-'+pages);   //将图片的链接push到数组里
          })
          for(var i=0;i<imgArr.length;i++){
            download(imgArr[i], function(){
              console.log('done');
            });

          }
      });  //superagent结束

    setTimeout(function() {
      curCount--;
      callback(null,url +'Call back content');
    }, delay);
  }


    async.mapLimit(pageUrls, 2 ,function (url, callback) {  // mapLimit(arr, limit, iterator, callback) 控制并发连接数的接口
      mainFn(url, callback);
    }, function (err,result) {
      console.log(result);
    });
  }

  start();

