/*jshint unused:false, camelcase:false*/
/*jshint -W108 */
/*jshint -W109 */
'use strict';

var amg = angular.module("pmlComponents.pmIdAgOfferCreate");
var token = sessionStorage.getItem('Pubtoken') || 'adminuser';

/**
 * keep this for future product environment.
 */
amg.factory("AutomatedGuaranteed", function ($resource) {
    return $resource("/api/inventory/products/:id", null, {
        get: {method: "GET", headers: {"pubToken": token}},
        update: {method: "PUT", headers: {"pubToken": token}},
        save: {method: "POST", headers: {"pubToken": token}, url: "/api/inventory/products"}
    });
});

amg.factory('AgOffers', ['$resource', function ($resource) {
    return $resource('/api/agoffers/:id', {id: '@id'}, {
        update: {method: 'PUT'},
        query: {
            method: 'GET',
            headers: {"pubToken": token},
            isArray: true
        }
    });
}]);

amg.factory('MediaOceanService', ['$resource', function ($resource) {
    return $resource('/api/mediaOcean/mappings/selected');
}]);


amg.service('amgFormValues', function () {
    this.amg = {};
    this.getAmg = function () {
        return this.amg;
    };
    this.setAmg = function (amg) {
        this.amg = amg;
    };
});
