/*jshint camelcase:false,curly: false*/
/*jshint -W108 */
/*jshint -W109 */
"use strict";

var request = require("request");

exports.index = function (req, res) {

    var config = req.app.get("config");
    var ag_env = req.app.get("env");

    var inventoryUrl = 'http://' +
        config[ag_env].server + ':' +
        config[ag_env].inventory.port +
        config[ag_env].inventory.api;

    inventoryUrl = inventoryUrl + req.url.replace("/api/inventory/", "");

    //console.log("inventoryAPI:", inventoryUrl, req.headers);
    request({
        url: inventoryUrl,
        headers: req.headers
    }).pipe(res);
};
