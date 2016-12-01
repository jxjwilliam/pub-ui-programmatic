/*jshint unused:false*/
"use strict";
//  Angular "service recipe"  More on providers here: http://docs.angularjs.org/guide/providers

var pmlComponents = angular.module("pmlComponents");

pmlComponents.service("pmIdPmpOfferCreateFormService", ["$http",
    function($http) {
        return {

            /**
             *
             * XHR Call to any API at any endpoint.
             * Will make it easy to pre-configure all Apigee api calls in the future.
             *
             */

            callApi : function (endpoint) {
                return {};   //$http.get(endpoint, {cache: false});
            }
        };
    }
]);
