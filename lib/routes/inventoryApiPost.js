/*jshint camelcase:false,curly: false*/
/*jshint -W108 */
/*jshint -W109 */
"use strict";

var request = require("request");
//require('request-debug')(request);

exports.index = function (req, res) {

    var config = req.app.get("config");
    var ag_env = req.app.get("env");

    var inventoryPostUrl = 'http://' +
        config[ag_env].server + ':' +
        config[ag_env].inventory.port +
        config[ag_env].inventory.api;

    inventoryPostUrl = inventoryPostUrl + req.url.replace("/api/inventory/", "");

    request.post({
        url: inventoryPostUrl,
        json: req.body,
        headers: req.headers
    }, function (error) {
        console.log("Product Created...!!!", error);
    }).pipe(res);
};
