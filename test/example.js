var stest = require("stest"),
	assert = require("assert");

var op = { timeout: 0 };

stest.addCase("stest", op, {
	setup: function(promise){
		setTimeout(function(){
			promise.emit("hey", "there");
		}, 4000);

		var n = 45;
		this.n = n;
		promise.emit("cookies", n);
	},
	hey: function(text){
		assert.ok(text);
	},
	cookies: function(n){
		assert.equal(45, n);
	},	
	teardown: function(){
		assert.equal(this.n, 45);
	}
}).run();
