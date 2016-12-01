"use strict";

var httpProxy = require("http-proxy");
var apiProxy = httpProxy.createProxyServer();


var target = "http://api-test.pubmatic.com/common/api-docs";
var req = apiProxy.get(target, function (res) {

    // Buffer the body entirely for processing as a whole.
    var bodyChunks = [];
    res.on("data", function (chunk) {
        // You can process streamed parts here...
        bodyChunks.push(chunk);
    }).on("end", function () {
        var body = Buffer.concat(bodyChunks);
        // ...and/or process the entire body here.
        res.setHeader("Content-Type", "application/json");
        res.send(body);
    });
});

req.on("error", function (e) {
    console.log("ERROR: " + e.message);
});
