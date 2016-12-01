/*global angular*/
(function(angular) {
    "use strict";

    angular
        .module("pmlComponents")
        .factory("pmUtilService", [function() {
            return {
                getValidationPatterns: function () {
                    return {
                        name: /^(?!.*[+|!(){}[\]<>%^"~*?:;@]+).*$/
                    };
                },

                isValidForm: function(requiredFields) {
                    var isValid = true;
                    angular.forEach(requiredFields, function(value) {
                        if (value === true) {
                            isValid = isValid && false;
                        }
                    });
                    return isValid;
                },

                getSiteFilter: function(platformIds, publisherId) {
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
                },

                setDefaultValue: function setDefaultValue(val, defaultValue) {
                    if (null === val || undefined === val) {
                        val = defaultValue;
                    }
                    return val;
                },
                setMultiSelectValues: function setMultiSelectValues(apiItems) {
                    var multiSelectData = [];
                    //console.log("API Items :" + apiItems[0].id);
                    angular.forEach(apiItems, function(value) {
                        if (value !== undefined) {
                            multiSelectData.push({
                                id: value.id,
                                name: value.name,
                                ticked: false
                            });
                        }
                    });
                    return multiSelectData;
                },
                updateNameOfGeos: function updateNameOfGeos(apiItems) {
                    var apiItemsCopy = angular.copy(apiItems);
                    angular.forEach(apiItemsCopy, function(value) {

                        if (value.geoLevel === "DMA") {
                            value.name = value.name + " (DMA)";
                        } else if (value.geoLevel === "COUNTRY") {
                            value.name = value.name + " (COUNTRY)";
                        }
                    });
                    return apiItemsCopy;
                },
                setMultiSelectValuesToTrue: function setMultiSelectValuesToTrue(apiItems) {
                    var multiSelectData = [];
                    angular.forEach(apiItems, function(value) {
                        multiSelectData.push({
                            id: value.id,
                            name: value.name,
                            ticked: true
                        });
                    });
                    return multiSelectData;
                },
                setMultiSelectValuesWithCustomKey: function setMultiSelectValues(apiItems, customKey) {
                    if (null === customKey) {
                        return setMultiSelectValues(apiItems);
                    }
                    var multiSelectData = [];
                    angular.forEach(apiItems, function(value) {
                        multiSelectData.push({
                            id: value.id,
                            name: value[customKey],
                            ticked: false
                        });
                    });
                    return multiSelectData;
                },
                setMultiSelectValuesWithItems: function setMultiSelectValues(apiItems, customKey, selectedItems) {
                    if (null === selectedItems) {
                        return setMultiSelectValues(apiItems, customKey);
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
                },
                getMultiSelectValues: function getMultiSelectValues(multiSelectArray) {
                    var resultsArray = [];
                    angular.forEach(multiSelectArray, function(value) {
                        if (value.ticked === true) {
                            resultsArray.push(value);
                        }
                    });
                    return resultsArray;
                },
                getIdsFromObjects: function getIdsFromObjects(ObjectList) {
                    var selectedData = [];
                    angular.forEach(ObjectList, function(obj) {
                        if (obj.id === undefined) {
                            selectedData.push(obj);
                        } else {
                            selectedData.push(obj.id);
                        }
                    });
                    return selectedData;
                },
                getSessionStorageItem: function (item) {
                    return sessionStorage.getItem(item);
                },
                setSessionStorageItem: function (item, value) {
                    sessionStorage.setItem(item, value);
                },
                clearSessionPageInfo: function () {
                    var i,
                        items = ["products-currentPage", "offers-currentPage"];
                    //Array check is for future compatibility. Items can be passed as param
                    if (Array.isArray(items)) {
                        for (i = 0; i < items.length; i++) {
                            sessionStorage.removeItem(items[i]);
                        }
                    } else {
                        sessionStorage.removeItem(items);
                    }
                }
            };
        }]);

}).call(this, angular);
