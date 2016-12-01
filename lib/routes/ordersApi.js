/**
 * Module dependencies.
 * tarique rehman
 */
var request = require('request');

//BASE_URL = "http://54.164.157.178:9090/ag-api/alloffers";

exports.index = function (req, res) {
    
    var config = req.app.get("config");
    var ag_env = req.app.get("env");

    var ordersUrl = 'http://' +
        config[ag_env].ag_server +
        config[ag_env].orders.api;

    var ownerId = req.headers.resourceid || req.headers.common.resourceId || 41809;
    var pageNumber = req.query.pageNumber || 1, pageSize = req.query.pageSize || 20;

    //var url = BASE_URL; //+ '?ownerId=' + ownerId + '&ownerTypeId=1&pageNumber=' + pageNumber + '&pageSize=' + pageSize;

    console.log('all orders query: ', ordersUrl + req.url.replace("/api/orders",""));

    request({
        url: ordersUrl + req.url.replace("/api/orders",""),
        headers: req.headers
    }).pipe(res);

}
