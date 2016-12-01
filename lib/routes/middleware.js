"use strict";

var express = require("express");
var app = express();
var httpProxy = require("http-proxy");
var apiProxy = httpProxy.createProxyServer();

/**
 * Redirect requests to middleware
 */
exports.index = function(req, res) {

    req.url = req.url.replace("api/", "");

    var target = app.get("middlewareURL") + req.url;

    apiProxy.web(req, res, {
        target: target
    });

    apiProxy.on("error", function(e) {
        console.log("Proxy error: ", e);
    });
};
