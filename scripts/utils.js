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