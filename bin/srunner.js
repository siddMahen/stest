#!/usr/bin/env node

var	path = require("path"),
	fs = require("fs"),
	cp = require("child_process"),
	color = require("ansi-color").set,
	argv = require("optimist")
	.usage("Usage: $0 [-s] -r [regex]")
	.demand(["r"])
	.argv;

/* srunner args
 *
 * -r: regexp of files to test
 * -s: silent
 *
 */

var silent = argv.s ? argv.s : false;
var r = path.join(process.cwd(), argv.r);

var info = function(buffer, colr){
	if(!silent){
		var string = buffer.toString();
		process.stdout.write(color(string, colr));
	}
}

var dir = path.dirname(r);
var filexp = new RegExp(path.basename(r));

if(!path.existsSync(dir)){ 
	info("This directory does not exist\n", "red");
	process.exit();
}

var files = fs.readdirSync(dir);
var matchExp = function(file){ return filexp.test(file) ? true : false; };
var filtered = files.filter(matchExp);

if(!filtered.length){
	info("No tests found to run\n", "red");
	process.exit();
}

filtered.forEach(function(file){
	cp.exec("node "+dir+"/"+file, function(err, stdout, stderr){
		if(err) throw err;
		info(stdout);
	});
});
