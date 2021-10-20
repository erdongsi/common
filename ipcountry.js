// 通过 ip 可以 确定 国家。

const fs = require("fs");

const helper = require("./helper");

var lst_ipcountrys = [];

function init(callback) {
    helper.log("[loadIpCountry:init] (callback) >>>>>");

    lst_ipcountrys = [];

    let _path = "./ip2country.csv";
    fs.readFile(_path,(e,d)=>{
        if (e) {
            helper.logRed("[loadIpCountry:init] readFile(",_path,") e:",e.message);
            callback();
        } else {
            //console.log(d.toString());
            let s = d.toString();
            let ary = s.split('\n');
            
            console.log("ary:",ary.length);

            for (let i = 0; i < ary.length; i++) {
                if (i <= 10) {
                    helper.logConsole(i, ary[i]);
                }
                if (i >= ary.length -10) {
                    helper.logConsole(i, ary[i]);
                }
            }
            
            for (let i = 0; i < ary.length; i++) {
                let ps = ary[i].split(',');

                let start_ip = 0;
                let end_ip = 0;
                let country_id = "-";
                let country_name = "-";
                if (ps.length >= 4) {
                    start_ip = Number(ps[0]);
                    end_ip = Number(ps[1]);
                    country_id = ps[2];
                    country_name = ps[3];
                    country_name = country_name.replace('\r', '');
                }

                if (i <= 10) {
                    helper.logConsole(i, ps.length, start_ip, end_ip, country_id, country_name);
                }
                if (i >= ary.length-10) {
                    helper.logConsole(i, ps.length, start_ip, end_ip, country_id, country_name);
                }

                lst_ipcountrys.push({start: start_ip, end: end_ip, countryid: country_id, countryname:country_name});
            }
            callback();
        }
    });
}
function foundIp(ip) {
    helper.log("[ipcountry:foundIp] (", ip, ") >>>>>");
    let ret = null;

    let nip = ipToNumber(ip);

    for (let i = 0; lst_ipcountrys.length; i++) {
        let ipc = lst_ipcountrys[i];
        if (ipc.start <= nip && nip <= ipc.end) {
            ret = ipc;
            break;
        }
    }
    helper.log("[ipcountry:foundIp] ret:", ret);
    return ret;
}
function ipToNumber(ip) {
    helper.log("[ipcountry:ipToNumber] (", ip, ") >>>>>");
    let ret = -1;
    let ips = ip.split('.');
    if (ips.length >= 4) {
        let a = Number(ips[0]);
        let b = Number(ips[1]);
        let c = Number(ips[2]);
        let d = Number(ips[3]);
        helper.log(a, b, c, d);
        helper.log(a<<24, b<<16, c<<8, d);

        ret = (a<<24) + (b<<16) + (c<<8) + d;
    }
    helper.log("[ipcountry:ipToNumber] ret:", ret);
    return ret;
}

exports.init = init;
exports.foundIp = foundIp;
exports.ipToNumber = ipToNumber;
