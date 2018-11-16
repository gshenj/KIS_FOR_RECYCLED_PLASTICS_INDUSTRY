function saveOrder(order, callback) {

    nextSeq("order_seq", function(orderNum){
        order.order_num = orderNum
        mongoose.OrderModel.create(order, function(err, doc) {
            if (err) handleError(err)
            if (doc) {
                console.log("保存订单成功！")
                console.log(JSON.stringify(doc))
                callback(doc)
            }
        })
    })
}


let ORDER_GRID = null;
let order_grid_toolbar = [{
    text: '',
    iconCls: 'icon-add',
    handler: newProduct
}, {
    text: '打印',
    iconCls: 'icon-edit',
    handler: editProduct
}, {
    text: '导出excel',
    iconCls: 'icon-remove',
    handler: destroyProduct
}]

let order_grid_columns = [[
    {field: 'order_num', title: '出库单号', width: 80, align: 'center'},
    {field: 'order_date', title: '出库日期', width: 80, align: 'center'},
    {field: 'customer_name', title: '客户名称', width: 220, align: 'center'},
    {field: 'customer_principal', title: '联系人', width: 60, align: 'center'},
    {field: 'contact_number', title: '联系电话', width: 80, align: 'center'},
    {field: 'delivery_address', title: '送货地址',  width: 220, align: 'center'},
    {field: 'order_maker', title: '制单人',  width: 60, align: 'center'},
    {field: 'order_driver', title: '送货司机',  width: 70, align: 'center'},
    {field: 'create_date', title: '录入时间',  width: 80, align: 'center'},
    {field: 'cancelled', title: '状态', width: 40, align: 'center'}
]]



function doSearchOrders(){

    // load order grid
    if (ORDER_GRID==null) {
        ORDER_GRID = $('#order_grid').datagrid({
            fit:true,
            singleSelect: true,
            border:false,
            width: 800,
            showFilterBar:false,
            toolbar: order_grid_toolbar,
            title:'出库单列表',
            data: [],
            columns: order_grid_columns
        })
    }


    findOrders(function(docs) {
        $('#order_grid').datagrid('loadData', docs)
    })
}

function findOrders(callback){

    let params = {};
    let begin = $('#dd_begin').datebox('getValue')
    let end = $('#dd_end').datebox('getValue')

    if (begin && end) {
        params.order_date = {$gte: begin, $lte: end}
    }

    let customer = $('#customer_choose_for_order_list').textbox('getValue')
    if(customer) {
        params.customer_id = customer
    }

    let orderState = $('#order_state').combobox('getValue')
    if (orderState) {
        // orderState为''，就不做查询条件
        params.cancelled = orderState
    }

    console.log("Find orders ->" +JSON.stringify(params))
    mongoose.OrderModel.find(params).sort({'order_date':-1}).exec(function(err, docs){

        //console.log("Docs -> "+JSON.stringify(docs))
        callback(docs)
    })

}