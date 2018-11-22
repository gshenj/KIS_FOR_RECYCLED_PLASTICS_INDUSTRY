let opt_type_for_cartype

function edit_cartype_tree_node() {
    var node = $('#cartype_tree').tree('getSelected');
    if (node) {
        $('#dlg_for_cartype').dialog('open').dialog('center').dialog('setTitle', '修改类型名称');
        //$('#fm_for_cartype').form('load', node)
        $('#cartype_id').val(node._id);
        $('#cartype_name_textbox').textbox('setValue', node.text);
        opt_type_for_cartype = 'edit'
    }
}

/**
 * 添加分类
 */
function append_cartype_tree_node() {
    $('#dlg_for_cartype').dialog('open').dialog('center').dialog('setTitle', '新增货车类型');
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
    $.messager.confirm('确定','是否确定删除选中的货车分类?',function(r) {
        if (r) {
            CartypeModel.findOneAndDelete({_id: node._id}, function (err, doc) {
                loadCartypeTree()
            })
        }
    })
}


//todo
/**
 * 保存分类树到db
 */
function saveCartype() {
    let cartype = $('#cartype_name_textbox').textbox('getValue')
    if (opt_type_for_cartype == 'new') {

        CartypeModel.create({name:cartype }, function(err, doc){
           loadCartypeTree()
        })

    } else if (opt_type_for_cartype == 'edit') {
        let cartype_id = $('#cartype_id').val()
        CartypeModel.findOneAndUpdate({_id:cartype_id},{name: cartype },  function(err, doc){
            loadCartypeTree()
        })
    }


    $('#dlg_for_cartype').dialog('close');
}


function loadCartypeSelectData() {
    CartypeModel.find({}, function(err, types) {
        $('#driver_car_type').combobox('loadData', types)
    })
}