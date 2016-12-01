/*jshint camelcase:false,curly: false*/
/*jshint -W108 */
/*jshint -W109 */
"use strict";

var request = require("request");

/**
 * Redirect requests to middleware.  this is to be changed when we have centralized docs on apigee.
 */
exports.index = function(req, res) {

    var url = req.url.replace("/apidoc/common", "");
    request({
        url: "http://api-test.pubmatic.com/common/api-docs" + url,
        headers: {
            "PubToken": "7d5f0c5cbc0d49e1a01a6ed39c845652"
        }
    }).pipe(res);
};
