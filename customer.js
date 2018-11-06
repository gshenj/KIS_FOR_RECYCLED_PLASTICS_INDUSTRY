mongoose = require("./scripts/db")
let CUSTOMER_GRID = null
let toolbar_for_customer = [
    {
        text: '添加',
        iconCls: 'icon-add',
        handler: function () {
            // show_sys_user_form('add')
            newCustomer()
        }
    }, {
        text: '编辑',
        iconCls: 'icon-edit',
        handler: function () {
            editCustomer()
        }
    }, {
        text: '删除',
        iconCls: 'icon-remove',
        handler: function () {
            destroyCustomer()
            // show_sys_user_form('delete')
        }
    }, {
        text: '导出到EXCEL',
        iconCls: 'icon-lock',
        handler: function () {
            CUSTOMER_GRID.datagrid('toExcel','客户列表.xls');
            // show_sys_user_form('reset_pass')
        }
    }]

function loadCustomersWhenClassificationNodeSelected(node){
    let t = $('#classification_tree')
    let rootNode = t.tree('getRoot')

    let params = {}
    if (node == null || node == rootNode) {

    } else if (t.tree('isLeaf', node.target)){
        console.log("Select classification node is a leaf.")
        params.classification = node.text;
    } else {
        let children = t.tree('getChildren', node.target)
        let arr = [node.text]
        for (let i=0; i<children.length; i++) {
            arr.push(children[i].text)
        }
        params.classification = {$in: arr}
    }

    console.log("Classification params is "+JSON.stringify(params))
    loadCustomerGrid(params)
}

function loadCustomerGrid(params) {
    if (CUSTOMER_GRID == null) {
        console.log("First time load customer grid.")
        CUSTOMER_GRID = $('#grid_for_customer').datagrid({
            fit: true,
            singleSelect: true,
            collapsible: false,
            data: [],
            border:false,
            rownumbers:true,
            title:'<span style="font-weight: bold">客户列表</span>',
            width:700,
            height:500,
            toolbar: toolbar_for_customer,
            columns:[[
                {title: "客户名称", field: 'name', width:250},
                {title: "联系人", field: "principal",width:100},
                {title: "联系电话", field: 'phone',width:100},
                {title: "客户编码", field: 'classification',width:100},
                {title: "联系地址", field: 'address',width:250}
            ]]
        })
    }

    if (params == null) {
        params = {}
    }
    mongoose.CustomerModel.find(params, function (err, docs) {
        CUSTOMER_GRID.datagrid('loadData', docs)
    })
}


let opt_type_for_customer;
function newCustomer(){
    $('#dlg_for_customer').dialog('open').dialog('center').dialog('setTitle','添加客户');
    $('#fm_for_customer').form('clear');
    let node = $('#classification_tree').tree('getSelected')
    if (node != null) {
        let rootNode = $('#classification_tree').tree('getRoot')
        if (node != rootNode)
            $('#customer_classification').combobox('setText',node.text)
    }
    opt_type_for_customer = 'new'
}
function editCustomer(){
    var row = CUSTOMER_GRID.datagrid('getSelected');
    if (row){
        $('#dlg_for_customer').dialog('open').dialog('center').dialog('setTitle','修改客户');
        console.log("ROw"+JSON.stringify(row))
        $('#fm_for_customer').form('load',row);

        // url = 'update_user.php?id='+row.id;
        opt_type_for_customer = 'edit'
    }
}

//todo
function saveCustomer() {

    let name = $('#name_textbox').textbox('getValue')
    let classification = $('#role_combobox').combobox('getText')
    let principal = $('#customer_principal').combobox('getText')
    let phone = $('#disabled_checkbox').checkbox('options').checked
    let address = $('#disabled_checkbox').checkbox('options').checked


    let customer = {name: name, role: role, disabled: disabled}
    console.log("New user is: " + JSON.stringify(user))
    if (url == 'new') {
        addCustomer(user, function () {
            $('#dlg_for_customer').dialog('close');
            loadSysUsers(null)
        })

    } else if (url == 'edit') {
        let customer_id = $('#customer_id').val();
        customer._id = customer_id;
        updateCustomer(user, function () {
            $('#dlg_for_customer').dialog('close');
            loadSysUsers(null)
        })
    }
}

function destroyCustomer(){
    var row = CUSTOMER_GRID.datagrid('getSelected');
    if (row){
        $.messager.confirm('确定','是否确定删除选中的用户?',function(r){
            if (r){
                deleteUser({_id:row._id},function(){
                    $('#dlg_for_customer').dialog('close');
                    loadSysUsers(null)
                })

            }
        });
    }
}





