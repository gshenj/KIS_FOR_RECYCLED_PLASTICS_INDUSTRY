function set_tool_butoon_status(click_src) {
    $('.tool_button').linkbutton('enable')
    $(click_src).linkbutton('disable')
    document.title = DOCUMENT_TITLE + '　──　' + $(click_src).linkbutton('options').text + ''
}

function show_order_input(src) {
    hide_others()
    $('#order_input_panel').panel('open').panel('resize')
    $('#main_layout').layout('resize')
    //load_customer_grid();
    // $('#order_input_toolbar').show()

    set_tool_butoon_status(src)

}

function show_orders_list(src) {
    hide_others()
    $('#orders_grid_panel').panel('open').panel('resize')
    $('#main_layout').layout('resize')
    // load_customer_grid();

    set_tool_butoon_status(src)

}


function show_orders_chart(src) {

    set_tool_butoon_status(src)
}

function show_customer_manage(src) {
    hide_others()
    $('#customer_manage_panel').panel('open').panel('resize')
    $('#main_layout').layout('resize')
    // load_customer_grid();
    set_tool_butoon_status(src)
}

function show_product_manage(src) {
    hide_others()
    $('#product_manage_panel').panel('open').panel('resize')
    $('#main_layout').layout('resize')
    //load_customer_grid();
    set_tool_butoon_status(src)
}

function show_user_manage(src) {
    hide_others()
    $('#user_manage_panel').panel('open').panel('resize')
    $('#main_layout').layout('resize')
    // load_user_datagrid()
    set_tool_butoon_status(src)
}


function hide_others() {
    $('.opt_panel').panel('close')
    // $('.page_toolbar').hide()
}


/**
 * 打开系统用户管理页面触发函数
 */
function onOpenUserManagePanel() {
    // 加载角色树
    mongoose.getSysRoleTreeData(function (data) {
        let tree = $('#role_tree').tree('loadData', data)
        loadSysUsers(tree.tree("getRoot"))
    })
}


/**
 * 打开客户管理页面触发函数
 */
function onOpenCustomerManagePanel() {
    // 加载分类树
    loadClassifications(function (data) {
        $('#classification_tree').tree('loadData', data)
    })

    // 加载客户列表
    console.log("Load customers")
    loadCustomerGrid(null)
}

/**
 * 打开产品管理页面触发函数
 */
function onOpenProductManagePanel() {
    // 加载产品列表
    loadProducts()
}
function loadProducts(){
    // customerId
    var customerId = $('#customer_choose_for_product_manage').textbox('getValue')
    if (customerId) {
        // load customer products
        mongoose.ProductModel.find({'customer':customerId}, function(err, docs){
            $('#product_grid').datagrid("loadData", docs)
        })
        $('#product_grid_panel').panel('setTitle', '客户产品管理')
    } else {
        // load global products
        mongoose.ProductModel.find({'customer':null}, function(err, docs){
            $('#product_grid').datagrid("loadData", docs)
        })
        $('#product_grid_panel').panel('setTitle', '通用产品管理')

    }


}