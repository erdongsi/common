const readline = require('readline');
const fs = require('fs');

class xmlFinder{

    constructor(){
        this.xmlJson = {};
        this.isReady = false;
    }

    setFile(path,callback){

        //创建readline interface,从xml文件中获取输入流
        const rl = readline.createInterface({
            input: fs.createReadStream(path),
            crlfDelay: Infinity
        });
    
        let row = 0;
        let current = [];
        current[0] = this.xmlJson;
    
        //逐行读取,转换为json
        rl.on('line', (line) => {
    
            row++;
            // console.log(row,line);
    
            line = line.trim();
            let split = line.split(' ');
    
            if(line.indexOf('<?xml')!=-1){
                return;
            }
            else if(line.indexOf('</')!=-1){
                current = current.slice(0,-1);
            }
            else{
                let tag_name = split[0].replace("<","").replace("/>","").replace(">","").trim();
                
                // console.log(tag_name);
                let temp;
    
                if(current[current.length-1][tag_name]==undefined){
                    current[current.length-1][tag_name] = {};
                    temp = current[current.length-1][tag_name];
                }
                else{
                    if(Object.prototype.toString.call(current[current.length-1][tag_name])=='[object Object]'){
                        let t = current[current.length-1][tag_name];
                        current[current.length-1][tag_name] = [];
                        current[current.length-1][tag_name].push(t);
                    }
                    current[current.length-1][tag_name].push({});
                    temp = current[current.length-1][tag_name][current[current.length-1][tag_name].length-1];
                }
    
                let attrs_str = split.slice(1).join(" ");
    
                //console.log("attrs_str:", attrs_str);
                let attrs = attrs_str.match(/(.*?)="(.*?)"/g);
                if(attrs!=null){
                    for(let i=0;i<attrs.length;i++){
                        //console.log(i, attrs[i]);
                        let attr = attrs[i].trim();
                        let attr_name = attr.slice(0,attr.indexOf("=")).trim();
                        let attr_value = attr.match(/\"(.*?)\"/g)[0].replace(/\"/g,"");
                        temp[attr_name] = attr_value;
                    }
                    //console.log(temp);
                }
    
                if(line.indexOf('/>')==-1){
                    current.push(temp);
                }
    
            }
        });
    
        rl.on('pause', () => {
            this.isReady = true;
            callback();
        });
       
    }

    find(key,value,...path){
        if(!this.isReady){
            return undefined;//JSON未设置,返回undefined
        }
    
        let content = this.xmlJson.root;
        for(let i in path){
            content = find_path(content,path[i]);
            if(content==undefined){
                return [];//路径不存在
            }
        }
    
        if(Object.prototype.toString.call(content)=='[object Array]'){
            let res = [];
            for(let i in content){
                if(content[i][key]==value){
                    res.push(content[i]);
                }
            }
            return res;
        }
        else{
            if(content[key]==value){
                return [content];
            }
            else{
                return [];//未找到键值匹配的项
            }
        }
        
    }

}

function find_path(content,next){
    if(Object.prototype.toString.call(content)!='[object Object]'){
        return undefined;
    }
    if(content[next]!=undefined){
        return content[next];
    }
    else{
        for(k in content){
            let res = find_path(content[k],next);
            if(res!=undefined){
                return res;
            }
        }
        return undefined;
    }
}

//exports.xmlFinder = xmlFinder;

module.exports = xmlFinder;