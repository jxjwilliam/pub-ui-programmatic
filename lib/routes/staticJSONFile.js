"use strict";

var path = require("path");
var join = path.join;

/**
 * GET Static JSON File
 */
exports.index = function (request, response) {
    var endpoint = join(__dirname, "..", "APILIST/list.json");
    response.sendfile(endpoint);
};
