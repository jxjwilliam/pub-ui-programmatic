/*jshint camelcase:false,curly: false*/
/*jshint -W108 */
/*jshint -W109 */
"use strict";

var request = require("request");

exports.index = function (req, res) {

    var config = req.app.get("config");
    var ag_env = req.app.get("env");

    var audienceUrl = 'http://' +
        config[ag_env].server + ':' +
        config[ag_env].audience.port +
        config[ag_env].audience.api;

    audienceUrl = audienceUrl + req.url.replace("/api/audience/", "");

    request({
        url: audienceUrl,
        headers: req.headers
    }).pipe(res);
};
