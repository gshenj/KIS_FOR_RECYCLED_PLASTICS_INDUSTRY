var mongoose = require('mongoose');
var Schema = mongoose.Schema;
let ROLES = [];
let ROLE_SELECT_DATA = {text:"系统角色", children:[]};



const REGION = {region:"地区", provinces: [
    {province: '江苏省', cities: ['无锡市', '苏州市']},
    {province: '浙江省', cities: ['宁波市']},
    {province: '安徽省', cities: ['黄山市']},
    {province: '上海市', cities: ['上海市']}
]}

const UNITS = [{units:"千克"}, {units:"公斤"}, {units:"包"}]

let roleSchema = new Schema({role:String})

let  provinceSchema = new Schema({province:String, cities:[String]})
let regionSchema = new Schema({region:String, provinces:[provinceSchema]})

let classificationSchema = new Schema({classifications:Schema.Types.Mixed})// {classifications:[{name:"江苏",children:[]}]}

var userSchema = new Schema({role:String, name:String, disabled:Boolean, password:String});


var product = {name:String, modal:String, price:Number, units:String, memo:String };
var productSchema = new Schema(product,{_id:false});          //product不生成_id字段

var customer ={
    name:String,
    address:String,
    phone:String,
    province:String,
    city:String,
    principal:String,
    products:[productSchema]
}


var customerSchema = new Schema(customer);

var orderProductSchema = Object.assign({},product, {num:Number, sum:Number});

var order = {
    order_id:String,
    cancelled:Boolean,
    order_num:String,
    create_date:Date,
    create_user:String,
    customer_id:String,
    customer_name:String,
    customer_principal:String,
    contact_number:String,     /*联系电话，默认为客户电话*/
    delivery_address:String,   /*送货地址，默认为客户地址*/
    order_date:String,
    products:[orderProductSchema],
    products_num:Number,
    products_sum:String,
    delivery_siji:String, /*司机*/
    zhidanren:String, /*制单人*/
    shenhe:String,/*审核人*/
    memo:String     /*订单备注*/
}
var orderSchema = new Schema(order);



/**DB utils **/
mongoose.connect('mongodb://localhost:27017',{dbName:'kis', useNewUrlParser:true});

RoleModel = mongoose.model('role', roleSchema, 'roles');
RegionModel = mongoose.model('region', regionSchema, 'regions');
UserModel = mongoose.model('user'/*ming zi er yi*/, userSchema,'users');
CustomerModel = mongoose.model('customer'/*ming zi er yi*/, customerSchema,'customers');
OrderModel = mongoose.model('order'/*ming zi er yi*/, orderSchema,'orders');
classificationModel = mongoose.model("classification", classificationSchema, "classifications")



var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.on('open', function(){console.log("Open database connection.")})



function loadSysRoles() {
    RoleModel.find({}, function(err, roles){
        ROLES = roles;
        for (let i=0; i<roles.length; i++) {
            ROLE_SELECT_DATA.children.push({"text":roles[i]})
        }
        // console.log(ROLE_SELECT_DATA)
    })
}

function getSysRoleTreeData(callback) {
    let tree_root = {text:"系统角色", children:[]};
    RoleModel.find({}, function(err, roles){
        for (let i=0; i<roles.length; i++) {
            tree_root.children.push({"text":roles[i].role})
        }
        callback([tree_root])
    })
}


module.exports = mongoose;
module.exports.loadSysRoles = loadSysRoles
module.exports.getSysRoleTreeData = getSysRoleTreeData
module.exports.ROLE_SELECT_DATA = ROLE_SELECT_DATA;
module.exports.RegionModel = RegionModel;
module.exports.ClassificationModel = classificationModel;
module.exports.UserModel = UserModel;
module.exports.RoleModel = RoleModel;
module.exports.CustomerModel = CustomerModel;
module.exports.UNITS = UNITS;
