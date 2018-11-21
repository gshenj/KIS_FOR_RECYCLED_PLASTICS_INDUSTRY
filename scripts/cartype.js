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


//todo
/**
 * 保存分类树到db
 */
function saveCartype() {
    let text = $('#cartype_name_textbox').textbox('getValue')
    if (opt_type_for_cartype == 'new') {

        CartypeModel.create({cartype:text}, function(err, doc){
           loadCartypeTree()
        })

    } else if (opt_type_for_cartype == 'edit') {
        CartypeModel.findOneAndUpdate({_id:text},{cartype: text},  function(err, doc){
            loadCartypeTree()
        })
    }


    $('#dlg_for_classification').dialog('close');
}