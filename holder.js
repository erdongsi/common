// 可以让 proc 暂停执行，在 free 后 proc 才会继续执行

let holding = false;

function make(proc) {
    holding = true;
    setTimeout(()=>{ loop(proc); }, 200);
}
function loop(proc) {
    if (false == holding) {
        proc();
    } else {
        setTimeout(()=>{ loop(proc); }, 200);
    }
}
function free() {
    holding = false;
}

exports.make = make;
exports.free = free;