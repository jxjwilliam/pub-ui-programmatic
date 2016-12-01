"use strict";

var pmlComponents = angular.module("pmlComponents");

pmlComponents.factory("Product", ["pmTokenStorageService", "$resource", function(pmTokenStorageService, $resource) {
    return $resource("/api/inventory/products/:id", null, {
        get: {
            method: "GET",
            headers: {
                "pubToken": pmTokenStorageService.getAuthToken()
            }
        },
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
            url: "/api/inventory/products"
        }
    });
}]);


pmlComponents.factory("PublisherAdTags", ["pmTokenStorageService", "$resource", function(pmTokenStorageService, $resource) {
    return $resource("/api/inventory/publisherAdTag?" +
        "pageNumber=1&pageSize=1000&" + ":adTagFilter&filters=loggedInOwnerId eq :pubId &filters=loggedInOwnerTypeId eq :ownerType", null, {
            query: {
                headers: {
                    "pubToken": pmTokenStorageService.getAuthToken()
                },
                method: "GET"
            },
            getByPost: {
                method: "POST",
                headers: {
                    "pubToken": pmTokenStorageService.getAuthToken()
                },
                url: "/api/inventory/publisherAdTag/postSearch"
            }
        });
}]);

pmlComponents.factory("PublisherSites", ["pmTokenStorageService", "$resource", function(pmTokenStorageService, $resource) {
    return $resource("/api/inventory/publisherSites?" +
        ":siteFilter" +
        "&filters=pubId+eq+:pubId&filters=iuFilter+eq+1&pageNumber=1&pageSize=1000",
        null, {
            query: {
                headers: {
                    "pubToken": pmTokenStorageService.getAuthToken()
                },
                method: "GET"
            },
        });
}]);

pmlComponents.factory("PublisherSections", ["pmTokenStorageService", "$resource", function(pmTokenStorageService, $resource) {
    return $resource("/api/inventory/section?" +
        "searchKey=&pageNumber=1&pageSize=500&filters=pubId eq :pubId&" +
        "filters=loggedInOwnerId eq :pubId & filters=loggedInOwnerTypeId eq :ownerType",
        null, {
            query: {
                headers: {
                    "pubToken": pmTokenStorageService.getAuthToken()
                }
            },
            method: "GET"
        });
}]);

pmlComponents.factory("AdServerInventory", ["pmTokenStorageService", "$resource", function(pmTokenStorageService, $resource) {
    return $resource("/api/inventory/adserverinventory/:id",
        null, {
            query: {
                headers: {
                    "pubToken": pmTokenStorageService.getAuthToken()
                }
            },
            method: "GET"
        });
}]);

