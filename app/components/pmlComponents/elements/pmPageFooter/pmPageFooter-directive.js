/**
 *
 * @ngdoc directive
 * @name pmPageFooter
 * @restrict E
 * @description Add PubMatic Footer to your application pages
 *
 *
 *  @example Add Page Footer to any page
 <pre>
     <pm-page-footer></pm-page-footer>
 </pre>
 *
 */

/*jshint unused:false*/
"use strict";

var pmlComponents =  angular.module("pmlComponents");
pmlComponents.directive("pageFooter", [function () {
    return {
        templateUrl: "components/pmlComponents/elements/pmPageFooter/pmPageFooter-directive.html",
        restrict: "EA",
        $scope:  {},
        controller: ["$scope", function($scope) {
            $scope.footerlinks = [];
        }]

    };
}]);
