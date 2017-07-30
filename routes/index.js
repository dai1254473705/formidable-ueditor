var express = require('express');
var router = express.Router();
var logger = require("../logger");
var request = require('request-json');
var bodyParser = require('body-parser');
var ueditor = require('./ueditor');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({
	extended: true
});
var client = request.createClient('url');//服务器地址
var formidable = require('formidable');
var fs = require("fs");
var path = require("path");
var app = express();
var AVATAR_UPLOAD_FOLDER = '/cache/';
//创建路径
fs.existsSync("public/cache/") || fs.mkdirSync("public/cache/");

//首页
router.get('/', urlencodedParser, function(req, res, next) {
	res.render('index', {
		title: "富文本"
	});
});

//上传头像
router.post('/uploadFile',urlencodedParser, function(req, res) {
	var form = new formidable.IncomingForm();
	form.encoding = 'utf-8'; //设置编辑
	form.uploadDir = 'public' + AVATAR_UPLOAD_FOLDER; //设置上传目录
	form.keepExtensions = true; //保留后缀
	form.maxFieldsSize = 10 * 1024 * 1024; //文件大小
	form.multiples = true; //支持多个文件，转成数组
	form.parse(req, function(err, fields, files) {
//			console.log('original files=====>', files);
			if(err) {
				var rs = {
					"resCode": 'FAIL',
					"message": '网络异常',
					"fileName": ''
				};
				res.json(rs);
				return;
			}
			console.log("file type ==>", files.file.type);

			var extName = ''; //后缀名
			switch(files.file.type) {
				case 'image/jpg':
					extName = 'jpg';
					break;
				case 'image/jpeg':
					extName = 'jpg';
					break;
				case 'image/png':
					extName = 'png';
					break;
				case 'image/x-png':
					extName = 'png';
					break;
				case 'image/x-png':
					extName = 'png';
					break;
			}
			if(extName.length == 0) {
				res.locals.error = '只支持png和jpg格式图片';
				var rs = {
					"resCode": 'FAIL',
					"message": '只支持png和jpg格式图片',
					"fileName": ''
				};
				res.json(rs);
				return;
			}
			var avatarName = Date.now() + '_' + Math.random() + '.' + extName;
			var newPath = form.uploadDir + avatarName;
			logger.info("临时路径 newPath===>",newPath);
			logger.info("文件源路径files.file.path===>",files.file.path);
			fs.renameSync(files.file.path, newPath); //重命名
			res.locals.success = '上传成功';
			var rs = {
				"resCode": 'SUCCESS',
				"message": '',
				"fileName": '/avatar/' + avatarName
			};
			var datas = {"token":getUserToken(req)};
			logger.info("调用前台上传文件接口==>api/0/file/upload");
			logger.info("文件名===>",form.uploadDir+'/'+avatarName);
			logger.info("request参数",datas);
			client.sendFile('api/0/file/upload',form.uploadDir+'/'+avatarName,datas,function(err, request, body) {
			  if (err) {
			  	logger.info(err)
			  }
			  var response = JSON.parse(body);
			  console.log("上传阿里云返回值",body);
			  if(response==undefined&&response.error!=undefined){
			  	 cookieUtil.getToken.bodyUndefind(res);
			  }else  if(response.retCode=='SUCCESS'){
			  	req.cookies.mbr_inf_m.avatar = response.data;
				res.cookie('mbr_inf_m',req.cookies.mbr_inf_m, {
					maxAge: 60 * 60 * 1000
				});
			  	logger.info("图片上传成功，开始删除缓存图片");
		  	    fs.unlink(form.uploadDir+'/'+avatarName,function(){
					console.log("缓存图片"+form.uploadDir+'/'+avatarName+"已被删除");
				});
				res.json(response);
			  }else{
			  	logger.info("上传头像失败，开始删除缓存图片");
			  	fs.unlink(form.uploadDir+'/'+avatarName,function(){
					console.log("缓存图片"+form.uploadDir+'/'+avatarName+"已被删除");
				});
			  	res.json(response);
			  };
			  
			});
	});//formdata over
	
	});


//修改紧急联系人
router.all('/urgency', urlencodedParser, function(req, res, next) {
	var obj = {
		"token": getUserToken(req),
		"urgencyName": req.query.urgency_name, //紧急联系人
		"urgencyRelation": req.query.urgency_relation, //和紧急联系人之间的关系
		"urgencyCell": req.query.urgency_cell, //紧急连接人手机号
	};
	logger.info("调用接口api/0/mbr/urgency");
	logger.info("request参数",obj);
	var url = 'api/0/mbr/urgency';
	client.post(url, obj, function(err, resoponse, body) {
		console.log("修改紧急联系人==>", body);
		if(undefined == body || body.error !== undefined) {
			//body==undefined 前端页面提示服务异常
			cookieUtil.getToken.bodyUndefind(res);
		} else if('SUCCESS' == body.retCode) {
			//更新紧急联系人状态
			req.cookies.mbr_inf_m.isUrgency = true;
			res.cookie('mbr_inf_m',req.cookies.mbr_inf_m, {
				maxAge: 60 * 60 * 1000
			});
			res.json(body);
		} else if('FAIL' == body.retCode) {
			//登录信息过期清除cookie,返回“NOTOKEN”前端页面要提示重新登录,否则res.json(body);
			cookieUtil.getToken.clearCook(res, body);
		} else if('ERROR' == body.retCode) {
			//error处理,TODO
			cookieUtil.getToken.getError(res, body);
		} else {
			//默认处理
			cookieUtil.getToken.getDefault(res, body);
		}
	})
}); 
module.exports = router;