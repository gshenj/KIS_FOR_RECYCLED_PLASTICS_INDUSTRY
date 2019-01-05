let opt_type_for_classification

/**
 * 编辑选中分类节点
 */
function edit_classification_tree_node() {
    var node = $('#classification_tree').tree('getSelected');
    if (node) {
        $('#dlg_for_classification').dialog('open').dialog('center').dialog('setTitle', '修改编码');
        $('#fm_for_classification').form('load', node);
        opt_type_for_classification = 'edit'
    }
}

/**
 * 保存分类树到db
 */
function saveClassification() {
    let text = $('#classification_name_textbox').textbox('getValue')
    if (opt_type_for_classification == 'new') {
        var t = $('#classification_tree');
        var node = t.tree('getSelected');
        t.tree('append', {
            parent: (node ? node.target : null),
            data: [{
                text: text
            }]
        });
    } else if (opt_type_for_classification == 'edit') {
        var t = $('#classification_tree');
        var node = t.tree('getSelected');
        if (node) {
            t.tree('update', {
                target: node.target,
                text: text
            });
        }
    }

    saveClassifications(t.tree(), function () {

        //reload classification tree
        loadClassifications(function (data) {
            $('#classification_tree').tree('loadData', data)
        })

    })

    $('#dlg_for_classification').dialog('close');
}

/**
 * 添加分类
 */
function append_classification_tree_node() {
    $('#dlg_for_classification').dialog('open').dialog('center').dialog('setTitle', '新增编码');
    $('#fm_for_classification').form('clear');
    // url = 'save_user.php';
    opt_type_for_classification = 'new'

}

/**
 * 删除分类
 */
function delete_classification_tree_node() {
    let t = $('#classification_tree');
    let node = t.tree('getSelected');
    t.tree('remove', node.target);
    saveClassifications(t.tree(), function () {

        //reload classification tree
        loadClassifications(function (data) {
            $('#classification_tree').tree('loadData', data)
        })

    })
}


function loadClassifications(callback) {

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


function saveClassifications(tree, callback) {
    let treeRoot = tree.tree('getRoot')
    let children = treeRoot.children;   //{text:"客户编码", children:[{text:"江苏",children:[]}]}
    let model = {classifications: []}
    for (let i = 0; i < children.length; i++) {
        model.classifications.push(treeToClassification(children[i]))
    }

    ClassificationModel.updateOne({}, model, function (err, doc) {
        handleError(err)
        // 成功后调用
        callback()
    })
    // save data to db
}

function treeToClassification(obj) {
    if (typeof(obj.text) == 'undefined') {
        return null
    }

    if (typeof(obj.children) != 'undefined' && obj.children.length > 0) {
        let children = obj.children
        console.log("children is" + JSON.stringify(children))
        let treeChildren = []
        for (let i = 0; i < children.length; i++) {
            let childChildren = treeToClassification(children[i]);
            if (childChildren) {
                treeChildren.push(childChildren)
            }
        }
        return {name: obj.text, children: treeChildren}

    } else {
        return {name: obj.text};
    }
}

function classificationToTree(obj) {

    if (typeof(obj.name) == 'undefined') {
        return null
    }

    if (typeof(obj.children) != 'undefined' && obj.children.length > 0) {
        let children = obj.children
        let treeChildren = []
        for (let i = 0; i < children.length; i++) {
            let childChildren = classificationToTree(children[i]);
            if (Object.keys(childChildren).length == 0) {
                // 对象为空
            } else {
                treeChildren.push(childChildren)
            }
        }
        return {text: obj.name, id:obj.name, children: treeChildren}

    } else {
        return {text: obj.name, id:obj.name};
    }
}

