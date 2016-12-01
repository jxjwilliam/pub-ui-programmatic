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

pmlComponents.factory("Offer", ["pmTokenStorageService", "$resource", function(pmTokenStorageService, $resource) {
    return $resource("/api/inventory/offers/:id", null, {
        update: {
            method: "PUT",
            headers: {
                "pubToken": pmTokenStorageService.getAuthToken()
            }
        },
        save: {
            method: "POST",
            headers: {
                "pubToken": pmTokenStorageService.getAuthToken()
            },
            url: "/api/inventory/offers"
        }
    });
}]);

pmlComponents.factory("Targeting", ["pmTokenStorageService", "$resource", function(pmTokenStorageService, $resource) {
    return $resource("/api/inventory/targeting/:id", null, {
        update: {
            method: "PUT",
            headers: {
                "pubToken": pmTokenStorageService.getAuthToken()
            }
        },
        save: {
            method: "POST",
            headers: {
                "pubToken": pmTokenStorageService.getAuthToken()
            },
            url: "/api/inventory/targeting"
        }
    });
}]);

pmlComponents.factory("PublisherSections", ["pmTokenStorageService", "$resource", function(pmTokenStorageService, $resource) {
    return $resource("/api/inventory/section?" +
        "searchKey=&pageNumber=1&pageSize=20&filters=pubId+eq+:pubId&" +
        "filters=loggedInOwnerId+eq+:pubId&filters=loggedInOwnerTypeId+eq+1",
        null, {
            query: {
                method: "GET",
                headers: {
                    "pubToken": pmTokenStorageService.getAuthToken()
                }
            },
        });
}]);

pmlComponents.factory("InventoryEstimation", ["pmTokenStorageService", "$resource", function(pmTokenStorageService, $resource) {
    return $resource("/api/inventory/inventoryEstimation?" +
        "pubId=:pubId&:filter",
        null, {
            query: {
                method: "GET",
                headers: {
                    "pubToken": pmTokenStorageService.getAuthToken()
                }
            },
        });
}]);

pmlComponents.factory("Audience", ["pmTokenStorageService", "$resource", function(pmTokenStorageService, $resource) {
    return $resource("/api/audience/audiences?" +
        "searchKey=:filter&pageNumber=1&pageSize=50&" +
        "accountId=:pubId&accountType=PUBLISHER&enabled=1&orderBy=name&order=ASC", null, {
            query: {
                method: "GET",
                headers: {
                    "pubToken": pmTokenStorageService.getAuthToken()
                }
            },
        });
}]);

