"use strict";

var pmlComponents = angular.module("pmlComponents");

pmlComponents.directive("pmIdViewOrderDetails", [
        function() {
            return {
                templateUrl: "components/idComponents/pmIdViewOrderDetails/pmIdViewOrderDetails-directive.html",
                restrict: "E",
                scope: {
                    endpoint: "@endpoint"
                },
                controller: ["$scope", "pmSharedObjectService", "$modal", "$http",
                    function($scope, pmSharedObjectService, $modal, $http) {
                        $scope.orderDetails = {};

                        $scope.normalizeDate = function(dateString) {
                            var timezone = "America/Los_Angeles",
                                onGoingDate = "12/31/2032",
                                returnString = moment.tz(dateString, timezone).format("MM/DD/YYYY");

                            if (returnString === onGoingDate) {
                                returnString = "Ongoing";
                            }

                            return returnString;
                            //return dateString.substring(0,10);
                        };

                        $scope.init = function() {
                            $scope.orderDetails = pmSharedObjectService.getSharedObject();

                            $scope.orderId = $scope.orderDetails.id;
                            $scope.showOrderApproval = /PENDING_APPROVAL/i.test($scope.orderDetails.status);

                            $scope.moGapUrl = "/api/mediaOcean/mappings/orderMappings";

                            $http.get($scope.moGapUrl).success(function(data) {
                                    // http://gap.mediaocean.com/gap/client/index.html?t=GYacWL2C3g5Qb4tutOAXcE7%2FEMruLJOL
                                    $scope.moGapUrl = data[0].moGapUrl;
                                }
                            );
                        };

                        $scope.init();
                    }
                ]
            };
        }
    ]
    /**
     * Data Filter allowing tabular capitalization of the first letter.
     * TODO: Move filters to a centralized place.
     */
);
