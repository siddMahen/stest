var events = require("events");

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

	console.log("Running tests...");

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
				var now = Date.now();
				
				try{
					test[event].apply(self.ctx, args);
				}catch(e){
					errors.push(e);
				}

				totalTime += Date.now() - now;
			});
		});

		// user setup
		var setupT = Date.now();
		setup.apply(self.ctx, [self.promise]);
		totalTime += Date.now() - setupT;

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
			var teardownT = Date.now();
			teardown.apply(self.ctx,[]);
			totalTime += Date.now() - teardownT;

			// give a little report on what happend
			console.log(name+"\n");
			
			if(!errors.length)
				console.log("No errors :-)");
			else{
				console.log("Errors:");
				errors.forEach(function(err){
					
					console.log(err.message);
					if(err.type !== "stest")	
						console.log(err.stack);
				});
			}

			console.log("\nElapsed time: "+totalTime.toString()+"ms");

		}, (opts.timeout > 0 ? opts.timeout * 1000 : 5000));
	});
}

// Exports
module.exports = new stest();

