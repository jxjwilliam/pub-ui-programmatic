/*jshint unused:false*/
"use strict";

/**
 *
 * @ngdoc directive
 * @name pmAddControl
 * @restrict E
 *
 * @description Configurable Add button control for adding any PubMatic object (products, packages etc.)
 * @param {string} controlobjects List of JSON objects that can be added
 *
 * @example Configure Add button to enable addition of products
 <pre>
     <pm-add-control
        controlobjects='[{"id":"create-product-choice","toolTip":"Create a Product","icon":"fa-cube","templateUrl":""}'
     </pm-add-control>
 </pre>
 *
 *
 *
 */

angular.module("pubApplication")
    .directive("pmButton", [
        function () {
            return {
                templateUrl: "components/pmlComponents/elements/pmButton/pmButton-directive.html",
                restrict: "E",
                scope: {
                    labels: "@labels",
                    routes: "@routes"
                },
                controller: ["pmButtonService", "$scope", "$location", "$timeout", "$route",
                    function ($apiService, $scope, $location, $timeout, $route) {

                        $scope.itemList = [];
                        var labelList = $scope.labels.split(",");
                        var routeList = $scope.routes.split(",");

                        for (var i = 0; i < labelList.length; i++) {
                            $scope.itemList.push({"label": labelList[i], "route": routeList[i]});
                        }

                        $scope.itemClicked = function (item) {
                            console.log("pmButton-directive: ", item);
                            $timeout(function () {
                                $scope.$apply(function () {
                                    if ($location.path() === item.route && /(choose|choice|ag)/.test(item.route)) {
                                        $route.reload();
                                    }
                                    else {
                                        $location.path(item.route);
                                    }
                                });
                            }, 1);
                            return false; //prevent propagation.
                        };
                    }]
            };
        }
    ]
);
