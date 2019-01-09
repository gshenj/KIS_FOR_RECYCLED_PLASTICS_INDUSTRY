let ORDER_GRID = null;
let LAST_GRID_TYPE = 0;


//键盘上下键选中行
$.extend($.fn.datagrid.methods, {
    keyCtr : function (jq) {
        return jq.each(function () {
            var grid = $(this);
            grid.datagrid('getPanel').panel('panel').attr('tabindex', 1).bind('keydown', function (e) {
                switch (e.keyCode) {
                    case 38: // up
                        var selected = grid.datagrid('getSelected');
                        if (selected) {
                            var index = grid.datagrid('getRowIndex', selected);
                            grid.datagrid("unselectAll")
                            grid.datagrid('selectRow', index - 1);
                        } else {
                            var rows = grid.datagrid('getRows');
                            grid.datagrid('selectRow', rows.length -1 );
                        }
                        break;
                    case 40: // down
                        var selected = grid.datagrid('getSelected');
                        if (selected) {
                            var index = grid.datagrid('getRowIndex', selected);
                            grid.datagrid("unselectAll")
                            grid.datagrid('selectRow', index + 1);
                        } else {
                            grid.datagrid('selectRow', 0);
                        }
                        break;
                    case 13:
                        printPreview()
                        break;
                }
            });
        });
    },
    unKeyCtr: function(jq) {
        return jq.each(function () {
            var grid = $(this);
            grid.datagrid('getPanel').panel('panel').attr('tabindex', 1).unbind('keydown')
        });
    }
});


function getCurrentSeq(seq_name, callback) {
    SequenceModel.findOne({ "seq_name": seq_name }, function (err, doc) {
        if (doc) {
            callback(doc.value)
        } else {
            SequenceModel.create({ 'seq_name': seq_name, value: 100000 }, function (err, doc) {
                callback(doc.value)
            })
        }
    })
}

function nextSeq(seq_name, callback) {
    SequenceModel.findOneAndUpdate({ "seq_name": seq_name }, { $inc: { value: 1 } }, function (err, doc) {
        if (doc) {
            callback(doc.value)
        }
    })
}

function saveOrder(order, callback) {
    nextSeq("order_seq", function (orderNum) {
        order.order_num = orderNum
        OrderModel.create(order, function (err, doc) {
            if (err) handleError(err)
            if (doc) {
                debug("保存订单成功！")
                //console.log(JSON.stringify(doc))
                callback(doc)
            }
        })
    })
}

let order_grid_columns = [[
    {field: 'order_num', title: '销售单号', width: 60, align: 'center'},
    {field: 'order_date', title: '销售日期', width: 80, align: 'center'},
    {
        field: 'state', title: '单据状态', width: 60, align: 'center', formatter: function (value, row, index) {
            return row.state==STATE_CANCELLED ? '<span style="color:red">'+row.state+'</span>' : row.state
        }
    },
    {field: 'customer_name', title: '客户名称', width: 160, align: 'left', halign:'center'},
    {field: 'customer_principal', title: '联系人', width: 60, align: 'left', halign:'center'},
    {field: 'contact_number', title: '联系电话', width: 80, align: 'left', halign:'center'},
    {field: 'delivery_address', title: '送货地址', width: 180, align: 'left', halign:'center'},
    {field: 'order_maker', title: '制单人', width: 60, align: 'left', halign:'center'},
    {field: 'order_driver', title: '送货司机', width: 80, align: 'left', halign:'center'},
    {field: 'products_num', title: '单据总数量', width: 80, align: 'right',halign:'center'},
    {field: 'products_sum', title: '单据总金额', width: 80, align: 'right',halign:'center'},
    {field: 'create_date', title: '录入时间', width: 140, align: 'right',halign:'center'}/*,
    {field: 'products', title:'产品列表', width:80, align:'center', halign:'center', formatter:function (value, row, index) {
            return  '<a href="#" onclick="showDetail()" >产品...</a>'
        }
    }*/
]]

