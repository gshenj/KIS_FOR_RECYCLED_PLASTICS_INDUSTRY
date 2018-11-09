///////////////////////////////////////////产品数据表格////////////////////////////////////////////
let PRODUCT_GRID = null;


let product_grid_toolbar = [{
    text: '添加',
    iconCls: 'icon-add',
    handler: append
}, {
    text: '删除',
    iconCls: 'icon-remove',
    handler: removeit
}, {
    text: '应用',
    iconCls: 'icon-save',
    handler: accept
}, {
    text: '撤销',
    iconCls: 'icon-undo',
    handler: reject
}, {
    text: 'getchanges',
    iconCls: 'icon-undo',
    handler:getChanges
}]

let product_grid_columns = [[
    {field: 'name', title: '品名', width: 140, align: 'center', editor: 'textbox'},
    {field: 'modal', title: '型号', width: 140, align: 'center', editor: 'textbox'},
    {
        field: 'units', title: '单位', width: 80, align: 'center',
        formatter: function (value, row) {
            return row.units;
        },
        editor: {
            type: 'combobox',
            options: {
                textField: 'units',
                valueField: 'units',
                data: mongoose.UNITS
            }
        }
    },
    {field: 'price', title: '价格', width: 60, align: 'center', editor: {type: 'numberbox', options: {precision: 2}}},
    {field: 'memo', title: '描述', width: 140, editor: 'textbox'}
]]


//
function load_product_grid(customerId, title) {

    if (PRODUCT_GRID == null) {
        PRODUCT_GRID = $('#product_grid').datagrid({
            fit:true,
            singleSelect: true,
            width: 580,
            showFilterBar:false,
            toolbar: product_grid_toolbar,
            title:'通用产品管理',
            data: [],
            columns: product_grid_columns,
            onClickCell: onClickCell,
            onEndEdit: onEndEdit
        })
        console.log("Init product grid.")
    }

    let params = {customer: customerId}
    mongoose.ProductModel.find(params, function(err, docs){
        console.log(JSON.stringify(docs))
        PRODUCT_GRID.datagrid('loadData', docs)
    })

    if (title) {
        PRODUCT_GRID.datagrid("getPanel").panel('setTitle', title);

    }


}




function endEditing() {
    if (typeof(editIndex) == 'undefined') {
        return true
    }
    if (PRODUCT_GRID.datagrid('validateRow', editIndex)) {
        PRODUCT_GRID.datagrid('endEdit', editIndex);
        editIndex = undefined;
        return true;
    } else {
        return false;
    }
}

function onClickCell(index, field, value) {

    console.log("onClickCell")
    if (editIndex != index) {
        if (endEditing()) {
            PRODUCT_GRID.datagrid('selectRow', index)
                .datagrid('beginEdit', index);
            var ed = PRODUCT_GRID.datagrid('getEditor', {index: index, field: field});
            if (ed) {
                ($(ed.target).data('textbox') ? $(ed.target).textbox('textbox') : $(ed.target)).focus();
            }
            editIndex = index;
        } else {
            setTimeout(function () {
                PRODUCT_GRID.datagrid('selectRow', editIndex);
            }, 0);
        }
    }
}

function onEndEdit(index, row, changes) {
    console.log('onEndEdit...')
    console.log(JSON.stringify(row))

}

function append() {
    if (endEditing()) {
        PRODUCT_GRID.datagrid('appendRow', {});
        editIndex = PRODUCT_GRID.datagrid('getRows').length - 1;
        PRODUCT_GRID.datagrid('selectRow', editIndex)
            .datagrid('beginEdit', editIndex);
    }
}

function removeit() {
    if (editIndex == undefined) {
        return
    }
    PRODUCT_GRID.datagrid('cancelEdit', editIndex)
        .datagrid('deleteRow', editIndex);
    editIndex = undefined;
}

function accept() {
    if (endEditing()) {
        PRODUCT_GRID.datagrid('acceptChanges');

        console.log("After accept "+ JSON.stringify(PRODUCT_GRID.datagrid('getRows')));
        return true;
    }
    return false;
}

function reject() {
    PRODUCT_GRID.datagrid('rejectChanges');
    editIndex = undefined;
    console.log("reject...")
}

function getChanges() {
    var rows = PRODUCT_GRID.datagrid('getChanges');
    alert(rows.length + ' rows are changed!');
}


function onDlgForCustomerClose(){
    //PRODUCT_GRID.datagrid('destroy')
    //PRODUCT_GRID = null;
}

