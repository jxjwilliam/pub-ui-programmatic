/*jshint camelcase:false,curly: false*/
/*jshint -W108 */
/*jshint -W109 */
"use strict";

var request = require("request");

exports.index = function (req, res) {

    //http: //api-test.pubmatic.com/apidoc/audience.html
    var url = req.url.replace("/apidoc/audience", "");
    console.log("http://api-test.pubmatic.com/audience/api-docs" + url);
    request({
        url: "http://api-test.pubmatic.com/audience/api-docs" + url,
        headers: {
            "PubToken": "7d5f0c5cbc0d49e1a01a6ed39c845652"
        }
    }).pipe(res);
};
