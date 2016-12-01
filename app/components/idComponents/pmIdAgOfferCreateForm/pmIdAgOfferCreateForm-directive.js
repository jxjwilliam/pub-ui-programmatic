/*jshint unused:false*/
"use strict";

var amg = angular.module("pmlComponents.pmIdAgOfferCreate");

amg.directive("pmIdAgCreateForm",
    function () {
        var agCtrl = amg.pmIdAgCreateFormCtrl;
        //for future product minified.
        agCtrl.$inject = [
            "pmApiService",
            "$scope",
            "$location",
            "$rootScope",
            "$routeParams",
            "AutomatedGuaranteed",
            "ProductAgOption",
            "$timeout",
            "amgFormValues",
            "AgOffers",
            "pmCommonApiService",
            "pmTokenStorageService"
        ];

        return {
            templateUrl: "components/idComponents/pmIdAgOfferCreateForm/pmIdAgOfferCreateForm-directive.html",
            restrict: "E",
            scope: {
                endpoint: "@endpoint"
            },
            controller: agCtrl,
            link: function (scope, element, attrs) {
                //console.log(scope, element, attrs);
            }
        };
    }
);

