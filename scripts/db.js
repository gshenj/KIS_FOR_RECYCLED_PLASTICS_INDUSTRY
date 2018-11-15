var mongoose = require('mongoose');
var Schema = mongoose.Schema;
let ROLES = [];
let ROLE_SELECT_DATA = {text:"系统角色", children:[]};

let COMPANY_INFO = {}



const REGION = {region:"地区", provinces: [
    {province: '江苏省', cities: ['无锡市', '苏州市']},
    {province: '浙江省', cities: ['宁波市']},
    {province: '安徽省', cities: ['黄山市']},
    {province: '上海市', cities: ['上海市']}
]}

const UNITS = [{units:"千克"}, {units:"公斤"}, {units:"包"}]

let sequenceSchema = new Schema({seq_name:String, value:Number})

let configSchema = new Schema({company_name:String, company_address:String,
    company_phone:String, company_fax:String, company_logo:Buffer, db_version:String})

let roleSchema = new Schema({role:String})

let  provinceSchema = new Schema({province:String, cities:[String]})
let regionSchema = new Schema({region:String, provinces:[provinceSchema]})

let classificationSchema = new Schema({classifications:Schema.Types.Mixed})// {classifications:[{name:"江苏",children:[]}]}

var userSchema = new Schema({role:String, name:String, disabled:Boolean, password:String});

let driverSchema = new Schema({name:String, car_type:String, car_No:String, id_No:String, driving_license_No:String, phone:String, address:String})

var product = {name:String, model:String, price:String, units:String, memo:String,
customer:{ type: Schema.Types.ObjectId, ref: 'CustomerModel' }};
var productSchema = new Schema(product);          //product不生成_id字段

var customer ={
    name:String,
    index_code:String,
    principal:String,
    phone:String,
    address:String,
    classification:String,
    products:[{ type: Schema.Types.ObjectId, ref: 'ProductModel' }]
}


var customerSchema = new Schema(customer);

var orderProductSchema = Object.assign({},product, {num:Number, sum:Number});

var order = {
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
    order_driver:String, /*司机*/
    order_maker:String, /*制单人*/
    memo:String     /*订单备注*/
}
var orderSchema = new Schema(order);



/**DB utils **/
mongoose.connect('mongodb://localhost:27017',{dbName:'kis', useNewUrlParser:true});

SequenceModel = mongoose.model('sequence', sequenceSchema, 'sequences')
ConfigModel = mongoose.model('config', configSchema, 'configs')
RoleModel = mongoose.model('role', roleSchema, 'roles');
RegionModel = mongoose.model('region', regionSchema, 'regions');
UserModel = mongoose.model('user'/*ming zi er yi*/, userSchema,'users');
CustomerModel = mongoose.model('customer'/*ming zi er yi*/, customerSchema,'customers');
ProductModel = mongoose.model('product'/*ming zi er yi*/, productSchema,'products');
OrderModel = mongoose.model('order'/*ming zi er yi*/, orderSchema,'orders');
ClassificationModel = mongoose.model("classification", classificationSchema, "classifications")

DriverModel = mongoose.model("driver", driverSchema,"drivers")


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
module.exports.SequenceModel = SequenceModel;
module.exports.ConfigModel = ConfigModel;
module.exports.RegionModel = RegionModel;
module.exports.ClassificationModel = ClassificationModel;
module.exports.UserModel = UserModel;
module.exports.RoleModel = RoleModel;
module.exports.CustomerModel = CustomerModel;
module.exports.ProductModel = ProductModel;
module.exports.DriverModel = DriverModel;
module.exports.OrderModel = OrderModel;
module.exports.UNITS = UNITS;
