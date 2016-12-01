/*jshint unused:false, camelcase:false,curly: false*/
/*jshint -W108 */
/*jshint -W109 */
"use strict";

var choice = angular.module('pmlComponents.pmIdOffersChoice');

choice.controller('choiceCtrl', ["$scope", "pmAclHttpService", "NavLinks",
    function($scope, pmAclHttpService, NavLinks) {

        var PmAgOptions = pmAclHttpService.getPmAgOptions();
        if (PmAgOptions.indexOf('AG') !== -1) {
            $scope.labels = NavLinks.PMAG.Labels;
            $scope.routes = NavLinks.PMAG.Routes;
            $scope.objectdisplayfields = "type,name,productName,description,price,{startDate-endDate}";
            $scope.objectdisplaylabels = "Type,Name,Product,Description,Price,Offer Period";
            $scope.offersApiString = "/api/alloffers?#LOGGED_IN_PUB#";
        }
        else {
            $scope.labels = NavLinks.PM.Labels;
            $scope.routes = NavLinks.PM.Routes;
            $scope.objectdisplayfields = "name,product,description,cpm,{offerStartDate-offerEndDate}";
            $scope.objectdisplaylabels = "Name,Product,Description,Price,Offer Period";
            $scope.offersApiString = "/api/inventory/offers?filters=name like *#SEARCH_TERM#*,description like *#SEARCH_TERM#*,tags like *#SEARCH_TERM#*&filters=loggedInOwnerId eq #LOGGED_IN_PUB#&filters=loggedInOwnerTypeId eq 1&sort=-modificationTime&cacheBreak=#CACHE_BREAK#";
        }
    }]);


