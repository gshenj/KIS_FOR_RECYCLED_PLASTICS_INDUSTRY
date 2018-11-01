mongoose = require("./scripts/db")
let USER_GRID = null;
let INIT_PASS = "123";
let SYS_USER_OPERATOR = '';

let ROLE = []

function users_to_grid(users) {

   /* for (let i in users) {
        console.log(users[i].name)

    }*/
    return users;
}


var toolbar = [{
    text: '编辑',
    iconCls: 'icon-edit',
    handler: function () {
        show_sys_user_form('edit')
    }
}, {
    text: '添加',
    iconCls: 'icon-add',
    handler: function () {
        show_sys_user_form('add')
    }
}, {
    text: '删除',
    iconCls: 'icon-remove',
    handler: function () {
        show_sys_user_form('delete')
    }
}, {
    text: '重置密码',
    iconCls: 'icon-lock',
    handler: function () {
        show_sys_user_form('reset_pass')
    }
}]


function load_user_datagrid() {
    if (USER_GRID == null) {
        console.log("First time load user datagrid.")
        // style="width:700px;height:250px"
        USER_GRID = $('#sys_user_datagrid').datagrid({
            fit: true,
            singleSelect: true,
            collapsible: false,
            data: [],
            width:700,
            toolbar: toolbar
        })
    } else {
        console.log("Reload user datagrid.")
    }
    mongoose.UserModel.find({}, function (err, users) {
        let d = users_to_grid(users)
        USER_GRID.datagrid('loadData', d)
    })
}


function show_sys_user_form(type) {
    SYS_USER_OPERATOR = type;
    $('#user_name').textbox('readonly', false)
    $('#user_role').combobox('readonly', false)
    $('#checkbox_user_disabled').switchbutton('enable')

    if (type == 'add') {
        $('#user_name').textbox('setText', '')
        $('#user_name').textbox('setValue', '')
        $('#user_role').combobox('loadData', mongoose.ROLE_SELECT_DATA)
        $('#checkbox_user_disabled').switchbutton('uncheck')
        $('#btn_sys_user_operator').linkbutton({text: '确定添加'})
        $('#w').window('setTitle', "添加用户")
        $('#w').window('open')
        $('#w').window('center')

    } else if (type == 'edit' || type == 'delete' || type == 'reset_pass') {
        let row = USER_GRID.datagrid('getSelected')
        mongoose.UserModel.findById(row._id, function (err, user) {
            $('#user_name').textbox('setText', user.name)
            $('#user_name').textbox('setValue', user.name)
            console.log(mongoose.ROLE_SELECT_DATA)
            $('#user_role').combobox('loadData', mongoose.ROLE_SELECT_DATA)
            $('#user_role').combobox('setValue', user.role)
            if (user.disabled) {
                $('#checkbox_user_disabled').switchbutton('check')
            } else {
                $('#checkbox_user_disabled').switchbutton('uncheck')
            }

            $('#uid').val(user._id);

            if (type == 'edit') {
                $('#w').window('setTitle', "编辑用户")
                $('#btn_sys_user_operator').linkbutton({text: '确定修改'})    // 添加
            } else if (type == 'delete') {
                $('#w').window('setTitle', "删除用户")
                $('#btn_sys_user_operator').linkbutton({text: '确定删除'})    // 添加
                $('#user_name').textbox('readonly', true)
                $('#user_role').combobox('readonly', true)
                $('#checkbox_user_disabled').switchbutton('disable')
            } else {
                $('#w').window('setTitle', "重置密码")
                $('#btn_sys_user_operator').linkbutton({text: '重置密码'})    // 添加
                $('#user_name').textbox('readonly', true)
                $('#user_role').combobox('readonly', true)
                $('#checkbox_user_disabled').switchbutton('disable')
            }

            $('#w').window('open')
            $('#w').window('center')
        })
    }


}


function close_user_win_and_reload() {
    $('#w').window('close');
    load_user_datagrid();
}

function sys_user_operator() {

    if (SYS_USER_OPERATOR == 'delete') {
        let uid = $('#uid').val();
        mongoose.UserModel.findByIdAndDelete(uid, function (err, user) {
            if (err) {
                alert(err)
            } else {
                console.log("Delete sys user " + user)
                show_messager("操作成功：用户已删除！");
                close_user_win_and_reload();
            }
        })

    } else if (SYS_USER_OPERATOR == 'reset_pass') {
        let uid = $('#uid').val();
        mongoose.UserModel.findById(uid, function (err, user) {
            if (err) {
                alert(err)
                return;
            }
            user.password = INIT_PASS
            user.save(function (err, u) {
                if (err)
                    alert(err)
                else {
                    show_messager('操作成功：密码已重置！');
                    close_user_win_and_reload();
                }
            })
        })

    } else if (SYS_USER_OPERATOR == 'add') {

        let userModel = new mongoose.UserModel()
        userModel.name = $('#user_name').textbox("getValue")
        userModel.role = $('#user_role').combobox('getValue')
        userModel.disabled = $('#checkbox_user_disabled').switchbutton('options').checked
        userModel.password = INIT_PASS
        userModel.save(function (err) {
            if (err) return handleError(err)
            else {
                show_messager('操作成功： 用户已添加！')
                close_user_win_and_reload()
            }
        })

    } else if (SYS_USER_OPERATOR == 'edit') {
        let uid = $('#uid').val()
        mongoose.UserModel.findById(uid, function (err, user) {
            if (err) {
                alert(err)
                return
            }
            console.log(user)
            user.name = $('#user_name').textbox("getValue")
            user.role = $('#user_role').combobox('getValue')
            user.disabled = $('#checkbox_user_disabled').switchbutton('options').checked
            user.save(function (err, u) {
                if (err)
                    alert(err)
                else {
                    show_messager('操作成功：用户信息已保存！');
                    close_user_win_and_reload();
                }
            });
        })
    }


}


function close_user_form() {
    $('#w').window('close')
}