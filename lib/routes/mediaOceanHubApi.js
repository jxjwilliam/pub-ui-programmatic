/*jshint  unused:false, camelcase:false,curly: false*/
/*jshint -W108 */
/*jshint -W109 */
"use strict";

/**
 * AMG-307: MediaOcean Hub Mappings API
 */
var request = require("request");
var trycatch = require('trycatch');

/**
 * /pub-api-automated-guaranteed/src/main/resources/ag.properties:
 * mediaocean.service.url = http://54.164.157.178:9090/offers/
 * BASE_URL = "http://10.10.1.2:9999/mappings/";
 *  return 7 arrays: { 'statuses', 'positions', 'categories', 'adSizes', 'vendors', 'creativeTypes', 'currencies' }
 *  if return error, then send back to static file mo307.json.
 *
 *  http://54.164.157.178:9090/mediaocean-hub/mappings/vendors?ownerId=31445&ownerTypeId=1
 */
exports.positions = function(req, res) {

    var config = req.app.get("config");
    var ag_env = req.app.get("env");

    var mediaOceanHubUrl = "http://" +
        config[ag_env].server + ":" +
        config[ag_env].mediaocean.port +
        config[ag_env].mediaocean.positions;

    var ownerId = req.headers.resourceid || req.headers.common.resourceId;
    var params = "?ownerId=" + ownerId + "ownerTypeId=1";

    trycatch(function() {
        request.get({
            url: mediaOceanHubUrl + params,
            headers: req.headers
        }).pipe(res);
    }, function(error) {
        console.log("Media-Ocean server is ECONNREFUSED! Please make the server run properly. Use mock-data instead.", error);
        res.sendfile("lib/REST/APILIST/mo307.json");
    });
};

exports.adSizes = function(req, res) {

    var config = req.app.get("config");
    var ag_env = req.app.get("env");

    var mediaOceanHubUrl = "http://" +
        config[ag_env].server + ":" +
        config[ag_env].mediaocean.port +
        config[ag_env].mediaocean.adSizes;

    var ownerId = req.headers.resourceid || req.headers.common.resourceId;
    var params = "?ownerId=" + ownerId + "ownerTypeId=1";

    trycatch(function() {
        request.get({
            url: mediaOceanHubUrl + params,
            headers: req.headers
        }).pipe(res);
    }, function(error) {
        console.log("Media-Ocean server is ECONNREFUSED! Please make the server run properly. Use mock-data instead.", error);
        res.sendfile("lib/REST/APILIST/mo307.json");
    });
};

exports.categories = function(req, res) {

    var config = req.app.get("config");
    var ag_env = req.app.get("env");

    var mediaOceanHubUrl = "http://" +
        config[ag_env].server + ":" +
        config[ag_env].mediaocean.port +
        config[ag_env].mediaocean.categories;

    var ownerId = req.headers.resourceid || req.headers.common.resourceId;
    var params = "?ownerId=" + ownerId + "ownerTypeId=1";

    trycatch(function() {
        request.get({
            url: mediaOceanHubUrl + params,
            headers: req.headers
        }).pipe(res);
    }, function(error) {
        console.log("Media-Ocean server is ECONNREFUSED! Please make the server run properly. Use mock-data instead.", error);
        res.sendfile("lib/REST/APILIST/mo307.json");
    });
};

exports.orderMappings = function(req, res) {
    var config = req.app.get("config");
    var ag_env = req.app.get("env");

    var mediaOceanHubUrl = "http://" +
        config[ag_env].server +
        config[ag_env].mediaocean.orderMappings;

    var ownerId = req.query.ownerId || req.headers.resourceid;
    var params = "?ownerId=" + ownerId + "&ownerTypeId=1";

    console.log("orderMappings: ", mediaOceanHubUrl + params);
    trycatch(function() {
        request.get({
            url: mediaOceanHubUrl + params,
            headers: req.headers
        }).pipe(res);
    }, function(error) {
        console.log("Media-Ocean server is ECONNREFUSED! Please make the server run properly. Use mock-data instead.", error);
    });
}

exports.moGapUrlMappings = function(req, res) {
    var config = req.app.get("config");
    var ag_env = req.app.get("env");

    var url = req.query.url;

    console.log("======== 1111111111 =========", url);

    request.get(url).pipe(res);
}


exports.combined = function(req, res) {

    var config = req.app.get("config");
    var ag_env = req.app.get("env");

    var mediaOceanHubUrl = "http://" +
        config[ag_env].server + ":" +
        config[ag_env].mediaocean.port +
        config[ag_env].mediaocean.api;

    var ownerId = req.headers.resourceid || req.headers.common.resourceId;
    var params = "?ownerId=" + ownerId + "&ownerTypeId=1";

    trycatch(function() {
        request.get({
            url: mediaOceanHubUrl + params,
            headers: req.headers
        }).pipe(res);
    }, function(error) {
        console.log("Media-Ocean server is ECONNREFUSED! Please make the server run properly. Use mock-data instead.", error);
        res.sendfile("lib/REST/APILIST/mo307.json");
    });
};

exports.selected = function(req, res) {
    console.log(req.body, req.headers);
    var fs = require("fs");
    var body;
    req.on("data", function(data) {
        body += data;
    });

    request.on("end", function() {
        fs.writeFile("lib/REST/APILIST/moSelected.json", body, function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("The file was saved!");
            }
        });
    });
};