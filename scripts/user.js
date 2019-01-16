let INIT_PASS = "123";
let SYS_USER_OPERATOR;
let SYS_USER_GRID = null;

let toolbarForSysUserGrid = [
    {
        text: '添加',
        iconCls: 'icon-add',
        handler: function () {
            newUser()
        }
    }, {
        text: '编辑',
        iconCls: 'icon-edit',
        handler: function () {
            editUser()
        }
    }, {
        text: '删除',
        iconCls: 'icon-remove',
        handler: function () {
            destroyUser()
        }
    }, {
        text: '重置密码',
        iconCls: 'icon-lock',
        handler: function () {
            resetPassword()
        }
    }]


function loadSysUsers(node_selected) {
    let node = $('#role_tree').tree('getSelected')
    let params = {}
    let tree = $('#role_tree').tree()
    let rootNode = tree.tree('getRoot')
    if (node == null || rootNode == node) {
        //console.log("Load all users")
    } else {
        params.role = node.text
    }

    loadSysUserGrid(params)
}


async function loadSysUserGrid(params) {
    if (SYS_USER_GRID == null) {
        SYS_USER_GRID = $('#sys_user_datagrid').datagrid({
            fit: true,
            singleSelect: true,
            collapsible: false,
            data: [],
            border: false,
            multiSort: true,
            rownumbers: true,
            title: '<span style="font-weight: bold">系统用户列表</span>',
            width: 700,
            height: 500,
            toolbar: toolbarForSysUserGrid,
            columns: [[
                {field: 'name', title: '用户名', sortable: true, width: 100},
                {field: 'role', title: '角色', sortable: true, width: 100},
                {
                    field: 'disabled',
                    title: '状态',
                    width: 100,
                    align: 'right',
                    formatter: function (value, row, index) {
                        if (row.disabled) {
                            return "<span style='color:red'>禁用</span>";
                        } else {
                            return "启用";
                        }
                    }
                }
            ]]
        })
    }
    let users = await UserModel.find(params).exec()
    SYS_USER_GRID.datagrid('loadData', users)
}

function newUser() {
    $('#dlg').dialog('open').dialog('center').dialog('setTitle', '添加用户');
    $('#fm').form('clear');
    SYS_USER_OPERATOR = 'new'
}

function editUser() {
    let row = $('#sys_user_datagrid').datagrid('getSelected');
    if (row) {
        $('#dlg').dialog('open').dialog('center').dialog('setTitle', '编辑用户');
        console.log("ROw" + JSON.stringify(row))
        $('#fm').form('load', row);
        if (row.disabled) {
            $('#disabled_checkbox').checkbox('check')
        } else {
            $('#disabled_checkbox').checkbox('uncheck')
        }
        SYS_USER_OPERATOR = 'edit'
    }
}

async function saveUser() {
    let name = $('#name_textbox').textbox('getValue')
    let role = $('#role_combobox').combobox('getText')
    let disabled = $('#disabled_checkbox').checkbox('options').checked

    let user = {name: name, role: role, disabled: disabled}
    if (SYS_USER_OPERATOR == 'new') {
        await addUser(user)
    } else if (SYS_USER_OPERATOR == 'edit') {
        let user_id = $('#user_id').val();
        user._id = user_id;
        await updateUser(user)
    }

    $('#dlg').dialog('close');
    loadSysUsers(null)
}

function destroyUser() {
    let row = $('#sys_user_datagrid').datagrid('getSelected');
    if (row) {
        $.messager.confirm('确定', '是否确定删除选中的用户?', async function (r) {
            if (r) {
                await deleteUser({_id: row._id})
                $('#dlg').dialog('close');
                loadSysUsers(null)
                show_msg("操作成功：删除用户成功！")
            }
        });
    }
}

function resetPassword() {
    let row = $('#sys_user_datagrid').datagrid('getSelected');
    if (row) {
        $.messager.confirm('确定', '是否确定重置选中的用户的登录密码?', async function (r) {
            if (r) {
                await resetUserPassword({_id: row._id})
                $('#dlg').dialog('close');
                loadSysUsers(null)
                show_msg("操作成功：重置密码成功！")
            }
        });
    }
}


async function addUser(user) {
    //添加用户的初始密码
    user.password = INIT_PASS;
    let doc = await UserModel.create(user).exec()
    return doc
}

async function deleteUser(user) {
    let doc = await UserModel.findByIdAndDelete(user._id).exec()
    return doc;
}


async function resetUserPassword(user) {
    let doc = await UserModel.findById(user._id).exec()
    doc.password = INIT_PASS
    await doc.save()
}

async function updateUser(user) {
    let doc = await UserModel.findById(user._id).exec()
    if (doc) {
        doc.name = user.name;
        doc.role = user.role
        doc.disabled = user.disabled
        await doc.save()
    }
    return doc;
}

async function set_password() {
    let old_pass = $('#old_pass').passwordbox('getValue')
    let new_pass = $('#new_pass').passwordbox('getValue')
    let new_pass_again = $('#new_pass_again').passwordbox('getValue')

    if (new_pass == new_pass_again) {
        let user = JSON.parse(localStorage.getItem('user'))
        let doc = await UserModel.findOne({name: user.name}).exec()
        if (doc.password == old_pass) {
            doc.password = new_pass;
            await doc.save()
            $('#dlg_for_setpassword').dialog('close')
            show_msg("操作成功：设置密码成功！")

        } else {
            show_msg('操作失败：旧密码错误！')
        }
    } else {
        show_msg('操作失败：重复密码不一致！')
    }
}

async function loadRolesData() {
    let docs = await RoleModel.find({}).exec()
    $('#role_combobox').combobox('loadData', docs)
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'))
}