pmlComponents.directive("pmIdProductCreateForm", [
        function() {
            return {
                templateUrl: "components/idComponents/pmIdProductCreateForm/pmIdProductCreateForm-directive.html",
                restrict: "E",
                scope: {
                    endpoint: "@endpoint"
                },
                controller: ["$q", "$timeout", "pmApiService", "$scope", "$location", "$rootScope", "$routeParams",
                    "Product", "PublisherSites", "PublisherAdTags", "PublisherSections", "pmTokenStorageService", "pmCommonApiService",
                    "pmUtilService", "pmAclHttpService", "ProductAgOption", "AdServerInventory",
                    function($q, $timeout, pmApiService, $scope, $location, $rootScope, $routeParams,
                        Product, PublisherSites, PublisherAdTags, PublisherSections, pmTokenStorageService, pmCommonApiService,
                        pmUtilService, pmAclHttpService, ProductAgOption, AdServerInventory) {

                        // INITIALIZATION
                        $scope.patterns = pmUtilService.getValidationPatterns();

                        $scope.panelView = "close";
                        //$rootScope.showOverlay = "none";
                        $scope.product = {}; // creating empty product object
                        $scope.productRetrieved = {};
                        $scope.showVideoFilters = false;
                        $scope.publisherAdTagsList = [];
                        $scope.allPublisherAdTags = [];
                        $scope.siteFilterFlag = false;
                        $scope.adSizeFilterFlag = false;
                        $scope.productCategoryFlag = false;
                        $scope.allAdSizes = [];
                        $scope.allVerticals = [];
                        $scope.requiredFields = {};
                        $scope.requiredFields.sites = false;
                        $scope.requiredFields.adTags = false;
                        $scope.atLeastOneError = {};
                        $scope.atLeastOneError.platform = false;
                        $scope.atLeastOneError.adFormat = false;
                        $scope.atLeastOneError.adFoldPlacement = false;
                        $scope.atLeastOneError.vastVersion = false;
                        $scope.atLeastOneError.vpaidComplianceVersion = false;
                        $scope.isAnyEnabled = {};
                        $scope.isAnyEnabled.sites = true;
                        $scope.isAnyEnabled.adTags = true;
                        $scope.isCompanionAdsNo = true;
                        $scope.isCompanionAdsYes = true;
                        $scope.labels = {};
                        $scope.labels.ALL_SITES = "All Sites Selected";
                        $scope.labels.SELECT_SITE = "Select Site";
                        $scope.labels.ALL_ADTAGS = "All AdTags Selected";
                        $scope.labels.SELECT_AD_TAG = "Select AdTag";
                        $scope.defaultLabel = {};
                        $scope.defaultLabel.sites = $scope.labels.ALL_SITES;
                        $scope.defaultLabel.adTags = $scope.labels.ALL_ADTAGS;

                        var RESOURCE_TYPE_PUBLISHER = "publisher",
                            RESOURCE_TYPE_PUBLISHER_ID = "1";

                        $scope.requiredFields = {
                            name: false,
                            productCategory: false,
                            siteName: false,
                            sites: false,
                            adTags: false

                        };
                        $scope.hasErrors = false;
                        $scope.serverErrors = [];

                        $scope.multiSelectDefaults = {
                            adSizes: "any",
                            sites: "any",
                            adTags: "any"
                        };

                        $scope.agEnabled = false;
                        $scope.isValidAdServer = true;
                        $scope.adServerInventory = {
                            adServerConfId: 0,    // each publisher is assigned to 1 ad server. will do a lookup to get this.
                            iuType: 1,
                            externalId: "",
                            id: 0   // this will get populated with a valid adServerInventoryUnit    
                        };

                        $scope.adSizeChange = function() {
                            console.dir($scope.selectedAdSizes);
                        };

                        $scope.getAdSizeFilterForAdTag = function() {
                            var adSizes = pmUtilService.getIdsFromObjects($scope.selectedAdSizes);
                            var adSizeFilter = "";
                            if (adSizes !== undefined && adSizes !== null && adSizes.length > 0) {
                                adSizeFilter = "filters=";
                                for (var y in adSizes) {
                                    adSizeFilter += "adSize eq " + adSizes[y] + ",";
                                }
                                adSizeFilter = adSizeFilter.substring(0, adSizeFilter.length - 1);
                            }
                            return adSizeFilter;
                        };

                        $scope.getAdFoldPlacementsFiltersForAdTag = function() {
                            var adFoldPlacements = angular.copy($scope.selectedAdFoldPlacements);
                            adFoldPlacements = pmUtilService.getIdsFromObjects(adFoldPlacements);
                            var adFoldPlacementFilter = "";
                            if (adFoldPlacements !== undefined && adFoldPlacements !== null && adFoldPlacements.length > 0) {
                                adFoldPlacementFilter = "filters=";
                                for (var y in adFoldPlacements) {
                                    adFoldPlacementFilter += "foldPlacement eq " + adFoldPlacements[y] + ",";
                                }
                                adFoldPlacementFilter = adFoldPlacementFilter.substring(0, adFoldPlacementFilter.length - 1);
                            }
                            return adFoldPlacementFilter;
                        };

                        $scope.getAdFormatFilterForAdTag = function() {
                            var adCodeTypes = $scope.selectedAdFormats;
                            var videoFilter;
                            var adFormatFilter = "";
                            if (adCodeTypes !== undefined && adCodeTypes !== null && adCodeTypes.length > 0) {
                                adFormatFilter = "filters=";
                                for (var z in adCodeTypes) {
                                    adFormatFilter += "adcodeType eq " + adCodeTypes[z] + ",";
                                    if (adCodeTypes[z] === 3) {
                                        videoFilter = $scope.getVideoAdTagFilter();
                                    }
                                }
                                adFormatFilter = adFormatFilter.substring(0, adFormatFilter.length - 1);
                                if (videoFilter !== undefined) {
                                    adFormatFilter += videoFilter;
                                }
                            }
                            return adFormatFilter;
                        };

                        $scope.getAdTagFilter = function() {
                            $scope.AdTagFilter = "";
                            var siteFilter = $scope.getSiteFilterForAdTags();
                            var adSizeFilter = $scope.getAdSizeFilterForAdTag();
                            var adFormatFilter = $scope.getAdFormatFilterForAdTag();
                            var adFoldPlacementFilter = $scope.getAdFoldPlacementsFiltersForAdTag();
                            if (siteFilter !== "") {
                                $scope.AdTagFilter = siteFilter;
                            }
                            if (adSizeFilter !== "") {
                                $scope.AdTagFilter += "&" + adSizeFilter;
                            }
                            if (adFormatFilter !== "") {
                                $scope.AdTagFilter += "&" + adFormatFilter;
                            }
                            if (adFoldPlacementFilter !== "") {
                                $scope.AdTagFilter += "&" + adFoldPlacementFilter;
                            }
                            return $scope.AdTagFilter;
                        };

                        $scope.changeAdTags = function() {
                            $scope.requiredFields.adTags = false;
                            var requestObject = $scope.createRequestBodyForPublisherAdTag();
                            PublisherAdTags.getByPost(requestObject).$promise.then(function(allPublisherAdTags) {
                                $scope.publisherAdTagsList = [];
                                $scope.allPublisherAdTags = $scope.setMultiSelectValues(allPublisherAdTags.items);
                                for (var i = 0; i < 100 && i < $scope.allPublisherAdTags.length; i++) {
                                    $scope.publisherAdTagsList[i] = $scope.allPublisherAdTags[i];
                                }
                                $scope.clearAdTagsSelection = false;
                                if ($scope.allPublisherSites.length <= 0) {
                                    $scope.publisherAdTagsList = null;
                                    $scope.allPublisherAdTags = null;
                                    $scope.requiredFields.adTags = true;
                                }
                            });
                        };

                        $scope.getSiteFilter = function(platformIds, publisherId) {
                            var siteFilter = "";
                            var filter;
                            if (platformIds === "0") {
                                filter = {
                                    pubId: publisherId
                                };
                            } else {
                                siteFilter = "filters=";
                                for (var x in platformIds) {
                                    siteFilter += "platformId eq " + platformIds[x] + ",";
                                }
                                siteFilter = siteFilter.substring(0, siteFilter.length - 1);
                                filter = {
                                    siteFilter: siteFilter,
                                    pubId: publisherId
                                };
                            }
                            return filter;
                        };


                        $scope.getSiteFilterForAdTags = function() {
                            var siteFilter = "";
                            $scope.sites = [];

                            if ($scope.selectedSites !== undefined && $scope.selectedSites !== null && $scope.selectedSites.length > 0) {
                                $scope.sites = pmUtilService.getIdsFromObjects($scope.selectedSites);
                            } else if ($scope.platFormFilteredSites !== undefined && $scope.platFormFilteredSites !== null && $scope.platFormFilteredSites.length > 0) {
                                $scope.sites = pmUtilService.getIdsFromObjects($scope.platFormFilteredSites);
                            }
                            siteFilter = "filters=";
                            //$scope.siteFilter = "";
                            for (var x in $scope.sites) {
                                siteFilter += "site eq " + $scope.sites[x] + ",";
                            }
                            siteFilter = siteFilter.substring(0, siteFilter.length - 1);
                            return siteFilter;
                        };

                        $scope.changeSites = function() {
                            //empty previous sites selection before querying platform filtered sites
                            $scope.publisherSites = [];

                            $scope.product.platforms = pmUtilService.getIdsFromObjects($scope.selectedPlatforms);
                            PublisherSites.query($scope.getSiteFilter($scope.product.platforms, $scope.publisherId)).$promise.then(function(publisherSites) {

                                //Clear the selection of sites
                                // $scope.$apply(function() {
                                //     $scope.clearSiteSelection = true;
                                // });
                                $scope.allPublisherSites = publisherSites.items;

                                for (var i = 0; i < 100 && i < $scope.allPublisherSites.length; i++) {
                                    $scope.publisherSites[i] = $scope.allPublisherSites[i];
                                }

                                // $scope.$apply(function() {
                                //     $scope.clearSitesSelection = false;
                                // });

                                $scope.clearSiteSelection = false;

                                if ($scope.allPublisherSites !== null && $scope.allPublisherSites.length === 0) {
                                    $scope.publisherAdTagsList = "";
                                    $scope.allPublisherAdTags = "";
                                    $scope.platFormFilteredSites = "";
                                } else if ($scope.allPublisherSites !== null) {
                                    $scope.platFormFilteredSites = $scope.allPublisherSites;
                                    $scope.clearAdTagsSelection = true;
                                    $scope.changeAdTags();
                                } else {
                                    window.alert("Internal error occured.");
                                }
                            });
                        };

                        $scope.init = function() {
                            if ($scope.publisherSites === undefined) {
                                $scope.publisherSites = [];
                            }
                            if (pmTokenStorageService.getResourceType() === RESOURCE_TYPE_PUBLISHER) {
                                $scope.publisherId = pmTokenStorageService.getResourceId();
                                $scope.loggedInOwnerTypeId = RESOURCE_TYPE_PUBLISHER_ID;
                            }

                            PublisherSites.query(pmUtilService.getSiteFilter("0", $scope.publisherId))
                                .$promise.then(function(response) {
                                    $scope.allPublisherSites = response.items;

                                    for (var i = 0; i < 100 && i < $scope.allPublisherSites.length; i++) {
                                        $scope.publisherSites[i] = $scope.allPublisherSites[i];
                                        $scope.publisherSites[i].ticked = false;
                                    }
                                });

                            PublisherSections.query({
                                "pubId": $scope.publisherId,
                                "ownerType": $scope.loggedInOwnerTypeId
                            }).$promise.then(function(publisherSections) {
                                $scope.publisherSections = $scope.setMultiSelectValues(publisherSections.items);
                                if ($routeParams.id === "add") {} else {
                                    $scope.publisherSections = $scope.setMultiSelectValues($scope.publisherSections, "name", $scope.productRetrieved.sections);
                                }
                            });

                            var PmAgOptions = pmAclHttpService.getPmAgOptions();
                            if (PmAgOptions.indexOf("AG") !== -1) {
                                $scope.agEnabled = true;
                                $scope.adServerInventory.adServerConfId = 1;   // pmCommonApiService.getAdServerForPublisher($scope.publisherId);
                            }

                            $scope.formattedTags = [];
                            if (typeof $routeParams.id !== "undefined") {
                                setTimeout(function() {
                                    $scope.panelView = "open";

                                }, 100);
                                if ($routeParams.id === "add") {
                                    $scope.mode = "add";
                                    $scope.screenTitle = "Create a Product";
                                    $scope.buttonTitle = "Create Product";
                                    //$rootScope.showOverlay = "block";
                                    $rootScope.$emit("showOverlay", "block");
                                    $scope.isBannerChecked = "true";
                                    $scope.isVideoChecked = "true";
                                    $scope.companionAds = null;
                                    $scope.selectedAdFormats = [0, 1, 2, 3];
                                    $scope.showVideoFilters = true;
                                    //SET default values
                                    $scope.allProductPlatforms = pmUtilService.setMultiSelectValuesToTrue(pmCommonApiService.getPlatforms());
                                    $scope.selectedPlatforms = pmUtilService.setMultiSelectValuesToTrue(pmCommonApiService.getPlatforms());
                                    $scope.allAdFoldPlacements = pmUtilService.setMultiSelectValuesToTrue(pmCommonApiService.getAdFoldPlacements());
                                    $scope.selectedAdFoldPlacements = pmUtilService.setMultiSelectValuesToTrue(pmCommonApiService.getAdFoldPlacements());
                                    $scope.allVastProtocols = pmUtilService.setMultiSelectValuesToTrue(pmCommonApiService.getVastProtocols());
                                    $scope.selectedVastVersions = pmUtilService.setMultiSelectValuesToTrue(pmCommonApiService.getVastProtocols());
                                    $scope.allVpaidCompliance = pmUtilService.setMultiSelectValuesToTrue(pmCommonApiService.getVpaidCompliance());
                                    $scope.selectedVpaidCompliance = pmUtilService.setMultiSelectValuesToTrue(pmCommonApiService.getVpaidCompliance());
                                    $scope.changeSites();
                                } else {
                                    $scope.allProductPlatforms = pmUtilService.setMultiSelectValues(pmCommonApiService.getPlatforms());
                                    $scope.allAdFoldPlacements = pmUtilService.setMultiSelectValues(pmCommonApiService.getAdFoldPlacements());
                                    $scope.allVastProtocols = pmUtilService.setMultiSelectValues(pmCommonApiService.getVastProtocols());
                                    $scope.allVpaidCompliance = pmUtilService.setMultiSelectValues(pmCommonApiService.getVpaidCompliance());
                                    $scope.mode = "edit";
                                    //$rootScope.showOverlay = "block";
                                    $rootScope.$emit("showOverlay", "block");
                                    $scope.productId = $routeParams.id;
                                    $scope.screenTitle = "Edit Product";
                                    $scope.buttonTitle = "Update Product";
                                    //Create a function to get an object from key value params
                                    $scope.productRetrieved = Product.get({
                                        "id": $routeParams.id
                                    }, function() {
                                        $scope.populateForm($scope.productRetrieved);
                                    });
                                }
                            } else {
                                $scope.panelView = "close";
                                $rootScope.$emit("showOverlay", "none");
                            }

                            $scope.adTagFilter = {
                                "adTagFilter": "",
                                "pubId": $scope.publisherId,
                                "ownerType": $scope.loggedInOwnerTypeId
                            };
                        };

                        $scope.init();
                        // end INITIALIZATION

                        // EVENT HANDLERS
                        $scope.validateAdServer = function() {
                            //console.log("1. [IN validateAdServer]...", 
                            //    $scope.adServerInventory.adServerConfId, $scope.adServerInventory.iuType, $scope.adServerInventory.externalId )
                            
                            if ( $scope.adServerInventory.externalId !== "") {
                                var promise = pmCommonApiService.validateAdServer(
                                        $scope.adServerInventory.adServerConfId,$scope.adServerInventory.iuType,$scope.adServerInventory.externalId);
                                promise.then(function(result){
                                    //console.log("5. [IN validateAdServer] result: ", result);
                                    if (result.data.items.length === 0) {
                                        $scope.isValidAdServer = false;
                                    }
                                    else {
                                        console.log("6. [IN validateAdServer] result.data.items[0]: ", result.data.items[0].id);
                                        $scope.adServerInventory.id = result.data.items[0].id;
                                        $scope.adServerInventory.adServerConfId = result.data.items[0].adserverConfId;
                                        $scope.adServerInventory.iuType = result.data.items[0].iuType;
                                        $scope.adServerInventory.externalId = result.data.items[0].externalId;
                                        $scope.isValidAdServer = true;
                                    }
                                });
                            }
                            else {
                                $scope.isValidAdServer = false;
                            }
                        };

                        $scope.onSiteNameAddedOrRemoved = function() {
                            $scope.requiredFields.siteName = ($scope.siteNamePills.length === 0);
                        };

                        $scope.productNameChange = function() {
                            var name = $scope.productName,
                                tempValidFlag = (name === undefined || name === ""),
                                namePattern = $scope.patterns.name;
                            $scope.requiredFields.name = tempValidFlag || !namePattern.test(name);
                        };

                        $scope.adSizesSearch = function(searchFilter) {
                            var promise = pmCommonApiService.getAdSizes(searchFilter);
                            return promise;
                        };

                        $scope.sitesSearch = function(searchFilter) {
                            if (searchFilter !== undefined) {
                                var platformIds = pmUtilService.getIdsFromObjects($scope.selectedPlatforms),
                                    filterObj = pmUtilService.getSiteFilter(platformIds, $scope.publisherId),
                                    tempFilter = searchFilter && searchFilter.length ? "&filters=url like *" + searchFilter + "*" : "&filters=url like *",
                                    tempObject = [],
                                    i = 0;

                                filterObj.siteFilter = filterObj.siteFilter + tempFilter;
                                var deferred = $q.defer();

                                PublisherSites.query(filterObj).$promise.then(function(publisherSites) {

                                    for (i = 0; i < 100 && i < publisherSites.items.length; i++) {
                                        tempObject[i] = publisherSites.items[i];
                                    }

                                    publisherSites.items = tempObject;

                                    deferred.resolve({
                                        isValid: true,
                                        data: publisherSites
                                    });
                                });
                                return deferred.promise;
                            }
                        };

                        $scope.adTagsSearch = function(searchFilter) {
                            var deferred = $q.defer(),
                                requestObject,
                                tempObject = [],
                                i = 0;

                            if (searchFilter !== undefined) {
                                $scope.requiredFields.adTags = false;
                                requestObject = $scope.createRequestBodyForPublisherAdTag(searchFilter);

                                if ($scope.allPublisherSites.length <= 0 || $scope.sites.length <= 0) {
                                    $scope.allPublisherAdTags = [];
                                    $scope.requiredFields.adTags = true;
                                } else {
                                    PublisherAdTags.getByPost(requestObject).$promise.then(function(allPublisherAdTags) {

                                        $scope.allPublisherAdTags = angular.copy(allPublisherAdTags.items);

                                        for (i = 0; i < 100 && i < $scope.allPublisherAdTags.length; i++) {
                                            tempObject[i] = $scope.allPublisherAdTags[i];
                                        }
                                        allPublisherAdTags.items = tempObject;
                                        deferred.resolve({
                                            isValid: true,
                                            data: allPublisherAdTags
                                        });
                                    });
                                }
                                return deferred.promise;
                            }
                        };

                        $scope.openAdSizes = function() {
                            if ($scope.allAdSizes === null || $scope.allAdSizes === undefined || $scope.allAdSizes.length === 0) {
                                $scope.allAdSizes = angular.copy(pmCommonApiService.getAdSizes());
                            }
                        };

                        $scope.openProductCategory = function() {
                            if ($scope.allVerticals === null || $scope.allVerticals === undefined || $scope.allVerticals.length === 0) {
                                $scope.allVerticals = angular.copy(pmCommonApiService.getVerticals());
                            }
                        };

                        $scope.cancel = function() {
                            $location.path("products");
                        };

                        $scope.getDataFromForm = function() {
                            $scope.requiredFields.adTags = false;
                            var product = {};
                            product.ownerType = 1;
                            product.ownerId = $scope.publisherId;
                            product.name = $scope.productName;
                            product.description = $scope.productDescription;
                            product.productCategory = pmUtilService.getIdsFromObjects($scope.selectedVerticals);
                            var formattedTags = [];
                            angular.forEach($scope.tagPills, function(value) {
                                if (value !== undefined) {
                                    formattedTags.push(value.text);
                                }
                            });
                            product.tags = formattedTags.join();
                            var formattedSiteNames = [];
                            angular.forEach($scope.siteNamePills, function(value) {
                                if (value !== undefined) {
                                    formattedSiteNames.push(value.text);
                                }
                            });
                            product.siteName = formattedSiteNames.join();
                            product.platforms = pmUtilService.getIdsFromObjects($scope.selectedPlatforms);
                            product.adCodeTypes = pmUtilService.getIdsFromObjects($scope.selectedAdFormats);
                            product.adFoldPlacements = pmUtilService.getIdsFromObjects($scope.selectedAdFoldPlacements);
                            product.adSizes = pmUtilService.getIdsFromObjects($scope.selectedAdSizes);

                            if ($scope.isVideoChecked === "true") {
                                product.companionAds = $scope.companionAds;
                                product.vastVersions = pmUtilService.getIdsFromObjects($scope.selectedVastVersions);
                                product.minAdDuration = $scope.minAdDuration;
                                product.maxAdDuration = $scope.maxAdDuration;
                                product.vpaidComplianceVersions = pmUtilService.getIdsFromObjects($scope.selectedVpaidCompliance);
                            } else {
                                $scope.resetVideoAdTagProperties(false);
                            }

                            if ($scope.selectedSites !== undefined && $scope.selectedSites !== null && $scope.selectedSites.length > 0) {
                                $scope.sites = pmUtilService.getIdsFromObjects($scope.selectedSites);
                            } else if ($scope.platFormFilteredSites !== undefined && $scope.platFormFilteredSites !== null && $scope.platFormFilteredSites.length > 0) {
                                $scope.sites = pmUtilService.getIdsFromObjects($scope.platFormFilteredSites);
                            }

                            var isAllPlatFormSelected = $scope.isAllUseCase($scope.allProductPlatforms, $scope.selectedPlatforms);
                            // var isAllSitesSelected = $scope.isAllUseCase($scope.publisherSites, $scope.sites);

                            var isAllSitesSelected = $scope.multiSelectDefaults.sites === "any" ? 0 : $scope.isAllSitesOrNot() ? 0 : null;
                            if (isAllPlatFormSelected === 0 && isAllSitesSelected === 0) {
                                product.sites = [];
                            } else {
                                product.sites = $scope.sites;
                            }

                            //var isAllAdTagsSelected = $scope.isAllUseCase($scope.publisherAdTagsList, $scope.selectedAdTags);
                            var isAllAdTagsSelected = $scope.isAllAdTagsOrNot();


                            if (isAllPlatFormSelected === 0 && isAllSitesSelected === 0 && isAllAdTagsSelected === 0) {
                                product.adTags = [];
                                //} else if (($scope.isBannerChecked === "true" && $scope.isVideoChecked === "false") || ($scope.isBannerChecked === "false" && $scope.isVideoChecked === "true")) {
                            } else if (!$scope.isAnyEnabled.adTags) {
                                if ($scope.allPublisherAdTags === undefined || $scope.allPublisherAdTags === null || $scope.allPublisherAdTags.length === 0) {
                                    $scope.requiredFields.adTags = true;
                                } else if ($scope.selectedAdTags === undefined || $scope.selectedAdTags === null || $scope.selectedAdTags.length === 0) {
                                    product.adTags = pmUtilService.getIdsFromObjects($scope.allPublisherAdTags);
                                } else {
                                    product.adTags = pmUtilService.getIdsFromObjects($scope.selectedAdTags);
                                }
                            } else {
                                product.adTags = pmUtilService.getIdsFromObjects($scope.selectedAdTags);
                            }
                            product.sections = pmUtilService.getIdsFromObjects($scope.selectedSections);

                            // Ad Server Unit Mapping
                            var PmAgOptions = pmAclHttpService.getPmAgOptions();
                            if (PmAgOptions.indexOf("AG") !== -1) {
                                $scope.validateAdServer();      // if valid, it will return a valid id and store it in $scope.adServerInventory.id
                                console.log("[IN getDataFromForm] $scope.adServerInventory.id: ", $scope.adServerInventory.id);
                                if ( $scope.adServerInventory.id === 0 ) {
                                    // TODO? need to create and return a new adserver inventory id.
                                }
                                product.adServerInventoryUnits = (($scope.adServerInventory.externalId === "") || ($scope.adServerInventory.id === 0)) ? null : [$scope.adServerInventory.id];
                                console.log("[IN getDataFromForm] product: ", product);
                            }

                            return product;

                        };

                        $scope.isAllAdTagsOrNot = function() {
                            if ($scope.multiSelectDefaults.adTags === "any") {
                                return 0;
                            } else if (($scope.isBannerChecked === "true" && $scope.isVideoChecked === "false") || ($scope.isBannerChecked === "false" && $scope.isVideoChecked === "true")) {
                                return null;
                            } else if ($scope.selectedAdTags === undefined || $scope.selectedAdTags.length === 0) {
                                return null;
                            } else {
                                return null;
                            }
                        };

                        $scope.createOrUpdate = function() {

                            $scope.product = $scope.getDataFromForm();
                            console.log("[IN createOrUpdate] $scope.product: ", $scope.product);
                            //Validate Product
                            if ($scope.product.name === undefined) {
                                $scope.requiredFields.name = true;
                            } else {
                                $scope.requiredFields.name = false;
                            }

                            if ($scope.product.productCategory.length === 0) {
                                $scope.requiredFields.productCategory = true;
                            } else {
                                $scope.requiredFields.productCategory = false;
                            }

                            if ($scope.product.siteName === "") {
                                $scope.requiredFields.siteName = true;
                            } else {
                                $scope.requiredFields.siteName = false;
                            }

                            if ($scope.allPublisherSites && $scope.allPublisherSites.length < 1) {
                                $scope.requiredFields.sites = true;
                            } else {
                                $scope.requiredFields.sites = false;
                            }
                            if ($scope.requiredFields.adTags || $scope.allPublisherAdTags === null || $scope.allPublisherAdTags.length === 0) {
                                $scope.requiredFields.adTags = true;
                            } else {
                                $scope.requiredFields.adTags = false;
                            }

                            console.log(($scope.requiredFields.name &&
                                $scope.requiredFields.productCategory &&
                                $scope.requiredFields.siteName &&
                                $scope.requiredFields.sites &&
                                $scope.requiredFields.adTags));
                            $scope.clearAdTagsSelection = false;
                            if (pmUtilService.isValidForm($scope.requiredFields)) {
                                if ($scope.productId === undefined) {
                                    Product.save($scope.product, function() {
                                        $scope.product = "";
                                        //pmCommonApiService.initProducts();
                                        $location.path("products");
                                        $rootScope.$emit("refreshProducts");
                                        $scope.hasErrors = false;
                                        $scope.serverErrors = [];
                                        pmUtilService.clearSessionPageInfo();
                                    }, function(response) {
                                        $scope.serverErrors = [];
                                        $scope.hasErrors = true;
                                        angular.forEach(response.data, function(value) {
                                            $scope.serverErrors.push(value.errorMessage);
                                        });
                                        $timeout(function() {
                                            var element = document.getElementById("error-container");
                                            element.scrollIntoView(true);
                                        }, 250);
                                        $scope.hideErrorMessageBox();
                                    });
                                } else {
                                    Product.update({
                                        id: $scope.productId
                                    }, $scope.product, function() {
                                        $scope.product = "";
                                        $location.path("products");
                                        $rootScope.$emit("refreshProducts");
                                        $scope.hasErrors = false;
                                        $scope.serverErrors = [];
                                        pmUtilService.clearSessionPageInfo();
                                    }, function(response) {
                                        $scope.serverErrors = [];
                                        $scope.hasErrors = true;
                                        angular.forEach(response.data, function(value) {
                                            $scope.serverErrors.push(value.errorMessage);
                                        });
                                        $timeout(function() {
                                            var element = document.getElementById("error-container");
                                            element.scrollIntoView(true);
                                        }, 250);
                                    });
                                }
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

                        $scope.resetVideoAdTagProperties = function(GET_FOR_UPDATE) {
                            //companionAds
                            $scope.companionAds = null;
                            $scope.isCompanionAdsNo = true;
                            $scope.isCompanionAdsYes = true;

                            //vastVersions
                            $scope.allVastProtocols = pmUtilService.setMultiSelectValuesToTrue(pmCommonApiService.getVastProtocols());
                            $scope.selectedVastVersions = pmUtilService.setMultiSelectValuesToTrue(pmCommonApiService.getVastProtocols());
                            //Ad duration
                            $scope.maxAdDuration = undefined;
                            $scope.minAdDuration = undefined;
                            //VPAID compliance
                            $scope.allVpaidCompliance = pmUtilService.setMultiSelectValuesToTrue(pmCommonApiService.getVpaidCompliance());
                            $scope.selectedVpaidCompliance = pmUtilService.setMultiSelectValuesToTrue(pmCommonApiService.getVpaidCompliance());
                            if (!GET_FOR_UPDATE) {
                                $scope.clearAdTagsSelection = true;
                                $scope.changeAdTags();
                            }
                        };

                        $scope.pushAdFormats = function() {
                            if ($scope.selectedAdFormats === undefined) {
                                $scope.selectedAdFormats = [];
                            }
                            if ($scope.isVideoChecked === "true") {
                                if ($scope.selectedAdFormats.indexOf(3) < 0) { // not in array, add it
                                    $scope.selectedAdFormats.push(3);
                                }
                                $scope.showVideoFilters = true;
                            } else if ($scope.isVideoChecked === "false") {
                                $scope.selectedAdFormats.splice($scope.selectedAdFormats.indexOf(3), 1); // remove it if exists (deselected)
                                $scope.showVideoFilters = false;
                                $scope.resetVideoAdTagProperties();
                            }
                            if ($scope.isBannerChecked === "true") {
                                if ($scope.selectedAdFormats.indexOf(0) < 0) { // all the values (0,1,2) are not there, add them
                                    $scope.selectedAdFormats.push(0);
                                    $scope.selectedAdFormats.push(1);
                                    $scope.selectedAdFormats.push(2);
                                }
                            } else if ($scope.isBannerChecked === "false") {
                                if ($scope.selectedAdFormats.indexOf(0) >= 0) {
                                    $scope.selectedAdFormats.splice($scope.selectedAdFormats.indexOf(0), 1);
                                    $scope.selectedAdFormats.splice($scope.selectedAdFormats.indexOf(1), 1);
                                    $scope.selectedAdFormats.splice($scope.selectedAdFormats.indexOf(2), 1);
                                }
                            }
                        };

                        // event handlers - checkboxes
                        $scope.adFormatsChange = function(GET_FOR_UPDATE) {
                            // if ($scope.isBannerChecked === "false" && $scope.isVideoChecked === "false") {
                            //     console.log("Error");
                            //     $scope[entityModel] = "true";
                            //     $scope.atLeastOneError.adFormat = true;
                            //     $timeout(function() {
                            //         $scope.atLeastOneError.adFormat = false;
                            //         $scope.multiSelectDefaults.adTags = "select";
                            //     }, 1000);
                            // } else {
                            $scope.pushAdFormats();
                            $scope.checkAllFiltersForAdTagAnyButton();
                            if ($routeParams.id === "add" || !GET_FOR_UPDATE) {
                                $scope.clearAdTagsSelection = true;
                                $scope.changeAdTags();
                            }
                            //}
                        };

                        $scope.adPlacementChange = function(item, GET_FOR_UPDATE) {
                            if ($scope.selectedAdFoldPlacements === undefined) {
                                $scope.selectedAdFoldPlacements = [];
                            }
                            // if ($scope.selectedAdFoldPlacements.length === 1 && item.ticked === false) {
                            //     $scope.atLeastOneError.adFoldPlacement = true;
                            //     $scope.selectedAdFoldPlacements[0].ticked = true;
                            //     $timeout(function() {
                            //         $scope.atLeastOneError.adFoldPlacement = false;
                            //     }, 1000);
                            // } else
                            var arrOfIds = pmUtilService.getIdsFromObjects($scope.selectedAdFoldPlacements);
                            if (item.ticked === true) {
                                if (arrOfIds.indexOf(item.id) < 0) {
                                    $scope.selectedAdFoldPlacements.push(item);
                                }
                            } else {
                                var index = arrOfIds.indexOf(item.id);
                                $scope.selectedAdFoldPlacements.splice(index, 1);
                            }
                            if ($routeParams.id === "add" || !GET_FOR_UPDATE) {
                                $scope.clearAdTagsSelection = true;
                                $scope.changeAdTags();
                            }
                            //$scope.checkAllFiltersForAdTagAnyButton();
                            //}
                        };

                        $scope.platformChangeForUpdate = function(item) {
                            if ($scope.selectedPlatforms === undefined) {
                                $scope.selectedPlatforms = [];
                            }
                            var arrOfIds = pmUtilService.getIdsFromObjects($scope.selectedPlatforms);
                            if (item.ticked === true) {
                                if (arrOfIds.indexOf(item.id) < 0) {
                                    $scope.selectedPlatforms.push(item);
                                }
                            } else {
                                var index = arrOfIds.indexOf(item.id);
                                $scope.selectedPlatforms.splice(index, 1);
                            }
                            if ($scope.checkForAnyButton($scope.allProductPlatforms, $scope.selectedPlatforms)) {
                                $scope.isAnyEnabled.sites = true;
                                $scope.multiSelectDefaults.sites = "any";
                            } else {
                                $scope.isAnyEnabled.sites = false;
                                $scope.multiSelectDefaults.sites = "select";
                            }
                            $scope.checkAllFiltersForAdTagAnyButton();
                        };

                        $scope.platformChange = function(item) {
                            if ($scope.selectedPlatforms === undefined) {
                                $scope.selectedPlatforms = [];
                            }

                            // if ($scope.selectedPlatforms.length === 1 && item.ticked === false) {
                            //     $scope.selectedPlatforms[0].ticked = true;
                            //     item.ticked = true;
                            //     $scope.atLeastOneError.platform = true;
                            //     $timeout(function() {
                            //         $scope.atLeastOneError.platform = false;
                            //     }, 1000);
                            // } else {
                            var arrOfIds = pmUtilService.getIdsFromObjects($scope.selectedPlatforms);
                            if (item.ticked === true) {
                                if (arrOfIds.indexOf(item.id) < 0) {
                                    $scope.selectedPlatforms.push(item);
                                }
                            } else {
                                var index = arrOfIds.indexOf(item.id);
                                $scope.selectedPlatforms.splice(index, 1);
                            }
                            $scope.clearSiteSelection = true;
                            $scope.clearAdTagsSelection = true;
                            $scope.changeSites();
                            //}
                            if ($scope.checkForAnyButton($scope.allProductPlatforms, $scope.selectedPlatforms)) {
                                $scope.isAnyEnabled.sites = true;
                                $scope.multiSelectDefaults.sites = "any";
                            } else {
                                $scope.isAnyEnabled.sites = false;
                                $scope.multiSelectDefaults.sites = "select";
                            }
                            $scope.checkAllFiltersForAdTagAnyButton();
                        };

                        $scope.vastVersionsChange = function(item, GET_FOR_UPDATE) {
                            if ($scope.selectedVastVersions === undefined) {
                                $scope.selectedVastVersions = [];
                            }
                            // if ($scope.selectedVastVersions.length === 1 && item.ticked === false) {
                            //     $scope.selectedVastVersions[0].ticked = true;
                            //     $scope.atLeastOneError.vastVersion = true;
                            //     $timeout(function() {
                            //         $scope.atLeastOneError.vastVersion = false;
                            //     }, 1000);
                            // } else {
                            var arrOfIds = pmUtilService.getIdsFromObjects($scope.selectedVastVersions);
                            if (item.ticked === true) {
                                if (arrOfIds.indexOf(item.id) < 0) {
                                    $scope.selectedVastVersions.push(item);
                                }
                            } else {
                                var index = arrOfIds.indexOf(item.id);
                                $scope.selectedVastVersions.splice(index, 1);
                            }
                            if ($routeParams.id === "add" || !GET_FOR_UPDATE) {
                                $scope.clearAdTagsSelection = true;
                                $scope.changeAdTags();
                            }
                            $scope.checkAllFiltersForAdTagAnyButton();
                            //                            }
                        };

                        $scope.vPaidComplianceChange = function(item, GET_FOR_UPDATE) {
                            if ($scope.selectedVpaidCompliance === undefined) {
                                $scope.selectedVpaidCompliance = [];
                            }
                            // if ($scope.selectedVpaidCompliance.length === 1 && item.ticked === false) {
                            //     $scope.selectedVpaidCompliance[0].ticked = true;
                            //     $scope.atLeastOneError.vpaidComplianceVersion = true;
                            //     $timeout(function() {
                            //         $scope.atLeastOneError.vpaidComplianceVersion = false;
                            //     }, 1000);
                            // } else {
                            var arrOfIds = pmUtilService.getIdsFromObjects($scope.selectedVpaidCompliance);
                            if (item.ticked === true) {
                                if (arrOfIds.indexOf(item.id) < 0) {
                                    $scope.selectedVpaidCompliance.push(item);
                                }
                            } else {
                                var index = arrOfIds.indexOf(item.id);
                                $scope.selectedVpaidCompliance.splice(index, 1);
                            }
                            if ($routeParams.id === "add" || !GET_FOR_UPDATE) {
                                $scope.clearAdTagsSelection = true;
                                $scope.changeAdTags();
                            }
                            $scope.checkAllFiltersForAdTagAnyButton();
                            //}
                        };

                        $scope.adDurationChange = function(GET_FOR_UPDATE) {
                            if ($routeParams.id === "add" || !GET_FOR_UPDATE) {
                                $scope.clearAdTagsSelection = true;
                                $scope.changeAdTags();
                            }
                            $scope.checkAllFiltersForAdTagAnyButton();
                        };

                        // event handlers - multi-select
                        $scope.productCategoryItemClick = function(item) {
                            $scope.productCategoryFlag = true;
                            if ($scope.selectedVerticals === undefined) {
                                $scope.selectedVerticals = [];
                            }
                            if (item.ticked === false) {
                                $scope.selectedVerticals.push(item.id);
                                $scope.requiredFields.productCategory = false;
                            }
                        };

                        $scope.adSizesItemClick = function() {
                            if ($scope.selectedAdSizes === undefined) {
                                $scope.selectedAdSizes = [];
                            }
                            $scope.adSizeFilterFlag = true;
                        };
                        $scope.adSizeFilterButtonClick = function() {
                            $scope.adSizeFilterFlag = true;
                        };
                        $scope.publisherSitesItemClick = function() {
                            $scope.siteFilterFlag = true;
                            if ($scope.selectedSites === undefined) {
                                $scope.selectedSites = [];
                            }
                        };
                        $scope.sitesFilterButtonClick = function() {
                            $scope.siteFilterFlag = true;
                        };
                        // end EVENT HANDLERS

                        $scope.populateAdCodeTypes = function(productResult) {
                            if (productResult !== undefined && productResult !== null && productResult.adCodeTypes !== null) {
                                var adcodeTypeIds = pmUtilService.getIdsFromObjects(productResult.adCodeTypes);
                                if (adcodeTypeIds.indexOf(3) < 0) {
                                    $scope.isVideoChecked = "false";
                                    $scope.showVideoFilters = false;
                                    $scope.resetVideoAdTagProperties(true);
                                } else {
                                    $scope.isVideoChecked = "true";
                                    $scope.showVideoFilters = true;
                                }
                                if (adcodeTypeIds.indexOf(0) < 0 || adcodeTypeIds.indexOf(1) < 0 || adcodeTypeIds.indexOf(2) < 0) {
                                    $scope.isBannerChecked = "false";
                                } else {
                                    $scope.isBannerChecked = "true";
                                }
                                $scope.pushAdFormats();
                            } else if (productResult !== undefined && productResult !== null && productResult.adCodeTypes === null) {
                                $scope.isVideoChecked = "false";
                                $scope.isBannerChecked = "false";
                                $scope.showVideoFilters = false;
                                $scope.resetVideoAdTagProperties(true);
                            }
                        };

                        $scope.populateVideoAdTagProperties = function(productResult) {
                            if ($scope.showVideoFilters === true) {
                                if (productResult.companionAds !== undefined && productResult.companionAds !== null) {
                                    if (productResult.companionAds === true) {
                                        $scope.isCompanionAdsNo = false;
                                        $scope.isCompanionAdsYes = true;
                                    } else if (productResult.companionAds === false) {
                                        $scope.isCompanionAdsNo = true;
                                        $scope.isCompanionAdsYes = false;
                                    } else {
                                        $scope.isCompanionAdsNo = false;
                                        $scope.isCompanionAdsYes = false;
                                    }
                                    $scope.companionAds = "" + productResult.companionAds;
                                    $scope.companionAdsChange(true);
                                }
                                $scope.allVastProtocols = $scope.setMultiSelectValues(pmCommonApiService.getVastProtocols(), "name", productResult.vastVersions);
                                angular.forEach($scope.allVastProtocols, function(value) {
                                    if (value.ticked === true) {
                                        $scope.vastVersionsChange(value, true);
                                    }
                                });
                                $scope.maxAdDuration = productResult.maxAdDuration;
                                $scope.minAdDuration = productResult.minAdDuration;
                                $scope.adDurationChange(true);
                                $scope.allVpaidCompliance = $scope.setMultiSelectValues(pmCommonApiService.getVpaidCompliance(), "name", productResult.vpaidComplianceVersions);
                                angular.forEach($scope.allVpaidCompliance, function(value) {
                                    if (value.ticked === true) {
                                        $scope.vPaidComplianceChange(value, true);
                                    }
                                });

                            }
                        };

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

                        $scope.populateOutputModel = function(productResult) {
                            $scope.selectedVerticals = pmUtilService.setMultiSelectValuesToTrue(productResult.productCategory);
                            $scope.selectedPlatforms = pmUtilService.setMultiSelectValuesToTrue(productResult.platforms);
                            $scope.selectedSites = pmUtilService.setMultiSelectValuesToTrue(productResult.sites);
                            $scope.selectedAdSizes = pmUtilService.setMultiSelectValuesToTrue(productResult.adSizes);
                            $scope.selectedSections = pmUtilService.setMultiSelectValuesToTrue(productResult.sections);
                            $scope.selectedAdTags = pmUtilService.setMultiSelectValuesToTrue(productResult.adTags);
                        };


                        $scope.setEditModes = function() {
                            $scope.categoriesEditMode = true;
                            $scope.adSizesEditMode = true;
                            $scope.sitesEditMode = true;
                            $scope.adTagsEditMode = true;
                            $scope.sectionsEditMode = true;
                        };

                        // SUPPORTING LOGIC
                        $scope.populateForm = function(productResult) {
                            console.log("[IN polulateForm] productResult: ", productResult);
                            // $scope.populateOutputModel(productResult);
                            $scope.setEditModes();

                            $scope.GET_FOR_UPDATE = true;
                            $scope.productName = productResult.name;
                            $scope.productDescription = productResult.description;
                            //Verticals refer to product category
                            $scope.allVerticals = $scope.setMultiSelectValues(pmCommonApiService.getVerticals(), "name", productResult.productCategory);

                            if (productResult.tags !== null) {
                                var tags = productResult.tags.split(",");
                                angular.forEach(tags, function(value) {
                                    $scope.formattedTags.push({
                                        "text": value
                                    });
                                });
                                $scope.tagPills = $scope.formattedTags;
                            }

                            var siteNames = productResult.siteName.split(",");
                            $scope.siteNamePills = [];
                            angular.forEach(siteNames, function(value) {
                                $scope.siteNamePills.push({
                                    "text": value
                                });
                            });

                            $scope.allProductPlatforms = $scope.setMultiSelectValues(pmCommonApiService.getPlatforms(), "name", productResult.platforms);
                            angular.forEach($scope.allProductPlatforms, function(value) {
                                if (value.ticked === true) {
                                    $scope.platformChangeForUpdate(value);
                                }
                            });

                            $scope.changeSitesForUpdate();

                            if ($scope.allPublisherSites !== undefined && $scope.allPublisherSites !== null) {
                                $scope.publisherSites = $scope.setMultiSelectValues(productResult.sites, "name", productResult.sites);
                            }

                            $scope.selectedSites = pmUtilService.getMultiSelectValues($scope.allPublisherSites);

                            $scope.populateAdCodeTypes(productResult);
                            $scope.populateVideoAdTagProperties(productResult);
                            $scope.allAdFoldPlacements = $scope.setMultiSelectValues(pmCommonApiService.getAdFoldPlacements(), "name", productResult.adFoldPlacements);
                            angular.forEach($scope.allAdFoldPlacements, function(value) {
                                if (value.ticked === true) {
                                    $scope.adPlacementChange(value, true);
                                }
                            });

                            //$scope.allAdSizes = $scope.setMultiSelectValues(pmCommonApiService.getAdSizes(), "name", productResult.adSizes);

                            // Change to ONLY show what has been selected before. This also solves showing all selected instead of showing default
                            // and then pre-selecting matching items from the subset of 100
                            $scope.allAdSizes = $scope.setMultiSelectValues(productResult.adSizes, "name", productResult.adSizes);

                            angular.forEach($scope.allAdSizes, function(value) {
                                if (value.ticked === true) {
                                    $scope.adSizesItemClick(value);
                                }
                            });
                            if ($scope.publisherSections !== undefined && $scope.publisherSections !== null) {
                                //$scope.publisherSections = $scope.setMultiSelectValues(productResult.sections, "name", productResult.sections);
                                $scope.publisherSections = $scope.setMultiSelectValues($scope.publisherSections, "name", productResult.sections);

                            }
                            $scope.changeAdTagsForUpdate();
                            
                            // populate adServerInventoryUnit
                            if ( productResult.adServerInventoryUnits !== null ) {
                                AdServerInventory.query({
                                    "id": productResult.adServerInventoryUnits[0].id
                                }).$promise.then(function(response) {
                                    $scope.adServerInventory = {
                                        adServerConfId: response.adserverConfId,    // each publisher is assigned to 1 ad server. will do a lookup to get this.
                                        iuType: response.iuType,
                                        externalId: response.externalId,
                                        id: response.id
                                    };
                                });
                            }
                        };

                        $scope.setMultiSelectValues = function(apiItems) {
                            var multiSelectData = [];
                            angular.forEach(apiItems, function(value) {
                                multiSelectData.push({
                                    id: value.id,
                                    name: value.name,
                                    ticked: false
                                });
                            });
                            return multiSelectData;
                        };

                        $scope.setMultiSelectValues = function(apiItems, customKey, selectedItems) {
                            if (null === selectedItems) {
                                return $scope.setMultiSelectValues(apiItems, customKey);
                            }
                            var multiSelectData = [];
                            angular.forEach(apiItems, function(value) {
                                if (typeof customKey !== "undefined") {
                                    var flag = false;
                                    angular.forEach(selectedItems, function(selectedValue) {
                                        if (selectedValue.id === value.id) {
                                            flag = true;
                                        }
                                    });
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

                        $scope.getMultiSelectValues = function(multiSelectArray) {
                            var resultsArray = [];
                            angular.forEach(multiSelectArray, function(value, key) {
                                if (key !== null) {

                                }
                                if (value.ticked === false) {
                                    resultsArray.push(value.id);
                                }
                            });
                            return resultsArray;
                        };

                        $scope.getSelectedValuesFromMultiSelectArray = function(multiSelectArray) {
                            var resultsArray = [];
                            angular.forEach(multiSelectArray, function(value, key) {
                                if (key !== null) {

                                }
                                if (value.ticked === true) {
                                    resultsArray.push(value.id);
                                }
                            });
                            return resultsArray;
                        };

                        $scope.multiSelectClosed = function(data) {
                            console.log("[IN multiSelectClosed] data: " + data);
                        };

                        $scope.cancel = function() {
                            $location.path("products");
                        };

                        pmUtilService.getIdsFromObjectsForAll = function() {
                            $scope.product.platforms = pmUtilService.getIdsFromObjects($scope.selectedPlatforms);
                            $scope.product.adTags = pmUtilService.getIdsFromObjects($scope.selectedAdTags);
                            $scope.product.productCategory = pmUtilService.getIdsFromObjects($scope.selectedVerticals);
                            $scope.product.sections = pmUtilService.getIdsFromObjects($scope.selectedSections);
                            $scope.product.vastVersions = pmUtilService.getIdsFromObjects($scope.selectedVastVersions);
                            $scope.product.vpaidComplianceVersions = pmUtilService.getIdsFromObjects($scope.selectedVpaidCompliance);
                        };

                        $scope.companionAdsChange = function(GET_FOR_UPDATE) {
                            if ($routeParams.id === "add" || !GET_FOR_UPDATE) {
                                if (($scope.isCompanionAdsYes === true && $scope.isCompanionAdsNo === true) || ($scope.isCompanionAdsYes === false && $scope.isCompanionAdsNo === false)) {
                                    $scope.companionAds = null;
                                } else if ($scope.isCompanionAdsYes === true && $scope.isCompanionAdsNo === false) {
                                    $scope.companionAds = true;
                                } else if ($scope.isCompanionAdsYes === false && $scope.isCompanionAdsNo === true) {
                                    $scope.companionAds = false;
                                }
                                $scope.clearAdTagsSelection = true;
                                $scope.changeAdTags();
                            }
                            $scope.checkAllFiltersForAdTagAnyButton();
                        };

                        $scope.getVideoAdTagFilter = function() {
                            pmUtilService.getIdsFromObjectsForAll();
                            var vpaidFilter = "";
                            if ($scope.product.vpaidComplianceVersions !== undefined && $scope.product.vpaidComplianceVersions !== null && $scope.product.vpaidComplianceVersions.length > 0) {
                                vpaidFilter = "&filters=adcodeType eq 3,";
                                angular.forEach($scope.product.vpaidComplianceVersions, function(value) {
                                    vpaidFilter += "vpaidVersion eq " + value + ",";
                                });
                                vpaidFilter = vpaidFilter.substring(0, vpaidFilter.length - 1);
                            }
                            var vastFilter = "";
                            if ($scope.product.vastVersions !== undefined && $scope.product.vastVersions !== null && $scope.product.vastVersions.length > 0) {
                                vastFilter = "&filters=adcodeType eq 3,";
                                angular.forEach($scope.product.vastVersions, function(value) {
                                    vastFilter += "protocol eq " + value + ",";
                                });
                                vastFilter = vastFilter.substring(0, vastFilter.length - 1);
                            }
                            var adDurationFilter = "";
                            if (($scope.minAdDuration !== undefined && $scope.minAdDuration !== null) || ($scope.maxAdDuration !== undefined && $scope.maxAdDuration !== null)) {

                                if ($scope.minAdDuration !== undefined && $scope.minAdDuration !== null) {
                                    adDurationFilter = "&filters=adcodeType eq 3,";
                                    adDurationFilter += "minDuration gtEq " + $scope.minAdDuration + ",";
                                }
                                if ($scope.maxAdDuration !== undefined && $scope.maxAdDuration !== null) {
                                    adDurationFilter += "&filters=adcodeType eq 3,";
                                    adDurationFilter += "maxDuration ltEq " + $scope.maxAdDuration + ",";
                                }
                                adDurationFilter = adDurationFilter.substring(0, adDurationFilter.length - 1);
                            }
                            var hasCompanionFilter = "";
                            if ($scope.companionAds !== undefined && $scope.companionAds !== null) {
                                hasCompanionFilter += "&filters=adcodeType eq 3,hasCompanion eq " + $scope.companionAds;
                            }
                            var videoFilter = vpaidFilter + vastFilter + adDurationFilter + hasCompanionFilter;
                            return videoFilter;
                        };

                        $scope.changeAdTagsForUpdate = function() {
                            $scope.requiredFields.adTags = false;
                            var requestObject = $scope.createRequestBodyForPublisherAdTag();
                            PublisherAdTags.getByPost(requestObject).$promise.then(function(allPublisherAdTags) {
                                $scope.allPublisherAdTags = allPublisherAdTags.items; //$scope.setMultiSelectValues(allPublisherAdTags.items);
                                $scope.publisherAdTagsList = [];
                                for (var i = 0; i < 100 && i < $scope.allPublisherAdTags.length; i++) {
                                    $scope.publisherAdTagsList[i] = $scope.allPublisherAdTags[i];
                                    $scope.publisherAdTagsList[i].ticked = false;
                                }

                                if ($scope.allPublisherAdTags.length === 0) {
                                    $scope.requiredFields.adTags = true;
                                } else {
                                    $scope.requiredFields.adTags = false;
                                }
                                if ($scope.allPublisherSites.length <= 0) {
                                    $scope.allPublisherAdTags = [];
                                    $scope.publisherAdTagsList = null;
                                    $scope.requiredFields.adTags = true;
                                } else {
                                    $scope.requiredFields.adTags = false;
                                }
                                if ($scope.productRetrieved.adTags) {
                                    if ($scope.productRetrieved.adTags.length !== $scope.allPublisherAdTags.length) {
                                        //$scope.allPublisherAdTags = $scope.setMultiSelectValues($scope.allPublisherAdTags, "name", $scope.productRetrieved.adTags);
                                        $scope.publisherAdTagsList = $scope.setMultiSelectValues($scope.productRetrieved.adTags, "name", $scope.productRetrieved.adTags);
                                    } else {
                                        $scope.adTagsEditMode = false;
                                    }
                                    $scope.multiSelectDefaults.adTags = "select";
                                } else {
                                    $scope.multiSelectDefaults.adTags = "any";
                                }
                            });
                        };


                        $scope.getPublisherSiteIds = function(sites) {
                            var siteIds = [];
                            for (var x in sites) {
                                siteIds.push(sites[x].id);
                            }
                            return siteIds;
                        };


                        $scope.changeSitesForUpdate = function() {
                            if ($scope.publisherSites === undefined) {
                                $scope.publisherSites = [];
                            }

                            $scope.product.platforms = pmUtilService.getIdsFromObjects($scope.selectedPlatforms);

                            PublisherSites.query($scope.getSiteFilter($scope.product.platforms, $scope.publisherId)).$promise.then(function(response) {

                                $scope.allPublisherSites = response.items; //$scope.setMultiSelectValues(publisherSites.items);

                                $scope.publisherSites = [];

                                for (var i = 0; i < 100 && i < $scope.allPublisherSites.length; i++) {
                                    $scope.publisherSites[i] = $scope.allPublisherSites[i];
                                    $scope.publisherSites[i].ticked = false;
                                }

                                // $scope.publisherSites = $scope.allPublisherSites;

                                if ($scope.allPublisherSites !== null && $scope.allPublisherSites.length === 0) {
                                    $scope.requiredFields.adTags = true;
                                    $scope.allPublisherAdTags = [];
                                    $scope.publisherAdTagsList = "";
                                    $scope.platFormFilteredSites = "";
                                } else if ($scope.allPublisherSites !== null) {
                                    if ($scope.productRetrieved.sites) {
                                        $scope.multiSelectDefaults.sites = "select";

                                        if ($scope.allPublisherSites.length !== $scope.productRetrieved.sites.length) {
                                            //$scope.allPublisherSites = $scope.setMultiSelectValues($scope.allPublisherSites, "name", $scope.productRetrieved.sites);
                                            $scope.publisherSites = $scope.setMultiSelectValues($scope.productRetrieved.sites, "name", $scope.productRetrieved.sites);
                                        } else {
                                            $scope.sitesEditMode = false;
                                        }
                                    } else {
                                        $scope.multiSelectDefaults.sites = "any";
                                    }

                                    $scope.platFormFilteredSites = $scope.allPublisherSites;
                                    $scope.changeAdTagsForUpdate();
                                } else {
                                    window.alert("Internal error occured.");
                                }
                            });
                        };
                        
                        $scope.genericFilterFunction = function() {
                            if ($scope.siteFilterFlag === true) {
                                $scope.checkAllFiltersForAdTagAnyButton();
                                $scope.clearAdTagsSelection = true;
                                $scope.changeAdTags();
                                $scope.siteFilterFlag = false;
                            }
                            if ($scope.adSizeFilterFlag === true) {
                                $scope.checkAllFiltersForAdTagAnyButton();
                                $scope.clearAdTagsSelection = true;
                                $scope.changeAdTags();
                                $scope.adSizeFilterFlag = false;
                            }
                            if ($scope.productCategoryFlag === true) {
                                $scope.checkAllFiltersForAdTagAnyButton();
                                $scope.productCategoryFlag = false;
                            }
                        };

                        //Return 0 if All,null if None else selectedEntities array
                        $scope.isAllUseCase = function(allEntities, selectedEntities) {
                            if (allEntities === undefined || allEntities === null || allEntities.length === 0) {
                                return selectedEntities;
                            }
                            // if () {
                            //     return null;
                            // }

                            if (allEntities.length > 0 && (selectedEntities === undefined || selectedEntities === null || selectedEntities.length === 0)) {
                                return 0;
                            }
                            if (allEntities.length === selectedEntities.length) {
                                return 0;
                            }
                            return selectedEntities;
                        };

                        $scope.checkForAnyButton = function(allEntities, selectedEntities) {
                            if (allEntities === null || allEntities === undefined) {
                                return true;
                            }
                            if (selectedEntities === null || selectedEntities === undefined) {
                                return true;
                            }
                            if (allEntities.length === selectedEntities.length || selectedEntities.length === 0) {
                                return true;
                            } else {
                                return false;
                            }
                        };
                        $scope.checkAllFiltersForAdTagAnyButton = function() {
                            $scope.isAnyEnabled.adTags = true;
                            //For Ad Formats
                            if ($scope.isBannerChecked === "true" && $scope.isVideoChecked === "true") {
                                $scope.isAnyEnabled.adTags = $scope.isAnyEnabled.adTags && true;
                            } else if ($scope.isBannerChecked === "false" && $scope.isVideoChecked === "false") {
                                $scope.isAnyEnabled.adTags = $scope.isAnyEnabled.adTags && true;
                            } else {
                                $scope.isAnyEnabled.adTags = false;
                            }
                            //For Video Filters
                            //For Vast Version
                            if ($scope.allVastProtocols !== undefined && $scope.selectedVastVersions !== undefined && $scope.selectedVastVersions.length === $scope.allVastProtocols.length) {
                                $scope.isAnyEnabled.adTags = $scope.isAnyEnabled.adTags && true;
                            } else {
                                $scope.isAnyEnabled.adTags = false;
                            }

                            //For VPAID Compliance
                            if ($scope.allVpaidCompliance !== undefined && $scope.selectedVpaidCompliance !== undefined && $scope.selectedVpaidCompliance.length === $scope.allVpaidCompliance.length) {
                                $scope.isAnyEnabled.adTags = $scope.isAnyEnabled.adTags && true;
                            } else {
                                $scope.isAnyEnabled.adTags = false;
                            }

                            //For Companion ads
                            if (($scope.isCompanionAdsYes === true && $scope.isCompanionAdsNo === true) || ($scope.isCompanionAdsYes === false && $scope.isCompanionAdsNo === false)) {
                                $scope.isAnyEnabled.adTags = $scope.isAnyEnabled.adTags && true;
                            } else if ($scope.isCompanionAdsYes === true && $scope.isCompanionAdsNo === false) {
                                $scope.isAnyEnabled.adTags = false;
                            } else if ($scope.isCompanionAdsYes === false && $scope.isCompanionAdsNo === true) {
                                $scope.isAnyEnabled.adTags = false;
                            }

                            //For Ad Duration
                            if ($scope.minAdDuration !== undefined && $scope.minAdDuration !== null) {
                                $scope.isAnyEnabled.adTags = false;
                            }
                            if ($scope.maxAdDuration !== undefined && $scope.maxAdDuration !== null) {
                                $scope.isAnyEnabled.adTags = false;
                            }

                            // //For Ad Fold Placement
                            // if ($scope.checkForAnyButton($scope.allAdFoldPlacements, $scope.selectedAdFoldPlacements)) {
                            //     $scope.isAnyEnabled.adTags = $scope.isAnyEnabled.adTags && true;
                            // } else {
                            //     $scope.isAnyEnabled.adTags = false;
                            // }
                            // //For ad sizes
                            // if ($scope.checkForAnyButton($scope.allAdSizes, $scope.selectedAdSizes)) {
                            //     $scope.isAnyEnabled.adTags = $scope.isAnyEnabled.adTags && true;
                            // } else {
                            //     $scope.isAnyEnabled.adTags = false;
                            // }
                            //For sites

                            //$scope.isAnyEnabled.adTags = $scope.isAnyEnabled.adTags && $scope.isAllSitesOrNot();
                            if ($scope.isAnyEnabled.adTags) {
                                $scope.multiSelectDefaults.adTags = "any";
                            } else {
                                $scope.multiSelectDefaults.adTags = "select";
                            }
                        };

                        $scope.isAllSitesOrNot = function() {
                            if ($scope.multiSelectDefaults.sites === "any") {
                                return true;
                            }
                            var isAllPlatFormSelected = $scope.isAllUseCase($scope.allProductPlatforms, $scope.selectedPlatforms);
                            var noSelectedSites = $scope.selectedSites === undefined || $scope.selectedSites === null || $scope.selectedSites.length === 0;
                            if (noSelectedSites && isAllPlatFormSelected === 0) {
                                return true;
                            } else {
                                return false;
                            }
                        };
                        $scope.createRequestBodyForPublisherAdTag = function(searchFilter) {
                            var requestObject = {},
                                filters;

                            requestObject.pageNumber = "1";
                            requestObject.pageSize = "1000";
                            filters = $scope.getAdTagFilter();
                            requestObject.filters = filters.split("filters=");
                            requestObject.filters.push("loggedInOwnerId eq " + $scope.publisherId);
                            requestObject.filters.push("loggedInOwnerTypeId eq " + $scope.loggedInOwnerTypeId);

                            if (searchFilter) {
                                requestObject.filters.push("name like *" + searchFilter + "*");
                            }

                            //Remove &
                            for (var i = 0; i < requestObject.filters.length; i++) {
                                requestObject.filters[i] = requestObject.filters[i].replace("&", "");
                                requestObject.filters[i] = requestObject.filters[i].replace("filters", "");
                            }
                            return requestObject;
                        };
                        // end SUPPORTING LOGIC
                    }
                ]
            };
        }
    ]
    /*
     * Data Filter allowing tabular capitalization of the first letter.
     * TODO: Move filters to a centralized place.
     */
);
