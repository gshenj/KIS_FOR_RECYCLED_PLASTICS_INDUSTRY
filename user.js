mongoose = require("./scripts/db")
let USER_GRID = null;
let INIT_PASS = "123";
let SYS_USER_OPERATOR = '';

let ROLE = []

var url;

SYS_USER_GRID = null;

var toolbar01 = [
    {
        text: '添加',
        iconCls: 'icon-add',
        handler: function () {
            // show_sys_user_form('add')
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
            // show_sys_user_form('delete')
        }
    }, {
        text: '重置密码',
        iconCls: 'icon-lock',
        handler: function () {
            resetPassword()
            // show_sys_user_form('reset_pass')
        }
    }]


function loadSysUsers(node_selected) {
    let node = $('#role_tree').tree('getSelected')
    console.log('Call loadSysUsers')


    let params = {}
    let tree = $('#role_tree').tree()
    let rootNode = tree.tree('getRoot')
    if (node == null || rootNode == node) {
        console.log("Load all users")
    } else {

        let role = node.text
        console.log("Load users of " + role)
        params.role = role
    }

    console.log("params:" + JSON.stringify(params))
    loadSysUserGrid(params)
    /* mongoose.UserModel.find(params, function (err, users) {
         let d = users_to_grid(users)
         console.log(JSON.stringify(d))
         $('#sys_user_datagrid').datagrid('loadData', d)
     })*/
}



function loadSysUserGrid(params) {
    if (SYS_USER_GRID == null) {
        // first time
        console.log("first time load sys user grid.")
        SYS_USER_GRID = $('#sys_user_datagrid').datagrid({
            fit: true,
            singleSelect: true,
            collapsible: false,
            data: [],
            border:false,
            rownumbers:true,
            title:'<span style="font-weight: bold">系统用户列表</span>',
            width:700,
            height:500,
            toolbar: toolbar01,
            columns:[[
                {field:'name',title:'用户名',width:100},
                {field:'role',title:'角色',width:100},
                {field:'disabled',title:'状态',width:100,align:'right', formatter: function(value,row,index){
                        if (row.disabled){
                            return "<span style='color:red'>禁用</span>";
                        } else {
                            return "启用";
                        }
                    }}
            ]]
        })
    }

    mongoose.UserModel.find(params, function (err, users) {
        //console.log("Load users: " +JSON.stringify(users))
        SYS_USER_GRID.datagrid('loadData', users)
    })
}


function newUser(){
    $('#dlg').dialog('open').dialog('center').dialog('setTitle','添加用户');
    $('#fm').form('clear');
    // url = 'save_user.php';
    url = 'new'
}
function editUser(){
    var row = $('#sys_user_datagrid').datagrid('getSelected');
    if (row){
        $('#dlg').dialog('open').dialog('center').dialog('setTitle','编辑用户');
        console.log("ROw"+JSON.stringify(row))
        $('#fm').form('load',row);
        if (row.disabled) {
            $('#disabled_checkbox').checkbox('check')
        } else {
            $('#disabled_checkbox').checkbox('uncheck')
        }
        // url = 'update_user.php?id='+row.id;
        url = 'edit'
    }
}

function saveUser(){

    let name = $('#name_textbox').textbox('getValue')
    let role = $('#role_combobox').combobox('getText')
    let disabled = $('#disabled_checkbox').checkbox('options').checked



    let user = {name: name, role: role, disabled:disabled}
    console.log("New user is: "+JSON.stringify(user))
    if (url == 'new') {
        addUser(user, function() {
            $('#dlg').dialog('close');
            loadSysUsers(null)
        })

    } else if (url == 'edit') {
        let user_id = $('#user_id').val();
        user._id = user_id;
        updateUser(user, function(){
            $('#dlg').dialog('close');
            loadSysUsers(null)
        })
    }
}
function destroyUser(){
    var row = $('#sys_user_datagrid').datagrid('getSelected');
    if (row){
        $.messager.confirm('确定','是否确定删除选中的用户?',function(r){
            if (r){

                deleteUser({_id:row._id},function(){
                    $('#dlg').dialog('close');
                    loadSysUsers(null)
                    show_msg("操作成功：删除用户成功！")
                })

            }
        });
    }
}

function resetPassword() {
    var row = $('#sys_user_datagrid').datagrid('getSelected');
    if (row){
        $.messager.confirm('确定','是否确定重置选中的用户的登录密码?',function(r){
            if (r){
                resetUserPassword({_id:row._id},function(){
                    $('#dlg').dialog('close');
                    loadSysUsers(null)
                    show_msg("操作成功：重置密码成功！")
                })

            }
        });
    }
}


function addUser(user, callback) {

    //添加用户的初始密码
    user.password = INIT_PASS;
    mongoose.UserModel.create(user, function (err, doc) {
        if (err) return handleError(err);
        else {
            callback()
        }
    });
}

function deleteUser(user, callback) {
    mongoose.UserModel.findByIdAndDelete(user._id, function(err, doc){
        if (err) return handleError(err);
        callback()
    })
}


function resetUserPassword(user, callback) {
    mongoose.UserModel.findById(user._id, function(err, doc){
        if (err) return handleError(err);
        doc.password = INIT_PASS
        doc.save(function(err, d) {
            callback()
        })

    })
}

function updateUser(user, callback) {

    mongoose.UserModel.findById(user._id, function (err, doc) {
        if (err) return handleError(err);
        doc.name = user.name;
        doc.role = user.role
        doc.disabled = user.disabled

        doc.save(function(err, d){
            callback()
        });
    });
}



function set_password(){
    //todo
    show_error("操作成功：设置密码成功！")
}
