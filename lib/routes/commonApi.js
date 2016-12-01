/*jshint camelcase:false,curly: false*/
/*jshint -W108 */
/*jshint -W109 */
"use strict";

var request = require("request");

exports.index = function (req, res) {

    var config = req.app.get("config");
    var ag_env = req.app.get("env");

    var commonUrl = "http://" +
        config[ag_env].server + ":" +
        config[ag_env].common.port +
        config[ag_env].common.api;

    commonUrl = commonUrl + req.url.replace("/api/common/", "");

    request({
        url: commonUrl,
        headers: req.headers
    }).pipe(res);
};