choice.offersController = function(pmApiService, $scope, $location, $routeParams, $rootScope, $timeout,
                                   AgOffersList, ProductAgOption,
                                   pmCommonApiService, $http, pmTokenStorageService,
                                   MediaOceanValidation) {

    $scope.panelView = "close";
    //$rootScope.showOverlay = "none";
    $scope.detailsRowToggle = false;
    $scope.validateStatus = '';
    $scope.kantarFullySelect = '';
    $scope.media_ocean_flag = true;
    pmCommonApiService.setPreviousUrl($location.path());
    MediaOceanValidation.getHttpMOData();
    $scope.showAdServer = false;

    if (typeof $routeParams.id !== "undefined") {
        $timeout(function() {
            $scope.$apply(function() {
                $scope.panelView = "open";
            });
        }, 200);
        if ($routeParams.id === "add") {
            $scope.mode = "add";
            $scope.screenTitle = "Create an Offer";
            $scope.buttonTitle = "Create Offer";
            $scope.submit_button_content = 'Create';
        } else {
            $scope.mode = "edit";
            $scope.productId = $routeParams.id;
            $scope.screenTitle = "Edit Offer";
            $scope.buttonTitle = "Update Offer";
        }
        $rootScope.$emit("showOverlay", "block");
    } else {
        if (/choose/.test($location.path())) {
            $scope.mode = "add";
            $scope.panelView = "open";
            $scope.screenTitle = "Create an Offer";
            $rootScope.$emit("showOverlay", "block");
        }
        else {
            $scope.panelView = "close";
            $rootScope.$emit("showOverlay", "none");
            $rootScope.$broadcast("showOverlay", "none");
        }
    }

    $scope.cancel = function() {
        $location.path("/offers");
        return false;
    };

    $scope.selectProductItem = function(data) {
        if (!data || !$scope.productOffersItems)
            return;

        var selectedProduct = null;
        $scope.productOffersItems.some(function(element, index) {
            if (element.name === data.name) {
                selectedProduct = element;
                return true;
            }
            return false;
        });

        if (selectedProduct) {
            $scope.detailsRowToggle = true;
            ProductAgOption.setOption(selectedProduct);
            ProductAgOption.setSelectedProduct(selectedProduct);
        }
        else {
            $scope.detailsRowToggle = false;
        }

        /**
         * william jiang: validate media-ocean Only when it is checked.
         */
        $scope.chosenProduct = ProductAgOption.getOption();
        $scope.$emit('validatePartner', selectedProduct);
    };

    $scope.$on('validatePartner', function(evt, partner) {
        $scope.partnerValidate(partner);
    });

    $scope.setMultiSelectValues = function(apiItems, customKey, selectedItems) {
        var multiSelectData = [];
        angular.forEach(apiItems, function(value, key) {
            if (typeof customKey !== "undefined") {
                var flag = false;
                angular.forEach(selectedItems, function(selectedValue, selectedKey) {
                    if (selectedValue.id === value.id) {
                        flag = true;
                    }
                });
                multiSelectData.push({id: value.id, name: value[customKey], ticked: flag});
            } else {
                multiSelectData.push({id: value.id, name: value.name, ticked: false});
            }
        });
        return multiSelectData;
    };

    var PAGE_SIZE = 100;
    var PAGE_NUMBER = 1;
    var loggedInFilter = "filters=loggedInOwnerId eq " + pmTokenStorageService.getResourceId() + "&filters=loggedInOwnerTypeId eq " + pmTokenStorageService.getResourceTypeId();

    var inventory_url = "/api/inventory/products?pageSize=" + PAGE_SIZE + "&pageNumber=" + PAGE_NUMBER + "&" + loggedInFilter + " &sort=-modificationTime&cacheBreak=" + new Date();

    console.log("inventory_url", inventory_url, pmTokenStorageService.getResourceId());

    pmApiService.callApi(inventory_url).success(function(response) {
        $scope.productOffersItems = response.items;
        $scope.productOffersList = $scope.setMultiSelectValues(response.items);
        sessionStorage.setItem('productOffersItems', JSON.stringify($scope.productOffersItems));
        sessionStorage.setItem('productOffersList', JSON.stringify($scope.productOffersList));
    }).error(function(response) {
        $scope.response = "error";
    });

    angular.isUndefinedOrNull = function(val) {
        return angular.isUndefined(val) || val === null;
    };

    $scope.partnerValidate = function(selectedProduct) {

        console.log('partnerValidate: ', selectedProduct);

        if ($scope.pmp_checked && !$scope.ag_checked) {
            $scope.addDisabled = false;
            return false;
        }

        var selected = selectedProduct || ProductAgOption.getSelectedProduct();

        var moFlags = {};
        moFlags.checkSize = MediaOceanValidation.validateSize(selected);

        moFlags.checkPosition = MediaOceanValidation.validatePosition(selected);

        moFlags.checkCategory = MediaOceanValidation.validateCategory(selected);

        console.log(moFlags,
            JSON.stringify(moFlags.checkSize),
            JSON.stringify(moFlags.checkPosition),
            JSON.stringify(moFlags.checkCategory));

        var m = moFlags;
        if (m.checkSize.hasOwnProperty('OK') && m.checkPosition.hasOwnProperty('OK') && m.checkCategory.hasOwnProperty('OK')) {
            $scope.validateStatus = 'OK';
            $scope.partner_status_show = true;
            $scope.partner_warning_show = false;
            if ($scope.ag_checked || $scope.pmp_checked) {
                $scope.addDisabled = false;
            }
            $scope.media_ocean_flag = true;
            $scope.media_ocean = true;

            if ($scope.kantar_media) {
                $scope.kantarFullySelect = '';
            }

            ProductAgOption.setMediaOcean(m);
            ProductAgOption.resetDemandPartners();
        }
        else if (m.checkSize.hasOwnProperty('ERROR') || m.checkPosition.hasOwnProperty('ERROR') || m.checkCategory.hasOwnProperty('ERROR')) {
            $scope.validateStatus = 'ERROR';
            $scope.partner_status_show = true;
            $scope.partner_warning_show = false;
            $scope.media_ocean_flag = false; //disable the checkbox
            $scope.media_ocean = false;

            if ($scope.kantar_media) {
                $scope.kantarFullySelect = '';
                $scope.addDisabled = false;
            }
            else {
                $scope.addDisabled = true;
            }
            //how to trigger the event? $scope.partnerSelected($event);
            ProductAgOption.setDemandPartners(selectedProduct);
            ProductAgOption.resetMediaOcean();
        }
        else {
            $scope.validateStatus = 'WARN';
            $scope.partner_status_show = true;
            $scope.partner_warning_show = true;
            $scope.media_ocean_flag = true;
            $scope.media_ocean = true;
            if ($scope.ag_checked || $scope.pmp_checked) {
                $scope.addDisabled = false;
            }

            if ($scope.kantar_media) {
                $scope.kantarFullySelect = '';
            }

            ProductAgOption.setMediaOcean(m);
            ProductAgOption.resetDemandPartners();
        }


        /**
         * if selectedProduct.adServerInventoryUnits is null or is an array with a length of 0 then display message.
         */
        if ($scope.ag_checked) {
            if (angular.isUndefinedOrNull(selectedProduct.adServerInventoryUnits) ||
                (angular.isArray(selectedProduct.adServerInventoryUnits) && selectedProduct.adServerInventoryUnits.length === 0)) {
                $scope.showAdServer = true;
                $scope.addDisabled = true;
            }
            else {
                $scope.showAdServer = false;
                //$scope.addDisabled = false;
            }
            console.log('adServerInventoryUnits:', JSON.stringify(selectedProduct.adServerInventoryUnits));
        }
    };

    $scope.partnerSelected = function($event) {

        var checkbox = $event.target;
        if (checkbox.checked) {
            if (checkbox.name === 'kantar-media') {
                $scope.partner_kantar_show = true;
                if ($scope.getMSValue()) {
                    $scope.kantarFullySelect = '';
                    $scope.addDisabled = false;
                }
                else {
                    $scope.kantarFullySelect = 'NO';
                    $scope.addDisabled = true;
                }
            }
            else {
                $scope.partner_status_show = true;
                // click checkbox, but not choose `select product` yet.
                if ($scope.getMSValue()) {
                    $scope.kantarFullySelect = '';
                    $scope.partnerValidate();
                }
                else {
                    $scope.kantarFullySelect = 'NO';
                    $scope.validateStatus = 'NO';
                    $scope.addDisabled = true;
                    return false;
                }
            }
        }
        else {
            if (checkbox.name === 'kantar-media') {
                $scope.partner_kantar_show = false;
                if (!$scope.media_ocean) {
                    $scope.addDisabled = true;
                }
            }
            else {
                $scope.partner_status_show = false;
                $scope.partner_warning_show = false;
                if (!$scope.kantar_media) {
                    $scope.addDisabled = true;
                }
            }
        }
        return false;
    };

};
