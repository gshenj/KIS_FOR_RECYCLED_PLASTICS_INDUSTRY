let DRIVER_GRID = null
let opt_type_for_cartype
let opt_type_for_driver;

function edit_cartype_tree_node() {
    var node = $('#cartype_tree').tree('getSelected');
    if (node) {
        $('#dlg_for_cartype').dialog('open').dialog('center').dialog('setTitle', '修改类型名称');
        //$('#fm_for_cartype').form('load', node)
        $('#cartype_id').val(node._id);
        $('#cartype_name_textbox').textbox('setValue', node.text);
        opt_type_for_cartype = 'edit'
    }
}

/**
 * 添加分类
 */
function append_cartype_tree_node() {
    $('#dlg_for_cartype').dialog('open').dialog('center').dialog('setTitle', '新增货车类型');
    $('#fm_for_cartype').form('clear');
    opt_type_for_cartype = 'new'
}

/**
 * 删除分类
 */
function delete_cartype_tree_node() {
    let t = $('#cartype_tree');
    let node = t.tree('getSelected');
    $.messager.confirm('确定', '是否确定删除选中的货车分类?', async function (r) {
        if (r) {
            await CartypeModel.findOneAndDelete({_id: node._id}).exec()
            loadCartypeTree()
        }
    })
}

/**
 * 保存分类树到db
 */
function saveCartype() {
    let cartype = $('#cartype_name_textbox').textbox('getValue')
    if (opt_type_for_cartype == 'new') {

        CartypeModel.create({name: cartype}, function (err, doc) {
            loadCartypeTree()
        })

    } else if (opt_type_for_cartype == 'edit') {
        let cartype_id = $('#cartype_id').val()
        CartypeModel.findOneAndUpdate({_id: cartype_id}, {name: cartype}, function (err, doc) {
            loadCartypeTree()
        })
    }
    $('#dlg_for_cartype').dialog('close');
}


function loadCartypeSelectData() {
    CartypeModel.find({}, function (err, types) {
        $('#driver_car_type').combobox('loadData', types)
    })
}

function onOpenDriverManagePanel() {
    // 加载货车类型树
    loadCartypeTree()
}

async function loadCartypeTree() {
    let data = await loadCartypes()
    $('#cartype_tree').tree('loadData', data)
    loadDriverGrid(null)
}


async function loadCartypes(callback) {
    let types = CartypeModel.find({}).exec()
    let carTypesData = {text: "所有分类", children: []}
    for (let i = 0; i < types.length; i++) {
        carTypesData.children.push({"text": types[i].name, "_id": types[i]._id})
    }
    return [carTypesData]
    //callback([carTypesData])
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

function loadDriverGridByParams(params) {
    if (DRIVER_GRID == null) {
        DRIVER_GRID = $('#driver_grid').datagrid({
            fit: true,
            border: false,
            height: '100%',
            singleSelect: true,
            collapsible: false,
            data: [],
            remoteSort: false,
            multiSort: true,
            //showFilterBar:false,
            rownumbers: true,
            title: '<span style="font-weight: bold">司机列表</span>',
            width: 800,
            toolbar: [{
                text: '添加',
                iconCls: 'icon-add',
                handler: newDriver
            }, {
                text: '编辑',
                iconCls: 'icon-edit',
                handler: editDriver
            }, {
                text: '删除',
                iconCls: 'icon-remove',
                handler: destroyDriver
            }],
            columns: [[
                {
                    title: "姓名",
                    field: 'name',
                    width: 70,
                    sortable: true,
                    sortOrder: 'asc',
                    align: 'left',
                    halign: 'center'
                },
                {
                    title: "车型载重",
                    field: 'cartype_name',
                    width: 120,
                    sortable: true,
                    sortOrder: 'asc',
                    align: 'left',
                    halign: 'center',
                    formatter: function (value, row, index) {
                        if (row.cartype) return row.cartype.name;
                    }
                },
                {
                    title: "车牌号码",
                    field: 'car_No',
                    width: 80,
                    sortable: true,
                    sortOrder: 'asc',
                    align: 'left',
                    halign: 'center'
                },
                {title: "身份证号", field: 'id_No', width: 140, align: 'left', halign: 'center'},
                {title: "行驶证号", field: 'driving_license_No', width: 140, align: 'left', halign: 'center'},
                {title: "联系电话", field: 'phone', width: 100, align: 'left', halign: 'center'},
                {title: "联系地址", field: "address", width: 250, align: 'left', halign: 'center'}
            ]]
        })
    }

    if (params == null) {
        params = {}
    }
    DriverModel.find(params).populate("cartype").exec(function (err, docs) {
        DRIVER_GRID.datagrid('loadData', docs)
    })
}

function newDriver() {
    $('#dlg_for_driver').dialog('open').dialog('center').dialog('setTitle', '添加司机信息');
    $('#fm_for_driver').form('clear');
    let selectedNode = $('#cartype_tree').tree('getSelected')
    if (selectedNode) {
        $('#driver_car_type').combobox('setValue', selectedNode._id)
    }
    opt_type_for_driver = 'new'
}


function editDriver() {
    let row = DRIVER_GRID.datagrid('getSelected');
    if (row) {
        $('#dlg_for_driver').dialog('open').dialog('center').dialog('setTitle', '编辑司机信息');
        $('#fm_for_driver').form('load', row);
        if (row.cartype) {
            $('#driver_car_type').combobox('setValue', row.cartype._id)
        }
        opt_type_for_driver = 'edit'
    }
}

function saveDriver() {
    let name = $('#driver_name').textbox('getValue')
    let car_type = $('#driver_car_type').textbox('getValue')
    if (car_type) {
        car_type = new mongoose.Types.ObjectId(car_type)
    } else {
        car_type = null;
    }
    let car_No = $('#driver_car_No').textbox('getValue')
    let id_No = $('#driver_id_No').textbox('getValue')
    let driving_license_No = $('#driver_driving_license_No').textbox('getValue')
    let phone = $('#driver_phone').textbox('getValue')
    let address = $('#driver_address').textbox('getValue')
    let driver = {
        name: name, cartype: car_type, car_No: car_No,
        id_No: id_No, driving_license_No: driving_license_No, phone: phone, address: address
    }

    if (opt_type_for_driver == 'new') {
        DriverModel.create(driver, function () {

            $('#dlg_for_driver').dialog('close');
            loadDriverGrid(null)

        })

    } else if (opt_type_for_driver == 'edit') {
        let driverId = $('#driver_id').val();
        DriverModel.findByIdAndUpdate(driverId, driver, function () {

            $('#dlg_for_driver').dialog('close');
            loadDriverGrid(null)
        })
    }
}

function destroyDriver() {
    let row = DRIVER_GRID.datagrid('getSelected');
    if (row) {
        $.messager.confirm('确定', '是否确定删除选中的司机?', function (r) {
            if (r) {
                DriverModel.findByIdAndDelete(row._id, function () {
                    $('#dlg_for_driver').dialog('close');
                    loadDriverGrid(null)
                })
            }
        });
    }
}