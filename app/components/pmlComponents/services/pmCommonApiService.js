/*global angular*/
(function(angular) {
    "use strict";

    angular
        .module("pmlComponents")
        .factory("pmCommonApiService", ["pmApiService", "$rootScope", "pmUtilService", "pmTokenStorageService", "$q", function(pmApiService, $rootScope, pmUtilService, pmTokenStorageService, $q) {

            var PAGE_SIZE = 100;
            var PAGE_NUMBER = 1;

            var vastProtocols = {
                items: [{
                    id: 2,
                    name: "Vast 2.0"
                }, {
                    id: 3,
                    name: "Vast 3.0"
                }]
            };

            var dow = {
                items: [{
                    id: 7,
                    name: "Sunday",
                    ticked: true
                }, {
                    id: 1,
                    name: "Monday",
                    ticked: true
                }, {
                    id: 2,
                    name: "Tuesday",
                    ticked: true
                }, {
                    id: 3,
                    name: "Wednesday",
                    ticked: true
                }, {
                    id: 4,
                    name: "Thursday",
                    ticked: true
                }, {
                    id: 5,
                    name: "Friday",
                    ticked: true
                }, {
                    id: 6,
                    name: "Saturday",
                    ticked: true
                }]
            };

            var channels = {
                items: [{
                    id: 0,
                    name: "ALL",
                    ticked: false

                }, {
                    id: 1,
                    name: "PMP",
                    ticked: true
                }, {
                    id: 2,
                    name: "Spot Buys",
                    ticked: false
                }, {
                    id: 3,
                    name: "Open Exchange",
                    ticked: false
                }, {
                    id: 4,
                    name: "Ad Network",
                    ticked: false
                }]
            };

            var vpaidCompliance = {
                items: [{
                    id: 0,
                    name: "NO_VPAID"
                }, {
                    id: 1,
                    name: "VPAID 1.0"
                }, {
                    id: 2,
                    name: "VPAID 2.0"
                }]
            };

            var videoAdFormats = {
                items: [{
                    id: 1,
                    name: "Linear"
                }, {
                    id: 2,
                    name: "Non-Linear"
                }]
            };

            var videoAdPositions = {
                items: [{
                    id: 1,
                    name: "Pre-roll"
                }, {
                    id: 2,
                    name: "In-roll"
                }, {
                    id: 3,
                    name: "Post-roll"
                }]
            };

            var deviceIDType = {
                items: [{
                    id: 1,
                    name: "IDFA (Identifier for Advertisers)"
                }, {
                    id: 3,
                    name: "Android ID"
                }]
            };

            var adFoldPlacements = {};
            var platforms = {};
            var adTagTypes = {};
            var verticals = {};
            var adSizes = {};
            var products = {};
            var geos = {};
            var videoPlaybackMethods = {};
            var browsers = {};
            var mobileCarriers = {};
            var richMediaTechnologies = {};
            var advertisers = {};
            var mobileOS = {};
            var tabletDeviceTypes = {};
            var mobileDeviceTypes = {};
            var buyers = {};
            var advertisingEntity = {};
            var fromUrl = "";

            return {

                getDaysOfWeek: function getDaysOfWeek() {
                    return dow.items;
                },

                getChannels: function getChannels() {
                    return channels.items;
                },

                getVastProtocols: function getVastProtocols() {
                    return vastProtocols.items;
                },

                getVpaidCompliance: function getVpaidCompliance() {
                    return vpaidCompliance.items;
                },

                getVideoAdFormats: function getVideoAdFormats() {
                    return videoAdFormats.items;
                },

                getVideoAdPositions: function getVideoAdPositions() {
                    return videoAdPositions.items;
                },

                getDeviceIdTypes: function getDeviceIdTypes() {
                    return deviceIDType.items;
                },

                getLoggedInFilter: function getLoggedInFilter() {
                    return "filters=loggedInOwnerId eq " + pmTokenStorageService.getResourceId() + "&filters=loggedInOwnerTypeId eq " + pmTokenStorageService.getResourceTypeId();
                },

                handleErrorResponse: function handleErrorResponse(response) {
                    if ($rootScope.errorResponse === undefined) {
                        $rootScope.errorResponse = [];
                    } else {
                        angular.forEach(response.data, function(value) {
                            window.alert(value.errorMessage);
                            $rootScope.errorResponse.push(value);
                        });
                    }
                },

                initAdFoldPlacements: function initAdFoldPlacements(pageSize, pageNumber) {
                    pageSize = pmUtilService.setDefaultValue(pageSize, PAGE_SIZE);
                    pageNumber = pmUtilService.setDefaultValue(pageNumber, PAGE_NUMBER);

                    pmApiService.callApi("/api/common/foldPlacement?pageSize=" + pageSize + "&pageNumber=" + pageNumber + "&sort=name").success(function(response) {
                        adFoldPlacements = pmUtilService.setMultiSelectValues(response.items);
                    }).error(function(response) {
                        this.handleErrorResponse(response);
                    });
                },

                getAdFoldPlacements: function getAdFoldPlacements() {
                    return adFoldPlacements;
                },

                initPlatforms: function initPlatforms(pageSize, pageNumber) {
                    pageSize = pmUtilService.setDefaultValue(pageSize, PAGE_SIZE);
                    pageNumber = pmUtilService.setDefaultValue(pageNumber, PAGE_NUMBER);

                    pmApiService.callApi("/api/common/platform?filter=name like NotDefined&pageSize=" + pageSize + "&pageNumber=" + pageNumber + "&sort=name&hideInvalid=true").success(function(response) {
                        /*  -------
                            THIS IS BREAKING THE BUILD.
                            SHOULD BE DONE IN DB OR FILTERED OUT ON API CALL.
                            ABOVE CALL IS NOT WORKING
                            -------
                        for (var i=0;i<response.items.length;i++) {
                            if (response.items[i].name === "NotDefined" ) {
                                delete response.items[i];
                            }
                        }
                        */
                        platforms = pmUtilService.setMultiSelectValues(response.items);
                    }).error(function(response) {
                        this.handleErrorResponse(response);
                    });
                },

                getPlatforms: function getPlatforms() {
                    return platforms;
                },

                initAdTagTypes: function initAdTagTypes(pageSize, pageNumber) {
                    pageSize = pmUtilService.setDefaultValue(pageSize, PAGE_SIZE);
                    pageNumber = pmUtilService.setDefaultValue(pageNumber, PAGE_NUMBER);

                    pmApiService.callApi("/api/common/adTagType?pageSize=" + pageSize + "&pageNumber=" + pageNumber + "&sort=name").success(function(response) {
                        adTagTypes = pmUtilService.setMultiSelectValues(response.items);
                    }).error(function(response) {
                        this.handleErrorResponse(response);
                    });
                },

                getAdTagTypes: function getAdTagTypes() {
                    return adTagTypes;
                },

                validateAdServer: function validateAdServer(adServerConfId,iuType,externalId) {
                    var apiString;

                    //console.log("2. [IN validateAdServer] about to call api");
                    var deferred = $q.defer();

                    apiString = "/api/inventory/adserverinventory?" + this.getLoggedInFilter() +
                        "&filters=adserverConfId eq " + adServerConfId + "&filters=iuType eq " + iuType + "&filters=externalId eq " + externalId;
                    

                    pmApiService.callApi(apiString).success(function(response) {
                        //console.log("3. [IN validateAdServer] did a new lookup...response.items: ", response.items);
                        deferred.resolve({
                            isValid: true,
                            data: response
                        });
                    }).error(function(response) {
                        deferred.reject({
                            isValid: false,
                            data: response
                        });
                    });
                    //console.log("4. [IN validateAdServer] returning...")
                    return deferred.promise;
                },

                initVerticals: function initVerticals(pageSize, pageNumber) {
                    pageSize = pmUtilService.setDefaultValue(pageSize, PAGE_SIZE);
                    pageNumber = pmUtilService.setDefaultValue(pageNumber, PAGE_NUMBER);

                    pmApiService.callApi("/api/common/vertical?pageSize=" + pageSize + "&pageNumber=" + pageNumber + "&hideInvalid=true&sort=name").success(function(response) {
                        verticals = pmUtilService.setMultiSelectValues(response.items);
                    }).error(function(response) {
                        this.handleErrorResponse(response);
                    });
                },

                getVerticals: function getVerticals(searchFilter) {
                    var apiString;

                    if (searchFilter === undefined) {
                        return verticals;
                    } else {
                        //console.log(" 5. [IN getVerticals] about to call api");
                        var deferred = $q.defer();

                        if (searchFilter === "") {
                            apiString = "/api/common/vertical?pageSize=" + PAGE_SIZE + "&pageNumber=" + PAGE_NUMBER + "&hideInvalid=true&sort=name";
                        } else {
                            apiString = "/api/common/vertical?filters=name like *" + searchFilter + "*";
                        }

                        pmApiService.callApi(apiString).success(function(response) {
                            //console.log(" 6. [IN getVerticals] did a new lookup...response.items: ", response.items);
                            deferred.resolve({
                                isValid: true,
                                data: response
                            });
                        }).error(function(response) {
                            deferred.reject({
                                isValid: false,
                                data: response
                            });
                        });

                        return deferred.promise;
                    }
                },

                initAdSizes: function initAdSizes(pageSize, pageNumber) {
                    pageSize = pmUtilService.setDefaultValue(pageSize, PAGE_SIZE);
                    pageNumber = pmUtilService.setDefaultValue(pageNumber, PAGE_NUMBER);

                    pmApiService.callApi("/api/common/adSize?pageSize=" + pageSize + "&pageNumber=" + pageNumber + "&sort=name").success(function(response) {
                        adSizes = pmUtilService.setMultiSelectValues(response.items);
                    }).error(function(response) {
                        this.handleErrorResponse(response);
                    });
                },

                getAdSizes: function getAdSizes(searchFilter) {
                    var apiString;

                    if (searchFilter === undefined) {
                        return adSizes;
                    } else {
                        //console.log(" 5. [IN getAdSizes] about to call api");
                        var deferred = $q.defer();

                        if (searchFilter === "") {
                            apiString = "/api/common/adSize?pageSize=" + PAGE_SIZE + "&pageNumber=" + PAGE_NUMBER + "&sort=name";
                        } else {
                            apiString = "/api/common/adSize?filters=name like *" + searchFilter + "*";
                        }

                        pmApiService.callApi(apiString).success(function(response) {
                            //console.log(" 6. [IN getAdSizes] did a new lookup...response.items: ", response.items);
                            deferred.resolve({
                                isValid: true,
                                data: response
                            });
                        }).error(function(response) {
                            deferred.reject({
                                isValid: false,
                                data: response
                            });
                        });

                        return deferred.promise;
                    }
                },

                initProducts: function initProducts(pageSize, pageNumber) {
                    pageSize = pmUtilService.setDefaultValue(pageSize, PAGE_SIZE);
                    pageNumber = pmUtilService.setDefaultValue(pageNumber, PAGE_NUMBER);

                    pmApiService.callApi("/api/inventory/products?pageSize=" + pageSize + "&pageNumber=" + pageNumber + "&" + this.getLoggedInFilter() + " &sort=-modificationTime&cacheBreak=" + new Date()).success(function(response) {
                        products = pmUtilService.setMultiSelectValues(response.items);
                    }).error(function(response) {
                        this.handleErrorResponse(response);
                    });
                },

                getProducts: function getProducts(searchFilter) {
                  //  return products;

                    var deferred = $q.defer(),
                        apiString = "";

                    if (searchFilter === undefined) {
                        return products;
                    } else {
                        //console.log(" 5. [IN getGeos] about to call api");
                        if (searchFilter === "") {
                            apiString = "/api/inventory/products?pageSize=" + PAGE_SIZE + "&pageNumber=" + PAGE_NUMBER + "&" + this.getLoggedInFilter() + " &sort=-modificationTime&cacheBreak=" + new Date();
                        } else {
                            apiString = "/api/inventory/products?filters=name like *" + searchFilter + "*&pageSize=" + PAGE_SIZE + "&pageNumber=" + PAGE_NUMBER + "&" + this.getLoggedInFilter() + " &sort=-modificationTime&cacheBreak=" + new Date();
                        }

                        pmApiService.callApi(apiString).success(function(response) {
                            //console.log(" 6. [IN getMobileCarriers] did a new lookup...response.items: ", response.items);
                            deferred.resolve({
                                isValid: true,
                                data: response
                            });
                        }).error(function(response) {
                            deferred.reject({
                                isValid: false,
                                data: response
                            });
                        });

                        return deferred.promise;
                    }
                },

                initGeos: function initGeos(pageSize, pageNumber) {
                    pageSize = pmUtilService.setDefaultValue(pageSize, PAGE_SIZE);
                    pageNumber = pmUtilService.setDefaultValue(pageNumber, PAGE_NUMBER);

                    //GeoLevels : 1 For Country , 4 for DMA, 2 for Region,3 for City
                    pmApiService.callApi("/api/common/geo?pageSize=" + pageSize + "&pageNumber=" + pageNumber + "&" + this.getLoggedInFilter() + "&filters=geoLevel eq 4,geoLevel eq 1&hideInvalid=true&sort=geoLevel,name&cacheBreak=" + new Date()).success(function(response) {
                        response.items = pmUtilService.updateNameOfGeos(response.items);
                        geos = pmUtilService.setMultiSelectValues(response.items);
                    }).error(function(response) {
                        this.handleErrorResponse(response);
                    });
                },

                getGeos: function getGeos(searchFilter) {
                    var deferred = $q.defer(),
                        apiString = "";

                    if (searchFilter === undefined) {
                        return geos;
                    } else {
                        //console.log(" 5. [IN getGeos] about to call api");
                        if (searchFilter === "") {
                            apiString = "/api/common/geo?pageSize=" + PAGE_SIZE + "&pageNumber=" + PAGE_NUMBER + "&" + this.getLoggedInFilter() + "&filters=geoLevel eq 4,geoLevel eq 1&hideInvalid=true&sort=geoLevel,name&cacheBreak=" + new Date();
                        } else {
                            apiString = "/api/common/geo?filters=name like *" + searchFilter + "*&" + this.getLoggedInFilter() + "&filters=geoLevel eq 4,geoLevel eq 1&cacheBreak=" + new Date();
                        }

                        pmApiService.callApi(apiString).success(function(response) {
                            //console.log(" 6. [IN getGeos] did a new lookup...response.items: ", response.items);
                            response.items = pmUtilService.updateNameOfGeos(response.items);
                            deferred.resolve({
                                isValid: true,
                                data: response
                            });
                        }).error(function(response) {
                            deferred.reject({
                                isValid: false,
                                data: response
                            });
                        });

                        return deferred.promise;
                    }
                },

                initVideoPlaybackMethods: function initVideoPlaybackMethods(pageSize, pageNumber) {
                    pageSize = pmUtilService.setDefaultValue(pageSize, PAGE_SIZE);
                    pageNumber = pmUtilService.setDefaultValue(pageNumber, PAGE_NUMBER);

                    pmApiService.callApi("/api/common/videoPlayback?pageSize=" + pageSize + "&pageNumber=" + pageNumber + "&sort=description").success(function(response) {
                        videoPlaybackMethods = pmUtilService.setMultiSelectValuesWithCustomKey(response.items, "description");
                    }).error(function(response) {
                        this.handleErrorResponse(response);
                    });
                },

                getVideoPlaybackMethods: function getVideoPlaybackMethods() {
                    return videoPlaybackMethods;
                },

                initBrowsers: function initBrowsers(pageSize, pageNumber) {
                    pageSize = pmUtilService.setDefaultValue(pageSize, PAGE_SIZE);
                    pageNumber = pmUtilService.setDefaultValue(pageNumber, PAGE_NUMBER);

                    pmApiService.callApi("/api/common/browser?pageSize=" + pageSize + "&pageNumber=" + pageNumber + "&sort=name").success(function(response) {
                        browsers = pmUtilService.setMultiSelectValues(response.items);
                    }).error(function(response) {
                        this.handleErrorResponse(response);
                    });
                },

                getBrowsers: function getBrowsers() {
                    return browsers;
                },

                initMobileCarriers: function initMobileCarriers(pageSize, pageNumber) {
                    pageSize = pmUtilService.setDefaultValue(pageSize, PAGE_SIZE);
                    pageNumber = pmUtilService.setDefaultValue(pageNumber, PAGE_NUMBER);

                    pmApiService.callApi("/api/common/mobileCarrier?pageSize=" + pageSize + "&pageNumber=" + pageNumber + "&" + this.getLoggedInFilter() + "&sort=carrierValue").success(function(response) {
                        mobileCarriers = pmUtilService.setMultiSelectValuesWithCustomKey(response.items, "carrierValue");
                    }).error(function(response) {
                        this.handleErrorResponse(response);
                    });
                },

                getMobileCarriers: function getMobileCarriers(searchFilter) {
                    var apiString = "";

                    if (searchFilter === undefined) {
                        return mobileCarriers;
                    } else {
                        //console.log(" 5. [IN getMobileCarriers] about to call api");
                        var deferred = $q.defer();
                        if (searchFilter === "") {
                            apiString = "/api/common/mobileCarrier?pageSize=" + PAGE_SIZE + "&pageNumber=" + PAGE_NUMBER + "&" + this.getLoggedInFilter() + "&sort=carrierValue";
                        } else {
                            apiString = "/api/common/mobileCarrier?filters=carrierValue like *" + searchFilter + "*&" + this.getLoggedInFilter() + "&sort=carrierValue";
                        }
                        pmApiService.callApi(apiString).success(function(response) {
                            //console.log(" 6. [IN getMobileCarriers] did a new lookup...response.items: ", response.items);
                            deferred.resolve({
                                isValid: true,
                                data: response
                            });
                        }).error(function(response) {
                            deferred.reject({
                                isValid: false,
                                data: response
                            });
                        });

                        return deferred.promise;
                    }
                },

                initRichMediaTechnologies: function initRichMediaTechnologies(pageSize, pageNumber) {
                    pageSize = pmUtilService.setDefaultValue(pageSize, PAGE_SIZE);
                    pageNumber = pmUtilService.setDefaultValue(pageNumber, PAGE_NUMBER);

                    pmApiService.callApi("/api/common/richMediaTechnology?pageSize=" + pageSize + "&pageNumber=" + pageNumber + "&" + this.getLoggedInFilter() + "&sort=name").success(function(response) {
                        richMediaTechnologies = pmUtilService.setMultiSelectValues(response.items);
                    }).error(function(response) {
                        this.handleErrorResponse(response);
                    });
                },

                getRichMediaTechnologies: function getRichMediaTechnologies() {
                    return richMediaTechnologies;
                },

                initAdvertisers: function initAdvertisers(pageSize, pageNumber) {
                    pageSize = pmUtilService.setDefaultValue(pageSize, PAGE_SIZE);
                    pageNumber = pmUtilService.setDefaultValue(pageNumber, PAGE_NUMBER);

                    pmApiService.callApi("/api/common/advertiser?pageSize=" + pageSize + "&pageNumber=" + pageNumber + "&" + this.getLoggedInFilter() + "&hideInvalid=true" + "&sort=name").success(function(response) {
                        advertisers = pmUtilService.setMultiSelectValues(response.items);
                    }).error(function(response) {
                        this.handleErrorResponse(response);
                    });
                },

                getAdvertisers: function getAdvertisers(searchFilter) {
                    var apiString = "";
                    if (searchFilter === undefined) {
                        return advertisers;
                    } else {
                        //console.log(" 5. [IN getAdvertisers] about to call api");
                        var deferred = $q.defer();
                        if (searchFilter === "") {
                            apiString = "/api/common/advertiser?pageSize=" + PAGE_SIZE + "&pageNumber=" + PAGE_NUMBER + "&" + this.getLoggedInFilter() + "&hideInvalid=true" + "&sort=name";
                        } else {
                            apiString = "/api/common/advertiser?filters=name like *" + searchFilter + "*&" + this.getLoggedInFilter();
                        }
                        pmApiService.callApi(apiString).success(function(response) {
                            //console.log(" 6. [IN getAdvertisers] did a new lookup...response.items: ", response.items);
                            deferred.resolve({
                                isValid: true,
                                data: response
                            });
                        }).error(function(response) {
                            deferred.reject({
                                isValid: false,
                                data: response
                            });
                        });

                        return deferred.promise;
                    }
                },

                initMobileOS: function initMobileOS(pageSize, pageNumber) {
                    pageSize = pmUtilService.setDefaultValue(pageSize, PAGE_SIZE);
                    pageNumber = pmUtilService.setDefaultValue(pageNumber, PAGE_NUMBER);

                    pmApiService.callApi("/api/common/mobileOS?pageSize=" + pageSize + "&pageNumber=" + pageNumber + "&sort=osName,verMajor,verMinor").success(function(response) {
                        mobileOS = pmUtilService.setMultiSelectValuesWithCustomKey(response.items, "osName");
                    }).error(function(response) {
                        this.handleErrorResponse(response);
                    });
                },

                getMobileOS: function getMobileOS() {
                    return mobileOS;
                },

                initTabletDeviceTypes: function initTabletDeviceTypes(pageSize, pageNumber) {
                    pageSize = pmUtilService.setDefaultValue(pageSize, PAGE_SIZE);
                    pageNumber = pmUtilService.setDefaultValue(pageNumber, PAGE_NUMBER);

                    pmApiService.callApi("/api/common/mobileDevice?pageSize=" + pageSize + "&pageNumber=" + pageNumber + "&filters=deviceTypeId+eq+4&" + this.getLoggedInFilter() + "&sort=deviceValue").success(function(response) {
                        tabletDeviceTypes = pmUtilService.setMultiSelectValuesWithCustomKey(response.items, "deviceValue");
                    }).error(function(response) {
                        this.handleErrorResponse(response);
                    });
                },

                getTabletDeviceTypes: function getTabletDeviceTypes() {
                    return tabletDeviceTypes;
                },

                initMobileDeviceTypes: function initMobileDeviceTypes(pageSize, pageNumber) {
                    pageSize = pmUtilService.setDefaultValue(pageSize, PAGE_SIZE);
                    pageNumber = pmUtilService.setDefaultValue(pageNumber, PAGE_NUMBER);

                    pmApiService.callApi("/api/common/mobileDevice?pageSize=" + pageSize + "&pageNumber=" + pageNumber + "&filters=deviceTypeId+eq+2&" + this.getLoggedInFilter() + "&sort=deviceValue").success(function(response) {
                        mobileDeviceTypes = pmUtilService.setMultiSelectValuesWithCustomKey(response.items, "deviceValue");
                    }).error(function(response) {
                        this.handleErrorResponse(response);
                    });
                },

                getMobileDeviceTypes: function getMobileDeviceTypes(searchFilter) {
                    //console.log(" 4. [IN getMobileDeviceTypes] searchFilter: ", searchFilter);
                    var apiString = "";

                    if (searchFilter === undefined) {
                        return mobileDeviceTypes;
                    } else {
                        //console.log(" 5. [IN getMobileDeviceTypes] about to call api");
                        var deferred = $q.defer();
                        if (searchFilter === "") {
                            apiString = "/api/common/mobileDevice?pageSize=" + PAGE_SIZE + "&pageNumber=" + PAGE_NUMBER + "&filters=deviceTypeId+eq+2&" + this.getLoggedInFilter() + "&sort=deviceValue";
                        } else {
                            apiString = "/api/common/mobileDevice?filters=deviceValue like *" + searchFilter + "*&" + this.getLoggedInFilter();
                        }
                        pmApiService.callApi(apiString).success(function(response) {
                            //console.log(" 6. [IN getMobileDeviceTypes] did a new lookup...response.items: ", response.items);
                            response.items = pmUtilService.setMultiSelectValuesWithCustomKey(response.items, "deviceValue");
                            deferred.resolve({
                                isValid: true,
                                data: response
                            });
                        }).error(function(response) {
                            deferred.reject({
                                isValid: false,
                                data: response
                            });
                        });

                        return deferred.promise;
                    }
                },

                initBuyers: function initBuyers(pageSize, pageNumber) {
                    pageSize = pmUtilService.setDefaultValue(pageSize, PAGE_SIZE);
                    pageNumber = pmUtilService.setDefaultValue(pageNumber, PAGE_NUMBER);

                    pmApiService.callApi("/api/common/buyer?pmpEnabled=1&pageSize=" + pageSize + "&pageNumber=" + pageNumber + "&" + this.getLoggedInFilter() + "&sort=name").success(function(response) {
                        buyers = pmUtilService.setMultiSelectValues(response.items);
                    }).error(function(response) {
                        this.handleErrorResponse(response);
                    });
                },

                getBuyers: function getBuyers(searchFilter) {
                    var apiString = "";

                    if (searchFilter === undefined) {
                        return buyers;
                    } else {
                        //console.log(" 5. [IN getBuyers] about to call api");
                        var deferred = $q.defer();
                        if (searchFilter === "") {
                            apiString = "/api/common/buyer?pmpEnabled=1&pageSize=" + PAGE_SIZE + "&pageNumber=" + PAGE_NUMBER + "&" + this.getLoggedInFilter() + "&sort=name";
                        } else {
                            apiString = "/api/common/buyer?filters=name like *" + searchFilter + "*&" + this.getLoggedInFilter();
                        }

                        pmApiService.callApi(apiString).success(function(response) {
                            //console.log(" 6. [IN getBuyers] did a new lookup...response.items: ", response.items);
                            deferred.resolve({
                                isValid: true,
                                data: response
                            });
                        }).error(function(response) {
                            deferred.reject({
                                isValid: false,
                                data: response
                            });
                        });

                        return deferred.promise;
                    }
                },

                initAdvertisingEntity: function initAdvertisingEntity(pageSize, pageNumber) {
                    pageSize = pmUtilService.setDefaultValue(pageSize, PAGE_SIZE);
                    pageNumber = pmUtilService.setDefaultValue(pageNumber, PAGE_NUMBER);

                    pmApiService.callApi("/api/common/advertisingEntity?pmpEnabled=1&pageSize=" + pageSize + "&pageNumber=" + pageNumber + "&" + this.getLoggedInFilter() + "&sort=name").success(function(response) {
                        advertisingEntity = pmUtilService.setMultiSelectValues(response.items);
                    }).error(function(response) {
                        this.handleErrorResponse(response);
                    });
                },
                getAdvertisingEntity: function getAdvertisingEntity(searchFilter) {
                    var apiString;
                    if (searchFilter === undefined) {
                        return advertisingEntity;
                    } else {
                        //console.log(" 5. [IN getAdvertisingEntity] about to call api");
                        var deferred = $q.defer();

                        if (searchFilter === "") {
                            apiString = "/api/common/advertisingEntity?pmpEnabled=1&pageSize=" + PAGE_SIZE + "&pageNumber=" + PAGE_NUMBER + "&" + this.getLoggedInFilter() + "&sort=name";
                        } else {
                            apiString = "/api/common/advertisingEntity?pmpEnabled=1&filters=name like *" + searchFilter + "*&" + this.getLoggedInFilter();
                        }

                        pmApiService.callApi(apiString).success(function(response) {
                            //console.log(" 6. [IN getAdvertisingEntity] did a new lookup...response.items: ", response.items);
                            deferred.resolve({
                                isValid: true,
                                data: response
                            });
                        }).error(function(response) {
                            deferred.reject({
                                isValid: false,
                                data: response
                            });
                        });

                        return deferred.promise;
                    }
                },
                getPreviousUrl: function() {
                    return fromUrl;
                },
                setPreviousUrl: function(url) {
                    fromUrl = url;
                }

            };
        }]);
}).call(this, angular);
