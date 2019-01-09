const ROLE_ADMIN = '管理员'
const ROLE_OPERATOR = '操作员'

const ORDER_GRID_TYPE_BRIEF = 1;
const ORDER_GRID_TYPE_DETAIL = 2;

const {BrowserWindow, dialog} = require('electron').remote
const {ipcRenderer} = require('electron')
const fs = require('fs');
let logger = require('electron-timber');


let win = require('electron').remote.getCurrentWindow();
win.on('maximize', function () {
    $('#to_max').hide();
    $('#to_unmax').show();
})
win.on('unmaximize', function () {
    $('#to_unmax').hide();
    $('#to_max').show();
})


$.extend($.fn.textbox.methods, {
    addClearBtn: function (jq, iconCls) {
        return jq.each(
            function () {
                var t = $(this);
                //console.log("t======" + JSON.stringify(t))
                var opts = t.textbox('options');
                opts.icons = []//opts.icons || [];  fixed
                opts.icons.unshift({
                    iconCls: iconCls,
                    handler: function (e) {
                        // console.log("Before clear:" + $(e.data.target).textbox('getText') + "-" + $(e.data.target).textbox('getValue'))
                        $(e.data.target).textbox('setValue', '').textbox('setText', '')//.textbox('textbox').focus();
                        $(this).css('visibility', 'hidden');
                        // console.log("After clear:" + $(e.data.target).textbox('getText') + "-" + $(e.data.target).textbox('getValue'))

                        if (customer_choose_dlg_type == 'list_products') {
                            loadProducts()
                        } else if (customer_choose_dlg_type == 'new_order') {
                            resetOrder()
                        }
                    }
                });
                t.textbox();
                if (!t.textbox('getText')) {
                    t.textbox('getIcon', 0).css('visibility', 'hidden');
                }
                t.textbox('textbox').bind('keyup', function () {
                    var icon = t.textbox('getIcon', 0);
                    if ($(this).val()) {
                        icon.css('visibility', 'visible');
                    } else {
                        icon.css('visibility', 'hidden');
                    }
                });
            }
        );
    }
});