let order_grid_columns2 = [[
    {field: 'order_num', title: '销售单号', width: 60, align: 'center'},
    {field: 'order_date', title: '销售日期', width: 80, align: 'center'},
    {
        field: 'state', title: '单据状态', width: 60, align: 'center', formatter: function (value, row, index) {
            return row.state==STATE_CANCELLED ? '<span style="color:red">'+row.state+'</span>' : row.state
        }
    },
    {field: 'customer_name', title: '客户名称', width: 160, align: 'left', halign:'center'},
    {field: 'product_name', title:'产品&型号', width:150, align:'left', halign:'center'},
    {field: 'product_units', title:'单位', width:60, align:'left', halign:'center'},
    {field: 'product_num', title:'数量', width:60, align:'right', halign:'center'},
    {field: 'product_price', title:'价格', width:60, align:'right', halign:'center'},
    {field: 'product_sum', title:'金额', width:70, align:'right', halign:'center'},
    {field: 'product_memo', title:'产品备注', width:100, align:'left', halign:'center'},
    {field: 'customer_principal', title: '联系人', width: 60, align: 'left', halign:'center'},
    {field: 'contact_number', title: '联系电话', width: 80, align:'left', halign: 'center'},
    {field: 'delivery_address', title: '送货地址', width: 180, align: 'left',halign:'center'},
    {field: 'order_maker', title: '制单人', width: 60, align: 'left', halign:'center'},
    {field: 'order_driver', title: '送货司机', width: 60, align: 'left',halign:'center'},
    {field: 'products_num', title: '单据总数量', width: 80, align: 'right',halign:'center'},
    {field: 'products_sum', title: '单据总金额', width: 80, align: 'right',halign:'center'},
    {field: 'create_date', title: '录入时间', width: 140, align: 'right',halign:'center'}
]]


function productDetailFormatter(rowIndex, rowData) {
    let products = rowData.products;
    let len = products.length
    let html = '<div style="width:100%; background-color:#fff; padding:5px 0px;"><table class="product_detail_table">'
    html += '<tr><th  style="font-size:24px; border:none; vertical-align: top;" rowspan="' + (len + 1) + '">产品信息</th><th>产品名称</th><th>单位</th><th>数量</th><th>价格</th><th>金额</th><th>备注</th></tr>'
    for (let i = 0; i < products.length; i++) {
        html += '<tr><td>' + products[i].product_name + '</td><td class="center_align">'
            //+products[i].product_model+'</td><td>'
            + products[i].product_units + '</td><td class="right_align">'
            + products[i].product_num + '</td><td class="right_align">'
            + products[i].product_price + '</td><td class="right_align">'
            + products[i].product_sum + '</td><td>'
            + products[i].product_memo + '</td></tr>'
    }

    return html += '</table></div>'
}


function changeGridType(newValue, oldValue) {
    loadOrderGrid()
}

function getGridType() {
    return $('#order_grid_type').combobox('getValue');
}

