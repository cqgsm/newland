$.define("configs", function(){
   // $.log("已加载用户配置模块");
    return $.configs = {
        //栏截器"favicon",
        //"mime","location","static","postData","methodOverride","json","render","matcher"
        intercepters: [],
        http_method: "_method",//用于模拟PUT,DELETE方法
        environments: "development",
        port: 8888,
        write_page: false,
        third_modules: "spec,random,menu,tab",//你可以用字符串形式表示，也可以用数组形式表示
        timeout: 4000,
        maxObjects: 128,
        maxLength: 1024 * 256,
        maxAge: 60*60*24*365,
        db:{
            development:{
                driver:   "mongoose",
                host:     "localhost",
                database: "cms-dev"
            },
            test: {
                driver:   "mongoose" ,
                host:     "localhost",
                database: "cms-test"
            } ,
            staging:{
                driver:   "mongoose",
                host:     "localhost",
                database: "cms-staging"
            },
            production:{
                driver:   "mongoose" ,
                host:     "localhost" ,
                database: "cms-production"
            }
        }
    }
})