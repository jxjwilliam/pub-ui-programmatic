/*jshint unused:false*/
"use strict";

/**
 *
 * @ngdoc directive
 * @name pmApiTable
 * @restrict E
 *
 * @description Call any PubMatic API and display the results in a UX compliant HTML table.
 * @param {string} apiEndpoint PubMatic API Endpoint (REST) called to populate the data table.
 * @param {string} method API CRUD method used for call (GET, POST, PUT, PATCH)
 * @param {string} fieldList Comma delimited list fields returned by the API that will display in the data table.
 *
 * @example Call <a href='www.google.com'>Inventory API</a> and display XYZ in the data table.
   <pre>
      <pm-api-table
         endpoint="inventory"
         method="GET"
         displayfields="api,endpoint,method,description">
      </pm-api-table>
   </pre>
 *
 *
 *
 */

var pmlComponents = angular.module("pmlComponents");

pmlComponents.directive("pmViewDetail", [
        function() {
            return {
                templateUrl:"components/pmlComponents/tags/pmViewDetail/pmViewDetail-directive.html",
                restrict: "E",
                scope: {
                    endpoint:      "@endpoint",
                    displayFields: "@objectdisplayfields",
                    baseObject:    "@baseobject"
                },
                controller:["pmApiService", "$scope", "$location", function($apiService, $scope, $location){

                    $scope.response = "waiting";
                    $scope.selectApi=function(item){
                        $location.url("/apiReference/"+item.api);
                    };
                    $scope.fieldList = $scope.displayFields.split(",");
                    $apiService.callApi($scope.endpoint).success(function (response) {

                        $scope.response = $scope.baseObject === undefined ? response : response[$scope.baseObject];
                        $scope.response = $scope.response.items[0];
                    }).error(function(){
                        $scope.response = "error";
                    });

                    $apiService.callApi("api/common/adSize").success(function (response) {

                        $scope.adSizes = $scope.baseObject === undefined ? response : response[$scope.baseObject];

                    }).error(function(){
                        $scope.adSizes = "error";
                    });
                }]
            };
        }
    ]
/*
 * Data Filter allowing tabular capitalization of the first letter.
 * TODO: Move filters to a centralized place.
 */
).filter("capitalize", function() {
        return function(input, scope) {
            if (input!==null) {
                input = input.toLowerCase();
            }
            return input.substring(0,1).toUpperCase()+input.substring(1);
        };
    }
);
