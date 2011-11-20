# stest - Sane async tests

# Installation:

Using `npm`:

	npm install stest

# Usage:

A very simple test:

	var stest = require("stest"),
		assert = require("assert");

	var opts = { timeout: 0 };

	stest.addCase("stest", opts,{
		setup: function(promise){
			promise.emit("event", 42);
			promise.emit("other_event", "Hello!");
		},
		event: function(fortytwo){
			assert.equal(42, fortytwo);
		},
		other_event: function(hello){
			assert.equal("Hello!", hello);
		},
		teardown: function(){

		}
	}).run();

`stest` hands you a `promise` object which is an instance
of `EventEmitter`. Use this to emit events and values
when your async calls complete, and check them in the
corresponding functions associated with the name of the
event you emitted.

The `setup` and `teardown` functions are given to you
to setup your test case. 

The `opts` argument allows you to specify a `timeout`.
If all async calls are not called before that time, then 
the `stest` will give you a heads up.

Tests can be run en masse like this:

	srunner -r test/test-*.js

Or like this:

	node test.js

If you prefer not to use `srunner`.

# License

(The MIT License)

Copyright (C) 2011 by Siddharth Mahendraker <siddharth_mahen@me.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
