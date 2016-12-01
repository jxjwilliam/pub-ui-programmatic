/*jshint camelcase:false,curly: false*/
/*jshint -W108 */
/*jshint -W109 */
"use strict";

var request = require("request");
//require('request-debug')(request);

exports.index = function (req, res) {

    var config = req.app.get("config");
    var ag_env = req.app.get("env");

    var inventoryPutUrl = 'http://' +
        config[ag_env].server + ':' +
        config[ag_env].inventory.port +
        config[ag_env].inventory.api;

    inventoryPutUrl = inventoryPutUrl + req.url.replace("/api/inventory/", "");

    request.put({
        url: inventoryPutUrl,
        headers: req.headers,
        json: req.body
    }, function (error) {
        console.log("Product Created...!!!", error);
    }).pipe(res);
};
