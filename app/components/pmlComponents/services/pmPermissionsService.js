/*jshint -W069, unused:false */
/*jshint -W108 */
/*jshint -W109 */
//Immediately-Invoked Function Expression (IIFE)
(function () {
    'use strict';

    var pmApp = angular.module("pmPermissionsService", ['ngResource']);

    pmApp.config(['$httpProvider', function ($httpProvider) {
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        $httpProvider.defaults.headers.common['Accept'] = 'application/json';
        $httpProvider.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';
    }]);

    pmApp.constant('NavLinks', {
        'PMAG': {
            Labels: 'New Offers,New Product',
            Routes: '/offers/choose,/products/add'
        },
        'PM': {
            Labels: 'New Offer,New Product',
            Routes: '/offers/pmp/add,/products/add'
        }
    });

    pmApp.constant('userFeaturesApi', '/api/castrum/userFeatures');
    pmApp.constant('aclResourceFeatureApi', '/api/castrum/aclResourceFeature');

    /**
     * Do we need a default setting in a developing env?
     * so `http://localhost:9000/#/products` also work (without parameters).
     */
    pmApp.value('PmAgDefault', [
            'http://localhost:9000/#/products?',
            'apiAuthKey=PubToken&',
            'apiAuthValue=adminuser&',
            'originApp=publisher&',
            'resourceId=31445&',
            'resourceType=publisher&',
            'signoutUrl=http:%2F%2Flocalhost:8080%2FAdGainMgmt%2Fpublisher%2F%3FviewName'
        ].join('')
    );

    pmApp.factory('pmAclHttpService', ["$http", "$location", "PmAgDefault", "userFeaturesApi", "aclResourceFeatureApi",
        function ($http, $location, PmAgDefault, userFeaturesApi, aclResourceFeatureApi) {

            var pmAgOptions = [];
            var userFeatures = {};
            var defaults = {
                'headers': {
                    'PubToken': 'adminuser'
                }
            };

            return {
                setPmAgOptions: function (options) {
                    pmAgOptions = options;
                },

                getPmAgOptions: function () {
                    return pmAgOptions;
                },

                setUserFeatures: function (dataItems) {
                    if (!dataItems) {
                        return false;
                    }
                    userFeatures = dataItems;
                    // serialize and save in Session.
                    sessionStorage.setItem('user_features', JSON.stringify(dataItems));
                },

                getUserFeatures: function () {
                    console.log(JSON.parse(sessionStorage.getItem('user_features')));
                    return userFeatures;
                },

                parseUrl: function (testUrl) {
                    var obj = {};
                    var ls = testUrl.split('?')[1].split('&').forEach(function (v) {
                        var t = v.split('=');
                        obj[t[0]] = t[1];
                    });

                    var key = obj.apiAuthKey;
                    var value = obj.apiAuthValue;
                    defaults.headers[key] = value;

                    sessionStorage.setItem(key, value);

                    obj.rtype = obj.resourceType === 'publisher' ? 1 : obj.resourceType;

                    return obj;
                },

                //'/api/castrum/aclResourceFeature',
                switchAgPm: function (loginUser) {

                    var obj = {};
                    if (loginUser) {
                        obj = this.parseUrl(loginUser);
                    }
                    else {
                        obj = $location.search();
                        if (Object.keys(obj).length > 0) {
                            obj.rtype = obj.resourceType === 'publisher' ? 1 : obj.resourceType;
                        }
                        else {
                            obj = this.parseUrl(PmAgDefault);
                        }
                    }

                    var self = this;
                    var key = obj.apiAuthKey;
                    var value = obj.apiAuthValue;
                    defaults.headers[key] = value;

                    $http.get(userFeaturesApi, {
                        params: {
                            'resourceId': obj.resourceId,
                            'resourceType': obj.rtype,
                            'apiAuthValue': obj.apiAuthValue,
                            'apiAuthKey': obj.apiAuthKey
                        },
                        headers: defaults.headers
                    }).then(function (response) {
                        var featureNames = response.data.items.map(function (v) {
                            return v.featureName.toUpperCase();
                        });
                        if (featureNames.indexOf('AG OFFER') !== -1) {
                            self.setPmAgOptions(['AG', 'PMP']);
                            //self.setPmAgOptions(['PMP']);
                        }
                        else {
                            //self.setPmAgOptions([110, 'PMP']);
                            self.setPmAgOptions(['PMP']);
                        }
                        console.log('pmAclService validation success: ', JSON.stringify(self.getPmAgOptions()));
                    }, function () {
                        //if validation failed, still PMP.
                        self.setPmAgOptions(['PMP']);
                        console.log('pmAclService validation fail: ', JSON.stringify(self.getPmAgOptions()));
                    });
                }
            };
        }]);

    pmApp.run(["pmAclHttpService", function (pmAclHttpService) {

        pmAclHttpService.switchAgPm();

    }]);

}());