function loadOrderGrid() {

    let gridType = getGridType()

    if (LAST_GRID_TYPE != gridType) {
        if (ORDER_GRID)
            ORDER_GRID.datagrid('unKeyCtr')

        ORDER_GRID = null;
    }

    if (ORDER_GRID == null) {
        logger.log("* orderGridType is " + gridType)
        ORDER_GRID = $('#order_grid').datagrid({
            fit: true,
            //singleSelect: true,
            ctrlSelect:true,
            border: false,
            showFilterBar: false,
            rownumbers: true,
            toolbar: '#order_grid_toolbar',
            title: '出库单列表',
            data: [],
            onDblClickRow: onDblClickOrderGridRow,
            columns: getGridType()==1 ? order_grid_columns : order_grid_columns2
            //view: detailview,
            //detailFormatter: productDetailFormatter
        })

        ORDER_GRID.datagrid("keyCtr");

        LAST_GRID_TYPE = gridType
        localStorage.setItem("order_grid_type", gridType)
    }

    findOrders(function (docs) {
        let docsRows = null;
        let gridType = getGridType()
        if (gridType == ORDER_GRID_TYPE_BRIEF) {
            docsRows = docs

        } else {
            docsRows = []
            for (let i=0; i<docs.length; i++) {
                let products = docs[i].products
                delete docs[i].products
                for (let j=0; j<products.length; j++) {
                    let newDoc = jQuery.extend({}, docs[i], products[j]);
                    docsRows.push(newDoc)
                }
            }
        }
        ORDER_GRID.datagrid('loadData', docsRows)
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

    let customer_name = $.trim($('#customer_choose_for_order_list').textbox('getText'))
    if (customer_name) {
        params.customer_name = {$regex: new RegExp(customer_name)}
    }

    let order_maker = $.trim($('#order_maker_searchbox').textbox('getValue'))
    if (order_maker) {
        params.order_maker = {$regex: new RegExp(order_maker)}
    }

    let order_driver = $.trim($('#order_dirver_searchbox').textbox('getValue'))
    if (order_driver) {
        params.order_driver = {$regex: new RegExp(order_driver)}
    }

    let orderState = $('#order_state').combobox('getValue')
    if (orderState != '') {
        // orderState为''，就不做查询条件
        params.state = orderState
    }

    OrderModel.find(params).populate('created_by', "name" /*只显示用户的name属性*/).sort({'order_num': -1}).exec(function (err, docs) {
        callback(docs)
    })

}

function onDblClickOrderGridRow(index, row) {
    printPreview();
    //logger.log(JSON.stringify(row))
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
    })

    if (getGridType() == ORDER_GRID_TYPE_DETAIL) {
        datagrid.datagrid('addFilterRule', {
            field: 'product_name',
            op: 'contains',
            value: searchText
        })
    }

    datagrid.datagrid('doFilter')
}


function findOrderById(id, callback) {
    OrderModel.findById(id, function(err, doc) {
        callback(doc)
    })
}

function cancelOrder(callback) {

    let row = ORDER_GRID.datagrid('getSelected')
    if (!row) {
        $.messager.alert('操作失败', '请选择单据')
        return;
    }
    if (row.state==STATE_CANCELLED) {
        $.messager.alert('操作失败', '单据已经作废，无法重复操作')
        return;
    }

    // 用户只能作废自己开的单据，管理员可以作废所有人开的单据
    let user = getCurrentUser()
    if (user.role == ROLE_OPERATOR && (row.created_by) && row.created_by._id != user._id) {
        console.log('Not allow to cancel order created by other users.')
        $.messager.alert('操作失败', '无法作废其他账号生成的单据')
        return false;
    }

    $.messager.confirm('作废', '确定作废单号'+ row.order_num + '的出库单?', function (r) {
        if (r) {
            OrderModel.findByIdAndUpdate(row._id, {state: STATE_CANCELLED, cancel_by: user.name+'('+user._id+')'}, function (err, doc) {
                loadOrderGrid()
            })
        }
    })
}


