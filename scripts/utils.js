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
        height: 40,
        msg: msg,
        showType: 'fade',
        showSpeed: 200,
        style: {
            right: '',
            top: document.body.scrollTop + document.documentElement.scrollTop,
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

function load_company(){
    mongoose.ConfigModel.findOne({},function(err, doc){
        if (doc) {
            SYS_INFO.companyInfo = doc;
        }
    })
}

function set_company() {
    let company_name = $('#company_name').textbox('getValue')
    let company_phone = $('#company_phone').textbox('getValue')
    let company_address = $('#company_address').textbox('getValue')
    let company_logo_path = $('#company_logo').textbox('getValue')
    mongoose.ConfigModel.findOne({},function(err, doc){
        let update = true
        if (!doc) {
           doc = new mongoose.ConfigModel()
            update = false
        }

        doc.company_name = company_name;
        doc.company_phone = company_phone
        doc.company_address = company_address

        doc.save(function(err){
            handleError(err)

            if (!err) {
                show_msg("操作成功：信息保存成功！")
            }
        })


    })

}

//$.fn.datebox.defaults.formatter = myDateFormatter;
function myDateFormatter(date){
    var y = date.getFullYear();
    var m = date.getMonth()+1;
    var d = date.getDate();
    return  y+'-'+(m<10?('0'+m):m)+'-'+(d<10?('0'+d):d)
}

function getCurrentSeq(seq_name, callback) {
    mongoose.SequenceModel.findOne({"seq_name":seq_name}, function(err, doc){
        if (doc) {
            callback(doc.value)
        } else {
            mongoose.SequenceModel.create({'seq_name':seq_name, value:100000}, function(err, doc) {
                callback(doc.value)
            })
        }
    })
}

function nextSeq(seq_name, callback) {
    mongoose.SequenceModel.findOneAndUpdate({"seq_name":seq_name},{$inc:{value:1}}, function(err, doc){
        if (doc) {
            callback(doc.value)
        }
    })
}

