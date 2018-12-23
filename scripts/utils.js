function show_msg(msg) {
    show_messager(msg, 'msg')
}

function show_error(msg) {
    show_messager(msg, 'error')
}

function show_messager(msg, type) {
    let bodyCls = type + '_body_cls';
    $.messager.show({
        //title:'My Title',
        width: 500,
        height: 48,
        msg: msg,
        showType: 'fade',
        showSpeed: 200,
        style: {
            right: '',
            top: 52,   //document.body.scrollTop + document.documentElement.scrollTop,
            bottom: ''
        },
        border: false,
        noheader: true,
        bodyCls: bodyCls,
        cls: 'msg_cls'
    });
}

function handleError(err) {
    if (err) {
        console.warn(err)
        show_error(JSON.stringify(err))
        return false
    }

    return true
}

function isNumber(value) {         //验证是否为数字
    var patrn = /^(-)?\d+(\.\d+)?$/;
    if (patrn.exec(value) == null || value == "") {
        return false
    } else {
        return true
    }
}

function load_company() {
    ConfigModel.findOne({}, function (err, doc) {
        if (doc) {
            localStorage.setItem("sys_config", JSON.stringify(doc))
        }
    })
}

const {dialog} = require('electron').remote
function loadLogo(src){
    dialog.showOpenDialog({filters: [{name: 'Images/png', extensions: ['png']}], properties: ['openFile']}, function(filePaths){
        //console.log(filePaths)
        if (filePaths.length > 0) {
            let base64_src = "data:image/png;base64,"+ base64_encode(filePaths[0])
            $(src).attr('src', base64_src)
        }
    })
}


function set_company() {
    let company_name = $('#company_name').textbox('getValue')
    let company_phone = $('#company_phone').textbox('getValue')
    let company_fax = $('#company_fax').textbox('getValue')
    let company_address = $('#company_address').textbox('getValue')
    let company_logo = $('#company_logo').attr('src')
    ConfigModel.findOne({}, function (err, doc) {
        let update = true
        if (!doc) {
            doc = new ConfigModel()
            update = false
        }

        doc.company_name = company_name
        doc.company_phone = company_phone
        doc.company_fax = company_fax
        doc.company_address = company_address
        doc.company_logo = company_logo


        doc.save(function (err) {
            handleError(err)

            if (!err) {
                localStorage.setItem("sys_config", JSON.stringify(doc))
                SYS_CONFIG = doc
                show_msg("操作成功：信息保存成功！")
            }
        })

    })

}

//$.fn.datebox.defaults.formatter = myDateFormatter;
function myDateFormatter(date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    return y + '-' + (m < 10 ? ('0' + m) : m) + '-' + (d < 10 ? ('0' + d) : d)
}


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






function getCurrentSeq(seq_name, callback) {
    SequenceModel.findOne({ "seq_name": seq_name }, function (err, doc) {
        if (doc) {
            callback(doc.value)
        } else {
            SequenceModel.create({ 'seq_name': seq_name, value: 100000 }, function (err, doc) {
                callback(doc.value)
            })
        }
    })
}

function nextSeq(seq_name, callback) {
    SequenceModel.findOneAndUpdate({ "seq_name": seq_name }, { $inc: { value: 1 } }, function (err, doc) {
        if (doc) {
            callback(doc.value)
        }
    })
}






function loadUnits(callback) {
    UnitsModel.find({}, function (err, units) {
        let unitsData = { text: "车型载重", children: [] }
        for (let i = 0; i < units.length; i++) {
            unitsData.children.push({ "text": units[i] })
        }
        callback(unitsData)
    })
}


function moveChildWindowToParentCenter(child, parent) {
    let parentPosition = parent.getPosition()
    let parentSize = parent.getSize();
    let childSize = child.getSize();

    let childPosition = [(parentSize[0] - childSize[0])/2 + parentPosition[0], (parentSize[1] - childSize[1])/2 + parentPosition[1]]
   console.log(childPosition)
    child.setPosition(Math.round(childPosition[0]), Math.round(childPosition[1]))
    //let childPosition = [(position[0] + size[0])/2, (position[1] + size[1])/2 ]
}



let fs = require('fs');
function base64_encode(file) {
    // read binary data
    let bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}




