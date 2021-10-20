// 利用 ftp 模块 来 递归扫描 目标 ftp://path，对每个文件 可以进行处理。
// 提供 ftp.get(file_path)功能。

const ftp = require("ftp");
const helper = require("./helper");

class ftpscaner {
    constructor() {
        this._client = new ftp();
    }

    // 递归扫描ftp, 对文件进行 filetodo处理, 结束会以callback返回
    // filetodo: function(file_info, callback); file_info ={path:..., mtimeMs:..., mtime:...}, 处理结束调用callback
    make(ip, path, filetodo, callback, port, user, pass) {
        helper.log("[ftpscaner:make] (",ip+",", path+",", "filetodo, callback, port, user, pass) >>>>>");

        this._client.on('ready', ()=>{
            helper.log("[ftpscaner:make] event: ready.");
            let dirs = [{path:path}];
            this.dirNext(dirs, 0, filetodo, ()=>{
                callback();
            });
        });
        this._client.on('greeting', ()=>{
            helper.log("[ftpscaner:make] event: greeing.");
        });
        this._client.on('close', ()=>{
            helper.log("[ftpscaner:make] event: close.");
        });
        this._client.on('end', ()=>{
            helper.log("[ftpscaner:make] event: end.");
        });
        this._client.on('error', ()=>{
            helper.log("[ftpscaner:make] event: error.");
        });

        // {host:ip, port:21, user:'anonymous', password:'anonymous@'}
        let addr = {host:ip};
        
        if (false == helper.isNullOrUndefined(port)) { addr.port = port; }
        if (false == helper.isNullOrUndefined(user)) { addr.user = user; }
        if (false == helper.isNullOrUndefined(pass)) { addr.password = pass; }

        this._client.connect(addr);
    }
    dirNext(objs, index, filetodo, callback) {
        //helper.log("[ftpscaner:dirNext] (objs,", index+",", "filetodo, callback) >>>>>");
        if (index >= objs.length) {
            callback();
        } else {
            let folder_path = objs[index].path;
            helper.log("[ftpscaner:dirNext] ["+index+"/"+objs.length+"] folder_path:", folder_path);

            this._client.list(folder_path, (e,r)=>{
                if (e) {
                    helper.logRed("[ftpscaner:dirNext] ftp.list e:", e.message);
                } else {
                    //helper.log("[ftpscaner:dirNext] r:", r);
                    helper.log("[ftpscaner:dirNext] ftp.list child:", r.length);

                    let dirs = [];
                    let files = [];
                    r.forEach((v,i,a)=>{
                        let p = folder_path + "/" + v.name;
                        if (folder_path.lastIndexOf("/") == folder_path.length-1) {
                            p = folder_path + v.name;
                        }
                        if ("d" == v.type) {
                            dirs.push({path:p, date:v.date, size:v.size});
                        }    
                        if ("-" == v.type) {
                            files.push({path:p, date:v.date, size:v.size});
                        }
                    });


                    this.fileNext(files, 0, filetodo, ()=>{

                        this.dirNext(dirs, 0, filetodo, ()=>{

                            this.dirNext(objs, index+1, filetodo, callback);

                        });
                    });
                }
            });

        }
    }
    fileNext(objs, index, filetodo, callback) {
        //helper.log("[ftpscaner:fileNext] (objs,",index+",", "filetodo, callback) >>>>>");
        if (index >= objs.length) {
            callback();
        } else {
            let file_info = objs[index];
            filetodo(file_info, ()=>{
                setImmediate(()=>{ this.fileNext(objs, index+1, filetodo, callback); });
            });
        }
    }
    get(path, callback) {
        this._client.get(path, (e,r)=>{
            callback(e,r);
        });
    }
    end() {
        this._client.end();
    }
    destroy() {
        this._client.destroy();
    }
}

module.exports = ftpscaner;