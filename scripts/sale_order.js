function saveOrder(order, callback) {

        mongoose.OrderModel.create(order, function(err, doc) {
            if (err) handleError(err)
            if (doc) {
                console.log("保存订单成功！")
                console.log(JSON.stringify(doc))
                callback(doc)
            }
        })


}