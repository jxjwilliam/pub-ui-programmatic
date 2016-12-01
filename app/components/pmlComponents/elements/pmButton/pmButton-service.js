/*jshint unused:false*/
"use strict";
//  Angular "service recipe"  More on providers here: http://docs.angularjs.org/guide/providers

var pubApplication = angular.module("pubApplication");

pubApplication.service("pmButtonService", ["$http",
    function($http) {
        return {

            /**
             *
             * XHR Call to any API at any endpoint.
             * Will make it easy to pre-configure all Apigee api calls in the future.
             *
             */

            callApi : function (endpoint) {
                return [
                    {
                        id:"create-product-choice",
                        toolTip:"Create a Product",
                        icon:"fa-cube",
                        templateUrl:""
                    },
                    {
                        id: "create-offer-choice",
                        toolTip:"Create an Offer",
                        icon:"fa-file-text",
                        templateUrl:""
                    },
                    {
                        id: "create-deal-choice",
                        toolTip:"Create a Deal",
                        icon:"fa-certificate",
                        templateUrl:""
                    },
                    {
                        id: "create-order-choice",
                        toolTip:"Create an Order",
                        icon:"fa-shopping-cart",
                        templateUrl:""
                    }
                ];
            }
        };
    }
]);
