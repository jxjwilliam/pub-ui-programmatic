/*jshint camelcase:false,curly: false*/
/*jshint -W108 */
/*jshint -W109 */
"use strict";

var request = require("request");

exports.index = function(req, res) {

    var url = req.url.replace("/apidoc/inventory", "");
    request({
        url: "http://api-test.pubmatic.com/inventory/api-docs" + url,
        headers: {
            "PubToken": "7d5f0c5cbc0d49e1a01a6ed39c845652"
        }
    }).pipe(res);
};
