/*jshint unused:false*/
"use strict";
//  Angular "service recipe"  More on providers here: http://docs.angularjs.org/guide/providers

var pmlComponents = angular.module("pmlComponents");

pmlComponents.service("pmApiService", ["$http", "pmTokenStorageService",
    function($http, pmTokenStorageService) {
        this.apiCache = {};

        this.callApi = function(endpoint) {

            // Check if we have called this endpoint first.
            //if (this.apiCache[endpoint] === undefined) {
            this.apiCache[endpoint] = $http.get(endpoint, {
                cache: false
            }, {
                headers: {
                    "PubToken": pmTokenStorageService.getAuthToken(),
                    "content-type":"application/json"
                }
            });
            //}

            return this.apiCache[endpoint];
        };
    }
]);
