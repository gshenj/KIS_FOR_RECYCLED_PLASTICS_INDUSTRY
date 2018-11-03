function show_messager(msg) {
    $.messager.show({
        //title:'My Title',
        width: 400,
        height: 40,
        msg: msg,
        showType: 'fade',
        style: {
            right: '',
            top: document.body.scrollTop + document.documentElement.scrollTop,
            bottom: ''
        },
        border: false,
        noheader: true,
        bodyCls: 'msg_body_cls',
        cls: 'msg_cls'
    });
}

function handleError(err) {
    if (err) {
        console.warn(err)

    }
}