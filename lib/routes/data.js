"use strict";

var path = require("path");
var join = path.join;

/**
 * GET all sites
 */
exports.index = function(request, response) {
    var id, dimensions, metrics, limit, sort, startDate, endDate, filter;

    id = request.query.id || "1";
    dimensions = request.query.dimensions || "site";
    metrics = request.query.metrics || "revenue,impressions,ecpm";
    limit = request.query.limit || "10";
    sort = request.query.sort || "ecpm";
    startDate = request.query.startDate || "20140101";
    endDate = request.query.endDate || "20140201";
    filter = request.query.filter || "";

    var path = "REST/DATA/dimensions=" + dimensions + "&metrics=" + metrics + "&filter=" + filter + ".json";
    console.log(path);

    var endpoint = join(__dirname, "..", path);
    response.sendfile(endpoint);
};
