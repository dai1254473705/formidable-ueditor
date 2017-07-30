'use static';
var  express      = require('express');
var  request      = require('request-json');
var  app          = express();
var  path         = require('path');
var  morgan = require('morgan');
var  logger = require("./logger");
var  bodyParser = require('body-parser');
var  ejs          = require('ejs');
var ueditor = require('./routes/formidable');

app.engine('html', ejs.__express);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));

//logger
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

//首页 
var  index  = require('./routes/index');

//首页
app.use('/',index);
app.use("/ueditor/ue",function(req, res, next) {
	console.log("发起请求");
	if(req.query.action === 'uploadimage'){
		console.log("发起请求1");
	    // 这里你可以获得上传图片的信息
	    var foo = req.ueditor;
	    console.log(foo); // exp.png
	    console.log(foo); // 7bit
	
	    // 下面填写你要把图片保存到的路径 （ 以 path.join(__dirname, 'public') 作为根路径）
	    var img_url = path.join(__dirname,'/cache/');
	// 		res.ue_up(img_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
	   		ueditor.formid(img_url);
	   		res.json();
	}
	// 客户端发起其它请求
   	else {
		console.log("发起请求3");
	    res.setHeader('Content-Type', 'application/json');
	    // 这里填写 ueditor.config.json 这个文件的路径
	    res.redirect('/ueditor/nodejs/config.json')
	}
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
	logger.error(err);
	// render the error page
	res.status(err.status || 500);
	res.render('error', {
		"title":err.status,
		"msg": '服务异常'
	});
});
app.listen(3010, "0.0.0.0", function() {
	logger.info('http://127.0.0.1:3010');
});