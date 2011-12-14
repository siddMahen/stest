/*
 * Copyright (c) 2011, Chris Dickinson
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Chris Dickinson nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL Chris Dickinson BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var bunker = require('bunker'),
    Module = require('module').Module,
    path = require('path'),
    fs = require('fs'),
    vm = require('vm');

function CoverageData (filename, bunker, data) {
  this.bunker = bunker;
  this.filename = filename;
  this.filedata = data;
  this.nodes = {};
}

CoverageData.prototype.visit = function(node) {
  (this.nodes[node.id] = this.nodes[node.id] || {node:node, count:0}).count++;
};

CoverageData.prototype.missing = function() {

  var nodes = this.nodes;
  return this.bunker.nodes.filter(function(node) { return !nodes[node.id] });
};

CoverageData.prototype.stats = function() {
  var missing = this.missing(),
      filedata = this.filedata.split('\n');

  var seenLines = [],
      lines = 
      missing.sort(function(lhs, rhs) {
        return lhs.node[0].start.line < rhs.node[0].start.line ? -1 :
               lhs.node[0].start.line > rhs.node[0].start.line ? 1  :
               0;
      }).filter(function(node) {

        var okay = (seenLines.indexOf(node.node[0].start.line) < 0);
        if(okay)
          seenLines.push(node.node[0].start.line);
        return okay;

      }).map(function(node, idx, all) {
        return {
          lineno:node.node[0].start.line + 1,
          source:function() { return filedata[node.node[0].start.line]; }
        };
      });

  return {
    percentage:(filedata.length-seenLines.length)/filedata.length,
    lines:lines,
    missing:seenLines.length,
    seen:(filedata.length-seenLines.length)
  };
};

var createEnvironment = function(module, filename) {
    
    var ctxt = {};
    for(var k in global)
      ctxt[k] = global[k];

    ctxt.require = require;
    ctxt.exports = module.exports;
    ctxt.__filename = filename;
    ctxt.__dirname = path.dirname(filename);
    ctxt.process = process;
    ctxt.console = console;
    ctxt.module = module;
    ctxt.global = ctxt;

    return ctxt;
};

module.exports = function(fileRegex) {
  var originalRequire = require.extensions['.js'],
      coverageData = {},
      match = fileRegex instanceof RegExp ? fileRegex : 
      	  new RegExp(fileRegex ? fileRegex.replace(/\//g, '\\/').replace(/\./g, '\\.') : '.*');

  require.extensions['.js'] = function(module, filename) {
	if(!match.test(filename)) return originalRequire(module, filename);

    var context = createEnvironment(module, filename),
        data = fs.readFileSync(filename, 'utf8'),
        bunkerized = bunker(data),
        coverage = coverageData[filename] = new CoverageData(filename, bunkerized, data);

    bunkerized.on('node', coverage.visit.bind(coverage));
    bunkerized.assign(context);

    var wrapper = '(function(ctxt) { with(ctxt) { return '+Module.wrap(bunkerized.compile())+'; } })',
        compiledWrapper = vm.runInNewContext(wrapper, filename, context);

    var args = [context.exports, context.require, module, filename, context.__dirname];
    return compiledWrapper.apply(module.exports, args);
  };

  var retval = function(ready) { ready(coverageData) };
  retval.release = function() { require.extensions['.js'] = originalRequire };

  return retval;
};

module.exports.cover = module.exports;
