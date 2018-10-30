mongoose = require("./scripts/db")


let CUSTOMER_GRID = null
function load_customer_grid() {
   load_customer_grid(null)

}

function load_customer_grid(callback) {

    if (CUSTOMER_GRID == null) {
        console.log("First time load customer datagrid.")

        CUSTOMER_GRID = $('#customer_grid').DataTable({
            data: [],
            pageLength:15,
            /*paging:false,
            "scrollY": "500px",
            "scrollCollapse": true,
            fixedHeader: true,*/
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
                }, {
                    text: '产品管理',
                    action: function (e, dt, node, config) {
                        dt.ajax.reload();
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

function show_customer_win_form(type, row_data) {
   CUSTOMER_OPERATOR_TYPE = type

    if (type=='add') {
        $('#customer_name').textbox("setValue",'')
        $('#customer_region').combotree('setValue')
        $('#customer_principal').textbox('setValue', '')
        $('#customer_phone').textbox('setValue', '')
        $('#customer_address').textbox('setValue','')

    } else if (type=='edit') {

       $('#customer_id').val(row_data._id);
        $('#customer_name').textbox("setValue",row_data.name)
        $('#customer_region').combotree('setValue', row_data.city).combotree('setText', row_data.city)
        $('#customer_principal').textbox('setValue', row_data.principal)
        $('#customer_phone').textbox('setValue', row_data.phone)
        $('#customer_address').textbox('setValue',row_data.address)

    }


   $('#customer_win').window('open').window('center')//.window('refresh')

    load_product_grid(row_data);

}

function close_customer_win_form(){
    $('#customer_win').window('close')
}


let CUSTOMER_OPERATOR_TYPE = ''
function customer_operator() {
    if (CUSTOMER_OPERATOR_TYPE == 'add') {
        let customerModel = new mongoose.CustomerModel()
        customerModel.name = $('#customer_name').textbox("getValue")
        customerModel.city = $('#customer_region').combotree('getValue')
        customerModel.principal = $('#customer_principal').textbox('getValue')
        customerModel.phone = $('#customer_phone').textbox('getValue')
        customerModel.address = $('#customer_address').textbox('getValue')
        customerModel.products = []
        console.log(JSON.stringify(customerModel))
        customerModel.save(function (err) {
            if (err) return handleError(err)
            else {
                show_messager('操作成功： 客户已添加！')


                load_customer_grid(function(){
                    CUSTOMER_GRID.rows(function ( idx, data, node ) {
                        return data.name === customerModel.name ?
                            true : false;
                    }).select()
                })


                close_customer_win_form()
            }
        })

    } else if (CUSTOMER_OPERATOR_TYPE == 'edit'){
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
            customer.save(function (err) {
                if (err) return handleError(err)
                else {
                    show_messager('操作成功： 修改已保存！')
                    load_customer_grid(function(){
                        CUSTOMER_GRID.rows(function ( idx, data, node ) {
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
},{
    text: '应用',
    iconCls: 'icon-save',
    handler: accept
},  {
    text: '撤销',
    iconCls: 'icon-undo',
    handler: reject
}]

let product_grid_columns = [[
    {field:'name', title:'品名',width:140,align:'center', editor:'textbox'},
    {field:'modal',title:'型号',width:140,align:'center', editor:'textbox'},
    {field:'units',title:'单位',width:80,align:'center',
        formatter:function(value,row){
            return row.units;
        },
        editor:{
            type:'combobox',
            options:{
                textField:'units',
                valueField:'units',
                data:mongoose.UNITS
            }
        }},
    {field:'price',title:'价格',width:60,align:'center',editor:{type:'numberbox',options:{precision:2}}},
    {field:'memo',title:'描述',width:140,editor:'textbox'}
]]

function load_product_grid(row_data) {
    console.log("loadData "+ JSON.stringify(row_data))
    let new_data = [];
    if (row_data==null || typeof (row_data) == 'undefined') {
        ;
    } else {
        new_data = row_data.products
    }

    if (PRODUCT_GRID == null) {
        PRODUCT_GRID = $('#product_grid').datagrid({singleSelect: true,
            width:580,
                toolbar: product_grid_toolbar,
                data: [],
                columns:product_grid_columns,
                onClickCell: onClickCell,
                onEndEdit: onEndEdit
        })
        console.log("Init product grid.")
    }


    PRODUCT_GRID.datagrid('loadData', new_data)
}


let editIndex = undefined;
function endEditing(){
    if (editIndex == undefined){return true}
    if (PRODUCT_GRID.datagrid('validateRow', editIndex)){
        PRODUCT_GRID.datagrid('endEdit', editIndex);
        editIndex = undefined;
        return true;
    } else {
        return false;
    }
}
function onClickCell(index, field){
    if (editIndex != index){
        if (endEditing()){
            PRODUCT_GRID.datagrid('selectRow', index)
                .datagrid('beginEdit', index);
            var ed = PRODUCT_GRID.datagrid('getEditor', {index:index,field:field});
            if (ed){
                ($(ed.target).data('textbox') ? $(ed.target).textbox('textbox') : $(ed.target)).focus();
            }
            editIndex = index;
        } else {
            setTimeout(function(){
                PRODUCT_GRID.datagrid('selectRow', editIndex);
            },0);
        }
    }
}
function onEndEdit(index, row){
    var ed = $(this).datagrid('getEditor', {
        index: index,
        field: 'name'
    });
    row.name = $(ed.target).combobox('getText');
}
function append(){
    if (endEditing()){
        PRODUCT_GRID.datagrid('appendRow',{status:'P'});
        editIndex = PRODUCT_GRID.datagrid('getRows').length-1;
        PRODUCT_GRID.datagrid('selectRow', editIndex)
            .datagrid('beginEdit', editIndex);
    }
}
function removeit(){
    if (editIndex == undefined){return}
    PRODUCT_GRID.datagrid('cancelEdit', editIndex)
        .datagrid('deleteRow', editIndex);
    editIndex = undefined;
}
function accept(){
    if (endEditing()){
        PRODUCT_GRID.datagrid('acceptChanges');
    }
}
function reject(){
    PRODUCT_GRID.datagrid('rejectChanges');
    editIndex = undefined;
}
function getChanges(){
    var rows = PRODUCT_GRID.datagrid('getChanges');
    alert(rows.length+' rows are changed!');
}

