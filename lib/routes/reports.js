/*jshint camelcase:false,curly: false*/
/*jshint -W108 */
/*jshint -W109 */
"use strict";

/**
 * Module dependencies.
 */
var path = require("path");
var join = path.join;

/**
 * GET list of canned, favorite reports
 */
exports.index = function(request, response) {
    var endpoint = join(__dirname, "..", "REST/REPORTS/list.json");
    response.sendfile(endpoint);
};