function isAdmin(role) {
    return (role == ROLE_ADMIN);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function updateTitle(menu) {
    $('#main_title').html(SYS_CONFIG.company_name + KIS_NAME + " " + KIS_VERSION + '　─　' + menu)
}

function hide_all_panel() {
    $('.opt_panel').panel('close')
}

function set_tool_button_status(click_src) {
    $('.tool_button').linkbutton('enable')

    if (click_src) {
        $(click_src).linkbutton('disable')
        updateTitle($(click_src).linkbutton('options').text + '')
    }
}



function showPanel(src, manage_panel_id) {
    hide_all_panel()
    $('#'+ manage_panel_id).panel('open').panel('resize')
    $('#main_layout').layout('resize')
    set_tool_button_status(src)
}

function onShowDriverPanel(){
    DriverModel.find({}).populate('cartype').exec(function(err, docs) {
        //console.log(JSON.stringify(docs))
        let g = $('#driver_select').combogrid('grid');
        g.datagrid('loadData', docs);
    })
}

function onOpenOrderListPanel(){
    let now = new Date();
    let begin = new Date(now.getFullYear(), 0, 1);
    let end = new Date(now.getFullYear(), 11, 31);

    $('#dd_begin').datebox('setValue', myDateFormatter(begin))
    $('#dd_end').datebox('setValue', myDateFormatter(end))

    let orderGridType = localStorage.getItem("order_grid_type")
    if (orderGridType) {
        $('#order_grid_type').combobox('setValue', orderGridType+"")
    }

    loadOrderGrid()
}


/**
 * 打开系统用户管理页面触发函数
 */
function onOpenUserManagePanel() {
    // 加载角色树
    getSysRoleTree(function (data) {
        let tree = $('#role_tree').tree('loadData', data)
        loadSysUsers(tree.tree("getRoot"))
    })
}


function getSysRoleTree(callback) {
    let tree_root = { text: "所有角色", children: [] };
    RoleModel.find({}, function (err, roles) {
        for (let i = 0; i < roles.length; i++) {
            tree_root.children.push({ "text": roles[i].role })
        }
        callback([tree_root])
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
    loadCustomerGrid(null)
}


/*
function loadClassificationTree(callback) {

    let data = {text: "所有编码"}
    ClassificationModel.findOne({}, function (err, classification) {

        if (classification == null) {
            console.log("classification is null")
            callback([data]);
            return;
        }

        let arr = classification.classifications     //{classifications:[{name:"江苏",children:[]}]}
        let children = []
        for (let i = 0; i < arr.length; i++) {
            children.push(classificationToTree(arr[i]))
        }
        data.children = children
        callback([data])
    })
}

*/


/**
 * 打开产品管理页面触发函数
 */
function onOpenProductManagePanel() {
    // 加载产品列表
    loadProducts()
}

/**
 * 打开系统设置页面触发函数
 */
function onOpenSysConfigPanel(){
    // can load form localstorge
    // load configs
    ConfigModel.findOne({}, function(err,doc){
        handleError(err)
        $('#company_name').textbox('setValue', doc.company_name)
        $('#company_phone').textbox('setValue', doc.company_phone)
        $('#company_fax').textbox('setValue', doc.company_fax)
        $('#company_address').textbox('setValue', doc.company_address)
        $('#company_logo').attr('src', doc.company_logo)
    })
}


let timer
// datagrid filter的触发过滤操作
function onSearch(src, datagrid, doSearch) {
    let e=arguments.callee.caller.arguments[0]||window.event
    if (timer) {
        clearTimeout(timer);
    }
    if (e.keyCode == 13) {
        doSearch(src, datagrid)
    } else if (400) {
        timer = setTimeout(function () {
            //doSearch(src, datagrid)
            doSearch(src, datagrid)
        }, 400);
    }
}


function onCarTypeTreeContextMenu(e, node) {
    e.preventDefault();
    $(this).tree('select', node.target);
    let root = $(this).tree('getRoot')
    let mm = $('#mm_cartype')
    mm.menu('show', {
        left: e.pageX,
        top: e.pageY
    });

    let item_edit = $('#cartype_edit')[0];
    let item_append = $('#cartype_append')[0];
    let item_delete = $('#cartype_delete')[0];

    if (root == node) {
        mm.menu('enableItem', item_append)
        mm.menu('disableItem', item_edit)
        mm.menu('disableItem', item_delete)
    } else {
        mm.menu('disableItem', item_append)
        mm.menu('enableItem', item_edit)
        mm.menu('enableItem', item_delete)
    }
}


function onClassificationTreeContextMenu(e, node) {
    e.preventDefault();
    $(this).tree('select', node.target);
    let root = $(this).tree('getRoot')

    let mm = $('#mm_classification');
    mm.menu('show', {
        left: e.pageX,
        top: e.pageY
    });

    let item_edit = $('#classification_edit')[0];
    let item_append = $('#classification_append')[0];
    let item_delete = $('#classification_delete')[0];

    if (root == node) {
        mm.menu('enableItem', item_append)
        mm.menu('disableItem', item_edit)
        mm.menu('disableItem', item_delete)

    } else {
        mm.menu('disableItem', item_append)
        mm.menu('enableItem', item_edit)
        if ($(this).tree('isLeaf', node.target)) {
            mm.menu('enableItem', item_delete)
        } else {
            mm.menu('disableItem', item_delete)
        }


    }
}


function menuHandler(item) {

    switch (item.name) {
        case 'account_info':
            let u = JSON.parse(localStorage.getItem('user'))
            $.messager.alert("用户信息", '用户：' + u.name + "<br/>角色：" + u.role, 'info')
            break;
        case 'logout':
            logout();
            break;
        case 'check-update':
            setTimeout(function () {
                $.messager.alert("更新", '当前版本为最新版', 'info')
            }, 3000)
            break;
        case 'about':
            // show about
            let win_about = new BrowserWindow({
                width: 300,
                height: 200,
                modal: true,
                show: false,
                maximizable: false,
                minimizable: false,
                resizable: false,
                frame: false,
                parent: win,
                title: '关于系统',
                autoHideMenuBar: true
            })
            win_about.loadURL('file://' + __dirname + '/about.html')
            win_about.on('closed', () => {
                win_about = null
            })
            win_about.once('ready-to-show', () => {
                moveChildWindowToParentCenter(win_about, win)
                win_about.show()

            })
            break;
        case 'exit':
            //
            closeWin(true)
            break;
        case 'set_password':
            // 改弹出框'
            $('#fm_for_setpassword').form('clear')
            $('#dlg_for_setpassword').dialog('open').dialog('center')
            break;
        default:
            ;
    }
}





function showAccountMenu(e) {
    e.preventDefault();
    $('#account_info').menu('show', {
        left: e.pageX,
        top: 105
    })
}


$(function () {



    SYS_CONFIG = JSON.parse(localStorage.getItem('sys_config'))
    $('#main_title').html(SYS_CONFIG.company_name + KIS_NAME + " " + KIS_VERSION)

    $('#new_order_sale_date').datebox().datebox('calendar').calendar({
        validator: function (date) {
            var now = new Date();
            var d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            var d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 6);
            return d1 <= date && date <= d2;
        }
    });


    $('.account_logo').bind('click', function (e) {
        showAccountMenu(e)
    });

    $('#customer_choose_for_product_manage').textbox('addClearBtn', 'icon-clear');
    $('#customer_choose_for_product_manage').textbox('textbox').bind('focus', function (e) {
        open_customer_choose_for_product_manage()
    });
    $('#new_order_customer_name').textbox('addClearBtn', 'icon-clear');
    $('#new_order_customer_name').textbox('textbox').bind('focus', function (e) {
        open_customer_choose_for_new_order()
    });

    //去掉tab菜单按钮的href，防止鼠标按住拖动出现href属性
    $('.tabs li a').removeAttr('href')


    let user = JSON.parse(localStorage.getItem('user'))
    if (!isAdmin(user.role)) {
        $('#main_tabs').tabs('close', '资料管理')
        $('#main_tabs').tabs('close', '系统设置')
    }

});


function open_customer_choose_for_product_manage() {
    customer_choose_dlg_type = 'list_products'
    $('#dlg_for_customer_choose').dialog('open').dialog('center')
}

function open_customer_choose_for_new_order() {
    customer_choose_dlg_type = 'new_order'
    $('#dlg_for_customer_choose').dialog('open').dialog('center')
}

function open_customer_choose_for_list_order() {
    customer_choose_dlg_type = 'list_order'
    $('#dlg_for_customer_choose').dialog('open').dialog('center')
}





////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



function afterCompleteLoading() {
    ipcRenderer.sendSync('main-window-ready', null)
    //默认最大化窗口
    //maxWin()
}

function printPreview() {
    let row = ORDER_GRID.datagrid('getSelected')
    findOrderById(row._id, function(doc){
        if (doc) {
            preview(doc, 'list')
        }
    })
}

function maxWin() {
    if (win.isMaximized()) {
        win.unmaximize()
    }else {
        win.maximize()
    }
}

function minWin() {
    win.minimize()
}

function closeWin(slience) {
    if (slience) {
        win.close()
    } else {
        $.messager.confirm('确定', '确定要关闭应用程序吗?', function (r) { if (r) win.close() });
    }
}

function preview(order, type) {
    type = type || 'new_order'
    localStorage.setItem('order', JSON.stringify(order));
    let win_print = new BrowserWindow({
        width: 800,
        height: 550,
        modal: true,
        show: false,
        maximizable: false,
        minimizable: false,
        resizable: false,
        parent: win,
        frame: false,
        title: '打印',
        autoHideMenuBar: true
    })
    win_print.on('closed', () => {
        win_print = null

        if (type == 'new_order') {
            $.messager.confirm('', '是否继续填写出货单?', function (r) {
                if (r) {
                    resetOrder();
                } else {
                    $('#order_list_menu').click()
                }
            })

        } else if (type == 'list') {

        }
    })

    win_print.loadURL('file://' + __dirname + '/print_template.html')
    moveChildWindowToParentCenter(win_print, win)
    win_print.show()
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function logout() {
    ipcRenderer.sendSync('logout')
}

function loadLogo(src){
    dialog.showOpenDialog({filters: [{name: 'Images/png', extensions: ['png']}], properties: ['openFile']}, function(filePaths){
        if (filePaths && filePaths.length > 0) {
            let base64_src = "data:image/png;base64,"+ base64_encode(filePaths[0])
            $(src).attr('src', base64_src)
        }
    })
}


function saveCompany() {
    let company_name = $('#company_name').textbox('getValue')
    let company_phone = $('#company_phone').textbox('getValue')
    let company_fax = $('#company_fax').textbox('getValue')
    let company_address = $('#company_address').textbox('getValue')
    let company_logo = $('#company_logo').attr('src')
    ConfigModel.findOne({}, function (err, doc) {
        let update = true
        if (!doc) {
            doc = new ConfigModel()
            update = false
        }

        doc.company_name = company_name
        doc.company_phone = company_phone
        doc.company_fax = company_fax
        doc.company_address = company_address
        doc.company_logo = company_logo


        doc.save(function (err) {
            handleError(err)

            if (!err) {
                localStorage.setItem("sys_config", JSON.stringify(doc))
                SYS_CONFIG = doc
                show_msg("操作成功：信息保存成功！")
            }
        })

    })
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function show_msg(msg) {
    show_messager(msg, 'msg')
}

function show_error(msg) {
    show_messager(msg, 'error')
}

function show_messager(msg, type) {
    let bodyCls = type + '_body_cls';
    $.messager.show({
        //title:'My Title',
        width: 500,
        height: 48,
        msg: msg,
        showType: 'fade',
        showSpeed: 200,
        style: {
            right: '',
            top: 52,   //document.body.scrollTop + document.documentElement.scrollTop,
            bottom: ''
        },
        border: false,
        noheader: true,
        bodyCls: bodyCls,
        cls: 'msg_cls'
    });
}

function handleError(err) {
    if (err) {
        console.warn(err)
        show_error(JSON.stringify(err))
        return false
    }

    return true
}

function isNumber(value) {         //验证是否为数字
    var patrn = /^(-)?\d+(\.\d+)?$/;
    if (patrn.exec(value) == null || value == "") {
        return false
    } else {
        return true
    }
}

function myDateFormatter(date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    return y + '-' + (m < 10 ? ('0' + m) : m) + '-' + (d < 10 ? ('0' + d) : d)
}



function exportExcel(dg, fileName) {
    let selectRows = dg.datagrid('getSelections')
    fileName += '-'
    fileName += (new Date().toLocaleString())
    fileName += '.xls'
    if (selectRows && selectRows.length>0) {
        dg.datagrid('toExcel', {
            filename: fileName,
            rows: selectRows
        });
    } else {
        dg.datagrid('toExcel', {
            filename: fileName
        });
    }



}