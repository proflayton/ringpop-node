// Copyright (c) 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

var rawBody = require('raw-body');
var safeParse = require('../lib/util.js').safeParse;

module.exports = function createProxyReqHandler(ringpop) {
    return function handleProxyReq(req, res, callback) {
    	console.log(req);
    	var arg2 = req.arg2;
        if (arg2 === null) {
            return callback(new Error('need header to exist'));
        }
        rawBody(arg2, {
        	limit: 1024 * 1024, // 1MB
        	length: arg2.length
        }, function _gotRawBody(err, rawHeader) {
        	if (err) {
        		return callback(err);
        	}
        	var header = safeParse(rawHeader);
        	console.log('handleProxyReq', header);
	        if (header === null) {
	            return callback(new Error('header failed to parse'));
	        }
        	ringpop.requestProxy.handleRequest(header, req.arg3, callback);
        })
    };
};
