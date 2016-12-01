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
 <pm-top-navigation>
 </pm-top-navigation>
 </pre>
 *
 *
 *
 */

var pmlComponents = angular.module("pubApplication");

pmlComponents.directive("pmTopNavigation", [
    function() {
        return {
            templateUrl: "components/pmlComponents/navigation/pmTopNavigation/pmTopNavigation-directive.html",
            restrict: "E",
            controller: ["pmTokenStorageService", "$scope", "$location", "pmUtilService", "pmAclHttpService", "ProductAgOption",
            function(pmTokenStorageService, $scope, $location, pmUtilService, pmAclHttpService, ProductAgOption) {

                var authenticationString = "http://dev.analytics.matrix.pubmatic.com/#/SITESECTION?apiAuthKey=PubToken&apiAuthValue=" + pmTokenStorageService.getAuthToken() +
                    "&originApp=" + pmTokenStorageService.getRefLoginOriginApp() +
                    "&resourceId=" + pmTokenStorageService.getResourceId() +
                    "&resourceType=" + pmTokenStorageService.getResourceType() +
                    "&signoutUrl=" + pmTokenStorageService.getRefSignoutUrl(),
                    tempPathUrlObject = $location.path().split("/"),
                    currentView = tempPathUrlObject[tempPathUrlObject.length - 1];

                $scope.menu = [{
                        display: "Insights",
                        href: "#/",
                        cls: "",
                        links: [{
                                display: "Real Time Dashboard",
                                nlp: "dashboard",
                                icon: "th-pulse",
                                href: authenticationString.replace("SITESECTION", "dashboard")
                            }, {
                                display: "Create a Report",
                                nlp: "create report",
                                icon: "th-create-report",
                                href: authenticationString.replace("SITESECTION", "dimensions")
                            }, {
                                display: "Standard Reports",
                                nlp: "standard reports",
                                icon: "th-copy",
                                href: authenticationString.replace("SITESECTION", "standard")
                            }, {
                                display: "Custom Reports",
                                nlp: "custom reports",
                                icon: "fa fa-save",
                                href: authenticationString.replace("SITESECTION", "custom")
                            }, {
                                display: "Scheduled Reports",
                                nlp: "schedule reports",
                                icon: "fa fa-calendar",
                                href: authenticationString.replace("SITESECTION", "schedule")
                            },
                            //{display:"Classic Reports", nlp:"classic report", icon:"fa fa-angle-left", href: tokenStorageService.getRefLoginOriginUrl() }
                            {
                                display: "Classic Reports",
                                nlp: "classic report",
                                icon: "fa fa-angle-left",
                                href: authenticationString.replace("SITESECTION", "loginlinks")
                            }
                        ]
                        },
                    //{display:"Inventory", icon:"fa fa-angle-left", href: tokenStorageService.getRefLoginOriginUrl(), links: [
                        {
                            display: "Inventory",
                            icon: "fa fa-angle-left",
                            href: "",
                            cls: "active",
                            links: [{
                                display: "Products",
                                nlp: "products",
                                cls: currentView.indexOf("product") !== -1 ? "active" : "",
                                icon: "th-pulse",
                                href: "#/products"
                            }, {
                                display: "Offers",
                                nlp: "offers",
                                cls: currentView.indexOf("offer") !== -1 ? "active" : "",
                                icon: "th-pulse",
                                href: "#/offers"
                            }, ]
                        }
                ];

                $scope.selectedMenu = $scope.menu[1];

                var PmAgOptions = pmAclHttpService.getPmAgOptions();
                if (PmAgOptions.indexOf("AG") !== -1) {
                    $scope.selectedMenu.links.push({
                        display: "Orders",
                        nlp: "orders",
                        cls: currentView.indexOf("order") !== -1 ? "active" : "",
                        icon: "th-pulse",
                        href: "#/orders"
                    });
                }

                $scope.publisherHome = window.location.protocol + "//" + window.location.hostname + ":8146/AdGainMgmt/dashboard.jsp";
                $scope.signOutUrl = pmTokenStorageService.getRefSignoutUrl();
                $scope.postLogoutActions = function () {
                    pmUtilService.clearSessionPageInfo();
                };
            }]
        };
    }
]);
