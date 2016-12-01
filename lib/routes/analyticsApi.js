/*jshint camelcase:false,curly: false*/
/*jshint -W108 */
/*jshint -W109 */
"use strict";

var request = require("request");

exports.index = function (req, res) {

    var config = req.app.get("config");
    var ag_env = req.app.get("env");

    var analyticsUrl = config[ag_env].analytics.url;
    var analyticsToken = config[ag_env].analytics.token;

    analyticsUrl = analyticsUrl + req.url.replace("/api/analytics/", "");

    request({
        url: analyticsUrl,
        headers: {
            "PubToken": analyticsToken
        }
    }).pipe(res);
};