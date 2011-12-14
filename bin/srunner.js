#!/usr/bin/env node

var	path = require("path"),
	fs = require("fs"),
	cp = require("child_process"),
	color = require("colors"),
	optimist = require("optimist"),
	argv = optimist
	.usage("Usage: $0 [-s] [-c] [modules] -r [regexp]")
	.options("s",{
		description: "supress output",
		alias:	"silent",
		boolean: true
	})
	.options("c",{
		description: "files to output code coverage for",
		alias: "cover",
		string: true
	})
	.options("r",{
		description: "regexp of files to test",
		alias: "regexp",
		string: true,
		demand: true
	})
	.argv;

/* srunner args
 *
 * -r: regexp of files to test
 * -s: silent
 * -c: code coverage
 *
 */

var silent = argv.s;
var coverage = argv.c ? argv.c.split(",") : [];
var r = path.join(process.cwd(), argv.r);

var info = function(buffer, colr){
	if(!silent){
		var string = buffer.toString();
		if(colr)
			process.stdout.write(color[colr](string));
		else
			process.stdout.write(string);
	}
}

if(typeof(argv.r) !== "string" || !argv.r.length){
	info(optimist.help());
	process.exit();
}

var dir = path.dirname(r);
var filexp = new RegExp(path.basename(r));

if(!path.existsSync(dir)){ 
	info("Invalid directory: This directory does not exist\n", "red");
	process.exit();
}

var files = fs.readdirSync(dir);
var matchExp = function(file){ return filexp.test(file) ? true : false; };
var filtered = files.filter(matchExp);

if(!filtered.length){
	info("Invalid path: No tests found to run\n", "red");
	process.exit();
}

filtered.forEach(function(file){
	cp.exec("node "+dir+"/"+file, function(err, stdout, stderr){
		if(err) throw err;
		info(stdout);
	});
});

if(coverage.length){
	var codecover = require("./coverage").cover(/.*/);
	
	coverage = coverage.map(function(file){ return path.join(process.cwd(), file); });
	coverage.forEach(function(file){ require(file); });
	
	filtered = filtered.map(function(file){ return dir+"/"+file; });
	filtered.forEach(function(file){ require(file); });
	
	var counter = 0;
	coverage.forEach(function(obj, i){
		counter++;
		codecover(function(cd){
			var stats = cd[obj].stats();
			
			var col = "magenta";
			info("Coverage for: "+path.basename(obj)+"\n", col); 
			info("Lines seen: "+stats.seen+"\n", col);
			info("Lines missing: "+stats.missing+"\n", col);
			info("Percentage seen: "+Math.floor(stats.percentage*100)+"%\n", col);
			info("\n");
			counter--;
			
			if(counter === 0) codecover.release();
		});
	});
}
