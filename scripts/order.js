function saveOrder(order, callback) {

    nextSeq("order_seq", function (orderNum) {
        order.order_num = orderNum
        mongoose.OrderModel.create(order, function (err, doc) {
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

let order_grid_columns = [[
    {field: 'order_num', title: '出库单号', width: 80, align: 'center'},
    {field: 'order_date', title: '出库日期', width: 80, align: 'center'},
    {field: 'cancelled', title: '单据状态', width: 80, align: 'center',formatter: function(value,row,index){
            return row.cancelled? '<span style="color:red">作废</span>' : '正常'
        }},
    {field: 'customer_name', title: '客户名称', width: 220, align: 'center'},
    {field: 'customer_principal', title: '联系人', width: 60, align: 'center'},
    {field: 'contact_number', title: '联系电话', width: 80, align: 'center'},
    {field: 'delivery_address', title: '送货地址', width: 220, align: 'center'},
    {field: 'order_maker', title: '制单人', width: 60, align: 'center'},
    {field: 'order_driver', title: '送货司机', width: 70, align: 'center'},
    {field: 'create_date', title: '录入时间', width: 80, align: 'center'}
]]


function productDetailFormatter(rowIndex, rowData) {
    let products = rowData.products;
    let len = products.length
    let html = '<table class="product_detail_table">'
    html += '<tr><th style="font-size:24px; vertical-align: top;" rowspan="' + (len + 1) + '">产品信息</th><th>产品名称</th><th>单位</th><th>数量</th><th>价格</th><th>金额</th><th>备注</th></tr>'
    for (let i = 0; i < products.length; i++) {
        html += '<tr><td>' + products[i].product_name + '</td><td>'
            //+products[i].product_model+'</td><td>'
            + products[i].product_units + '</td><td>'
            + products[i].product_num + '</td><td>'
            + products[i].product_price + '</td><td>'
            + products[i].product_sum + '</td><td>'
            + products[i].product_memo + '</td></tr>'
    }

    return html += '</table>'
}

function loadOrderGrid() {

    // load order grid
    if (ORDER_GRID == null) {
        ORDER_GRID = $('#order_grid').datagrid({
            fit: true,
            singleSelect: true,
            border: false,
            width: 800,
            showFilterBar: false,
            rownumbers: true,
            toolbar: '#order_grid_toolbar',
            title: '出库单列表',
            data: [],
            columns: order_grid_columns,
            view: detailview,
            detailFormatter: productDetailFormatter
        })
    }


    findOrders(function (docs) {
        ORDER_GRID.datagrid('loadData', docs)
        ORDER_GRID.datagrid('enableFilter', {filterMatchingType: 'any'})
    })

}

function findOrders(callback) {

    let params = {};
    let begin = $('#dd_begin').datebox('getValue')
    let end = $('#dd_end').datebox('getValue')

    if (begin && end) {
        params.order_date = {$gte: begin, $lte: end}
    }

    let customer = $('#customer_choose_for_order_list').textbox('getValue')
    if (customer) {
        params.customer_id = customer
    }

    let orderState = $('#order_state').combobox('getValue')
    if (orderState != '') {
        // orderState为''，就不做查询条件
        params.cancelled = orderState
    }

    //console.log("Find orders ->" +JSON.stringify(params))
    mongoose.OrderModel.find(params).sort({'order_num': -1}).exec(function (err, docs) {
        callback(docs)
    })

}


function doSearchOrder(input, datagrid) {
    let searchText = input.value
    datagrid.datagrid('removeFilterRule').datagrid('addFilterRule', {
        field: 'order_num',
        op: 'contains',
        value: searchText
    }).datagrid('addFilterRule', {
        field: 'order_date',
        op: 'contains',
        value: searchText
    }).datagrid('addFilterRule', {
        field: 'customer_name',
        op: 'contains',
        value: searchText
    }).datagrid('doFilter')
}


function cancelOrder(callback) {

    let row = ORDER_GRID.datagrid('getSelected')
    if(row && !row.cancelled) {
        $.messager.confirm('', '确定作废选中的出库单?', function (r) {
            if (r) {
                mongoose.OrderModel.findByIdAndUpdate(row._id, {cancelled: true, cancel_by: ''}, function (err, doc) {
                    //callback(doc);
                    loadOrderGrid()
                })
            }
        })
    }

}

