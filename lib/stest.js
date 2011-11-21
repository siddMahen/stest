var events = require("events"),
	color = require("ansi-color").set;
/*
 * @class stest
 *
 * A simple async testing class.
 *
 * @api public
 */

function stest(){

	this._queue = [];	
	this.ctx = {};
	this.promise = new events.EventEmitter();

	this._addTime = function(func){
		var now = Date.now();
		func();
		return Date.now() - now;
	}

	this._report = function(name, errors, time){
		
		var result = "",
			c = "green";

		if(!errors.length)
			result = "\u2713";
		else{
			result = "\u2717";
			c = "red";
		}

		// write results
		process.stdout.write(color(result+" "+name+" - "+time+"ms\n", c));
		// print errs
		errors.forEach(function(err){
			process.stdout.write(color(err.message+"\n", "red"));
			if(err.type !== "stest")	
				process.stdout.write(color(err.stack+"\n", "red"));
		});
	}
}

/*
 * Adds a test cass to stest, along with some 
 * other acnillary stuff.
 *
 * @param {String} name 
 * @param {Object} opts
 * @param {Object} test
 *
 * @api public
 */

stest.prototype.addCase = function(name, opts, test){

	this._queue.push({ name: name, opts: opts, test: test });
	return this;
}

/*
 * Runs the test cases synchronously
 *
 * @api public
 */

stest.prototype.run = function(){

	var self = this;

	this._queue.forEach(function(tcase, index, array){
		
		var test = tcase.test;
		var opts = tcase.opts;
		var name = tcase.name;

		var setup = test["setup"];
		var teardown = test["teardown"] ? test["teardown"] : function(){};
		
		// to record elapsed time
		var totalTime = 0;
		// to record error
		var errors = [];

		// delete the setup and teardown keys
		delete test["setup"];
		if(test["teardown"]) delete test["teardown"];

		// add listeners for each key
		Object.keys(test).forEach(function(event, i, array){
			self.promise.once(event, function(){
				var args = Array.prototype.slice.call(arguments, 0);
				totalTime += self._addTime(function(){	
					try{
						test[event].apply(self.ctx, args);
					}catch(e){
						errors.push(e);
					}
				});
			});
		});

		// user setup
		totalTime += self._addTime(function(){ setup.apply(self.ctx,[self.promise]); });

		// start the timeout
		setTimeout(function(){

			// makes sure everything is removed
			Object.keys(test).forEach(function(event){
				var ears = self.promise.listeners(event).length;
				if(ears > 0){
					var e = new Error("The '"+event+"' event never fired.");
					e.type = "stest";
					errors.push(e);
					self.promise.removeAllListeners(event);
				}
			});

			// user teardown
			totalTime += self._addTime(function(){ teardown.apply(self.ctx,[]); });
			//give a report
			self._report(name, errors, totalTime);
		}, (opts.timeout > 0 ? opts.timeout : 250));
	});
}

// Exports
module.exports = new stest();

