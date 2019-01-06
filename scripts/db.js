let loggerInDb = require('electron-timber')
var mongoose = require('mongoose');
mongoose.set('useFindAndModify', false)

var Schema = mongoose.Schema;
let ROLES = [];
let ROLE_SELECT_DATA = { text: "系统角色", children: [] }
let CAR_TYPE_SELECT_DATA = {text: '车型载重', children:[]}
let UNIT_SELECT_DATA 

const UNITS = [{ units: "千克" }, { units: "公斤" }, { units: "包" }]

let cartypeSchema = new Schema({ name: String })
let unitSchema = new Schema({ unit: String })
let sequenceSchema = new Schema({ seq_name: String, value: Number })
let configSchema = new Schema({ company_name: String, company_address: String, company_phone: String, company_fax: String, company_logo: String, db_version: String })
let roleSchema = new Schema({ role: String })
let provinceSchema = new Schema({ province: String, cities: [String] })
let regionSchema = new Schema({ region: String, provinces: [provinceSchema] })
let classificationSchema = new Schema({ classifications: Schema.Types.Mixed })// {classifications:[{name:"江苏",children:[]}]}
let userSchema = new Schema({ role: String, name: String, disabled: Boolean, password: String });
let driverSchema = new Schema({ name: String, cartype: {type:Schema.Types.ObjectId, ref:'cartype'}, car_No: String, id_No: String, driving_license_No: String, phone: String, address: String })

let _product = { name: String, model: String, price: String, units: String, memo: String, customer: { type: Schema.Types.ObjectId, ref: 'customer' }}
let productSchema = new Schema(_product)        //product不生成_id字段

let _customer = { name: String, index_code: String, principal: String, phone: String, address: String, classification: String, products: [{ type: Schema.Types.ObjectId, ref: 'product' }]}
let customerSchema = new Schema(_customer);

let orderProductSchema = new Schema({ product_name: String, product_model: String, product_price: String, product_units: String, product_memo: String, product_num: Number, product_sum: String }, { _id: false });

let _order = {
    state: String,    /*正常、作废、null*/
    cancel_by:String, /*作废人*/
    order_num: String,
    create_date: String,
    create_user: String,
    created_by: {type:Schema.Types.ObjectId, ref:'user'},
    customer_id: String,
    customer_name: String,
    customer_principal: String,
    contact_number: String,     /*联系电话，默认为客户电话*/
    delivery_address: String,   /*送货地址，默认为客户地址*/
    order_date: String,
    products: [orderProductSchema],
    products_num: Number,
    products_sum: String,
    order_driver: String, /*司机*/
    order_maker: String, /*制单人*/
    memo: String     /*订单备注*/
}
let orderSchema = new Schema(_order);


let ip_address = localStorage.getItem("db_address") || 'localhost:27017'
if (ip_address.indexOf(":") == -1) {
    ip_address += ":27017"
}
let db_address = 'mongodb://' + ip_address

let strUrl=location.href;
let arrUrl=strUrl.split("/");
let strPage=arrUrl[arrUrl.length-1];
loggerInDb.log(strPage +" * " + db_address)

let process = require('electron').remote.process
let argv = process.argv
let dbName = 'kis'
if (argv.length>=3 && argv[2]=='dev') {
    dbName = 'kis-dev'
}
/**DB utils **/
mongoose.connect(db_address, { dbName: dbName, useNewUrlParser: true });

CartypeModel = mongoose.model('cartype', cartypeSchema, 'cartypes')
UnitModel = mongoose.model('unit', unitSchema, 'units')
SequenceModel = mongoose.model('sequence', sequenceSchema, 'sequences')
ConfigModel = mongoose.model('config', configSchema, 'configs')
RoleModel = mongoose.model('role', roleSchema, 'roles');
RegionModel = mongoose.model('region', regionSchema, 'regions');
UserModel = mongoose.model('user'/*ming zi er yi*/, userSchema, 'users');
CustomerModel = mongoose.model('customer', customerSchema, 'customers');
ProductModel = mongoose.model('product', productSchema, 'products');
OrderModel = mongoose.model('order', orderSchema, 'orders');
ClassificationModel = mongoose.model("classification", classificationSchema, "classifications")
DriverModel = mongoose.model("driver", driverSchema, "drivers")

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.on('open', function () { loggerInDb.log("Open database connection.") })

function loadSysRoles() {
    RoleModel.find({}, function (err, roles) {
        ROLES = roles;
        for (let i = 0; i < roles.length; i++) {
            ROLE_SELECT_DATA.children.push({ "text": roles[i] })
        }
        // console.log(ROLE_SELECT_DATA)
    })
}

function loadConfig(callback) {
    ConfigModel.findOne({}, function (err, doc) {
        if (doc) {
            callback(doc)
        }
    })
}

/*module.exports = mongoose;
module.exports.loadSysRoles = loadSysRoles
// module.exports.getSysRoleTreeData = getSysRoleTreeData
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
module.exports.UNITS = UNITS;*/
