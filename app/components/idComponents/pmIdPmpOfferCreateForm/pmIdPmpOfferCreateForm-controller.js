"use strict";

var pmlComponents = angular.module("pmlComponents");

pmlComponents.controller("pmpCtrl", ["$scope", "pmAclHttpService", "NavLinks", function ($scope, pmAclHttpService, NavLinks) {

    var PmAgOptions = pmAclHttpService.getPmAgOptions();
    if (PmAgOptions.indexOf("AG") !== -1) {
        $scope.labels = NavLinks.PMAG.Labels;
        $scope.routes = NavLinks.PMAG.Routes;
        $scope.objectdisplayfields = "type,name,productName,description,price,{startDate-endDate}";
        $scope.objectdisplaylabels = "Type,Name,Product,Description,Price,Offer Period";
        $scope.offersApiString = "/api/alloffers?#LOGGED_IN_PUB#";
    }
    else {
        $scope.labels = NavLinks.PM.Labels;
        $scope.routes = NavLinks.PM.Routes;
        $scope.objectdisplayfields = "name,product,description,cpm,{offerStartDate-offerEndDate}";
        $scope.objectdisplaylabels = "Name,Product,Description,Price,Offer Period";
        $scope.offersApiString = "/api/inventory/offers?filters=name like *#SEARCH_TERM#*,description like *#SEARCH_TERM#*,tags like *#SEARCH_TERM#*&filters=loggedInOwnerId eq #LOGGED_IN_PUB#&filters=loggedInOwnerTypeId eq 1&sort=-modificationTime&cacheBreak=#CACHE_BREAK#";
    }

}]);