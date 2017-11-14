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

module.exports = RetriableStream;

// A retriable stream attempts to be
// efficient, but falls back to being just as back
// as chunking Bytes
function RetriableStream(stream) {
	this.buffer = undefined;
    this.useBuffer = false;
    // Handle situations where we are acually just
    // dealing with buffers
	if (Buffer.isBuffer(stream)) {
		this.buffer = stream;
		this.useBuffer = true;
		return;
    }
    this.buffer = new Buffer(0);
	this.stream = stream;
	this._configure();
}

RetriableStream.prototype._configure = function _configure() {
	var self = this;
	this.stream.pause();
	this.stream.on('data', function _onData(data) {
		self.buffer = Buffer.concat([self.buffer, data], self.buffer + data.length);
	});
	this.stream.once('end', function _ended() {
		self.useBuffer = true;
	});
};

RetriableStream.prototype.pipe = function pipe(streamB) {
	if (this.useBuffer) {
		streamB.end(this.buffer);
		return;
	}
	this.stream.pipe(streamB);
	this.stream.resume();
};
