function saveOrder(order, callback) {

    nextSeq("order_seq", function (orderNum) {
        order.order_num = orderNum
        OrderModel.create(order, function (err, doc) {
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
    {field: 'order_num', title: '出库单号', width: 60, align: 'center'},
    {field: 'order_date', title: '出库日期', width: 80, align: 'center'},
    {field: 'cancelled', title: '单据状态', width: 60, align: 'center',formatter: function(value,row,index){
            return row.cancelled? '<span style="color:red">作废</span>' : '正常'
        }},
    {field: 'customer_name', title: '客户名称', width: 220, align: 'center'},
    {field: 'customer_principal', title: '联系人', width: 60, align: 'center'},
    {field: 'contact_number', title: '联系电话', width: 80, align: 'center'},
    {field: 'delivery_address', title: '送货地址', width: 220, align: 'center'},
    {field: 'order_maker', title: '制单人', width: 60, align: 'center'},
    {field: 'order_driver', title: '送货司机', width: 60, align: 'center'},
    {field: 'products_num', title: '产品总数量', width: 80, align: 'center'},
    {field: 'products_sum', title: '产品总金额', width: 80, align: 'center'},
    {field: 'create_date', title: '录入时间', width: 140, align: 'center'}
]]


function productDetailFormatter(rowIndex, rowData) {
    let products = rowData.products;
    let len = products.length
    let html = '<div style="width:100%; background-color:#fff"><table class="product_detail_table">'
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

    return html += '</table></div>'
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

    // let customer = $('#customer_choose_for_order_list').textbox('getValue')
    // if (customer) {
    //     params.customer_id = customer
    // }
    let customer_name = $.trim($('#customer_choose_for_order_list').textbox('getText'))
    if (customer_name) {
        params.customer_name = {$regex:new RegExp(customer_name)}
    }

    // if (params.customer_id && params.customer_name) {
    //     params['$or'] = [{customer_id: customer_id}, {customer_name:}]
    // }

    let order_maker = $.trim($('#order_maker_searchbox').textbox('getValue'))
    if (order_maker) {
        params.order_maker = {$regex: new RegExp(order_maker)}
    }

    let order_driver = $.trim($('#order_dirver_searchbox').textbox('getValue'))
    if(order_driver) {
        params.order_driver = {$regex:new RegExp(order_driver)}
    }

    let orderState = $('#order_state').combobox('getValue')
    if (orderState != '') {
        // orderState为''，就不做查询条件
        params.cancelled = orderState
    }

    console.log("Find orders ->" +JSON.stringify(params))
    OrderModel.find(params).sort({'order_num': -1}).exec(function (err, docs) {
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
                OrderModel.findByIdAndUpdate(row._id, {cancelled: true, cancel_by: ''}, function (err, doc) {
                    //callback(doc);
                    loadOrderGrid()
                })
            }
        })
    }

}


function resetOrder() {
    $('#new_order_form').form('clear')
    // set order maker
    let current_user = localStorage.getItem('user')
    current_user = JSON.parse(current_user)
    $('#new_order_maker').textbox('setValue', current_user.name)
    // set order No.
    getCurrentSeq("order_seq", function (value) {
        $('#new_order_sale_No').html(value + 1)
    })

    //
    let t = $('#new_order_customer_name')
    if (!t.textbox('getText')) {
        t.textbox('getIcon', 0).css('visibility', 'hidden');
    }

    //
    $('#new_order_sale_date').datebox('setValue', myDateFormatter(new Date()))
    
    //
    resetOrderProductGrid(false)
}

function resetOrderProductGrid(addFirstRow) {
    deleteAllRows()
    if (addFirstRow) {
        addOrderRow()
    }
}

function endEditing() {
    if (typeof (editIndex) == 'undefined') {
        return true
    }
    if ($('#order_products_grid').datagrid('validateRow', editIndex)) {
        $('#order_products_grid').datagrid('endEdit', editIndex);
        editIndex = undefined;
        return true;
    } else {
        return false;
    }
}


function deleteOrderRow() {
    removeit()
}


function addOrderRow() {
    if (endEditing()) {
        let rows = $('#order_products_grid').datagrid('getRows');
        if (rows.length == 0 || rows.length == 1) {
            // 如果当面没有行，或者只有1行，那么追加一行
            $('#order_products_grid').datagrid('appendRow', {});
            editIndex = $('#order_products_grid').datagrid('getRows').length - 1;

        } else {
            let selectedRow = $('#order_products_grid').datagrid('getSelected');
            if (selectedRow) {
                console.log(JSON.stringify(selectedRow))
                let selectedIndex = $('#order_products_grid').datagrid('getRowIndex', selectedRow);
                if (selectedIndex == (rows.length - 1)) {
                    // 不管多少行，如果当前选中最后一行，添加最后一行
                    $('#order_products_grid').datagrid('appendRow', {});
                    editIndex = $('#order_products_grid').datagrid('getRows').length - 1;
                } else {
                    // 否则在选中行之前插入一行
                    console.log("selectedINdex" + selectedIndex)
                    $('#order_products_grid').datagrid("insertRow", { index: selectedIndex, row: {} })
                    editIndex = selectedIndex;
                }

            } else {
                //如果当前没有选中任何一行，那么在尾部添加一行，正常不会执行到这里
                $('#order_products_grid').datagrid('appendRow', {});
                editIndex = $('#order_products_grid').datagrid('getRows').length - 1;
            }
        }

        $('#order_products_grid').datagrid('selectRow', editIndex)
            .datagrid('beginEdit', editIndex);
    }
}

function removeit() {
    if (editIndex == undefined) {
        return
    }
    $('#order_products_grid').datagrid('cancelEdit', editIndex)
        .datagrid('deleteRow', editIndex);
    editIndex = undefined;
}

function deleteAllRows() {
    let rows = $('#order_products_grid').datagrid('getRows')
    for (let i = rows.length; i > 0;) {
        i--;
        $('#order_products_grid').datagrid('cancelEdit', i).datagrid('deleteRow', i)
    }
    editIndex = undefined
}

function onClickCell(index, field, value) {

    console.log("onClickCell")
    if (editIndex != index) {
        if (endEditing()) {
            $('#order_products_grid').datagrid('selectRow', index)
                .datagrid('beginEdit', index);
            var ed = $('#order_products_grid').datagrid('getEditor', { index: index, field: field });
            if (ed) {
                ($(ed.target).data('textbox') ? $(ed.target).textbox('textbox') : $(ed.target)).focus();
            }
            editIndex = index;
        } else {
            setTimeout(function () {
                $('#order_products_grid').datagrid('selectRow', editIndex);
            }, 0);
        }
    }

    event.stopPropagation();    //  阻止事件冒泡,防止响应表格panel的click事件
}

function accept() {
    if (endEditing()) {
        $('#order_products_grid').datagrid('acceptChanges');
    }

    let rows = $('#order_products_grid').datagrid('getRows')
    if (rows.length == 0) {
        return false;
    }

    //console.log("Accept rows:" +JSON.stringify(rows))
    let totalSum = 0;
    for (let i=0; i<rows.length; i++)  {
        if (rows[i].product_sum) {
            totalSum += Number(rows[i].product_sum)
        } else{
            totalSum = ''
            break;
        }
    }
    $('#products_sum').html(totalSum ? totalSum.toFixed(2) : totalSum)

    let products_num = 0;
    for (let i=0; i<rows.length; i++)  {
        if (rows[i].product_num) {
            products_num += Number(rows[i].product_num)
        } else {
            products_num = ''
            break;
        }
    }
    $('#products_num').html(products_num)

}

function doPrint() {
    accept();

    let products = $('#order_products_grid').datagrid('getRows')

    // save orders
    let customer_id = $('#new_order_customer_name').textbox('getValue');
    let customer_name = $('#new_order_customer_name').textbox('getText');
    let order_date = $('#new_order_sale_date').textbox('getText');
    //let order_num = $('#new_order_sale_No').textbox('getValue')
    let delivery_address = $('#new_order_customer_address').textbox('getValue')
    let principal = $('#new_order_customer_principal').textbox('getValue')
    let contact_number = $('#new_order_customer_phone').textbox('getValue')
    let maker = $('#new_order_maker').textbox('getValue')
    let driver = $('#driver_select').textbox('getValue')
    //let total_sum = $('#total_sum').html()

    let cancelled = false;

    let products_num = $('#products_num').html()
    let products_sum = $('#products_sum').html()

    let create_user = JSON.parse(localStorage.getItem('user')).name

    let order_data = {
        order_num: 0,//order_num,
        customer_id: customer_id,
        customer_name: customer_name,
        customer_principal: principal,
        contact_number: contact_number,
        delivery_address: delivery_address,
        order_date: order_date,
        create_date: (new Date()).dtFormat("yyyy-MM-dd hh:mm:ss.S"),
        order_maker: maker,
        order_driver: driver,
        cancelled: cancelled,
        products: products,
        products_num: products_num,
        products_sum: products_sum,
        create_user:  create_user
    }

    console.log(JSON.stringify(order_data))
    $('#win_in').html('正在保存单剧...')
    $('#win').window('open')

    setTimeout(function () {
        saveOrder(order_data, function (doc) {
            $('#win_in').html('开始打印...')
            setTimeout(function () {
                $('#win').window('close')
                preview(doc)
                //$('#win').window('close')
                //关闭打印页面，window消失
            }, 1000)
        })
    }, 1000)
}


function onLoadSuccess() {
    //let b = $('#order_products_grid').datagrid('getPanel').panel('body')
    let b = '#order_products_grid_wrapper'
    $(b).bind('click', function () {
        accept()
    })
}


function onChangePrice(newValue, oldValue) {
    var ed = $('#order_products_grid').datagrid('getEditor', { index: editIndex, field: 'product_num' });
    var ed1 = $('#order_products_grid').datagrid('getEditor', { index: editIndex, field: 'product_sum' });

    if (ed) {
        let sumValue = ''
        let num = $(ed.target).textbox('getValue')
        if (isNumber(newValue) && isNumber(num)) {
            sumValue = Number(num) * Number(newValue)
            $(ed1.target).numberbox('setValue', sumValue)
            return true;
        }
    }
    if (ed1) {
        //$(ed1.target).numberbox('clear')
        $(ed1.target).numberbox('setValue', '')
    }
       

}

function onChangeNum(newValue, oldValue) {
    var ed = $('#order_products_grid').datagrid('getEditor', { index: editIndex, field: 'product_price' });
    var ed1 = $('#order_products_grid').datagrid('getEditor', { index: editIndex, field: 'product_sum' });

    if (ed) {
        let sumValue = ''
        let price = $(ed.target).numberbox('getValue')
        if (isNumber(newValue) && isNumber(price)) {
            sumValue = Number(price) * Number(newValue)
            $(ed1.target).numberbox('setValue', sumValue)
            return true;
        }
    }
    if (ed1) {
        //$(ed1.target).numberbox('clear')
        $(ed1.target).numberbox('setValue', '')


    }

}