/*jshint camelcase:false,curly: false*/
/*jshint -W108 */
/*jshint -W109 */
"use strict";

var request = require("request");

exports.index = function (req, res) {
    var config = req.app.get("config");
    var ag_env = req.app.get("env");

    var castrumUrl = 'http://' +
        config[ag_env].server + ':' +
        config[ag_env].castrum.port +
        config[ag_env].castrum.api;
    castrumUrl = castrumUrl + req.url.replace("/api/castrum/", "");

    var headers = {'PubToken': req.query.apiAuthValue};

    request({
        url: castrumUrl,
        headers: headers
    }).pipe(res);
};


exports.userFeaturesMap = function (req, res) {

    var config = req.app.get("config");
    var ag_env = req.app.get("env");

    var castrumUrl = 'http://' +
        config[ag_env].server + ':' +
        config[ag_env].castrum.port +
        config[ag_env].castrum.api;
    castrumUrl = castrumUrl + req.url.replace("/api/castrum/", "");

    var headers = {'PubToken': req.query.apiAuthValue};

    request.get({
        url: castrumUrl,
        headers: headers
    }).pipe(res);

};

// curl -X GET -H "PubToken: adminuser" "http://54.164.157.178:7070/castrum/userFeatures" | python -m json.tool
exports.userFeaturesList = function (req, res) {

    var config = req.app.get("config");
    var ag_env = req.app.get("env");

    var castrumUrl = 'http://' +
        config[ag_env].server + ':' +
        config[ag_env].castrum.port +
        config[ag_env].castrum.api;
    castrumUrl = castrumUrl + req.url.replace("/api/castrum/", "");

    var headers = {'PubToken': req.query.apiAuthValue};

    request.get({
        url: castrumUrl,
        headers: headers
    }).pipe(res);

};
