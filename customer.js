mongoose = require("./scripts/db")
mongoose.set('useFindAndModify', false)


let CUSTOMER_GRID = null
let enable_customer_filter = false

let editIndex = undefined;

function loadCustomerGrid(node) {


    let t = $('#classification_tree')
    if (node == null) {
        node = t.tree('getSelected')
    }

    let rootNode = t.tree('getRoot')

    let params = {}
    if (node == null || node == rootNode) {

    } else if (t.tree('isLeaf', node.target)){
        console.log("Select classification node is a leaf.")
        params.classification = node.text;
    } else {
        let arr = [node.text]
        let children = t.tree('getChildren', node.target)
        // children包含所有子节点
        for (let i=0; i<children.length; i++) {
            arr.push(children[i].text)
        }
        params.classification = {$in: arr}
    }

    console.log("Classification params is "+JSON.stringify(params))


    if (CUSTOMER_GRID == null) {
        console.log("First time load customer grid.")
        CUSTOMER_GRID = $('#grid_for_customer').datagrid({
            fit: true,
            singleSelect: true,
            collapsible: false,
            data: [],
            border:false,
            remoteSort:false,
            multiSort:true,
            showFilterBar:false,
            rownumbers:true,
            title:'<span style="font-weight: bold">客户列表</span>',
            width:720,
            toolbar: '#customer_grid_toolbar',
            columns:[[
                {title: "客户编码", field: 'classification',width:100, sortable: true,sortOrder: 'asc'},
                {title: "客户名称", field: 'name', width:250, sortable:true, sortOrder: 'asc'},
                {title: "客户简码", field: 'index_code', width:80, sortable:true, sortOrder: 'asc'},
                {title: "联系人", field: "principal",width:100},
                {title: "联系电话", field: 'phone',width:100},
                {title: "联系地址", field: 'address',width:250}
            ]]
        })
        enable_customer_filter = false;
    }

    if (params == null) {
        params = {}
    }
    mongoose.CustomerModel.find(params, function (err, docs) {
        CUSTOMER_GRID.datagrid('loadData', docs)
        CUSTOMER_GRID.datagrid('enableFilter', {filterMatchingType:'any'})
    })
}


let opt_type_for_customer;
function newCustomer(){
    $('#dlg_for_customer').dialog('open').dialog('center').dialog('setTitle','添加客户');
    $('#fm_for_customer').form('clear');
    let node = $('#classification_tree').tree('getSelected')
    if (node != null) {
        let rootNode = $('#classification_tree').tree('getRoot')
        if (node != rootNode) {
            $('#customer_classification').combotree('setValue', {id:node.text, text:node.text})
        }
    }

    //load_product_grid(null)

    opt_type_for_customer = 'new'
}


function editCustomer(){
    var row = CUSTOMER_GRID.datagrid('getSelected');
    if (row){
        $('#dlg_for_customer').dialog('open').dialog('center').dialog('setTitle','修改客户');
        console.log("ROw"+JSON.stringify(row))
        $('#fm_for_customer').form('load',row);

        // 加载客户产品表格
        //load_product_grid(row)
        // url = 'update_user.php?id='+row.id;
        opt_type_for_customer = 'edit'
    }
}

//todo
function saveCustomer() {

    let name = $('#customer_name').textbox('getValue')
    let classification = $('#customer_classification').combotree('getValue')
    let principal = $('#customer_principal').textbox('getValue')
    let phone = $('#customer_phone').textbox('getValue')
    let address = $('#customer_address').textbox('getValue')
    let index_code = $('#customer_index_code').textbox('getValue')
   // let products = PRODUCT_GRID.datagrid('getData').rows

    let customer = {name: name, classification: classification ,
        index_code:index_code, principal: principal, phone:phone, address:address}

    if (opt_type_for_customer == 'new') {
        //customer.products = []
        console.log("New customer is: " + JSON.stringify(customer))
        mongoose.CustomerModel.create(customer, function () {

            $('#dlg_for_customer').dialog('close');
            loadCustomerGrid(null)

        })

    } else if (opt_type_for_customer == 'edit') {
        let customerId = $('#customer_id').val();
        //customer._id = customer_id;
        console.log("Edit customer is: " + JSON.stringify(customer))
        // customer不能包含products字段，否则会更新.update是局部字段更新的.
        mongoose.CustomerModel.findByIdAndUpdate(customerId, customer, function () {

            $('#dlg_for_customer').dialog('close');
            loadCustomerGrid(null)
        })
    }
}

function destroyCustomer(){
    var row = CUSTOMER_GRID.datagrid('getSelected');
    if (row){
        $.messager.confirm('确定','是否确定删除选中的用户?',function(r){
            if (r){
                mongoose.CustomerModel.findByIdAndDelete(row._id, function(){
                    $('#dlg_for_customer').dialog('close');
                    loadCustomerGrid(null)
                })

            }
        });
    }
}


function showClassificationCombotree(){
    loadClassifications(function (data) {
        $('#customer_classification').combotree('loadData', data)
    });
}


function beforeSelectClassificationCombotree(node){
    console.log(JSON.stringify(node));
    if (typeof(node.id) == 'undefined') {

        console.log("选中编码分类根节点")
        //$.messager.alert({title:"警告", msg:"请选择城市", zIndex:1000000})
        // $('#customer_region').combo('showPanel')
        return false;
    }

    return true

}



function exportExcel() {
    CUSTOMER_GRID.datagrid('toExcel','客户列表.xls');
}




let timer
function onSearch(src, datagrid) {
    let e=arguments.callee.caller.arguments[0]||window.event

    if (timer) {
        clearTimeout(timer);
    }
    if (e.keyCode == 13) {
        doSearch(src, datagrid)
    } else if (400) {
        timer = setTimeout(function () {
            doSearch(src, datagrid)
        }, 400);
    }
}

function doSearch(input, datagrid) {
    let searchText = input.value
    datagrid.datagrid('removeFilterRule').datagrid('addFilterRule', {
        field: 'index_code',
        op: 'contains',
        value: searchText
    },{
        field: 'name',
        op: 'contains',
        value: searchText
    }).datagrid('addFilterRule', {
        field: 'classification',
        op: 'contains',
        value: searchText
    }).datagrid('addFilterRule', {
        field: 'principal',
        op: 'contains',
        value: searchText
    }).datagrid('addFilterRule', {
        field: 'phone',
        op: 'contains',
        value: searchText
    }).datagrid('addFilterRule', {
        field: 'address',
        op: 'contains',
        value: searchText
    }).datagrid('doFilter')
}