pmlComponents.directive("pmIdPmpOfferCreateForm", [
    function() {
        return {
            templateUrl: "components/idComponents/pmIdPmpOfferCreateForm/pmIdPmpOfferCreateForm-directive.html",
            restrict: "E",
            scope: {
                endpoint: "@endpoint"
            },
            controller: ["$q", "$filter", "pmApiService", "$scope", "$location", "$routeParams", "$rootScope", "$timeout",
                "Product", "Offer", "Targeting", "PublisherSections", "PublisherSites", "PublisherAdTags", "Audience",
                "pmTokenStorageService", "pmCommonApiService", "pmUtilService", "InventoryEstimation", "pmAclHttpService",
                "ProductAgOption",
                function($q, $filter, pmApiService, $scope, $location, $routeParams, $rootScope, $timeout,
                          Product, Offer, Targeting, PublisherSections, PublisherSites, PublisherAdTags, Audience,
                          pmTokenStorageService, pmCommonApiService, pmUtilService, InventoryEstimation, pmAclHttpService,
                          ProductAgOption) {
                    //$sope.pmpOffer.product = {};

                    var RESOURCE_TYPE_PUBLISHER = "publisher",
                        RESOURCE_TYPE_PUBLISHER_ID = "1",
                        ERROR_STRING = "error",
                        statics;


                    //$rootScope.showOverlay = "none";

                    $scope.statics = {
                        ONGOING_DATE: "2032-12-31",
                        TIMEZONE: "America/Los_Angeles",
                        DATE_FORMAT: "YYYY-MM-DD"
                    };

                    statics = $scope.statics;

                    $scope.patterns = pmUtilService.getValidationPatterns();

                    $scope.validTodaysDateForCal = moment.tz(statics.TIMEZONE).subtract(1, "days").format(statics.DATE_FORMAT);

                    $scope.validOfferEndDate = $scope.validTodaysDateForCal;
                    $scope.validTxnEndDate = $scope.validTodaysDateForCal;

                    $scope.formattedTags = [];
                    $scope.panelView = "close";
                    $scope.showVideoTargeting = false;
                    $scope.showMobileTargeting = false;
                    $scope.calculatedAvails = 40000; // needs to be looked up for publisher
                    $scope.buttonTitle = "Create Offer";
                    $scope.pmpOffer = {};
                    $scope.targeting = {};
                    $scope.pmpOffer.oneClickBuy = "false";
                    $scope.pmpOffer.featured = "false";
                    //$scope.targeting.matchedUsers = "false";
                    $scope.targeting.latLong = "false";
                    $scope.productDetails = {};
                    $scope.dow = angular.copy(pmCommonApiService.getDaysOfWeek());
                    $scope.channels = pmCommonApiService.getChannels();
                    $scope.daysPartingRange = {
                        from: 0,
                        to: 48
                    };
                    $scope.hasErrors = false;
                    $scope.serverErrors = []; // used to show all errors. could change later.

                    $scope.requiredFields = {
                        product: false,
                        name: false,
                        eCpm: false,
                        transactionStartDate: false,
                        transactionEndDate: false,
                        offerStartDate: false,
                        offerEndDate: false
                    };

                    $scope.multiSelectDefaults = {
                        // geoSelection: "any",
                        smartphone: "any",
                        tablet: "any",
                        buyers: "any",
                        dsps: "any",
                        advertisers: "any"
                    };

                    $scope.txnStartDateError = null;
                    $scope.isProductSelected = false;
                    $scope.chosenProduct = {};

                    $scope.getDayPartingTime = function(value) {
                        var hours = Math.floor(value / 2),
                            mins = (value % 2 > 0) ? "30" : "00";

                        return hours + ":" + mins + ":00";

                    };

                    $scope.getDayPartingTimeFromString = function(value) {
                        var arr = value.split(":");
                        var result = parseInt(arr[0]) * 2;
                        if (arr[1] === "30") {
                            result += 1;
                        }
                        return result;
                    };

                    $scope.openGeos = function() {
                        if (null === $scope.geos || undefined === $scope.geos) {
                            $scope.geos = angular.copy(pmCommonApiService.getGeos());
                        }
                    };

                    $scope.openAudience = function() {
                        if (null === $scope.audienceSegments || undefined === $scope.audienceSegments) {
                            Audience.query({
                                pubId: $scope.publisherId
                            }).$promise.then(function(audienceSegments) {
                                $scope.audienceSegments = $scope.setMultiSelectValues(audienceSegments.items);
                            });
                        }
                    };

                    $scope.openRichMedia = function() {
                        if (null === $scope.richMediaTechnology || undefined === $scope.richMediaTechnology) {
                            $scope.richMediaTechnology = angular.copy(pmCommonApiService.getRichMediaTechnologies());
                        }
                    };

                    $scope.openMobileOS = function() {
                        if (null === $scope.os || undefined === $scope.os) {
                            $scope.os = angular.copy(pmCommonApiService.getMobileOS());
                        }
                    };

                    $scope.openBrowsers = function() {
                        if (null === $scope.browsers || undefined === $scope.browsers) {
                            $scope.browsers = angular.copy(pmCommonApiService.getBrowsers());
                        }
                    };

                    $scope.openSmartPhoneDevices = function() {
                        if (null === $scope.mobileDeviceType || undefined === $scope.mobileDeviceType) {
                            $scope.mobileDeviceType = angular.copy(pmCommonApiService.getMobileDeviceTypes());
                        }
                    };

                    $scope.openTabletDevices = function() {
                        if (null === $scope.tabletDeviceType || undefined === $scope.tabletDeviceType) {
                            $scope.tabletDeviceType = angular.copy(pmCommonApiService.getTabletDeviceTypes());
                        }
                    };

                    $scope.openCarrier = function() {
                        if (null === $scope.mobileCarrier || undefined === $scope.mobileCarrier) {
                            $scope.mobileCarrier = angular.copy(pmCommonApiService.getMobileCarriers());
                        }
                    };

                    $scope.openDeviceTypes = function() {
                        if (null === $scope.deviceIDType || undefined === $scope.deviceIDType) {
                            $scope.deviceIDType = angular.copy(pmCommonApiService.getDeviceIdTypes());
                        }
                    };

                    $scope.openVideoAdFormats = function() {
                        if (null === $scope.videoAdFormats || undefined === $scope.videoAdFormats) {
                            $scope.videoAdFormats = angular.copy(pmCommonApiService.getVideoAdFormats());
                        }
                    };

                    $scope.openVideoAdPositions = function() {
                        if (null === $scope.videoAdPositions || undefined === $scope.videoAdPositions) {
                            $scope.videoAdPositions = angular.copy(pmCommonApiService.getVideoAdPositions());
                        }
                    };

                    $scope.openPlaybackMethod = function() {
                        if (null === $scope.videoPlaybackMethods || undefined === $scope.videoPlaybackMethods) {
                            $scope.videoPlaybackMethods = angular.copy(pmCommonApiService.getVideoPlaybackMethods());
                        }
                    };

                    $scope.openBuyers = function() {
                        if (null === $scope.buyers || undefined === $scope.buyers) {
                            $scope.buyers = angular.copy(pmCommonApiService.getBuyers());
                        }
                    };

                    $scope.openDemandPartners = function() {
                        if (null === $scope.dsps || undefined === $scope.dsps) {
                            $scope.dsps = angular.copy(pmCommonApiService.getAdvertisingEntity());
                        }
                    };

                    $scope.openAdvertisers = function() {
                        if (null === $scope.advertisers || undefined === $scope.advertisers) {
                            $scope.advertisers = angular.copy(pmCommonApiService.getAdvertisers());
                        }
                    };

                    $scope.productSearch = function(searchFilter) {
                        var promise = pmCommonApiService.getProducts(searchFilter);
                        //console.log(" 7. [IN geoSearch] promise recieved.", promise);
                        return promise;
                    };

                    $scope.AdvertisersSearch = function(searchFilter) {
                        //console.log(" 2. [IN AdvertisersSearch] searchFilter: ", searchFilter);
                        //console.log(" 3. [IN AdvertisersSearch] calling api...");
                        var promise = pmCommonApiService.getAdvertisers(searchFilter);
                        //console.log(" 7. [IN AdvertisersSearch] promise recieved.", promise);
                        return promise;
                    };

                    $scope.geoSearch = function(searchFilter) {
                        //console.log(" 2. [IN geoSearch] searchFilter: ", searchFilter);
                        //console.log(" 3. [IN geoSearch] calling api...");
                        var promise = pmCommonApiService.getGeos(searchFilter);
                        //console.log(" 7. [IN geoSearch] promise recieved.", promise);
                        return promise;
                    };


                    $scope.mobileCarrierSearch = function(searchFilter) {
                        //console.log(" 2. [IN carrierSearch] searchFilter: ", searchFilter);
                        //console.log(" 3. [IN carrierSearch] calling api...");
                        var promise = pmCommonApiService.getMobileCarriers(searchFilter);
                        //console.log(" 7. [IN carrierSearch] promise recieved.", promise);
                        return promise;
                    };

                    $scope.mobileDeviceTypeSearch = function(searchFilter) {
                        //console.log(" 2. [IN mobileDeviceTypeSearch] searchFilter: ", searchFilter);
                        //console.log(" 3. [IN mobileDeviceTypeSearch] calling api...");
                        var promise = pmCommonApiService.getMobileDeviceTypes(searchFilter);
                        //console.log(" 7. [IN mobileDeviceTypeSearch] promise recieved.", promise);
                        return promise;
                    };

                    $scope.buyersSearch = function(searchFilter) {
                        //console.log(" 2. [IN buyersSearch] searchFilter: ", searchFilter);
                        //console.log(" 3. [IN buyersSearch] calling api...");
                        var promise = pmCommonApiService.getBuyers(searchFilter);
                        //console.log(" 7. [IN buyersSearch] promise recieved.", promise);
                        return promise;
                    };

                    $scope.demandSidePlatformSearch = function(searchFilter) {
                        //console.log(" 2. [IN demandSidePlatformSearch] searchFilter: ", searchFilter);
                        //console.log(" 3. [IN demandSidePlatformSearch] calling api...");
                        var promise = pmCommonApiService.getAdvertisingEntity(searchFilter);
                        //console.log(" 7. [IN demandSidePlatformSearch] promise recieved.", promise);
                        return promise;
                    };

                    $scope.loadProducts = function() {
                        //if ( $scope.productList === null ) {
                        $scope.productList = angular.copy(pmCommonApiService.getProducts());
                        //}
                    };

                    $scope.$watch("pmpOffer.transactionStartDate", function(newVal) {
                        $scope.requiredFields.transactionStartDate = (newVal === "");

                        if (newVal) {
                            $scope.validTxnEndDate = moment(newVal).subtract(1, "days").format(statics.DATE_FORMAT);
                        }
                    });

                    $scope.$watch("pmpOffer.transactionEndDate", function(newVal) {
                        if (newVal) {
                            $scope.requiredFields.transactionEndDate = (newVal === "");
                        }
                    });

                    $scope.$watch("pmpOffer.offerStartDate", function(newVal) {
                        $scope.requiredFields.offerStartDate = (newVal === "");

                        if (newVal) {
                            $scope.validOfferEndDate = moment(newVal).subtract(1, "days").format(statics.DATE_FORMAT);
                            $scope.requiredFields.validOfferStartDate = moment(newVal).isAfter($scope.pmpOffer.transactionStartDate || "");
                        }
                    });

                    $scope.$watch("pmpOffer.offerEndDate", function(newVal) {
                        if (newVal) {
                            $scope.requiredFields.offerEndDate = (newVal === "");
                        }
                    });

                    $scope.productItemClick = function(item) {
                        //$scope.product = item;
                        $scope.updateTargeting(item);
                        $scope.requiredFields.product = false;
                    };

                    $scope.offerNameChange = function() {
                        var name = $scope.pmpOffer.name,
                            tempValidFlag = (name === undefined || name === ""),
                            namePattern = $scope.patterns.name;

                        $scope.requiredFields.name = tempValidFlag || !namePattern.test(name);
                    };

                    $scope.eCpmChange = function() {
                        $scope.requiredFields.eCpm = !(((parseFloat($scope.pmpOffer.cpm) >= 0.01) && (parseFloat($scope.pmpOffer.cpm) <= 999.99)));
                    };

                    $scope.createInventoryEstimationFilter = function() {
                        var platformIds = pmUtilService.getIdsFromObjects($scope.productDetails.platforms);
                        var siteIds = pmUtilService.getIdsFromObjects($scope.productDetails.sites);
                        var adSizeIds = pmUtilService.getIdsFromObjects($scope.productDetails.adSizes);
                        var platformFilter = "";
                        angular.forEach(platformIds, function(value) {
                            platformFilter += "platformIds=" + value + "&";
                        });
                        platformFilter = platformFilter.substring(0, platformFilter.length - 1);
                        var siteFilter = "";
                        angular.forEach(siteIds, function(value) {
                            siteFilter += "siteIds=" + value + "&";
                        });
                        siteFilter = siteFilter.substring(0, siteFilter.length - 1);
                        var adSizeFilter = "";
                        angular.forEach(adSizeIds, function(value) {
                            adSizeFilter += "adSizeIds" + value + "&";
                        });
                        adSizeFilter = adSizeFilter.substring(0, adSizeFilter.length - 1);
                        return platformFilter + "&" + siteFilter + "&" + adSizeFilter;
                    };

                    $scope.getInventoryEstimations = function() {
                        InventoryEstimation.query({
                            pubId: $scope.publisherId,
                            filter: $scope.createInventoryEstimationFilter()
                        }).$promise.then(function(inventoryEstimation) {
                            //console.log("Inventory Estimation :" + inventoryEstimation);
                            if (inventoryEstimation !== undefined && inventoryEstimation !== null) {
                                if ($routeParams.id === "add") {
                                    $scope.pmpOffer.impressions = inventoryEstimation.impressions;
                                }
                            }
                        });
                    };

                    function getVideoTargeting(product) {
                        var result = false;
                        if (product === undefined || product === null || product.adCodeTypes === undefined || product.adCodeTypes === null || product.adCodeTypes.length === 0) {
                            result = true;
                        }
                        angular.forEach(product.adCodeTypes, function(value) {
                            if (value.id === 3) {
                                result = true;
                            }
                        });
                        return result;
                    }

                    function getMobileTargeting(product) {
                        var result = false;
                        if (product === undefined || product === null || product.platforms === undefined || product.platforms === null || product.platforms.length === 0) {
                            result = true;
                        }
                        angular.forEach(product.platforms, function(value) {
                            if (value.id === 2 || value.id === 3) {
                                result = true;
                            }
                        });
                        return result;
                    }

                    $scope.updateTargeting = function(productInput, isEdit) {
                        //console.log(productInput);
                        $scope.productDetails = Product.get({
                            id: productInput.id,
                            loggedInOwnerId: pmTokenStorageService.getResourceId(),
                            loggedInOwnerTypeId: pmTokenStorageService.getResourceTypeId()
                        }, function() {
                            //console.log($scope.productDetails);
                            // $scope.showVideoTargeting = getVideoTargeting($scope.productDetails);
                            // $scope.showMobileTargeting = getMobileTargeting($scope.productDetails);
                            $scope.setProductTargetingParams(getVideoTargeting($scope.productDetails), getMobileTargeting($scope.productDetails), isEdit);

                            $scope.getInventoryEstimations();

                        });
                    };

                    $scope.setProductTargetingParams = function(videoTargetingFlag, mobileTargetingFlag, isEdit) {

                        function resetVideoParams(hiddenMode) {
                            var value;

                            hiddenMode = hiddenMode || !videoTargetingFlag;
                            value = hiddenMode ? null : [];

                            $scope.targeting.videoAdTypes = value;
                            $scope.videoAdTypesClrSelection = true;

                            $scope.targeting.videoAdPositions = value;
                            $scope.videoAdPositionsClrSelection = true;

                            $scope.targeting.videoPlaybackMethods = value;
                            $scope.videoPlaybackMethodsClrSelection = true;
                        }

                        function resetMobileParams(hiddenMode) {
                            var value;

                            hiddenMode = hiddenMode || !mobileTargetingFlag;
                            value = hiddenMode ? null : [];

                            $scope.targeting.latLong = hiddenMode ? null : "false";

                            $scope.targeting.os = value;
                            $scope.osClrSelection = true;

                            $scope.selectedBrowsers = value;
                            $scope.browsersClrSelection = true;

                            $scope.selectedMobileDeviceType = value;
                            $scope.smartphonesClrSelection = true;
                            $scope.multiSelectDefaults.smartphone = hiddenMode ? "any" : "select";

                            $scope.selectedTabletDeviceType = value;
                            $scope.tabletsClrSelection = true;
                            $scope.multiSelectDefaults.tablet = hiddenMode ? "any" : "select";

                            $scope.targeting.carriers = value;
                            $scope.carriersClrSelection = true;

                            $scope.targeting.deviceIdType = value;
                            $scope.deviceIdTypeClrSelection = true;
                        }

                        if (!isEdit) {

                            // if ($scope.showMobileTargeting === true && !mobileTargetingFlag) {
                            //     resetMobileParams();
                            // }

                            // if($scope.showVideoTargeting === true && !videoTargetingFlag) {
                            //     resetVideoParams();
                            // }

                            resetMobileParams();
                            resetVideoParams();
                        }

                        $scope.showVideoTargeting = videoTargetingFlag;
                        $scope.showMobileTargeting = mobileTargetingFlag;
                    };

                    $scope.init = function() {
                        if (pmTokenStorageService.getResourceType() === RESOURCE_TYPE_PUBLISHER) {
                            $scope.publisherId = pmTokenStorageService.getResourceId();
                            $scope.loggedInOwnerTypeId = RESOURCE_TYPE_PUBLISHER_ID;
                        }

                        // check if ag is enabled. 
                        // if yes then show product from selectedProduct and hide multi-select
                        var PmAgOptions = pmAclHttpService.getPmAgOptions();
                        if (PmAgOptions.indexOf("AG") !== -1) {
                            $scope.chosenProduct = $scope.chosenProduct || {};
                            $scope.chosenProduct.product = ProductAgOption.getSelectedProduct();
                            $scope.isProductSelected = true;
                            /**
                             * fix a bug: TypeError: undefined is not a function
                             */
                            $scope.productItemClick($scope.chosenProduct.product);
                        }

                        //In update use case
                        $scope.buyers = angular.copy(pmCommonApiService.getBuyers());
                        $scope.dsps = angular.copy(pmCommonApiService.getAdvertisingEntity());
                        $scope.advertisers = angular.copy(pmCommonApiService.getAdvertisers());


                        if (typeof $routeParams.id !== "undefined") {
                            setTimeout(function() {
                                $scope.panelView = "open";

                            }, 100);
                            if ($routeParams.id === "add") {
                                $scope.mode = "add";
                                //$rootScope.showOverlay = "block";
                                $rootScope.$emit("showOverlay", "block");
                                $scope.screenTitle = "Create a PMP Offer";
                            } else {
                                $scope.mode = "edit";
                                //$rootScope.showOverlay = "block";
                                $rootScope.$emit("showOverlay", "block");
                                $scope.offerId = $routeParams.id;
                                $scope.screenTitle = "Edit a PMP Offer";
                                $scope.buttonTitle = "Update Offer";
                                $scope.offerRetrieved = Offer.get({
                                    "id": $routeParams.id
                                }, function() {
                                    if (PmAgOptions.indexOf("AG") !== -1) {
                                        if($scope.offerRetrieved && $scope.offerRetrieved.product) {

                                            $scope.chosenProduct = $scope.chosenProduct || {};
                                            $scope.chosenProduct.product = $scope.offerRetrieved.product;
                                            $scope.isProductSelected = true;
                                        }
                                    }

                                    if ($scope.offerRetrieved.targeting === null || $scope.offerRetrieved.targeting === undefined) {
                                        $scope.populateForm($scope.offerRetrieved);
                                    } else {
                                        $scope.targetingId = $scope.offerRetrieved.targeting.id;
                                        $scope.targetingRetrieved = Targeting.get({
                                            "id": $scope.targetingId
                                        }, function() {
                                            $scope.populateForm($scope.offerRetrieved, $scope.targetingRetrieved);
                                        });
                                    }
                                });
                            }
                        } else {
                            $scope.panelView = "close";
                            $rootScope.$emit("showOverlay", "none");
                        }
                        Audience.query({
                            pubId: $scope.publisherId
                        }).$promise.then(function(audienceSegments) {
                            $scope.audienceSegments = $scope.setMultiSelectValues(audienceSegments.items);
                            if ($routeParams.id === "add") {

                            } else if ($scope.targetingRetrieved !== undefined) {
                                $scope.audienceSegments = $scope.setMultiSelectValues($scope.audienceSegments, "name", $scope.targetingRetrieved.audienceSegments);
                            }
                        });

                        if (pmTokenStorageService.getResourceType() === "publisher") {
                            $scope.publisherId = pmTokenStorageService.getResourceId();
                        }
                    };

                    $scope.init();

                    $scope.setMultiSelectValues = function(apiItems, customKey, selectedItems) {
                        var multiSelectData = [],
                            flag = false;

                        angular.forEach(apiItems, function(value, key) {
                            if (typeof customKey !== "undefined") {
                                flag = false;
                                if (selectedItems) {
                                    angular.forEach(selectedItems, function(selectedValue, selectedKey) {
                                        if (selectedValue.id === value.id) {
                                            flag = true;
                                        }
                                    });
                                }
                                multiSelectData.push({
                                    id: value.id,
                                    name: value[customKey],
                                    ticked: flag
                                });
                            } else {
                                multiSelectData.push({
                                    id: value.id,
                                    name: value.name,
                                    ticked: false
                                });
                            }
                        });
                        return multiSelectData;
                    };

                    // $scope.setMultiSelectValues = function(apiItems, customKey, selectedItems) {
                    //     var multiSelectData = [];
                    //     angular.forEach(apiItems, function(value, key) {
                    //         if (typeof customKey !== "undefined") {
                    //             var flag = false;
                    //             angular.forEach(selectedItems, function(selectedValue, selectedKey) {
                    //                 if (selectedValue.id === value.id) {
                    //                     flag = true;
                    //                 }
                    //             });
                    //             multiSelectData.push({
                    //                 id: value.id,
                    //                 name: value[customKey],
                    //                 ticked: flag
                    //             });
                    //         } else {
                    //             multiSelectData.push({
                    //                 id: value.id,
                    //                 name: value.name,
                    //                 ticked: false
                    //             });
                    //         }
                    //     });
                    //     return multiSelectData;
                    // };

                    $scope.checkIfAll = function(retrivedEntities) {
                        if (retrivedEntities === undefined || retrivedEntities === null) {
                            return false;
                        }
                        if (retrivedEntities[0].id === 0) {
                            return true;
                        } else {
                            return false;
                        }
                    };

                    $scope.setEditModes = function() {
                        $scope.productsEditMode = true;
                        $scope.geosEditMode = true;
                        $scope.audienceEditMode = true;
                        $scope.richMediaEditMode = true;
                        $scope.osEditMode = true;
                        $scope.browsersEditMode = true;
                        $scope.smartPhonesEditMode = true;
                        $scope.tabletsEditMode = true;
                        $scope.carriersEditMode = true;
                        $scope.buyersEditMode = true;
                        $scope.dspsEditMode = true;
                        $scope.advertisersEditMode = true;
                    };

                    $scope.populateForm = function(pmpOfferResult, targetingResult) {
                        var tempDate,
                            ongoingDate = $scope.statics.ONGOING_DATE;

                        $scope.productList = $scope.setMultiSelectValues([pmpOfferResult.product], "name", [pmpOfferResult.product]);
                        // angular.forEach($scope.productList, function(product) {
                        //     if (product.ticked === true) {
                        //         $scope.updateTargeting(product, true);
                        //     }
                        // });

                        $scope.updateTargeting(pmpOfferResult.product, true);

                        if (null !== targetingResult && undefined !== targetingResult) {
                            //$scope.geos = $scope.setMultiSelectValues(pmCommonApiService.getGeos(), "name", targetingResult.geos);
                            $scope.setEditModes();

                            targetingResult.geos = pmUtilService.updateNameOfGeos(targetingResult.geos);
                            $scope.geos = $scope.setMultiSelectValues(targetingResult.geos, "name", targetingResult.geos);

                            $scope.audienceSegments = $scope.setMultiSelectValues($scope.audienceSegments, "name", targetingResult.audienceSegments);
                            $scope.videoAdFormats = $scope.setMultiSelectValues(pmCommonApiService.getVideoAdFormats(), "name", targetingResult.videoAdTypes);
                            $scope.videoAdPositions = $scope.setMultiSelectValues(pmCommonApiService.getVideoAdPositions(), "name", targetingResult.videoAdPositions);
                            $scope.videoPlaybackMethods = $scope.setMultiSelectValues(pmCommonApiService.getVideoPlaybackMethods(), "name", targetingResult.videoPlaybackMethods);
                            $scope.os = $scope.setMultiSelectValues(pmCommonApiService.getMobileOS(), "name", targetingResult.os);
                            $scope.browsers = $scope.setMultiSelectValues(pmCommonApiService.getBrowsers(), "name", targetingResult.browsers);

                            if ($scope.checkIfAll(targetingResult.smartphones)) {
                                // $scope.mobileDeviceType = pmUtilService.setMultiSelectValuesToTrue(pmCommonApiService.getMobileDeviceTypes());
                                $scope.multiSelectDefaults.smartphone = "any";
                            } else {
                                $scope.mobileDeviceType = $scope.setMultiSelectValues(targetingResult.smartphones, "name", targetingResult.smartphones);
                                $scope.multiSelectDefaults.smartphone = "select";
                            }

                            if ($scope.checkIfAll(targetingResult.tablets)) {
                                // $scope.tabletDeviceType = pmUtilService.setMultiSelectValuesToTrue(pmCommonApiService.getTabletDeviceTypes());
                                $scope.multiSelectDefaults.tablet = "any";
                            } else {
                                $scope.tabletDeviceType = $scope.setMultiSelectValues(pmCommonApiService.getTabletDeviceTypes(), "name", targetingResult.tablets);
                                $scope.multiSelectDefaults.tablet = "select";
                            }

                            $scope.mobileCarrier = $scope.setMultiSelectValues(pmCommonApiService.getMobileCarriers(), "name", targetingResult.carriers);
                            $scope.deviceIDType = $scope.setMultiSelectValues(pmCommonApiService.getDeviceIdTypes(), "name", targetingResult.deviceIdType);
                            $scope.richMediaTechnology = $scope.setMultiSelectValues(pmCommonApiService.getRichMediaTechnologies(), "name", targetingResult.richMediaTechnologies);
                            $scope.targeting.latLong = targetingResult.latLong ? "true" : "false";
                            //$scope.targeting.matchedUsers = targetingResult.matchedUsers ? "true" : "false";
                            $scope.daysPartingRange.from = $scope.getDayPartingTimeFromString(targetingResult.startTimeParting);
                            if (targetingResult.endTimeParting === "23:59:59") {
                                targetingResult.endTimeParting = "24:00:00";
                            }
                            $scope.daysPartingRange.to = $scope.getDayPartingTimeFromString(targetingResult.endTimeParting);
                            $scope.dow = $scope.setMultiSelectValues($scope.dow, "name", targetingResult.daysOfWeek);
                        }

                        //For Offer
                        // $scope.productList = $scope.setMultiSelectValues(pmCommonApiService.getProducts(), "name", [pmpOfferResult.product]);
                        // angular.forEach($scope.productList, function(product) {
                        //     if (product.ticked === true) {
                        //         $scope.updateTargeting(product, true);
                        //     }
                        // });

                        if ($scope.checkIfAll(pmpOfferResult.buyers)) {
                            //$scope.buyers = pmUtilService.setMultiSelectValuesToTrue(pmCommonApiService.getBuyers());
                            $scope.multiSelectDefaults.buyers = "any";
                        } else {
                            $scope.buyers = $scope.setMultiSelectValues(pmpOfferResult.buyers, "name", pmpOfferResult.buyers);
                            $scope.multiSelectDefaults.buyers = "select";
                        }
                        if ($scope.checkIfAll(pmpOfferResult.dsps)) {
                            // $scope.dsps = pmUtilService.setMultiSelectValuesToTrue(pmCommonApiService.getAdvertisingEntity());
                            $scope.multiSelectDefaults.dsps = "any";
                        } else {
                            $scope.dsps = $scope.setMultiSelectValues(pmpOfferResult.dsps, "name", pmpOfferResult.dsps);
                            $scope.multiSelectDefaults.dsps = "select";
                        }
                        if ($scope.checkIfAll(pmpOfferResult.advertisers)) {
                            // $scope.advertisers = pmUtilService.setMultiSelectValuesToTrue(pmCommonApiService.getAdvertisers());
                            $scope.multiSelectDefaults.advertisers = "any";
                        } else {
                            $scope.advertisers = $scope.setMultiSelectValues(pmpOfferResult.advertisers, "name", pmpOfferResult.advertisers);
                            $scope.multiSelectDefaults.advertisers = "select";
                        }
                        //$scope.pmpOffer.product = pmpOfferResult.product;
                        $scope.pmpOffer.name = pmpOfferResult.name;
                        $scope.pmpOffer.description = pmpOfferResult.description;
                        $scope.pmpOffer.percentageAvails = pmpOfferResult.percentageAvails;
                        $scope.pmpOffer.notes = pmpOfferResult.notes;
                        $scope.pmpOffer.cpm = pmpOfferResult.cpm;
                        $scope.pmpOffer.minSpend = pmpOfferResult.minSpend;
                        $scope.pmpOffer.tags = pmpOfferResult.tags;

                        if (null !== pmpOfferResult.tags && undefined !== pmpOfferResult.tags && pmpOfferResult.tags.length !== 0) {
                            var tags = pmpOfferResult.tags.split(",");
                            angular.forEach(tags, function(value) {
                                $scope.formattedTags.push({
                                    "text": value
                                });
                            });
                            $scope.tagPills = $scope.formattedTags;
                        }
                        $scope.pmpOffer.oneClickBuy = pmpOfferResult.oneClickBuy ? "true" : "false";
                        $scope.pmpOffer.featured = pmpOfferResult.featured ? "true" : "false";

                        tempDate = $filter("date")($scope.getTimezoneFormattedDate(pmpOfferResult.offerEndDate), "yyyy-MM-dd");

                        if (tempDate === ongoingDate) {
                            $scope.offerOngoing = ongoingDate;
                        } else {
                            $scope.pmpOffer.offerEndDate = tempDate;
                        }

                        tempDate = $filter("date")($scope.getTimezoneFormattedDate(pmpOfferResult.transactionEndDate), "yyyy-MM-dd");

                        if (tempDate === ongoingDate) {
                            $scope.transactionOngoing = ongoingDate;
                        } else {
                            $scope.pmpOffer.transactionEndDate = tempDate;
                        }

                        $scope.pmpOffer.offerStartDate = $filter("date")($scope.getTimezoneFormattedDate(pmpOfferResult.offerStartDate), "yyyy-MM-dd");
                        $scope.pmpOffer.transactionStartDate = $filter("date")($scope.getTimezoneFormattedDate(pmpOfferResult.transactionStartDate), "yyyy-MM-dd");
                        $scope.pmpOffer.impressions = pmpOfferResult.impressions;
                    };

                    $scope.getTimezoneFormattedDate = function(date) {
                        var timezone = $scope.statics.TIMEZONE;
                        return moment(date).tz(timezone).format("YYYY-MM-DD");
                    };

                    //TODO: Remove Flag . Its a hack
                    $scope.getIdsFromObjects = function(objectList, flag) {

                        //console.log("[IN getIdsFromObjects] objectList: ", objectList);
                        var selectedData = [];

                        if (objectList && objectList.constructor === Array) {
                            angular.forEach(objectList, function(key, value) {
                                if (typeof key === "number") {
                                    selectedData.push(key);
                                } else {
                                    if (key.id !== undefined) {
                                        selectedData.push(key.id);
                                    }
                                }

                            });
                            return selectedData;
                        }
                    };

                    $scope.getMultiSelectValues = function(multiSelectArray) {
                        var resultsArray = [];
                        angular.forEach(multiSelectArray, function(value, key) {
                            if (value.ticked === true) {
                                resultsArray.push(key);
                            }
                        });
                        return resultsArray;
                    };

                    $scope.radioSelect = function(button) {
                        //console.log(button);
                    };

                    $scope.cancel = function() {
                        $location.path("offers");
                    };

                    $scope.getTimezoneConvertedDate = function(date) {
                        var timezone = "America/Los_Angeles";

                        if (null === date || undefined === date) {
                            return null;
                        }

                        //Check if date is same is today in PST
                        // var todayDateInPST = moment().tz(timezone).format("DD");
                        // if (todayDateInPST === dt.getDate().toString()) {
                        //     //console.log("Use case of today's date");
                        //     return moment.tz(timezone).toISOString();
                        // }
                        //End

                        return moment.tz(date, timezone).toISOString();
                    };

                    $scope.formatDate = function(date) {
                        var year = date.getFullYear().toString();
                        var month = (date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1).toString();
                        var day = date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate().toString();
                        var hour = date.getHours() < 10 ? ("0" + date.getHours()) : date.getHours().toString();
                        var minutes = date.getMinutes() < 10 ? ("0" + date.getMinutes()) : date.getMinutes().toString();
                        var seconds = date.getSeconds() < 10 ? ("0" + date.getSeconds()) : date.getSeconds().toString();
                        var formattedDate = year + "-" + month + "-" + day + " " + hour + ":" + minutes + ":" + seconds;
                        //console.log(formattedDate);
                        return formattedDate;
                    };

                    //Return 0 if All,null if None else selectedEntities array
                    // Deprecated
                    $scope.isAllUseCase = function(allEntities, selectedEntities) {

                        if (allEntities === undefined || allEntities === null || allEntities.length === 0) {
                            return selectedEntities;
                        }
                        if (selectedEntities === undefined || selectedEntities === null) {
                            return null;
                        }
                        if (allEntities.length > 0 && selectedEntities.length === 0) {
                            return null;
                        }
                        if (allEntities.length === selectedEntities.length) {
                            return 0;
                        }

                        return selectedEntities;
                    };

                    //Return 0 if All,null if None else selectedEntities array
                    $scope.isAnyUseCase = function(entity, allEntities, selectedEntities) {
                        var noneFlag = !selectedEntities || selectedEntities.length === 0,
                            retVal = null;

                        retVal = $scope.multiSelectDefaults[entity] === "any" ? 0 : (noneFlag ? null : selectedEntities);

                        // if (allEntities === undefined || allEntities === null || allEntities.length === 0) {
                        //     return selectedEntities;
                        // }
                        // if (selectedEntities === undefined || selectedEntities === null) {
                        //     return null;
                        // }
                        // if (allEntities.length > 0 && selectedEntities.length === 0) {
                        //     return null;
                        // }
                        // if (allEntities.length === selectedEntities.length) {
                        //     return 0;
                        // }
                        return retVal;
                    };

                    $scope.createMultiSelectEntityObject = function(entity, values) {
                        var isAllOrNone,
                            noneFlag = !values || values.length === 0;

                        //                        isAllOrNone = $scope.isAllUseCase($scope[entity], values);
                        //
                        isAllOrNone = $scope.multiSelectDefaults[entity] === "any" ? 0 : (noneFlag ? null : values);
                        if (isAllOrNone === 0) {
                            $scope.pmpOffer[entity] = [0];
                        } else if (isAllOrNone === null) {
                            $scope.pmpOffer[entity] = [];
                        } else {
                            $scope.pmpOffer[entity] = $scope.getIdsFromObjects(values);
                        }
                    };

                    $scope.buildTargetingObjectForApi = function() {
                        var isAllOrNone;

                        $scope.targeting.ownerType = 1;
                        $scope.targeting.ownerId = $scope.publisherId;
                        $scope.targeting.geos = $scope.getIdsFromObjects($scope.targeting.geos);
                        $scope.targeting.audienceSegments = $scope.getIdsFromObjects($scope.targeting.audienceSegments);
                        $scope.targeting.videoAdTypes = $scope.getIdsFromObjects($scope.targeting.videoAdTypes);
                        $scope.targeting.videoAdPositions = $scope.getIdsFromObjects($scope.targeting.videoAdPositions);
                        $scope.targeting.videoPlaybackMethods = $scope.getIdsFromObjects($scope.targeting.videoPlaybackMethods);
                        $scope.targeting.os = $scope.getIdsFromObjects($scope.targeting.os);
                        $scope.selectedDays = pmUtilService.getMultiSelectValues($scope.dow);
                        $scope.targeting.daysOfWeek = $scope.getIdsFromObjects($scope.selectedDays);
                        $scope.targeting.browsers = $scope.getIdsFromObjects($scope.selectedBrowsers);

                        // isAllOrNone = $scope.isAnyUseCase("geos", $scope.targeting.geos, $scope.targeting.geos);
                        // if (isAllOrNone === 0) {
                        //     $scope.targeting.geos = [0];
                        // } else if (isAllOrNone === null) {
                        //     $scope.targeting.geos = [];
                        // } else {
                        //     $scope.targeting.geos = $scope.getIdsFromObjects($scope.targeting.geos);
                        // }


                        // isAllOrNone = $scope.isAllUseCase($scope.mobileDeviceType, $scope.selectedMobileDeviceType);
                        isAllOrNone = $scope.isAnyUseCase("smartphone", $scope.mobileDeviceType, $scope.selectedMobileDeviceType);

                        if (isAllOrNone === 0) {
                            $scope.targeting.smartphones = [0];
                        } else if (isAllOrNone === null) {
                            $scope.targeting.smartphones = [];
                        } else {
                            $scope.targeting.smartphones = $scope.getIdsFromObjects($scope.selectedMobileDeviceType);
                        }

                        // isAllOrNone = $scope.isAllUseCase($scope.tabletDeviceType, $scope.selectedTabletDeviceType);
                        isAllOrNone = $scope.isAnyUseCase("tablet", $scope.tabletDeviceType, $scope.selectedTabletDeviceType);
                        if (isAllOrNone === 0) {
                            $scope.targeting.tablets = [0];
                        } else if (isAllOrNone === null) {
                            $scope.targeting.tablets = [];
                        } else {
                            $scope.targeting.tablets = $scope.getIdsFromObjects($scope.selectedTabletDeviceType);
                        }

                        $scope.targeting.carriers = $scope.getIdsFromObjects($scope.targeting.carriers);
                        $scope.targeting.deviceIdType = $scope.getIdsFromObjects($scope.targeting.deviceIdType);
                        $scope.targeting.richMediaTechnologies = $scope.getIdsFromObjects($scope.targeting.richMediaTechnologies);
                        $scope.targeting.startTimeParting = $scope.getDayPartingTime($scope.daysPartingRange.from);
                        $scope.targeting.endTimeParting = $scope.getDayPartingTime($scope.daysPartingRange.to);
                    };

                    $scope.buildOfferObjectForApi = function() {
                        var formattedTags = [],
                            isAllOrNone;

                        $scope.pmpOffer.targeting = $scope.targetingResponse.id;
                        $scope.pmpOffer.ownerId = $scope.publisherId;
                        $scope.pmpOffer.ownerType = 1;

                        $scope.createMultiSelectEntityObject("buyers", $scope.selectedBuyers);
                        $scope.createMultiSelectEntityObject("dsps", $scope.selectedDsps);
                        $scope.createMultiSelectEntityObject("advertisers", $scope.selectedAdvertisers);

                        // get tags
                        angular.forEach($scope.tagPills, function(value) {
                            if (value !== undefined) {
                                formattedTags.push(value.text);
                            }
                        });

                        $scope.pmpOffer.tags = formattedTags.join();
                        $scope.channels = pmUtilService.getMultiSelectValues($scope.channels);
                        $scope.pmpOffer.channels = $scope.getIdsFromObjects($scope.channels);
                        var PmAgOptions = pmAclHttpService.getPmAgOptions();
                        if (PmAgOptions.indexOf("AG") !== -1) {
                            if ($scope.chosenProduct.product) {
                                $scope.pmpOffer.product = $scope.chosenProduct.product.id;
                            }
                        }
                        else {
                            $scope.pmpOffer.product = $scope.selectedProduct[0].id;
                        }
                        $scope.pmpOffer.offerStartDate = $scope.getTimezoneConvertedDate($scope.pmpOffer.offerStartDate + " 00:00:00");
                        $scope.pmpOffer.transactionStartDate = $scope.getTimezoneConvertedDate($scope.pmpOffer.transactionStartDate + " 00:00:00");

                        $scope.pmpOffer.transactionEndDate = $scope.getTimezoneConvertedDate($scope.pmpOffer.transactionEndDate + " 23:59:59");
                        $scope.pmpOffer.offerEndDate = $scope.getTimezoneConvertedDate($scope.pmpOffer.offerEndDate + " 23:59:59");
                    };

                    $scope.$watch("transactionOngoing", function(curr, old) {
                        var timezone = "America/Los_Angeles";

                        if (curr) {
                            $scope.preTransactionEndDate = $scope.pmpOffer.transactionStartDate || moment.tz(timezone).format("YYYY-MM-DD");
                            $scope.pmpOffer.transactionEndDate = $scope.statics.ONGOING_DATE;
                        } else {
                            $scope.pmpOffer.transactionEndDate = $scope.preTransactionEndDate;
                        }

                        $scope.requiredFields.transactionEndDate = false;
                    });

                    $scope.$watch("offerOngoing", function(curr, old) {
                        var timezone = "America/Los_Angeles";

                        if (curr) {
                            $scope.preOfferEndDate = $scope.pmpOffer.offerStartDate || moment.tz(timezone).format("YYYY-MM-DD");
                            $scope.pmpOffer.offerEndDate = $scope.statics.ONGOING_DATE;
                        } else {
                            $scope.pmpOffer.offerEndDate = $scope.preOfferEndDate;
                        }

                        $scope.requiredFields.offerEndDate = false;
                    });

                    $scope.checkOfferFormValidity = function() {
                        var isValidFlag = true,
                            tempValidFlag = true,
                            namePattern = $scope.patterns.name,
                            requiredFieldsKey,
                            validationFields = [
                                "product",
                                "name",
                                "eCpm",
                                "offerStartDate",
                                "offerEndDate",
                                "transactionStartDate",
                                "transactionEndDate"
                            ];

                        validationFields.forEach(function(item) {
                            requiredFieldsKey = item;

                            switch (item) {
                                case "product":
                                    // check if ag is enabled. 
                                    // if yes then show product from selectedProduct and hide multi-select
                                    var PmAgOptions = pmAclHttpService.getPmAgOptions();
                                    if (PmAgOptions.indexOf("AG") !== -1) {
                                        //$scope.chosenProduct.product = ProductAgOption.getSelectedProduct();
                                        if ($scope.chosenProduct.product) {
                                            tempValidFlag = true;
                                        }
                                    }
                                    else {
                                        tempValidFlag = ($scope.selectedProduct.length === 1);
                                    }
                                    break;
                                case "name":
                                    //Check for name pattern
                                    tempValidFlag = !!($scope.pmpOffer.name);

                                    if (tempValidFlag) {
                                        tempValidFlag = namePattern.test($scope.pmpOffer.name);
                                    }

                                    break;
                                case "eCpm":
                                    tempValidFlag = ((parseFloat($scope.pmpOffer.cpm) >= 0.01) && (parseFloat($scope.pmpOffer.cpm) <= 999.99));
                                    break;
                                case "offerStartDate":
                                    tempValidFlag = moment($scope.pmpOffer.offerStartDate || "").isValid();

                                    if (tempValidFlag) {
                                        tempValidFlag = moment($scope.pmpOffer.transactionStartDate).isSame(moment($scope.pmpOffer.offerStartDate));
                                        tempValidFlag = tempValidFlag || moment($scope.pmpOffer.transactionStartDate).isAfter(moment($scope.pmpOffer.offerStartDate));
                                        requiredFieldsKey = "validOfferStartDate";
                                    }

                                    break;
                                case "offerEndDate":
                                    tempValidFlag = moment($scope.pmpOffer.offerEndDate || "").isValid();
                                    break;
                                case "transactionStartDate":
                                    // Put Validation for offerStart Date
                                    /*tempValidFlag = moment($scope.pmpOffer.transactionStartDate || "").isValid() &&
                                             (moment($scope.pmpOffer.transactionStartDate).isBefore(moment($scope.pmpOffer.transactionEndDate)) ||
                                             moment($scope.pmpOffer.transactionStartDate).isSame(moment($scope.pmpOffer.transactionEndDate))
                                             );*/
                                    tempValidFlag = moment($scope.pmpOffer.transactionStartDate || "").isValid();
                                    var isStartDateBefore = moment($scope.pmpOffer.transactionStartDate).isBefore(moment($scope.pmpOffer.transactionEndDate)),
                                        isStartDateSame = moment($scope.pmpOffer.transactionStartDate).isSame(moment($scope.pmpOffer.transactionEndDate));

                                    if (!tempValidFlag) {
                                        $scope.txnStartDateError = "Enter a Transaction Start Date";
                                    } else if (!isStartDateBefore && !isStartDateSame) {
                                        $scope.txnStartDateError = "Transaction start date can not be in future than transaction end date";
                                        tempValidFlag = !tempValidFlag;
                                    }
                                    break;
                                case "transactionEndDate":
                                    // Put Validation for offerStart Date & offer End Date
                                    tempValidFlag = moment($scope.pmpOffer.transactionEndDate || "").isValid();
                                    break;
                            }

                            if (isValidFlag) {
                                isValidFlag = tempValidFlag;
                            }

                            $scope.requiredFields[requiredFieldsKey] = !tempValidFlag;

                        });

                        return isValidFlag;

                    };

                    $scope.successCb = function() {
                        $scope.pmpOffer = "";
                        $location.path("offers");
                        $rootScope.$emit("refreshOffers");
                        $scope.serverErrors = [];
                        $scope.hasErrors = false;
                        pmUtilService.clearSessionPageInfo();
                    };

                    $scope.errorCb = function(response) {

                        $scope.serverErrors = [];
                        $scope.hasErrors = true;
                        angular.forEach(response.data, function(value) {
                            $scope.serverErrors.push(value.error);
                        });

                        $timeout(function() {
                            var element = document.getElementById("error-container");
                            element.scrollIntoView(true);
                        }, 250);

                        $scope.hideErrorMessageBox();
                        // Convert ISO dates to specific timezone
                        $scope.pmpOffer.offerStartDate = $scope.getTimezoneFormattedDate($scope.pmpOffer.offerStartDate);
                        $scope.pmpOffer.offerEndDate = $scope.getTimezoneFormattedDate($scope.pmpOffer.offerEndDate);
                        $scope.pmpOffer.transactionStartDate = $scope.getTimezoneFormattedDate($scope.pmpOffer.transactionStartDate);
                        $scope.pmpOffer.transactionEndDate = $scope.getTimezoneFormattedDate($scope.pmpOffer.transactionEndDate);

                    };

                    $scope.createOrUpdate = function() {

                        //TODO:Check for targeting form Validation first
                        if ($scope.checkOfferFormValidity()) {

                            $scope.buildTargetingObjectForApi();

                            $scope.targetingResponse = Targeting.save($scope.targeting, function() {

                                $scope.buildOfferObjectForApi();

                                //if (pmUtilService.isValidForm($scope.requiredFields)) {
                                if ($routeParams.id === "add") {
                                    Offer.save($scope.pmpOffer, $scope.successCb, $scope.errorCb);
                                } else {
                                    Offer.update({
                                        id: $scope.offerId
                                    }, $scope.pmpOffer, $scope.successCb, $scope.errorCb);
                                }
                            });
                        } else {
                            $scope.serverErrors = [];
                            $scope.hasErrors = true;
                            $scope.serverErrors.push("Please correct form errors.");
                            $timeout(function() {
                                var element = document.getElementById("error-container");
                                element.scrollIntoView(true);
                            }, 250);

                            $scope.hideErrorMessageBox();
                        }
                    };

                    $scope.hideErrorMessageBox = function() {
                        $timeout(function() {
                            $scope.hasErrors = false;
                            $scope.serverErrors = [];
                        }, 5000);
                    };

                    // $scope.createOrUpdate = function() {
                    //     var isAllOrNone;

                    //     // if ($scope.checkTargetingFormValidity()) {
                    //     //     $scope.createTargetingObject();
                    //     // }

                    //     $scope.createTargetingObject();

                    //     if ($routeParams.id === "add") {

                    //         $scope.targetingResponse = Targeting.save($scope.targeting, function() {

                    //             $scope.createOfferObject();

                    //             if (pmUtilService.isValidForm($scope.requiredFields)) {
                    //                 Offer.save($scope.pmpOffer, function() { // success
                    //                     $scope.pmpOffer = "";
                    //                     $location.path("offers");
                    //                     $rootScope.$emit("refreshOffers");
                    //                     $scope.serverErrors = [];
                    //                     $scope.hasErrors = false;
                    //                 }, function(response) {
                    //                     angular.serverErrors = [];
                    //                     $scope.hasErrors = true;
                    //                     angular.forEach(response.data, function(value){
                    //                         $scope.serverErrors.push(value.errorMessage);
                    //                     });
                    //                 });
                    //             }
                    //         });
                    //     } else {
                    //         if (null === $scope.targeting || undefined === $scope.targeting) {
                    //             $scope.pmpOffer.targeting = $scope.targetingResponse.id;
                    //             $scope.pmpOffer.ownerId = $scope.publisherId;
                    //             $scope.pmpOffer.ownerType = 1;

                    //             $scope.createMultiSelectEntityObject("buyers", $scope.selectedBuyers);
                    //             $scope.createMultiSelectEntityObject("dsps", $scope.selectedDsps);
                    //             $scope.createMultiSelectEntityObject("advertisers", $scope.selectedAdvertisers);


                    //             if ($scope.selectedProduct !== undefined) {
                    //                 $scope.pmpOffer.product = $scope.selectedProduct[0].id;
                    //             }
                    //             $scope.channels = pmUtilService.getMultiSelectValues($scope.channels);
                    //             $scope.pmpOffer.channels = $scope.getIdsFromObjects($scope.channels);

                    //             if ($scope.pmpOffer.offerStartDate === undefined) {
                    //                 $scope.showErrorMessages("Please choose Offer start date.");
                    //             } else {
                    //                 $scope.pmpOffer.offerStartDate = $scope.getTimezoneConvertedDate($scope.pmpOffer.offerStartDate + " 00:00:00");
                    //             }
                    //             if ($scope.pmpOffer.offerEndDate === undefined) {
                    //                 $scope.showErrorMessages("Please choose Offer End date.");
                    //             } else {
                    //                 $scope.pmpOffer.offerEndDate = $scope.getTimezoneConvertedDate($scope.pmpOffer.offerEndDate + " 23:59:59");
                    //             }
                    //             if ($scope.pmpOffer.transactionStartDate === undefined) {
                    //                 $scope.showErrorMessages("Please choose Transaction start date.");
                    //             } else {
                    //                 $scope.pmpOffer.transactionStartDate = $scope.getTimezoneConvertedDate($scope.pmpOffer.transactionStartDate + " 00:00:00");
                    //             }
                    //             if ($scope.pmpOffer.transactionEndDate === undefined) {
                    //                 $scope.showErrorMessages("Please choose Transaction End date.");
                    //             } else {
                    //                 $scope.pmpOffer.transactionEndDate = $scope.getTimezoneConvertedDate($scope.pmpOffer.transactionEndDate + " 23:59:59");
                    //             }

                    //             // get tags
                    //             var formattedTags = [];
                    //             angular.forEach($scope.tagPills, function(value) {
                    //                 if (value !== undefined) {
                    //                     formattedTags.push(value.text);
                    //                 }
                    //             });
                    //             $scope.pmpOffer.tags = formattedTags.join();
                    //             Offer.update({
                    //                 id: $scope.offerId
                    //             }, $scope.pmpOffer, function() {
                    //                 $scope.pmpOffer = "";
                    //                 $location.path("offers");
                    //                 $rootScope.emit("refreshOffers");
                    //             });
                    //         } else {
                    //             if (null === $scope.targeting.id || undefined === $scope.targeting.id) {
                    //                 $scope.targetingResponse = Targeting.save($scope.targeting, function() {
                    //                     $scope.pmpOffer.targeting = $scope.targetingResponse.id;
                    //                     $scope.pmpOffer.ownerId = $scope.publisherId;
                    //                     $scope.pmpOffer.ownerType = 1;
                    //                     var isAllOrNone = $scope.isAllUseCase($scope.buyers, $scope.selectedBuyers);
                    //                     if (isAllOrNone === 0) {
                    //                         $scope.pmpOffer.buyers = [0];
                    //                     } else if (isAllOrNone === null) {
                    //                         $scope.pmpOffer.buyers = [];
                    //                     } else {
                    //                         $scope.pmpOffer.buyers = $scope.getIdsFromObjects($scope.selectedBuyers);
                    //                     }
                    //                     isAllOrNone = $scope.isAllUseCase($scope.dsps, $scope.selectedDsps);
                    //                     if (isAllOrNone === 0) {
                    //                         $scope.pmpOffer.dsps = [0];
                    //                     } else if (isAllOrNone === null) {
                    //                         $scope.pmpOffer.dsps = [];
                    //                     } else {
                    //                         $scope.pmpOffer.dsps = $scope.getIdsFromObjects($scope.selectedDsps);
                    //                     }
                    //                     isAllOrNone = $scope.isAllUseCase($scope.advertisers, $scope.selectedAdvertisers);
                    //                     if (isAllOrNone === 0) {
                    //                         $scope.pmpOffer.advertisers = [0];
                    //                     } else if (isAllOrNone === null) {
                    //                         $scope.pmpOffer.advertisers = [];
                    //                     } else {
                    //                         $scope.pmpOffer.advertisers = $scope.getIdsFromObjects($scope.selectedAdvertisers);
                    //                     }
                    //                     if ($scope.selectedProduct !== undefined) {
                    //                         $scope.pmpOffer.product = $scope.selectedProduct[0].id;
                    //                     }
                    //                     $scope.channels = pmUtilService.getMultiSelectValues($scope.channels);
                    //                     $scope.pmpOffer.channels = $scope.getIdsFromObjects($scope.channels);

                    //                     $scope.pmpOffer.offerStartDate = $scope.getTimezoneConvertedDate($scope.pmpOffer.offerStartDate + " 00:00:00");
                    //                     $scope.pmpOffer.offerEndDate = $scope.getTimezoneConvertedDate($scope.pmpOffer.offerEndDate + " 23:59:59");
                    //                     $scope.pmpOffer.transactionEndDate = $scope.getTimezoneConvertedDate($scope.pmpOffer.transactionEndDate + " 23:59:59");
                    //                     $scope.pmpOffer.transactionStartDate = $scope.getTimezoneConvertedDate($scope.pmpOffer.transactionStartDate + " 00:00:00");

                    //                     // get tags
                    //                     var formattedTags = [];
                    //                     angular.forEach($scope.tagPills, function(value) {
                    //                         if (value !== undefined) {
                    //                             formattedTags.push(value.text);
                    //                         }
                    //                     });
                    //                     $scope.pmpOffer.tags = formattedTags.join();
                    //                     Offer.update({
                    //                         id: $scope.offerId
                    //                     }, $scope.pmpOffer, function() {
                    //                         $scope.pmpOffer = "";
                    //                         $location.path("offers");
                    //                         $rootScope.emit("refreshOffers");
                    //                     });
                    //                 });
                    //             } else {
                    //                 $scope.targetingResponse = Targeting.update({
                    //                     "id": $scope.targetingId
                    //                 }, $scope.targeting, function() {
                    //                     $scope.pmpOffer.targeting = $scope.targetingResponse.id;
                    //                     $scope.pmpOffer.ownerId = $scope.publisherId;
                    //                     $scope.pmpOffer.ownerType = 1;
                    //                     isAllOrNone = $scope.isAllUseCase($scope.buyers, $scope.selectedBuyers);
                    //                     if (isAllOrNone === 0) {
                    //                         $scope.pmpOffer.buyers = [0];

                    //                     } else if (isAllOrNone === null) {
                    //                         $scope.pmpOffer.buyers = [];
                    //                     } else {
                    //                         $scope.pmpOffer.buyers = $scope.getIdsFromObjects($scope.selectedBuyers);
                    //                     }
                    //                     isAllOrNone = $scope.isAllUseCase($scope.dsps, $scope.selectedDsps);
                    //                     if (isAllOrNone === 0) {
                    //                         $scope.pmpOffer.dsps = [0];
                    //                     } else if (isAllOrNone === null) {
                    //                         $scope.pmpOffer.dsps = [];
                    //                     } else {
                    //                         $scope.pmpOffer.dsps = $scope.getIdsFromObjects($scope.selectedDsps);
                    //                     }
                    //                     isAllOrNone = $scope.isAllUseCase($scope.advertisers, $scope.selectedAdvertisers);
                    //                     if (isAllOrNone === 0) {
                    //                         $scope.pmpOffer.advertisers = [0];
                    //                     } else if (isAllOrNone === null) {
                    //                         $scope.pmpOffer.advertisers = [];
                    //                     } else {
                    //                         $scope.pmpOffer.advertisers = $scope.getIdsFromObjects($scope.selectedAdvertisers);
                    //                     }
                    //                     if ($scope.selectedProduct !== undefined) {
                    //                         $scope.pmpOffer.product = $scope.selectedProduct[0].id;
                    //                     }
                    //                     $scope.channels = pmUtilService.getMultiSelectValues($scope.channels);
                    //                     $scope.pmpOffer.channels = $scope.getIdsFromObjects($scope.channels);
                    //                     // get tags
                    //                     var formattedTags = [];
                    //                     angular.forEach($scope.tagPills, function(value) {
                    //                         if (value !== undefined) {
                    //                             formattedTags.push(value.text);
                    //                         }
                    //                     });
                    //                     $scope.pmpOffer.tags = formattedTags.join();
                    //                     Offer.update({
                    //                         id: $scope.offerId
                    //                     }, $scope.pmpOffer, function() {
                    //                         $scope.pmpOffer = "";
                    //                         $location.path("offers");
                    //                         $rootScope.emit("refreshOffers");
                    //                     });
                    //                 });
                    //             }
                    //         }

                    //     }
                    // };
                    $scope.audienceSearch = function(searchFilter) {
                        if (searchFilter !== undefined) {
                            var deferred = $q.defer();
                            Audience.query({
                                filter: searchFilter,
                                pubId: $scope.publisherId
                            }).$promise.then(function(audienceSegments) {
                                $scope.audienceSegments = $scope.setMultiSelectValues(audienceSegments.items);
                                if ($routeParams.id === "add") {} else if ($scope.targetingRetrieved !== undefined) {
                                    $scope.audienceSegments = $scope.setMultiSelectValues($scope.audienceSegments, "name", $scope.targetingRetrieved.audienceSegments);
                                }

                                deferred.resolve({
                                    isValid: true,
                                    data: audienceSegments
                                });
                            });
                            return deferred.promise;
                        }
                    };
                }
            ]
        };
    }
]);
