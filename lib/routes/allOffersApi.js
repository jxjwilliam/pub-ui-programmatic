/*jshint camelcase:false,curly: false*/
/*jshint -W108 */
/*jshint -W109 */
"use strict";

/**
 * Module dependencies.
 * William Jiang: ng-date: {{date}}
 */
var express = require('express');
var request = require('request');
var app = express();

/**
 * export AG_BACKEND=54.164.157.178
 * export AG_PORT=9090
 * BASE_URL = "http://54.164.157.178:9090/ag-api/alloffers";
 * var BASE_URL = 'http://' + ag_env + ':' + ag_port + ag_api + '/alloffers';
 *  var ag_env = process.env.AG_BACKEND ? process.env.AG_BACKEND : 'localhost',
 *   ag_port = process.env.AG_PORT ? process.env.AG_PORT : '8080',
 *   ag_api = process.env.AG_API ? '/' + process.env.AG_API : '';
 */

exports.index = function (req, res) {

    var config = req.app.get("config");
    var ag_env = req.app.get("env");

    var allOffersUrl = 'http://' +
        config[ag_env].ag_server + ':' +
        config[ag_env].alloffers.port +
        config[ag_env].alloffers.api;

    var ownerId = req.headers.resourceid || req.headers.common.resourceId;
    var pageNumber = req.query.pageNumber || 1;
    var pageSize = req.query.pageSize || 20;

    allOffersUrl =
        allOffersUrl +
        '?ownerId=' + ownerId +
        '&ownerTypeId=1&pageNumber=' + pageNumber +
        '&pageSize=' + pageSize;
    console.log('all offers query: ', allOffersUrl, req.query);

    request({
        url: allOffersUrl,
        headers: req.headers
    }).pipe(res);

}
