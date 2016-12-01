"use strict";

var pmlComponents = angular.module("pmlComponents");

pmlComponents.controller("pmIdViewOrderDetailsController", ["$scope", "pmAclHttpService", "$routeParams", "NavLinks", "pmSharedObjectService",
    function($scope, pmAclHttpService, $routeParams, NavLinks, pmSharedObjectService) {
        /**
         * "AG" and "PMP"
         */
        var PmAgOptions = pmAclHttpService.getPmAgOptions();
        if (PmAgOptions.indexOf("AG") !== -1) {
            $scope.labels = NavLinks.PMAG.Labels;
            $scope.routes = NavLinks.PMAG.Routes;
        }
        else {
            $scope.labels = NavLinks.PM.Labels;
            $scope.routes = NavLinks.PM.Routes;
        }
        $scope.orderDetails = pmSharedObjectService.getSharedObject();
        $scope.orderId = $scope.orderDetails.id || $routeParams.id;
    }]);

/**
 * william fix bug: the button will move to next line without the filter.
 */
pmlComponents.filter("capitalizeFirst", function() {
        return function(input) {
            if (!input) {
                return;
            }
            return input.substring(0, 1).toUpperCase() + input.substring(1).toLowerCase();
        };
    }
);