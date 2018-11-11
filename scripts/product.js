///////////////////////////////////////////产品数据表格////////////////////////////////////////////
let PRODUCT_GRID = null;

function loadProducts() {
    let title = '客户产品管理'
    let customer_id = $('#customer_choose_for_product_manage').textbox("getValue")
    let customer_name = $('#customer_choose_for_product_manage').textbox("getText")
    if (customer_id == '') {
        customer_id = null
        title = '通用产品管理'
    } else {
        customer_id = new mongoose.Types.ObjectId(customer_id)//,new mongoose.ObjectId(customer_id)
        title = '客户产品管理 - ' + customer_name
    }
    load_product_grid(customer_id, title)

}



let product_grid_toolbar = [{
    text: '添加',
    iconCls: 'icon-add',
    handler: newProduct
}, {
    text: '编辑',
    iconCls: 'icon-edit',
    handler: editProduct
}, {
    text: '删除',
    iconCls: 'icon-remove',
    handler: destroyProduct
}]

let product_grid_columns = [[
    {field: 'name', title: '品名', width: 140, align: 'center'},
    {field: 'model', title: '型号', width: 140, align: 'center'},
    {field: 'units', title: '单位', width: 80, align: 'center'},
    {field: 'price', title: '价格', width: 60, align: 'center'},
    {field: 'memo', title: '描述', width: 160, align: 'center'}
]]


function load_product_grid(customerId, title) {

    if (PRODUCT_GRID == null) {
        PRODUCT_GRID = $('#product_grid').datagrid({
            fit:true,
            singleSelect: true,
            border:false,
            width: 580,
            showFilterBar:false,
            toolbar: product_grid_toolbar,
            title:'通用产品管理',
            data: [],
            columns: product_grid_columns
        })
    }

    let params = {customer: customerId}
    mongoose.ProductModel.find(params, function(err, docs){
        PRODUCT_GRID.datagrid('loadData', docs)
    })

    if (title) {
        PRODUCT_GRID.datagrid("getPanel").panel('setTitle', title);
    }
}



let opt_type_for_product;
function newProduct(){
    $('#dlg_for_product').dialog('open').dialog('center').dialog('setTitle','添加产品信息');
    $('#fm_for_product').form('clear');
    opt_type_for_product = 'new'
}


function editProduct(){
    var row = PRODUCT_GRID.datagrid('getSelected');
    if (row){
        $('#dlg_for_product').dialog('open').dialog('center').dialog('setTitle','编辑产品信息');
        $('#fm_for_product').form('load',row);
        opt_type_for_product = 'edit'
    }
}

function saveProduct() {

    let name = $('#product_name').textbox('getValue')
    let model = $('#product_model').textbox('getValue')
    let units = $('#product_units').textbox('getValue')
    let price = $('#product_price').textbox('getValue')
    let memo = $('#product_memo').textbox('getValue')
    let product = {name: name, model: model, units:units, price: price, memo:memo}
    // get customer Id
    let customerId = $('#customer_choose_for_product_manage').textbox('getValue')
    console.log("A customerId "+customerId)
    if (customerId == '') {
        product.customer = null
    } else {
        product.customer = new mongoose.Types.ObjectId(customerId)
    }

    if (opt_type_for_product == 'new') {
        console.log("New product is: " + JSON.stringify(product))
        mongoose.ProductModel.create(product, function () {
            $('#dlg_for_product').dialog('close');
            loadProducts()
        })

    } else if (opt_type_for_product == 'edit') {
        let id = $('#product_id').val();
        console.log("Edit product is: " + JSON.stringify(product))
        // customer不能包含products字段，否则会更新.update是局部字段更新的.
        mongoose.ProductModel.findByIdAndUpdate(id, product, function () {

            $('#dlg_for_product').dialog('close');
            loadProducts()
        })
    }
}

function destroyProduct(){
    var row = PRODUCT_GRID.datagrid('getSelected');
    if (row){
        $.messager.confirm('确定','是否确定删除选中的产品?',function(r){
            if (r){
                mongoose.ProductModel.findByIdAndDelete(row._id, function(){
                    $('#dlg_for_product').dialog('close');
                    loadProducts()
                })
            }
        });
    }
}



function onDlgForCustomerClose(){
    //PRODUCT_GRID.datagrid('destroy')
    //PRODUCT_GRID = null;
}

