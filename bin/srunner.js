#!/usr/bin/env node

var	path = require("path"),
	fs = require("fs"),
	cp = require("child_process"),
	argv  = require("optimist").argv;

// options
var r = path.join(process.cwd(), argv.r);
var silent = argv.s ? argv.s : false;

var info = function(buffer){
	var string = buffer.toString();
	if(!silent) console.log(string); 
}

var dir = path.dirname(r);
var filexp = new RegExp(path.basename(r));

if(!path.existsSync(dir)){ 
	info("This directory does not exist");
	process.exit();
}

var files = fs.readdirSync(dir);

if(!files.length){
	info("No tests found to run");
	process.exit();
}

files.forEach(function(file){
	
	if(filexp.test(file)){
		
		cp.exec("node "+dir+"/"+file, function(err, stdout, stderr){
			if(err) throw err;
			info(stdout);
		});
	}	
});
