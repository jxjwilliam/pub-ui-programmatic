/*jshint camelcase:false,curly: false*/
/*jshint -W108 */
/*jshint -W109 */
"use strict";

var request = require("request");

exports.index = function (req, res) {

    var url = req.url.replace("/apidoc/brandcontrol", "");
    request({
        url: "http://api-test.pubmatic.com/brandcontrol/api-docs"+url,
        headers:{
            "PubToken": "7d5f0c5cbc0d49e1a01a6ed39c845652"
        }
    }).pipe(res);
};