let opt_type_for_cartype

function edit_cartype_tree_node() {
    var node = $('#cartype_tree').tree('getSelected');
    if (node) {
        $('#dlg_for_cartype').dialog('open').dialog('center').dialog('setTitle', '修改类型');
        $('#fm_for_cartype').form('load', node);
        opt_type_for_cartype = 'edit'
    }
}

/**
 * 添加分类
 */
function append_cartype_tree_node() {
    $('#dlg_for_cartype').dialog('open').dialog('center').dialog('setTitle', '新增编码');
    $('#fm_for_cartype').form('clear');
    opt_type_for_cartype = 'new'
}

/**
 * 删除分类
 */
function delete_cartype_tree_node() {

    //需要对话框确认。
    let t = $('#cartype_tree');
    let node = t.tree('getSelected');
   // t.tree('remove', node.target);
    CartypeModel.findOneAndDelete({name: node.text}, function(err, doc){
        loadCartypeTree()
    })
}


/**
 * 保存分类树到db
 */
function saveCartype() {
    let text = $('#cartype_name_textbox').textbox('getValue')
    if (opt_type_for_cartype == 'new') {
        var t = $('#cartype_tree');
        var node = t.tree('getSelected');
        t.tree('append', {
            parent: (node ? node.target : null),
            data: [{
                text: text
            }]
        });
    } else if (opt_type_for_cartype == 'edit') {
        var t = $('#cartype_tree');
        var node = t.tree('getSelected');
        if (node) {
            t.tree('update', {
                target: node.target,
                text: text
            });
        }
    }

    CartypeModel.create()
    saveClassifications(t.tree(), function () {

        //reload classification tree
        loadClassifications(function (data) {
            $('#classification_tree').tree('loadData', data)
        })

    })

    $('#dlg_for_classification').dialog('close');
}