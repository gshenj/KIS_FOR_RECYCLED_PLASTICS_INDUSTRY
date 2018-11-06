mongoose = require("./scripts/db")
let REGION_TREE = null
let REGION_OPERATOR = ''


function init() {

   // $('#mainTab').tabs('select', 0)

    mongoose.loadSysRoles();

}


/*

function tree_to_model(treeData) {
    var modelData = []
    modelData.country = treeData[0].text;
    modelData.province = treeData[0].
}
*/

function selectMainTab(title, idx) {
    if (title == '') {

    }
}

function region_tree_delete_node() {
    let node = REGION_TREE.tree('getSelected');
    REGION_TREE.tree('remove', node.target);
}

/**
 * 编辑节点
 */
function region_tree_edit_node() {
    let node = REGION_TREE.tree('getSelected');
    REGION_TREE.tree('beginEdit', node.target);

}


function region_operator() {
    if (REGION_OPERATOR == 'add') {

        let node_text = $('#region_name').textbox('getText');
        console.log(node_text)
        let node = REGION_TREE.tree('getSelected')
        REGION_TREE.tree('append', {
            parent: node.target,
            data: {
                text: node_text
            }
        })

        region_tree_save()
    } else if (REGION_OPERATOR == 'delete') {
        let node = REGION_TREE.tree('getSelected')
        REGION_TREE.tree('remove', node.target)

    } else if (REGION_OPERATOR == 'edit') {
        let node = REGION_TREE.tree('getSelected')
        let new_text = $('#region_name').textbox('getValue')
        REGION_TREE.tree('update', {
            target: node.target,
            text: new_text
        })
    }

    region_tree_save()
    $('#region_window').window('close');


}


/**
 * 添加节点
 */
function show_region_form(type) {
    REGION_OPERATOR = type;
    let node = REGION_TREE.tree('getSelected')
    if (node == null) {
        alert('请选择地区!')
        return;
    }

    let parentNode = REGION_TREE.tree('getParent', node.target)
    if (type == 'add') {
        let rootNode = REGION_TREE.tree('getRoot')
        if (parentNode == null) {
            console.log("选中根节点，添加省份")
        } else if (parentNode == rootNode) {
            console.log("选中省级节点，添加城市")
        } else {
            console.log("选中市节点，无法添加子节点")
            alert('无法添加子节点！')
            return;
        }

        $('#father_name').textbox('setValue', node.text)
        $('#region_name').textbox('setValue', '')
        $('#btn_region_operator').linkbutton({text: '确定添加'})

    } else if (type == 'edit') {

        $('#father_name').textbox('setValue', parentNode.text)
        $('#region_name').textbox('setValue', node.text)
        $('#btn_region_operator').linkbutton({text: '确定修改'})
    } else if (type == 'delete') {
        $('#father_name').textbox('setValue', parentNode.text)
        $('#region_name').textbox('setValue', node.text)
        $('#btn_region_operator').linkbutton({text: '确定删除'})

    }


    $('#region_window').window('open')
    $('#region_window').window('center')

    /*REGION_TREE.tree('append', {
        parent: node.target,
        data: {
            text: '新增节点'
        }
    });

    let children = REGION_TREE.tree('getChildren', node.target)
    console.log(children)
    REGION_TREE.tree('beginEdit', children[children.length-1].target);*/
}


function model_to_tree(model) {
    let provinces = model.provinces;
    let provinceChildren = [];
    for (let i = 0; i < provinces.length; i++) {
        let cities = provinces[i].cities;
        let cityChildren = [];
        for (let j = 0; j < cities.length; j++) {
            cityChildren.push({text: cities[j], id:cities[j], type:'city'});
        }
        let v = {text: provinces[i].province, id:provinces[i].province, type:'province', children: cityChildren};
        provinceChildren.push(v)
    }

    let treeData = [{text: model.region, children: provinceChildren, type:'country'}];
    return treeData;

}

