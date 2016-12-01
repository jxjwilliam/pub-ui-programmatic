/*jshint camelcase:false,curly: false*/
/*jshint -W108 */
/*jshint -W109 */
"use strict";

var request = require("request");

exports.index = function (req, res) {

    var config = req.app.get("config");
    var ag_env = req.app.get("env");

    var brandControlUrl = 'http://' +
        config[ag_env].server + ':' +
        config[ag_env].brandcontrol.port +
        config[ag_env].brandcontrol.api;

    brandControlUrl = brandControlUrl + req.url.replace("/api/inventory/", "");

    request({
        url: brandControlUrl,
        headers: req.headers,
        json: req.body
    }).pipe(res);
};
