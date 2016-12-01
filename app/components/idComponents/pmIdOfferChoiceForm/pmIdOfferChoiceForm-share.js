"use strict";

/**
 * Here's the calling order:
 *
 * app.config()
 * app.run()
 * directive's compile functions (if they are found in the dom)
 * app.controller()
 * directive's link functions (again if found)
 */
var choice = angular.module("pmlComponents.pmIdOffersChoice", []);

choice.config(function () {
    //console.log('choice config is starting.');
});

choice.value("ShowMessage", {
    "partnerNotEmpty": "Please select at least one check box in the Available AG Demand Partners section",
    "helpPMP": "helpPMP",
    "helpAG": "helpAG"
});

choice.run(function () {
    //console.log("choice.run is running");
});