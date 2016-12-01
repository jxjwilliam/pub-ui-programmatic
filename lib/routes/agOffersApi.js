/*jshint camelcase:false,curly: false*/
/*jshint -W108 */
/*jshint -W109 */
"use strict";

/**
 * Module dependencies.
 */
var request = require("request");
var trycatch = require("trycatch");

/**
 * var ag_env = process.env.AG_BACKEND ? process.env.AG_BACKEND : "localhost",
 *   ag_port = process.env.AG_PORT ? process.env.AG_PORT : "8080",
 *   ag_api = process.env.AG_API ? "/" + process.env.AG_API : "",
 *   ownerId = 0;
 * var BASE_URL = "http://" + ag_env + ":" + ag_port + ag_api + "/agoffers";
 */

exports.index = function (req, res) {

    var config = req.app.get("config");
    var ag_env = req.app.get("env");
    var agOffersUrl = "http://" +
        config[ag_env].ag_server + ":" +
        config[ag_env].agoffers.port +
        config[ag_env].agoffers.api;

    var ownerId = req.headers.resourceid || req.headers.common.resourceId;
    console.log("agoffers create:", req.body, "&ownerId=" + ownerId);

    request.post({
        url: agOffersUrl + "?ownerTypeId=1&ownerId=" + ownerId,
        json: req.body,
        headers: req.headers
    }, function (error) {
        console.log("Ag Offer ERROR:", error);
    }).pipe(res);
};


exports.findOne = function (req, res) {

    var config = req.app.get("config");
    var ag_env = req.app.get("env");
    var agOffersUrl = "http://" +
        config[ag_env].ag_server + ":" +
        config[ag_env].agoffers.port +
        config[ag_env].agoffers.api;

    var ownerId = req.headers.resourceid || req.headers.common.resourceId;
    var url = agOffersUrl + "/" + req.params.id + "?ownerId=" + ownerId + "&ownerTypeId=1";
    console.log("agOffers findOne[line 56]: ", req.params, url);

    request({
        url: url,
        headers: req.headers
    }).pipe(res);
};

//Accept:application/json
exports.findAll = function (req, res) {

    var config = req.app.get("config");
    var ag_env = req.app.get("env");
    var agOffersUrl = "http://" +
        config[ag_env].ag_server + ":" +
        config[ag_env].agoffers.port +
        config[ag_env].agoffers.api;

    var ownerId = req.headers.resourceid || req.headers.common.resourceId;

    trycatch(function () {
        request.get({
            url: agOffersUrl + "?ownerTypeId=1&ownerId=" + ownerId,
            headers: req.headers
        }).pipe(res);
    }, function (error) {
        console.log("jetty server is ECONNREFUSED! Please make the server run properly. Use mock-data instead.", error);
        res.sendfile("lib/REST/APILIST/agoffers.json");
    });
};

exports.edit = function (req, res) {

    var config = req.app.get("config");
    var ag_env = req.app.get("env");
    var agOffersUrl = "http://" +
        config[ag_env].ag_server + ":" +
        config[ag_env].agoffers.port +
        config[ag_env].agoffers.api;

    var ownerId = req.headers.resourceid || req.headers.common.resourceId;
    console.log("agOffers edit:", req.body, req.params);

    request.put({
        url: agOffersUrl + "/" + req.params.id + "?ownerId=" + ownerId + "&ownerTypeId=1",
        headers: req.headers,
        json: req.body
    }, function (error) {
        console.log("Automated-Guaranteed Update Error...!!!", error);
    }).pipe(res);
};

exports.update = function (req, res) {

    var config = req.app.get("config");
    var ag_env = req.app.get("env");
    var agOffersUrl = "http://" +
        config[ag_env].ag_server + ":" +
        config[ag_env].agoffers.port +
        config[ag_env].agoffers.api;

    var ownerId = req.headers.resourceid || req.headers.common.resourceId;
    console.log("agoffers update:", req.body, req.params, ownerId);

    request.put({
        url: agOffersUrl + "?ownerTypeId=1?ownerId=" + ownerId,
        headers: req.headers,
        json: req.body
    }, function (error) {
        console.log("Automated-Guaranteed Update Error...!!!", error);
    }).pipe(res);
};

exports.remove = function (req, res) {

    var config = req.app.get("config");
    var ag_env = req.app.get("env");
    var agOffersUrl = "http://" +
        config[ag_env].ag_server + ":" +
        config[ag_env].agoffers.port +
        config[ag_env].agoffers.api;

    var ownerId = req.headers.resourceid || req.headers.common.resourceId;
    console.log("agoffers remove:", req.params);

    request.delete({
        url: agOffersUrl + "/" + req.params.id + "?ownerTypeId=1?ownerId=" + ownerId,
        headers: req.headers
    }).pipe(res);
};