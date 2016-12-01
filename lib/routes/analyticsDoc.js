"use strict";

var request = require("request");

exports.index = function (req, res) {

    var url = req.url.replace("/apidoc/analytics", "");
    request("http://107.23.152.230:8080/v1/analytics/api-docs"+url).pipe(res);
};