/*












    function load_customer_grid() {
    load_customer_grid(null)

}

function load_customer_grid(callback) {

    if (CUSTOMER_GRID == null) {
        console.log("First time load customer datagrid.")

        CUSTOMER_GRID = $('#customer_grid').DataTable({
            data: [],
            pageLength: 15,
            /!*paging:false,
            "scrollY": "500px",
            "scrollCollapse": true,
            fixedHeader: true,*!/
            select: true,
            dom: 'Bfrtip',
            buttons: [
                {
                    text: '编辑',
                    action: function (e, dt, node, config) {
                        let row_data = dt.row('.selected').data();
                        console.log(row_data)
                        if (typeof(row_data) == 'undefined') {
                            alert('请选择客户')
                            return
                        }

                        show_customer_win_form('edit', row_data)
                        // open edit customer winform.
                        //console.log( JSON.stringify( dt.row('.selected').data()))
                    }
                },
                {
                    text: '新增',
                    action: function (e, dt, node, config) {
                        show_customer_win_form('add', null)
                    }
                },
                {
                    text: '删除',
                    action: function (e, dt, node, config) {
                        let row_data = dt.row('.selected').data();
                        console.log(row_data)
                        if (typeof(row_data) == 'undefined') {
                            alert('请选择客户')
                            return
                        }

                        show_customer_win_form('delete', row_data)
                    }
                },
                'excel'
            ],
            columns: [
                {
                    "className": 'details-control',
                    "orderable": false,
                    "data": null,
                    "defaultContent": ''
                },
                {title: "客户", data: 'name'},
                {title: "联系人", data: "principal"},
                {title: "电话", data: 'phone'},
                {title: "地区", data: 'city'},
                {title: "地址", data: 'address'}
            ],
            "order": [[1, 'asc']]
        });


        $("div.toolbar1").html('<b>Custom tool bar! Text/images etc.</b>');

        // Add event listener for opening and closing details
        $('#customer_grid tbody').on('click', 'td.details-control', function () {
            var tr = $(this).closest('tr');
            var row = CUSTOMER_GRID.row(tr);

            if (row.child.isShown()) {
                // This row is already open - close it
                row.child.hide();
                tr.removeClass('shown');
            }
            else {
                // Open this row
                row.child(format(row.data())).show();
                tr.addClass('shown');
            }
        });

        $('#customer_grid tbody').on('click', 'tr', function () {
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected');
            }
            else {
                CUSTOMER_GRID.$('tr.selected').removeClass('selected');
                $(this).addClass('selected');
            }
        });


    } else {
        console.log("Reload user datagrid.")
    }


    mongoose.CustomerModel.find({}, function (err, users) {
        CUSTOMER_GRID.clear().rows.add(users).draw()
        //  CUSTOMER_GRID.clear().rows.add(users).invalidate().draw()

        if (callback != null)
            callback()
    })
}


function format(d) {
    // `d` is the original data object for the row
    let products = d.products;

    console.log("sub table"+products)
    let html = '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'
    html += '<tr><th>品名</th><th>型号</th><th>单位</th><th>价格</th><th>描述</th>';
    for (let i=0; i<products.length; i++) {
        let p = products[i];
        html += "<tr><td>"+p.name+"</td><td>"+p.modal+"</td><td>"+p.units+"</td><td>"+p.price+"</td><td>"+p.memo+"</td></tr>"
    }
    html += '</table>'
    return html

}



//let CURRENT_CUSTOMER_PRODUCT = []
function show_customer_win_form(type, row_data) {
    CUSTOMER_OPERATOR_TYPE = type
    if (type == 'add') {
        $('#customer_name').textbox("setValue", '').textbox("readonly", false)
        $('#customer_region').combotree('setValue', {text:"", id:""}).combotree('readonly', false)
        $('#customer_principal').textbox('setValue', '').textbox("readonly", false)
        $('#customer_phone').textbox('setValue', '').textbox("readonly", false)
        $('#customer_address').textbox('setValue', '').textbox("readonly", false)
        $('#btn_customer_operator').linkbutton({text: '确定保存'})

    } else if (type == 'edit') {

        $('#customer_id').val(row_data._id);
        $('#customer_name').textbox("setValue", row_data.name).textbox("readonly", false)
        $('#customer_region').combotree('setValue', {text:row_data.city, id:row_data.city}).combotree('readonly', false)
        $('#customer_principal').textbox('setValue', row_data.principal).textbox("readonly", false)
        $('#customer_phone').textbox('setValue', row_data.phone).textbox("readonly", false)
        $('#customer_address').textbox('setValue', row_data.address).textbox("readonly", false)
        $('#btn_customer_operator').linkbutton({text: '保存修改'})

    } else if (type == 'delete') {

        $('#customer_id').val(row_data._id);
        $('#customer_name').textbox("setValue", row_data.name).textbox("readonly", true)
        $('#customer_region').combotree('setValue', {text:row_data.city, id:row_data.city}).combotree('setText', row_data.city).combotree('readonly', true)
        $('#customer_principal').textbox('setValue', row_data.principal).textbox("readonly", true)
        $('#customer_phone').textbox('setValue', row_data.phone).textbox("readonly", true)
        $('#customer_address').textbox('setValue', row_data.address).textbox("readonly", true)
        $('#btn_customer_operator').linkbutton({text: '确定删除'})
    }


    $('#customer_win').window('open').window('center')

    load_product_grid(row_data);

}

function close_customer_win_form() {
    $('#customer_win').window('close')
}


let CUSTOMER_OPERATOR_TYPE = ''

function customer_operator() {
    if (CUSTOMER_OPERATOR_TYPE == 'add') {

        if (!accept()){
            alert('产品数据输入有误！')
            return;
        }

        let customerModel = new mongoose.CustomerModel()
        customerModel.name = $('#customer_name').textbox("getValue")
        customerModel.city = $('#customer_region').combotree('getValue')
        let tree = $('#customer_region').combotree('tree');
        let cityNode = tree.tree('getSelected')
        let provinceNode = tree.tree('getParent', cityNode.target)
        customerModel.province = provinceNode.text

        customerModel.principal = $('#customer_principal').textbox('getValue')
        customerModel.phone = $('#customer_phone').textbox('getValue')
        customerModel.address = $('#customer_address').textbox('getValue')
        customerModel.products = PRODUCT_GRID.datagrid('getData').rows
        console.log("新增客户：" + JSON.stringify(customerModel))
        customerModel.save({validateBeforeSave: false}, function (err) {
            if (err) return handleError(err)
            else {
                show_messager('操作成功： 客户已添加！')
                load_customer_grid(function () {
                    CUSTOMER_GRID.rows(function (idx, data, node) {
                        return data.name === customerModel.name ?
                            true : false;
                    }).select()
                })

                close_customer_win_form()
            }
        })

    } else if (CUSTOMER_OPERATOR_TYPE == 'edit') {
        if (!accept()){
            alert('产品数据输入有误！')
            return;
        }

        let id = $('#customer_id').val()
        mongoose.CustomerModel.findById(id, function (err, customer) {
            if (err) {
                alert(err)
                return
            }
            console.log(customer)
            customer.name = $('#customer_name').textbox("getValue")
            customer.city = $('#customer_region').combotree('getValue')
            customer.principal = $('#customer_principal').textbox('getValue')
            customer.phone = $('#customer_phone').textbox('getValue')
            customer.address = $('#customer_address').textbox('getValue')
            customer.products = PRODUCT_GRID.datagrid('getData').rows
            console.log("编辑后客户信息："+JSON.stringify(customer))
            customer.save({validateBeforeSave: false}, function (err) {    //{validateBeforeSave: false}很重要
                if (err) return handleError(err)
                else {
                    show_messager('操作成功： 修改已保存！')
                    load_customer_grid(function () {
                        CUSTOMER_GRID.rows(function (idx, data, node) {
                            return data.name === customer.name ?
                                true : false;
                        }).select()
                    })
                    close_customer_win_form()
                }
            })
        });

    } else if (CUSTOMER_OPERATOR_TYPE == 'delete') {

        let id = $('#customer_id').val();
        mongoose.CustomerModel.findByIdAndDelete(id, function (err, user) {
            if (err) {
                alert(err)
            } else {
                console.log("Delete sys user " + user)
                show_messager("操作成功：用户已删除！");
                load_customer_grid()
                close_customer_win_form()
            }
        })
    }
}


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

function load_product_grid(row_data) {
    console.log("loadData " + JSON.stringify(row_data))
    let new_data = [];
    if (row_data == null || typeof (row_data) == 'undefined') {
        ;
    } else {
        new_data = row_data.products
    }

    if (PRODUCT_GRID == null) {
        PRODUCT_GRID = $('#product_grid').datagrid({
            singleSelect: true,
            width: 580,
            toolbar: product_grid_toolbar,
            data: [],
            columns: product_grid_columns,
            onClickCell: onClickCell,
            onEndEdit: onEndEdit
        })
        console.log("Init product grid.")
    }


    PRODUCT_GRID.datagrid('loadData', new_data)
    reject();
}



let editIndex = undefined;

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

function onClickCell(index, field) {
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

function onEndEdit(index, row) {
    var ed = $(this).datagrid('getEditor', {
        index: index,
        field: 'name'
    });
    row.name = $(ed.target).combobox('getText');
}

function append() {
    if (endEditing()) {
        PRODUCT_GRID.datagrid('appendRow', {status: 'P'});
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
        return true;
    }
    return false;
}

function reject() {
    PRODUCT_GRID.datagrid('rejectChanges');
    editIndex = undefined;
}

function getChanges() {
    var rows = PRODUCT_GRID.datagrid('getChanges');
    alert(rows.length + ' rows are changed!');
}

*/

