"use strict";

var path = require("path");
var join = path.join;

/**
 * GET all sites
 */
exports.index = function(request, response) {
    var endpoint = join(__dirname, "..", "REST/SITES/list.json");
    response.sendfile(endpoint);
};