function resetOrder() {
    $('#new_order_form').form('clear')
    let current_user = localStorage.getItem('user')
    current_user = JSON.parse(current_user)
    $('#new_order_maker').textbox('setValue', current_user.name)
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

    $('#products_num').html("")
    $('#products_sum').html("")
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
                    $('#order_products_grid').datagrid("insertRow", {index: selectedIndex, row: {}})
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

    if (editIndex != index) {
        if (endEditing()) {
            $('#order_products_grid').datagrid('selectRow', index)
                .datagrid('beginEdit', index);
            var ed = $('#order_products_grid').datagrid('getEditor', {index: index, field: field});
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
    let accept_ok = false
    if (endEditing()) {
        $('#order_products_grid').datagrid('acceptChanges');
        accept_ok = true;
    }

    let rows = $('#order_products_grid').datagrid('getRows')
    if (rows.length > 0) {

        //console.log("Accept rows:" +JSON.stringify(rows))
        let totalSum = 0;
        for (let i = 0; i < rows.length; i++) {
            if (rows[i].product_sum) {
                totalSum += Number(rows[i].product_sum)
            } else {
                totalSum = ''
                break;
            }
        }
        $('#products_sum').html(totalSum ? totalSum.toFixed(2) : totalSum)

        let products_num = 0;
        for (let i = 0; i < rows.length; i++) {
            if (rows[i].product_num) {
                products_num += Number(rows[i].product_num)
            } else {
                products_num = ''
                break;
            }
        }
        $('#products_num').html(products_num)
    }

    return accept_ok;
}

function doPrint() {
    let customer_id = $('#new_order_customer_name').textbox('getValue');
    let customer_name = $('#new_order_customer_name').textbox('getText');

    if (customer_id && customer_name) {
        if (!accept()) {
            console.log("产品输入信息缺少或者有误！")
            return false;
        }

    } else {
        console.log("没有输入客户信息！")
        return false;
    }


    let products = $('#order_products_grid').datagrid('getRows')
    if (products.length <= 0) {
        console.log("没有输入产品信息！")
        return false;
    }

    // save orders
    let order_date = $('#new_order_sale_date').textbox('getText');
    //let order_num = $('#new_order_sale_No').textbox('getValue')
    let delivery_address = $('#new_order_customer_address').textbox('getValue')
    let principal = $('#new_order_customer_principal').textbox('getValue')
    let contact_number = $('#new_order_customer_phone').textbox('getValue')
    let maker = $('#new_order_maker').textbox('getValue')
    let driver = $('#driver_select').combobox('getText')
    //let total_sum = $('#total_sum').html()

    let products_num = $('#products_num').html()
    let products_sum = $('#products_sum').html()

    let user = getCurrentUser();
    let create_user = user.name
    let created_by = user._id

    let order_data = {
        order_num: 0,//order_num,
        customer_id: customer_id,
        customer_name: customer_name,
        customer_principal: principal,
        contact_number: contact_number,
        delivery_address: delivery_address,
        order_date: order_date,
        create_date: (new Date()).dtFormat("yyyy-MM-dd hh:mm:ss"),
        order_maker: maker,
        order_driver: driver,
        state: STATE_OK,
        products: products,
        products_num: products_num,
        products_sum: products_sum,
        create_user: create_user,
        created_by: created_by
    }

    //console.log(JSON.stringify(order_data))
    $('#win_in').html('正在保存单剧...')
    $('#win').window('open').window('center')

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
    let b = '#order_products_grid_wrapper'
    $(b).bind('click', function () {
        accept()
    })
}

function onChangePrice(newValue, oldValue) {
    var ed = $('#order_products_grid').datagrid('getEditor', {index: editIndex, field: 'product_num'});
    var ed1 = $('#order_products_grid').datagrid('getEditor', {index: editIndex, field: 'product_sum'});

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
    let ed = $('#order_products_grid').datagrid('getEditor', {index: editIndex, field: 'product_price'});
    let ed1 = $('#order_products_grid').datagrid('getEditor', {index: editIndex, field: 'product_sum'});

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
        $(ed1.target).numberbox('setValue', '')
    }

}



function onOpenOrderReportPanel() {
}


function calcSum() {
    let totalNum = 0;
    let totalSum = 0;
    let rows = ORDER_GRID.datagrid('getSelections');
    if (rows && rows.length > 0) {
        ;
    } else {
        rows = ORDER_GRID.datagrid('getRows')
    }

    let gridType = getGridType()
    if (gridType == ORDER_GRID_TYPE_DETAIL) {
        for (let i=0; i<rows.length; i++) {
            if (rows[i].product_num)
                totalNum += rows[i].product_num;
            if (rows[i].product_sum)
                totalSum += Number(rows[i].product_sum);
        }

        $.messager.alert("统计", '产品数量：' + totalNum+ "<br/>产品金额：" +Number(totalSum).toFixed(2), 'info')

    } else {
        for (let i=0; i<rows.length; i++) {
            if (rows[i].products_num)
                totalNum += rows[i].products_num;
            if (rows[i].products_sum)
                totalSum += Number(rows[i].products_sum);
        }
        $.messager.alert("统计", '单据总数量：' + totalNum+ "<br/>单据总金额：" +Number(totalSum).toFixed(2), 'info')

    }


}

