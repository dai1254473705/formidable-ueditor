'use static';
var winston   = require('winston');
var path      = require('path');
var fs        =  require('fs');
var getTimes  =  require('silly-datetime');
var level,filePath,logDir;
var dates=getTimes.format(new Date(), 'YYYYMMDD');
var logDir = 'logs';
fs.existsSync(logDir) || fs.mkdirSync(logDir);

//判断是否存在
fs.existsSync(logDir+"/error/") || fs.mkdirSync(logDir+"/error/");
fs.existsSync(logDir+"/debug/") || fs.mkdirSync(logDir+"/debug/");
fs.existsSync(logDir+"/info/")  || fs.mkdirSync(logDir+"/info/");
fs.existsSync(logDir+"/warn/")  || fs.mkdirSync(logDir+"/warn/");

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            level: 'debug'
        }),
   		new (winston.transports.File)({
	      name: 'error-file',
	      filename: path.join(logDir, '/error/'+dates+'-error.log'),
	      level: 'error'
	    }),
        new (winston.transports.File)({
	      name: 'info-file',
	      filename: path.join(logDir, '/info/'+dates+'-info.log'),
	      level: 'info'
	    }),
	    new (winston.transports.File)({
	    	name: 'warn-file',
	      filename: path.join(logDir, '/warn/'+dates+'-warn.log'),
	      level: 'warn'
	    })
    ]
});

module.exports = logger;


