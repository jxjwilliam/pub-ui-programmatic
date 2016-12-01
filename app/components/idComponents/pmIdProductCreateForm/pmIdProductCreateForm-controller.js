"use strict";

var pmlComponents = angular.module("pmlComponents");

pmlComponents.controller("productCtrl", ["$scope", "pmAclHttpService", "NavLinks",
                function ($scope, pmAclHttpService, NavLinks) {

    /**
     * 'AG' and 'PMP'
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

    $scope.isProductCompatible = function(item) {
        //console.log("[IN isProductCompatible] item: ", item);
        var PmAgOptions = pmAclHttpService.getPmAgOptions();
        if (PmAgOptions.indexOf("AG") !== -1) {
            return ((item.adServerInventoryUnits === null) ? false : true);
        }
        return false;
    };
}]);
