function onShowDriverPanel(){
    mongoose.DriverModel.find({}, function(err, docs) {
        //console.log(JSON.stringify(docs))
        var g = $('#driver_select').combogrid('grid');
        g.datagrid('loadData', docs);
    })
}

function show_panel(src, manage_panel_id) {
    hide_all_panel()
    $('#'+ manage_panel_id).panel('open').panel('resize')
    $('#main_layout').layout('resize')
    set_tool_button_status(src)
}

function hide_all_panel() {
    $('.opt_panel').panel('close')
}

function set_tool_button_status(click_src) {
    $('.tool_button').linkbutton('enable')
    $(click_src).linkbutton('disable')

    document.title = DOCUMENT_TITLE_PREFIX + '　─　' + $(click_src).linkbutton('options').text + ''
}



ORDER_GRID = null;
function onOpenOrderListPanel(){
    var now = new Date();
    var begin = new Date(now.getFullYear(), 0, 1);
    var end = new Date(now.getFullYear(), 11, 31);

    $('#dd_begin').datebox('setValue', myDateFormatter(begin))
    $('#dd_end').datebox('setValue', myDateFormatter(end))

    loadOrderGrid()
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

/**
 * 打开系统设置页面触发函数
 */
function onOpenSysConfigPanel(){

    // can load form localstorge
    // load configs
    mongoose.ConfigModel.findOne({}, function(err,doc){
        handleError(err)
        $('#company_name').textbox('setValue', doc.company_name)
        $('#company_phone').textbox('setValue', doc.company_phone)
        $('#company_fax').textbox('setValue', doc.company_fax)
        $('#company_address').textbox('setValue', doc.company_address)
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

function exportExcel(datagrid, filename) {
    datagrid.datagrid('toExcel',filename);
}


let DRIVER_GRID = null
function onOpenDriverManagePanel() {
    // load driver grid
    loadDriverGrid()

}

function loadDriverGrid(params){
    if (DRIVER_GRID == null) {
        DRIVER_GRID = $('#driver_grid').datagrid({
            fit: true,
            border:false,
            //style:{marginTop:0, marginLeft:'auto', marginRight:'auto'},
            height:'100%',
            singleSelect: true,
            collapsible: false,
            data: [],
            remoteSort:false,
            multiSort:true,
            //showFilterBar:false,
            rownumbers:true,
            title:'<span style="font-weight: bold">司机列表</span>',
            width:800,
            toolbar: [{
                text: '添加',
                iconCls: 'icon-add',
                handler: newDriver
            }, {
                text: '编辑',
                iconCls: 'icon-edit',
                handler: editDriver
            },{
                text: '删除',
                iconCls: 'icon-remove',
                handler: destroyDriver
            }],
            columns:[[
                {title: "姓名", field: 'name',width:70, sortable: true,sortOrder: 'asc'},
                {title: "车型载重", field: 'car_type',width:120, sortable: true,sortOrder: 'asc'},
                {title: "车牌号码", field: 'car_No', width:80, sortable:true, sortOrder: 'asc'},
                {title: "身份证号", field: 'id_No',width:140},
                {title: "行驶证号", field: 'driving_license_No',width:140},
                {title: "联系电话", field: 'phone', width:100},
                {title: "家庭住址", field: "address",width:250}
            ]]
        })
    }

    if (params == null) {
        params = {}
    }
    mongoose.DriverModel.find(params, function (err, docs) {
        DRIVER_GRID.datagrid('loadData', docs)
        //DRIVER_GRID.datagrid('enableFilter', {filterMatchingType:'any'})
    })
}

let opt_type_for_driver;
function newDriver(){
    $('#dlg_for_driver').dialog('open').dialog('center').dialog('setTitle','添加司机信息');
    $('#fm_for_driver').form('clear');
    opt_type_for_driver = 'new'
}


function editDriver(){
    var row = DRIVER_GRID.datagrid('getSelected');
    if (row){
        $('#dlg_for_driver').dialog('open').dialog('center').dialog('setTitle','编辑司机信息');
        $('#fm_for_driver').form('load',row);
        opt_type_for_driver = 'edit'
    }
}

function saveDriver() {

    let name = $('#driver_name').textbox('getValue')
    let car_type = $('#driver_car_type').textbox('getValue')
    let car_No = $('#driver_car_No').textbox('getValue')
    let id_No = $('#driver_id_No').textbox('getValue')
    let driving_license_No = $('#driver_driving_license_No').textbox('getValue')
    let phone = $('#driver_phone').textbox('getValue')
    let address = $('#driver_address').textbox('getValue')
    let driver = {name: name, car_type:car_type, car_No: car_No ,
        id_No:id_No, driving_license_No: driving_license_No, phone:phone, address:address}

    if (opt_type_for_driver == 'new') {
        console.log("New driver is: " + JSON.stringify(driver))
        mongoose.DriverModel.create(driver, function () {

            $('#dlg_for_driver').dialog('close');
            loadDriverGrid(null)

        })

    } else if (opt_type_for_driver == 'edit') {
        let driverId = $('#driver_id').val();
        console.log("Edit customer is: " + JSON.stringify(driver))
        // customer不能包含products字段，否则会更新.update是局部字段更新的.
        mongoose.DriverModel.findByIdAndUpdate(driverId, driver, function () {

            $('#dlg_for_driver').dialog('close');
            loadDriverGrid(null)
        })
    }
}

function destroyDriver(){
    var row = DRIVER_GRID.datagrid('getSelected');
    if (row){
        $.messager.confirm('确定','是否确定删除选中的司机?',function(r){
            if (r){
                mongoose.DriverModel.findByIdAndDelete(row._id, function(){
                    $('#dlg_for_driver').dialog('close');
                    loadDriverGrid(null)
                })
            }
        });
    }
}

function loadCarTypes(){

}

