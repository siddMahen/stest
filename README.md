# stest - A Sane Async Testing Framework

`stest` is a fun, fast and simple testing framework 
particularly suited towards asynchronous code. It lets 
you easily structure tests for code with both 
synchronous and asynchronous methods without too much
complexity.

# Installation:

Using `npm`:

	npm install -g stest

# Usage:

A very simple test:

	var stest = require("stest"),
		assert = require("assert"),
		mylib = stest.cover("../lib/mylib");

	var opts = { timeout: 0 };

	stest.addCase("stest", opts,{
		setup: function(promise){
			
			promise.emit("event", 42);
			promise.emit("other_event", "Hello!");
			
			mylib.async_func(function(err, obj){
			    promise.emit("async", err, obj);
			});
		},
		event: function(fortytwo){
			assert.equal(42, fortytwo);
		},
		other_event: function(hello){
			assert.equal("Hello!", hello);
		},
		async: function(err, obj){
		    assert.ifError(err);
		    assert.ok(obj);
		},
		teardown: function(errors){
			if(errors.length > 0) assert.ok(0);
		}
	}).run();

`stest` hands you a `promise` object which is an instance
of `EventEmitter`. Use this to emit events and values
when your async/sync calls complete, and check them in the
corresponding functions associated with the name of the
events you've emitted.

The `setup` and `teardown` functions are given to you
to setup your test case, and to perform a teardown. 
`setup` is required, `teardown` is optional.

The `opts` argument allows you to specify a `timeout`
in miliseconds. If all async calls are not called 
before that time, `stest` will give you a heads up.

`stest` also supports code coverage using the `cover`
method, which shows unseen LOC and gives you a brief
overview of how much of the file you've tested.

See the source code and inline documentation for more details.

# Running Tests:

Tests can be run en masse using `srunner`:

	Usage: srunner [-s] -r [regexp]

	Options:
	  -s, --silent  supress output           [boolean]
	  -r, --regexp  regexp of files to test  [string]  [required]

Which looks like this in the command line:

	srunner -r test/test-.*\.js

If you prefer not to use `srunner`, you can 
still run tests like this:

	node test.js

`srunner` isn't dependant on `stest` per se, so it also
works really well as a general purpose test runner.

# License:

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
