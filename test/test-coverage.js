var assert = require("assert"),
	stest = require("../lib/stest.js"),
	cov = stest.cover("./fixtures/coverage.js");

// defaults to 250 ms
var opts = { timeout: 0 };

stest
.addCase("stest - code coverage", opts, {
	setup: function(promise){
		cov.something(1);
		cov.something(-1);
	},
})
.run();
