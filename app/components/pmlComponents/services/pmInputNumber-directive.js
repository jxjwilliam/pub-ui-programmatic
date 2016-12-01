/*jshint unused:false*/
"use strict";

/**
 *
 * @ngdoc directive
 * @name pmInputNumber
 *
 * @description Input type number -> Allows only number values to be entered
 * @param NA
 *
 * @example Add pm-input-number as an attribute to HTML input[type=text] field
   <pre>
       <input pm-input-number type="text"/>
   </pre>
 *
 *
 *
 */

var app = angular.module("pubApplication");

app.directive("pmInputNumber", function() {
    return {
        require: "ngModel",
        link: function(scope, element, attrs, modelCtrl) {
            function inputValue(val) {
                if (val) {
                    var digits = val.replace(/[^0-9.]/g, "");

                    if (digits !== val) {
                        modelCtrl.$setViewValue(digits);
                        modelCtrl.$render();
                    }
                    return parseFloat(digits);
                }
                return undefined;
            }
            modelCtrl.$parsers.unshift(inputValue);
        }
    };
});
