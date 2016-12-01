/*global angular*/
/*jshint unused:false*/
(function(angular) {
    "use strict";

    var app = angular.module("pubApplication");

    app.config(function($routeProvider) {

        $routeProvider
            .when("/config", {
                templateUrl: "components/pages/pubConfigScreen/pubConfigScreen.html",
                controller: "pubConfigScreenCtrl"
            })
            .when("/products", {
                templateUrl: "components/pages/products/products.html"
            })
            .when("/products/:id", {
                templateUrl: "components/pages/products/products.html"
            })
            .when("/products/add", {
                templateUrl: "components/pages/products/products.html"
            })
            // orders routes
            .when("/orders", {
                templateUrl: "components/pages/orders/orders.html"
            })
             .when("/orders/:id", {
                templateUrl: "components/pages/orders/orderDetails.html"
            })
            
            // offers routes
            .when("/offers", {
                templateUrl: "components/pages/offers/choice.html"
            })
            .when("/offers/choose", {
                templateUrl: "components/pages/offers/choice.html"
            })
            .when("/offers/:id", {
                templateUrl: "components/pages/offers/ag.html"
            })
            .when("/offers/pmp/:id", {
                templateUrl: "components/pages/offers/offers.html"
            })
            .when("/offers/pmp/add", {
                templateUrl: "components/pages/offers/offers.html"
            })
            .when("/offers/ag/:id", {
                templateUrl: "components/pages/offers/ag.html"
            })
            .when("/offers/ag/add", {
                templateUrl: "components/pages/offers/ag.html"
            })
            //.when("/castrum", {
            //    templateUrl: "pmAclService.html"
            //})
            .otherwise({
                redirectTo: "/products"
            });
    });

    app.run([
        "pmTokenStorageService",
        "$location",
        "$http",

        function(tokenStorageService, $location, $http) {

            // Set all the session storage params
            tokenStorageService.setAuthType(($location.search()).apiAuthKey || tokenStorageService.getAuthType() || "");
            tokenStorageService.setAuthToken(($location.search()).apiAuthValue || tokenStorageService.getAuthToken() || "");
            tokenStorageService.setRefLoginOriginApp(($location.search()).originApp || tokenStorageService.getRefLoginOriginApp() || "");
            tokenStorageService.setRefLoginOriginUrl(($location.search()).originUrl || tokenStorageService.getRefLoginOriginUrl() || "#/loginlinks");
            tokenStorageService.setRefSignoutUrl(($location.search()).signoutUrl || tokenStorageService.getRefSignoutUrl() || "http://www.pubmatic.com");
            tokenStorageService.setResourceId(($location.search()).resourceId || tokenStorageService.getResourceId() || "");
            tokenStorageService.setResourceType(($location.search()).resourceType || tokenStorageService.getResourceType() || "");

            $http.defaults.headers.common.PubToken = tokenStorageService.getAuthToken() || ""; // No APIGEE
            $http.defaults.headers.common.Authorization = tokenStorageService.getAuthToken() || ""; // with APIGEE
            $http.defaults.headers.common.resourceId = tokenStorageService.getResourceId() || "";
            $http.defaults.headers.common.resourceType = tokenStorageService.getResourceType() || "";

            // If they are not authenticated send them to login screen (Pub UI)
            if (tokenStorageService.getAuthToken() === "") {
                window.location = "http://54.164.157.178:7070/AdGainMgmt/publisher/";
                return false;
            }
        }
    ]);

    app.run(["pmCommonApiService", function(pmCommonApiService) {
        pmCommonApiService.initAdFoldPlacements();
        pmCommonApiService.initPlatforms();
        pmCommonApiService.initVerticals();
        pmCommonApiService.initAdSizes();
        pmCommonApiService.getVastProtocols();
        pmCommonApiService.getVpaidCompliance();
        pmCommonApiService.initProducts();
        pmCommonApiService.initGeos();
        pmCommonApiService.initVideoPlaybackMethods();
        pmCommonApiService.initBrowsers();
        pmCommonApiService.initMobileCarriers();
        pmCommonApiService.initRichMediaTechnologies();
        pmCommonApiService.initAdvertisers();
        pmCommonApiService.initMobileOS();
        pmCommonApiService.initTabletDeviceTypes();
        pmCommonApiService.initMobileDeviceTypes();
        pmCommonApiService.initBuyers();
        pmCommonApiService.initAdvertisingEntity();
    }]);

}).call(this, angular);
