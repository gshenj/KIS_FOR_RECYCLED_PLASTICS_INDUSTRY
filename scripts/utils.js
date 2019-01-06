Date.prototype.dtFormat = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) 
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

function moveChildWindowToParentCenter(child, parent) {
    let parentPosition = parent.getPosition()
    let parentSize = parent.getSize();
    let childSize = child.getSize();
    let childPosition = [(parentSize[0] - childSize[0])/2 + parentPosition[0], (parentSize[1] - childSize[1])/2 + parentPosition[1]]
    child.setPosition(Math.round(childPosition[0]), Math.round(childPosition[1]))
}

function base64_encode(file) {
    let bitmap = fs.readFileSync(file);
    return new Buffer(bitmap).toString('base64');
}


