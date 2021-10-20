// 通过key来管理 非 nodejs 控制的 内存，该 内存 不计算在 nodejs --max-old-space-size 之内。

const helper = require("./helper");

class bufpool {
	constructor() {
		this._pool = {};
		this._memsize = 0;
	}
	addBuffer(key, content) {
		let buf = Buffer.from(content);
		if (false == helper.isNullOrUndefined(this._pool[key])) {
			this._memsize -= this._pool[key].size;
		}
		this._pool[key] = {buf, size:buf.length, tick:(new Date()).getTime()};
		this._memsize += buf.length;

		this.printMem();
	}
	removeBuffer(key) {
		if (false == helper.isNullOrUndefined(this._pool[key])) {
			this._memsize -= this._pool[key].size;
		}
		delete this._pool[key];

		this.printMem();
	}
	getBuffer(key) {
		return this._pool[key];
	}
	getMemSize() {
		return this._memsize;
	}
	printMem() {
		helper.log("[pufpool:printmem]", (this._memsize/(1024*1024)).toFixed(2), "M");
	}

	static getInst() {
		if (helper.isNullOrUndefined(bufpool.inst)) {
			bufpool.inst = new bufpool();
		}
		return bufpool.inst;
	}
}

module.exports = bufpool;
