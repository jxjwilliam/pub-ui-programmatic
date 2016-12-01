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

pmlComponents.directive("pmApiTable", [
        function() {
            return {
                templateUrl: "components/pmlComponents/elements/pmApiTable/pmApiTable-directive.html",
                restrict: "E",
                scope: {
                    endpoint: "@endpoint",
                    displayFields: "@objectdisplayfields",
                    displayLabels: "@objectdisplaylabels",
                    baseobject: "@baseobject",
                    showLinks: "@showlinks",
                    calculationFieldLabel: "@calculationfieldlabel",
                    calculationsExpression: "&calculationsexpression",
                    pageName: "@pagename",
                    search: "@search",
                    pageSize: "@pagesize"
                },
                controller: ["pmApiService", "$scope", "$rootScope", "$location", "$sce", "$routeParams", "pmTokenStorageService", "pmUtilService", "pmSharedObjectService",
                    function($apiService, $scope, $rootScope, $location, $sce, $routeParams, $pmTokenStorageService, $pmUtilService, pmSharedObjectService) {
                        $scope.response = "waiting";
                        $scope.panelView = false;
                        $scope.firstPage = 1;
                        $scope.previousPage = 1;
                        $scope.currentPage = 1;
                        $scope.nextPage = 2;
                        $scope.lastPage = 0;
                        $scope.isFirstPage = true;
                        $scope.isLastPage = false;
                        $scope.showOverlay = $rootScope.showOverlay;
                        $scope.fieldList = $scope.displayFields.split(",");
                        $scope.labelList = $scope.displayLabels.split(",");
                        $scope.origEndPoint = $scope.endpoint;
                        $scope.endpoint = $scope.endpoint.replace("#CACHE_BREAK#", new Date());
                        $scope.pagingEnabled = true;
                        $scope.searchText = "";

                        $scope.showPanel = function($scope) {
                            $scope.panelView = !$scope.panelView;
                        };

                        $rootScope.$on("showOverlay", function(event, overlayShow) {
                            $scope.showOverlay = $rootScope.showOverlay = overlayShow;
                            /**
                             * "none", "block", ""
                             * var ol = document.querySelector("#overlay");
                             * angular.element(ol).css("display", overlayShow);
                             */
                            return false;
                        });

                        $scope.init = function() {

                            $scope.currentPage = ($pmUtilService.getSessionStorageItem($scope.pageName + "-currentPage") === null) ? 1 : parseInt(sessionStorage.getItem($scope.pageName + "-currentPage"));

                            // special case for all offers as parameters are different format
                            // default: filters=ownerId eq 31445&filters=ownerTypeId eq 1
                            // offers/orders/lineitems: ownerId=31445&ownerTypeId=1
                            if (($location.$$path.search("offers") > 0) || ($location.$$path.search("orders") > 0)) {
                                $scope.endpoint = $scope.endpoint.replace("#LOGGED_IN_PUB#", "ownerId=" + $pmTokenStorageService.getResourceId() + "&ownerTypeId=1") + "&pageSize=" + $scope.pageSize + "&pageNumber=" + $scope.currentPage;
                            }
                            else {
                                $scope.endpoint = $scope.endpoint.replace("#LOGGED_IN_PUB#", $pmTokenStorageService.getResourceId()).replace(/#SEARCH_TERM#/g, "") + "&pageSize=" + $scope.pageSize + "&pageNumber=" + $scope.currentPage;
                            }

                            $apiService.callApi($scope.endpoint).success(function(response) {
                                $scope.response = $scope.baseobject === undefined ? response : response[$scope.baseobject];

                                // Paging
                                $scope.totalRecords = response.metaData.totalRecords;
                                $scope.lastPage = $scope.calculateTotalPages($scope.totalRecords);
                                $scope.pagingEnabled = ($scope.totalRecords > $scope.pageSize);

                                // stay on same grid page when refreshing
                                if ($scope.currentPage > "1") { // user selected item on page 1+
                                    $scope.isFirstPage = false;
                                    $scope.previousPage = $scope.currentPage - 1;
                                    $scope.nextPage = ($scope.currentPage < $scope.lastPage) ? $scope.currentPage + 1 : $scope.lastPage;
                                    $scope.isLastPage = ($scope.currentPage === $scope.lastPage) ? true : false;
                                } else { // user selected item on page 1
                                    $scope.isFirstPage = true;
                                    $scope.previousPage = 1;
                                    $scope.nextPage = ($scope.currentPage < $scope.lastPage) ? $scope.currentPage + 1 : $scope.lastPage;
                                    $scope.isLastPage = ($scope.currentPage === $scope.lastPage) ? true : false;
                                }
                            }).error(function() {
                                $scope.response = "error";
                            });
                        };
                        $scope.init();

                        $scope.doAction = function($scope) {
                            console.log("[IN doAction] path:", $location.$$path + "/" + $scope.item.id);
                            pmSharedObjectService.setSharedObject($scope.item);
                            $pmUtilService.setSessionStorageItem($scope.pageName + "-currentPage", parseInt($scope.currentPage)); // storing page specific pagination
                            if ($location.$$path.search("offers") > 0) {
                                $location.path($location.$$path + "/" + (($scope.item.type !== undefined) ? $scope.item.type.toLowerCase() : "pmp") + "/" + $scope.item.id);
                            }
                            else {
                                $location.path($location.$$path + "/" + $scope.item.id);
                            }
                        };

                        $scope.clearSearch = function() {
                            $scope.searchText = "";
                            $scope.doSearch({keyCode: 13});
                        };

                        $scope.doSearch = function(evt, searchText) {
                            if (evt.keyCode === 13) { // user hits "enter". call the api with searchText as query parameter
                                $scope.endpoint = $scope.origEndPoint;
                                $scope.endpoint = $scope.endpoint.replace("#CACHE_BREAK#", new Date());
                                $scope.endpoint = $scope.endpoint.replace("#LOGGED_IN_PUB#", $pmTokenStorageService.getResourceId()).replace(/#SEARCH_TERM#/g, $scope.searchText) + "&pageSize=" + $scope.pageSize + "&pageNumber=1";
                                $apiService.callApi($scope.endpoint).success(function(response) {
                                    $scope.response = $scope.baseobject === undefined ? response : response[$scope.baseobject];
                                    //                       $scope.response = $scope.response.items;

                                    // set up paging
                                    $scope.totalRecords = response.metaData.totalRecords;
                                    $scope.currentPage = 1;
                                    $scope.previousPage = 1;
                                    $scope.lastPage = $scope.calculateTotalPages($scope.totalRecords);
                                    $scope.nextPage = (1 === $scope.lastPage) ? $scope.lastPage : 2;
                                    $scope.pagingEnabled = ($scope.totalRecords > $scope.pageSize);

                                    //If records are not present.
                                    if (response.metaData.totalRecords === 0) {
                                        $scope.response = "empty";
                                    }
                                }).error(function() {
                                    $scope.response = "error";
                                });
                            }
                        };

                        $scope.normalizeDate = function(dateString) {
                            var timezone = "America/Los_Angeles",
                                onGoingDate = "12/31/2032",
                                returnString = moment.tz(dateString, timezone).format("MM/DD/YYYY");

                            if (returnString === onGoingDate) {
                                returnString = "Ongoing";
                            }

                            return returnString;
                        };

                        $scope.formatField = function(item, field) {
                            var values = "";
                            var valueList = [];
                            if (field.match(/{([A-Za-z])\w+-([A-Za-z])\w+}/g)) { // format: {field1-field2}
                                var fields = field.replace("{", "").replace("}", "").split("-"); // creates an array of 2 fields [field1,field2]
                                if (fields[0].search("Date") > 0) {
                                    if (item.type === "AG") {
                                        values = values + "Ongoing";
                                    }
                                    else {
                                        values = values + $scope.normalizeDate(item[fields[0]]) + " - " + $scope.normalizeDate(item[fields[1]]);
                                    }
                                } else {
                                    values = values + item[fields[0]] + " - " + item[fields[1]];
                                }
                            } else {
                                if (typeof item[field] === "object") {
                                    if (item[field] !== null && item[field].constructor === Array) {
                                        angular.forEach(item[field], function(value, key) {
                                            if (value !== null) {
                                                valueList.push(value.name);
                                            }
                                        });
                                        values = valueList.join(", ");
                                        valueList = [];
                                    } else {
                                        values = values + ((item[field] !== null) ? item[field].name : "");
                                    }

                                } else {
                                    values = (item[field] !== null) ? item[field] : "";
                                }
                            }
                            // temporary solution for first column width
                            if (field === "name") {
                                if (item[field].length > 21) {
                                    values = values.substring(0, 21) + "...";
                                }
                            }
                            return values;
                        };

                        $scope.calculateTotalPages = function(recordCount) {
                            var totalPages = Math.floor(recordCount / $scope.pageSize);
                            if ((recordCount % $scope.pageSize) > 0) {
                                totalPages++;
                            }
                            return totalPages;
                        };

                        $scope.pageClick = function(pageNumber) {
                            $scope.response = "waiting";
                            $scope.currentPage = pageNumber;
                            $scope.previousPage = (pageNumber === 1) ? 1 : (pageNumber - 1);
                            $scope.nextPage = (pageNumber === $scope.lastPage) ? $scope.lastPage : (pageNumber + 1);
                            $scope.isFirstPage = (pageNumber === 1) ? true : false;
                            $scope.isLastPage = (pageNumber === $scope.lastPage) ? true : false;
                            $scope.endpoint = $scope.origEndPoint;
                            $scope.endpoint = $scope.endpoint.replace("#CACHE_BREAK#", new Date());
                            
                            if (($location.$$path.search("offers") > 0) || ($location.$$path.search("orders") > 0)) {
                                $scope.endpoint = $scope.endpoint.replace("#LOGGED_IN_PUB#", "ownerId=" + $pmTokenStorageService.getResourceId() + "&ownerTypeId=1") + "&pageSize=" + $scope.pageSize + "&pageNumber=" + pageNumber;
                            }
                            else {
                                $scope.endpoint = $scope.endpoint.replace("#LOGGED_IN_PUB#", $pmTokenStorageService.getResourceId()).replace(/#SEARCH_TERM#/g, $scope.searchText) + "&pageSize=" + $scope.pageSize + "&pageNumber=" + pageNumber;
                            }

                            $apiService.callApi($scope.endpoint).success(function(response) {
                                $scope.response = $scope.baseobject === undefined ? response : response[$scope.baseobject];
                            }).error(function() {
                                $scope.response = "error";
                            });
                        };

                        if ($routeParams.refresh === "true") {
                            console.log("Refresh Called");
                            $scope.pageClick();
                        }
                    }
                ]
            };
        }
    ]
    /*
     * Data Filter allowing tabular capitalization of the first letter.
     * TODO: Move filters to a centralized place.
     */
).filter("capitalize", function() {
        return function(input, scope) {
            if (input !== null) {
                if (typeof(input) === "undefined") {
                    return input;
                }
                if (typeof(input) === Number) {
                    return input;
                }
                if (typeof(input) === String) {
                    input = input.toString().toLowerCase();
                    return input.substring(0, 1).toUpperCase() + input.substring(1);
                }
            }
        };
    }
);
