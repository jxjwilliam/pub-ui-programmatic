"use strict";

var amg = angular.module("pmlComponents.pmIdAgOfferCreate");

amg.filter("capitalize", function() {
        return function(input) {
            if (input!==null) {
                input = input.toLowerCase();
            }
            return input.substring(0,1).toUpperCase()+input.substring(1);
        };
    }
);