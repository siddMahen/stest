var assert = require("assert"),
	stest = require("../lib/stest");

// defaults to 250 ms
var opts = { timeout: 0 };

stest
.addCase("stest - basic tests", opts, {
	setup: function(promise){
		this.one = "one";
		promise.emit("ctx_1");
		promise.emit("ctx_2", this);
		promise.emit("data", "hello");
	},
	ctx_1: function(){	
		assert.ok(this.one);
		assert.deepEqual("one", this.one);
	},
	ctx_2: function(instance){
		assert.throws(function(){
			var e = instance.nonExistant["crazy"];
		});
		assert.deepEqual(undefined, this.nonExistant);
	},
	data: function(data){
		assert.ok(data);
		assert.deepEqual("hello", data);
	}
})
.addCase("stest - advanced tests", opts, {
	setup: function(promise){
		setTimeout(function(){
			promise.emit("ok");
		}, 1000);   
	},
	ok: function(){},
	teardown: function(errors){
		assert.ok(errors);
		var err = errors.pop();
		assert.deepEqual("ok", err.event);
		assert.deepEqual("stest", err.type);
	}			  
})
.run();
