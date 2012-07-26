$.define("server","flow, helper, status, http, more/tidy_html, ejs, mvc",
    function(Flow, Helper, status, http, tidy){
  


      
        function router2(flow , url){
            switch(url){
                case "/doc" :
                    $.walk( "app/views/doc", function(files, dirs){
                        var pages = files.filter(function(file){
                            return /\.html$/.test(file)
                        });
                        for(var i = 0; i < pages.length; i++){
                            $.log(pages[i])
                        }
                    })
                    flow.fire("static","/");
                    break;
                default:
                    return true
            }
        }

        http.createServer(function(req, res) {
            var flow = Flow()
            flow.res =  res;
            flow.req =  req;
            flow.timeoutID = setTimeout(function(){
                console.log("=============="+flow.req.url)
                flow.fire(404)
            },2500);

      //      var eee = $.path.parse(req.url, true);
           // console.log(eee.pathname+"!!!!!!!!")
      //      router.route(req.method, eee.pathname);
            flow.helper = Helper()
            //把所有操作都绑定流程对象上
            flow
            .bind("send_file", function( page ){
                //    $.log("进入send_file回调")
                clearTimeout(this.timeoutID)
                var headers =  page.headers || {}
                $.mix(headers, {
                    "Content-Type": page.mine,
                    "mass-mime" :"page.mine"
                });
                
                this.res.writeHead(page.code, headers);
                this.res.write(page.data);
                this.res.end();
            })
            .bind("static", function( url ){
                //  $.log("进入static回调");
                //去掉#？等杂质，如果是符合如下后缀后，则进行静态资源缓存
                if( /\.(css|js|png|jpg|gif|ico)$/.test( url.replace(/[?#].*/, '') ) ){
                    var mine = RegExp.$1
                    url = url.replace(/[?#].*/, '');
                    var cache = $.staticCache[ url ];
                    if( cache ){
                        var lm
                        if(( lm = cache.headers && cache.headers["Last-Modified"] )){
                            if(lm === this.req.headers["if-modified-since"]){
                                res.writeHead(304, "Not Modified");
                                res.end();
                                return;
                            }
                        }
                        this.fire("send_file", cache);
                    }else{
                        //从硬盘中读取数据
                        var statics =  $.path.join("app/public/",url);
                        $.readFile(statics, function(err, data){
                            if(err){
                                this.fire(404)
                            }else{
                                //node.js向前端发送Last-Modified头部时，不要使用 new Date+""，而要用new Date().toGMTString()，因为前者可能出现中文乱码
                                cache = {
                                    code: 200,
                                    data: data,
                                    mine: mimes[ mine ],
                                    headers: {
                                        "Last-Modified":new Date().toGMTString()
                                    }
                                }
                                $.staticCache[ url ] = cache;
                                this.fire("send_file", cache)
                            }
                        }.bind(this));
                    }
                }else{
                    this.fire("get_page", url);
                }
            })
            .bind(404, function( ){
                var text = $.readFileSync( "app/views/error.html", 'utf-8')//读取内容
                var fn = $.ejs(text);
                var data = $.mix(
                    this.helper[0],
                    status["404"], {
                        code: 404
                    });
                var html = fn( data, this.helper[1]);
                data.partial = html;
                var layout_url = $.path.join("app","views/layout", data.layout );
                this.fire("get_layout", layout_url, 404 );
            })

           
            .bind("get_layout", function( layout_url, url ){
                //  $.log("进入get_layout回调")
                var fn = $.viewsCache[ layout_url ]
                if( fn ){
                    var html = fn( this.helper[0], this.helper[1] );
                    this.fire('cache_page', html, url);
                }else{
                    $.readFile( layout_url,  'utf-8', function(err, text){
                        if(err){
                            this.fire( 404 )
                        }else{
                            var fn = $.ejs( text );
                            if(url){//如果指定了第二个参数才存入缓存系统
                                $.viewsCache[ layout_url ] = fn
                                this.fire("get_layout", layout_url, url)
                            }else{
                                var html = fn( this.helper[0] );
                                this.fire('cache_page', html, url)
                            }
                           
                        }
                    }.bind(this))
                }
            });
            if(router2(flow, req.url)){
                flow.fire("static", req.url)
            }

           
       

        }).listen( $.configs.port );
    //今天的任务支持CSS JS 图片
    });

//http://www.w3.org/html/ig/zh/wiki/Contributions#bugs
//http://yiminghe.iteye.com/blog/618432

//doTaskList = function(dataList, doAsync, callback){
//    dataList = dataList.slice();
//    var ret = [];
//    var next = function(){
//        if(dataList.length < 1)
//            return callback(null, ret)
//        var d = dataList.shift();
//        try{
//            doAsync(d, function(err,data){
//                if(err)
//                    return callback(err);
//                ret.push(data);
//                next();
//            })
//        }catch(err){
//            return callback(err)
//        }
//    }
//    next();
//}

