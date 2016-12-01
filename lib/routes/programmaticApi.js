/*jshint camelcase:false,curly: false*/
/*jshint -W108 */
/*jshint -W109 */
"use strict";

/**
 * Module dependencies.
 */
var request = require("request");

exports.index = function (req, res) {

    var config = req.app.get("config");
    var ag_env = req.app.get("env");

    var programmaticUrl = 'http://' +
        config[ag_env].server + ':' +
        config[ag_env].programmatic.port +
        config[ag_env].programmatic.api;


    programmaticUrl = programmaticUrl + req.url.replace("/api/programmatic/", "");

    request({
        url: programmaticUrl,
        headers: {
            "Cookie": "PLAY_SESSION=49043921f8f007561dcafc8567e90e447733fb7c-email=agdemo%40pubmatic.com"
        }
    }).pipe(res);
};
