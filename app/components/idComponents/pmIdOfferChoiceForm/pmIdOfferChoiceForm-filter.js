/*jshint unused:false*/
"use strict";

var choice = angular.module("pmlComponents.pmIdOffersChoice");

choice.filter("capitalize", function () {
    return function (input, scope) {
        if (input !== null) {
            input = input.toLowerCase();
        }
        return input.substring(0, 1).toUpperCase() + input.substring(1);
    };
});