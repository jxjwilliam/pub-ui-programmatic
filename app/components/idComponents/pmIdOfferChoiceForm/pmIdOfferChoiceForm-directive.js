/*jshint unused:false, camelcase:false,curly: false*/
/*jshint -W108 */
/*jshint -W109 */
'use strict';

var choice = angular.module("pmlComponents.pmIdOffersChoice");

//TODO: http://localhost:9000/images/icons/selected.png
choice.directive("pmIdOffersForm", ['$location', '$rootScope', '$timeout', 'ProductAgOption',
    function($location, $rootScope, $timeout, ProductAgOption) {

        var offersCtrl = choice.offersController;

        //for future minified product-version release.
        offersCtrl.$inject =
            ["pmApiService", "$scope", "$location", "$routeParams", "$rootScope", "$timeout",
                "AgOffersList", "ProductAgOption", "pmCommonApiService", "$http", "pmTokenStorageService",
                "MediaOceanValidation"];

        return {
            templateUrl: "components/idComponents/pmIdOfferChoiceForm/pmIdOfferChoiceForm-directive.html",
            restrict: "E",
            scope: {
                endpoint: "@endpoint"
            },
            controller: offersCtrl,

            link: function(scope, element, attrs) {

                var name = '', activeItems = [],
                    button = angular.element(document.querySelector('button.begin-offer'));

                scope.ag_checked = false;
                scope.pmp_checked = false;
                scope.partner_show = false;
                scope.partner_warning_show = false;
                scope.partner_status_show = false;
                scope.partner_kantar_show = false;
                scope.addDisabled = true;
                scope.button_content = 'Create Offers';
                scope.activeItems = [];

                scope.submit_offers = function() {
                    if (scope.activeItems.length === 0) return;

                    /**
                     * fix: partnerChoice init to empty array.
                     */
                    ProductAgOption.resetPartnerChoice();

                    if (scope.media_ocean) {
                        ProductAgOption.setPartnerChoice('media_ocean_choice');
                        ProductAgOption.setMediaOceanChoice(scope.validateStatus);
                    }
                    if (scope.kantar_media) {
                        ProductAgOption.setPartnerChoice('karntar_media_choice');
                    }

                    var url = '';
                    if (scope.activeItems.length === 2) {
                        url = '/offers/pmp/add';
                    }
                    else {
                        url = scope.activeItems[0] === 'PMP' ? '/offers/pmp/add' : '/offers/ag/add';
                    }
                    $timeout(function() {
                        scope.$apply(function() {
                            $location.path(url);
                        });
                    }, 1);
                    return false;
                };

                scope.itemSelected = function(item) {
                    if (item === '/offers/ag/add') {
                        name = 'Automated Guaranteed';
                        if (scope.ag_checked) {
                            scope.ag_checked = false;
                            scope.partner_show = false;
                            angular.forEach(scope.activeItems, function(value, index) {
                                if (value === name) scope.activeItems.splice(index, 1);
                            });
                        }
                        else {
                            scope.ag_checked = true;
                            scope.partner_show = true;
                            scope.activeItems.push(name);
                        }
                    }
                    else if (item === '/offers/pmp/add') {
                        name = 'PMP';
                        if (!scope.ag_checked) {
                            scope.partner_show = false;
                        }
                        if (scope.pmp_checked) {
                            scope.pmp_checked = false;
                            angular.forEach(scope.activeItems, function(value, index) {
                                if (value === name) scope.activeItems.splice(index, 1);
                            });
                        }
                        else {
                            scope.pmp_checked = true;
                            scope.activeItems.push(name);
                        }
                    }
                    else {
                        console.log('item can not be parsed: ', item);
                        return false;
                    }

                    // can't use scope.addDisabled = !scope.addDisabled.
                    if (scope.getMSValue()) {
                        if (scope.activeItems.length > 0) {

                            if (scope.activeItems.length > 1) scope.activeItems.sort().reverse();
                            //button.html(scope.button_content + ' for <strong>' + scope.activeItems.join(', ') + '</strong>');

                            if (!scope.kantar_media && !scope.media_ocean) {
                                if (scope.pmp_checked) {
                                    scope.addDisabled = false;
                                }
                                else {
                                    scope.addDisabled = true;
                                }
                            }
                            else if (scope.addDisabled) {
                                scope.addDisabled = false;
                            }
                        }
                        else {
                            if (!scope.addDisabled) scope.addDisabled = true;
                        }
                    }
                    else {
                        if (!scope.addDisabled) scope.addDisabled = true;
                    }

                    //scope.$emit('validatePartner');
                    return false;
                };

                scope.getMSValue = function() {
                    var selected = document.querySelector('button.multiSelect.multiSelectButton');
                    if (selected) {
                        var msValue = selected.innerText;
                        console.log('in getMSValue: ', msValue);
                        if (msValue !== 'Select Product')
                            return !!msValue;
                    }
                    return false;
                };
            }
        };
    }]);

