const ROLE_ADMIN = '管理员'
const ROLE_OPERATOR = '操作员'

function isAdmin(role) {
    return (role == ROLE_ADMIN);
}


function onShowDriverPanel(){
    DriverModel.find({}).populate('cartype').exec(function(err, docs) {
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

    if (click_src) {
        $(click_src).linkbutton('disable')
        updateTitle($(click_src).linkbutton('options').text + '')
    }
}


function updateTitle(menu) {
    $('#main_title').html(SYS_CONFIG.company_name + KIS_NAME + " " + KIS_VERSION + '　─　' + menu)
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
    getSysRoleTree(function (data) {
        let tree = $('#role_tree').tree('loadData', data)
        loadSysUsers(tree.tree("getRoot"))
    })
}



function getSysRoleTree(callback) {
    let tree_root = { text: "系统角色", children: [] };
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
    loadClassificationTree(function (data) {
        $('#classification_tree').tree('loadData', data)
    })

    // 加载客户列表
    console.log("Load customers")
    loadCustomerGrid(null)
}


function loadClassificationTree(callback) {

    let data = {text: "客户编码"}
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

      //  $('#system_info_panel').panel('open')
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
     // 加载货车类型树
    loadCartypeTree()
}


function loadCartypeTree(){
    loadCartypes(function (data) {
        let tree = $('#cartype_tree').tree('loadData', data)
        loadDriverGrid(null)
    })
}


function loadCartypes(callback) {
    CartypeModel.find({}, function (err, types) {
        let carTypesData =  { text: "货车分类", children: [] }
        for (let i = 0; i < types.length; i++) {
            carTypesData.children.push({ "text": types[i].name, "_id": types[i]._id })
        }
        callback([carTypesData])
    })
}


function loadDriverGrid(node) {
    let t = $('#cartype_tree')
    if (node == null) {
        node = t.tree('getSelected')
    }
    let rootNode = t.tree('getRoot')
    if (node == null || node == rootNode) {
        loadDriverGridByParams(null)
    } else {
        loadDriverGridByParams({cartype: node._id})
    }

}


function loadDriverGridByParams(params){
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
                {title: "车型载重", field: 'cartype_name',width:120, sortable: true,sortOrder: 'asc', formatter: function(value,row,index){
                     if (row.cartype) return row.cartype.name;
                    }},
                {title: "车牌号码", field: 'car_No', width:80, sortable:true, sortOrder: 'asc'},
                {title: "身份证号", field: 'id_No',width:140},
                {title: "行驶证号", field: 'driving_license_No',width:140},
                {title: "联系电话", field: 'phone', width:100},
                {title: "联系地址", field: "address",width:250}
            ]]
        })
    }

    if (params == null) {
        params = {}
    }
    DriverModel.find(params).populate("cartype").exec(function (err, docs) {
        DRIVER_GRID.datagrid('loadData', docs)
        //DRIVER_GRID.datagrid('enableFilter', {filterMatchingType:'any'})
    })
}

let opt_type_for_driver;
function newDriver(){
    $('#dlg_for_driver').dialog('open').dialog('center').dialog('setTitle','添加司机信息');
    $('#fm_for_driver').form('clear');
    let selectedNode = $('#cartype_tree').tree('getSelected')
    if (selectedNode) {
        $('#driver_car_type').combobox('setValue', selectedNode._id)
    }
    opt_type_for_driver = 'new'
}


function editDriver(){
    var row = DRIVER_GRID.datagrid('getSelected');
    if (row){
        $('#dlg_for_driver').dialog('open').dialog('center').dialog('setTitle','编辑司机信息');
        $('#fm_for_driver').form('load',row);
        if(row.cartype) {
            $('#driver_car_type').combobox('setValue', row.cartype._id)
        }
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
    let driver = {name: name, cartype:new mongoose.Types.ObjectId(car_type), car_No: car_No ,
        id_No:id_No, driving_license_No: driving_license_No, phone:phone, address:address}

    if (opt_type_for_driver == 'new') {
        console.log("New driver is: " + JSON.stringify(driver))
        DriverModel.create(driver, function () {

            $('#dlg_for_driver').dialog('close');
            loadDriverGrid(null)

        })

    } else if (opt_type_for_driver == 'edit') {
        let driverId = $('#driver_id').val();
        console.log("Edit driver is: " + JSON.stringify(driver))
        DriverModel.findByIdAndUpdate(driverId, driver, function () {

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
                DriverModel.findByIdAndDelete(row._id, function(){
                    $('#dlg_for_driver').dialog('close');
                    loadDriverGrid(null)
                })
            }
        });
    }
}