function tree_to_model(tree) {
    let root = tree.tree('getRoot');
    let provinces = root.children;
    let provinceArray = []
    for (let i in provinces) {
        let child = provinces[i]
        let cities = child.children;
        let citiesArray = []
        for (let j in cities) {
            let city = cities[j]
            citiesArray.push(city.text); // cities
        }
        provinceArray.push({province: child.text, cities: citiesArray});
    }

    let modelData = {region: root.text, provinces: provinceArray}
    return modelData;
}

/**
 * 保存地区树到数据库
 *
 */
function region_tree_save() {
    let model = tree_to_model(REGION_TREE);
    if (REGION_TREE == null) {
        region.save(function (err) {
            handleError(err)
            load_region_tree()
        })
    } else {
        mongoose.RegionModel.updateOne({}, model, function (err, doc) {
            handleError(err)
            load_region_tree()

        })
    }

}


/*function load_region_tree_data(tree) {
    mongoose.RegionModel.findOne({}, function (err, region) {
        let d = model_to_tree(region)
        //console.log(d)
        tree.combotree('loadData', d)
    })
}*/

/*
function load_region_tree() {
    mongoose.RegionModel.findOne({}, function (err, region) {
        let d = model_to_tree(region)
        //console.log(d)
        $load_region_tree(d);
    })
}
*/

function loadClassifications(callback) {

    let data = {text:"客户编码"}
    mongoose.ClassificationModel.findOne({}, function (err, classification) {

        if (classification == null) {
            console.log("classification is null")
            callback([data]);
            return;
        }

        let arr = classification.classifications     //{classifications:[{name:"江苏",children:[]}]}
        let children = []
        for (let i=0; i<arr.length; i++) {
            children.push(classificationToTree(arr[i]))
        }
        data.children = children
        callback([data])
    })
}

function saveClassifications(tree, callback) {
    let treeRoot = tree.tree('getRoot')
    let children = treeRoot.children;   //{text:"客户编码", children:[{text:"江苏",children:[]}]}
    let model = {classifications:[]}
    for (let i=0; i<children.length; i++) {
        model.classifications.push(treeToClassification(children[i]))
    }

    mongoose.ClassificationModel.updateOne({}, model, function (err, doc) {
        handleError(err)
        // 成功后调用
        callback()
    })
    // save data to db
}



function treeToClassification(obj) {
    if (typeof(obj.text)== 'undefined') {
        //console.log("obj is :"+obj+ ", obj.text is undefined")
        return null
    }

    if (typeof(obj.children)!='undefined' && obj.children.length>0) {
        let children = obj.children
        console.log("children is"+JSON.stringify(children))
        let treeChildren = []
        for (let i = 0; i<children.length; i++) {
            //let child = {"text": children[i].name}  //
            //console.log("will revers "+JSON.stringify(children[i]))

            let childChildren = treeToClassification(children[i]);
            //console.log("revers result "+JSON.stringify(childChildren))

            if (childChildren == null) {
                // break;
                //treeChildren.push(childChildren)
            } else {
                //child.children = childChildren;
                treeChildren.push(childChildren)
            }
        }
        return {name:obj.text, children:treeChildren}

    } else {
        return {name: obj.text};
    }
}

function classificationToTree(obj) {

    if (typeof(obj.name)== 'undefined') {
        return null
    }

    if (typeof(obj.children)!='undefined' && obj.children.length>0) {
        let children = obj.children
        let treeChildren = []
        for (let i = 0; i<children.length; i++) {
            let childChildren = classificationToTree(children[i]);
            if (Object.keys(childChildren).length == 0) {
                // 对象为空
            } else {
                treeChildren.push(childChildren)
            }
        }
        return {text:obj.name, children:treeChildren}

    } else {
        return {text: obj.name};
    }
}

/**
 * 从数据库加载地区树结构
 * @param d
 */
/*
function $load_region_tree(d) {
    if (REGION_TREE == null) {
        REGION_TREE = $('#region_tree').tree({fit:true, data: d, animate: true})
        console.log('Init tree data.')
    } else {
        REGION_TREE.tree('loadData', d)
        console.log("Reload tree data.")
    }
}*/
