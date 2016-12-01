/*jshint unused:false, asi:true, camelcase:false,curly: false*/
/*jshint -W108 */
/*jshint -W109 */

"use strict";
/**
 * @ngdoc service
 * @name pmIdOfferChoiceForm
 * @author William Jiang
 *
 * @description provide REST service and share data to AG Offer Choice.
 */
var choice = angular.module("pmlComponents.pmIdOffersChoice");
var token = sessionStorage.getItem("Pubtoken") || "adminuser";

choice.factory("AgOffersList", ["$resource", function($resource) {
    return $resource("/api/agoffers", {
        query: {
            method: "GET",
            headers: {"pubToken": token},
            isArray: true
        }
    })
}]);

choice.factory("AllOffersList", ["$resource", function($resource) {
    return $resource("/api/alloffers", {
        query: {
            method: "GET",
            headers: {"pubToken": token},
            isArray: true
        }
    })
}]);

/**
 * make the AG offer form smarter to display and suit with various cases.
 * action: create, update, (future: delete, etc)
 */
choice.factory("ProductAgOption", ["MediaOceanValidation", function(MediaOceanValidation) {

    var selectedProduct = {};
    var chosenProduct = {};
    var moProduct = {};
    var demandPartners = {};

    var fromAction = "";
    var partnerChoice = [];
    var mediaOceanChoice = "";

    return {
        /**
         * save user's choice product. used in AG, PMP and Choice pages.
         * @param product
         */
        setSelectedProduct: function(product) {
            selectedProduct = product;
        },
        /**
         * retrieve user's choice product.
         * @returns {{product}}
         */
        getSelectedProduct: function() {
            return selectedProduct;
        },

        //'ABF' : 'BTF'
        mapPosition: function(positions) {
            angular.forEach(positions, function(position) {
                if (/Above/.test(position)) {
                    position = 'ABF';
                }
                else if (/Below/.test(position)) {
                    position = 'BTF';
                }
            })
        },

        /**
         * used only in Choice page.
         * @param option:
         * @return: chosenProduct{name, description, category, position, size}
         * @return more: {id, publisherId}
         */
        setOption: function(option) {
            var rp = chosenProduct;
            rp.name = option.name;
            rp.description = option.description;
            rp.id = option.id;
            rp.publisherId = option.publisherId;

            var sizes = option.adSizes || []; //null by default
            var positions = option.adFoldPlacements || [];
            var categories = option.productCategory || [];

            var len = categories ? categories.length : 0;
            if (len === 1) {
                rp.category = categories[0].name;
                rp.categoryMore = "";
            }
            else if (len > 1) {
                rp.category = categories[0].name + "(+" + (len - 1) + " more)";
                rp.categoryMore = categories.map(function(c) {
                    return c.name
                }).join(", <br>");
            }
            else {
                rp.category = "N/A";
                rp.categoryMore = "";
            }

            len = sizes ? sizes.length : 0;
            if (len === 1) {
                rp.size = MediaOceanValidation.pmMoNameMapping(sizes[0].name);
                rp.sizeMore = "";
            }
            else if (len > 1) {
                rp.size = MediaOceanValidation.pmMoNameMapping(sizes[0].name) + "(+" + (len - 1) + " more)";
                rp.sizeMore = sizes.map(function(s) {
                    return MediaOceanValidation.pmMoNameMapping(s.name)
                }).join(", <br>");
            }
            else {
                rp.size = "N/A";
                rp.sizeMore = "";
            }

            len = positions ? positions.length : 0;
            if (len === 1) {
                if (!/(Partially|Unknown)/i.test(positions[0].name)) {
                    rp.position = positions[0].name;
                }
                else {
                    rp.position = "N/A";
                }
            }
            else if (len > 1) {
                var ary = [];
                positions.forEach(function(p) {
                    if (!/(Partially|Unknown)/i.test(p.name)) {
                        ary.push(p.name);
                    }
                });
                //rp.position = this.mapPosition(ary).join(', ');
                rp.position = ary.join(', ');
            }
            else {
                rp.position = "N/A";
            }
        },

        //used only in Choice page.
        getOption: function() {
            if (Object.keys(chosenProduct).length > 0 && chosenProduct.name) { //name can not ""
                return chosenProduct;
            }
            else {// in case of blocking.
                return {
                    name: "",
                    description: "",
                    category: "",
                    size: "",
                    position: ""
                }
            }
        },

        /**
         *
         * @param erros
         */
        resetDemandPartners: function() {
            demandPartners = {};
        },

        setDemandPartners: function(error) {
            demandPartners = {
                sizes: error.adSizes,
                positions: error.adFoldPlacements,
                categories: error.productCategory
            }
        },

        getDemandPartners: function() {
            return demandPartners;
        },

        /**
         * moProduct { sizes, positions, categories }
         * @param warns_or_oks
         * @returns {boolean}
         */
        resetMediaOcean: function() {
            moProduct.sizes = [];
            moProduct.positions = [];
            moProduct.categories = [];
        },

        setMediaOcean: function(warns_or_oks) {

            // possible: OK and WARN
            // {"checkSize":{"ERROR":"what is wrong"},"checkPosition":{"OK":"Above the Fold"},"checkCategory":{"WARN":["education","tution","working"]}}
            var w = warns_or_oks;

            // need to clean-up the cache, otherwise accumulate:
            this.resetMediaOcean();

            if (Object.keys(w.checkSize)[0] === 'ERROR' || Object.keys(w.checkPosition)[0] === 'ERROR' || Object.keys(w.checkCategory)[0] === 'ERROR') {
                console.log('surprise: SHOULD be IMPOSSIBLE!', w);
                return false;
            }

            if (Object.keys(w.checkSize)[0] === 'OK') {
                moProduct.sizes[0] = {name: w.checkSize.OK.replace(/_.*$/, "")};
            }
            else {
                w.checkSize.WARN.forEach(function(v) {
                    moProduct.sizes.push({name: v});
                });
            }

            if (Object.keys(w.checkPosition)[0] === 'OK') {
                moProduct.positions[0] = {name: /Above/i.test(w.checkPosition.OK) ? 'ABF' : 'BTF'};
            }
            else {
                w.checkPosition.WARN.forEach(function(v) {
                    if (/Above/i.test(v)) {
                        moProduct.positions.push({name: 'ABF'});
                    }
                    else {
                        moProduct.positions.push({name: 'BTF'});
                    }
                });
            }

            if (Object.keys(w.checkCategory)[0] === 'OK') {
                moProduct.categories[0] = {name: w.checkCategory.OK};
            }
            else {
                w.checkCategory.WARN.forEach(function(v) {
                    moProduct.categories.push({name: v});
                });
            }
        },

        getMediaOcean: function() {
            return moProduct;
        },

        /**
         * action: 'update', 'create', 'delete', ""
         * @param action
         */
        setAction: function(action) {
            fromAction = action;
        },

        getAction: function() {
            return fromAction;
        },

        /**
         * PMP, AG
         * @param choice: media_ocean_choice, kantar_media_choice
         */
        resetPartnerChoice: function() {
            partnerChoice = [];
        },

        setPartnerChoice: function(choice) {
            if (partnerChoice.indexOf(choice) === -1) {
                partnerChoice.push(choice);
            }
        },

        getPartnerChoice: function() {
            return partnerChoice;
        },


        /**
         * keep validation status:
         * @param status: "", OK, ERROR, WARN, NO
         */
        setMediaOceanChoice: function(status) {
            mediaOceanChoice = status;
        },

        getMediaOceanChoice: function() {
            return mediaOceanChoice;
        },

        resetMediaOceanChoice: function() {
            mediaOceanChoice = "";
        }
    }
}]);


choice.factory('MediaOceanValidation', ["$http", function($http) {

    /**
     * william jiang: for performance reason, keep it in memory.
     * mediaocean.service.url = http://54.164.157.178:9090/offers/
     * This is static data, don't need to http-request every time.
     * @type {{
     *   positions:  {pmId: number, pmName: string, moName: string}[],
     *   categories: {pmId: number, pmName: string, moName: string}[],
     *   adSizes:    {pmId: number, pmName: string, moName: string}[]
     * }}
     */

    var mo_data = {
        "positions": [
            {
                "pmId": 0,
                "pmName": "Unknown",
                "moName": "ABOVE_THE_FOLD"
            },
            {
                "pmId": 1,
                "pmName": "Above the Fold",
                "moName": "ABOVE_THE_FOLD"
            },
            {
                "pmId": 2,
                "pmName": "Below the Fold",
                "moName": "BELOW_THE_FOLD"
            },
            {
                "pmId": 3,
                "pmName": "Partially Above the Fold",
                "moName": "ABOVE_THE_FOLD"
            }
        ],
        "categories": [
            {
                "pmId": 1,
                "pmName": "Not Applicable",
                "moName": "REFERENCE"
            },
            {
                "pmId": 2,
                "pmName": "Automotive",
                "moName": "REFERENCE"
            },
            {
                "pmId": 3,
                "pmName": "Business and Finance",
                "moName": "BUSINESS_AND_INDUSTRIAL"
            },
            {
                "pmId": 8,
                "pmName": "Education",
                "moName": "JOBS_AND_EDUCATION"
            },
            {
                "pmId": 9,
                "pmName": "Employment and Career",
                "moName": "JOBS_AND_EDUCATION"
            },
            {
                "pmId": 10,
                "pmName": "Entertainment and Leisure",
                "moName": "HOBBIES_AND_LEISURE"
            },
            {
                "pmId": 12,
                "pmName": "Gaming",
                "moName": "GAMES"
            },
            {
                "pmId": 14,
                "pmName": "Health and Fitness",
                "moName": "HEALTH"
            },
            {
                "pmId": 16,
                "pmName": "Home and Garden",
                "moName": "HOME_AND_GARDEN"
            },
            {
                "pmId": 18,
                "pmName": "Men''s Interest",
                "moName": "REFERENCE"
            },
            {
                "pmId": 21,
                "pmName": "Music",
                "moName": "ARTS_AND_ENTERTAINMENT"
            },
            {
                "pmId": 23,
                "pmName": "News",
                "moName": "NEWS"
            },
            {
                "pmId": 24,
                "pmName": "Parenting and Family",
                "moName": "HOME_AND_GARDEN"
            },
            {
                "pmId": 27,
                "pmName": "Real Estate",
                "moName": "REAL_ESTATE"
            },
            {
                "pmId": 28,
                "pmName": "Reference",
                "moName": "REFERENCE"
            },
            {
                "pmId": 29,
                "pmName": "Food and Dining",
                "moName": "FOOD_AND_DRINK"
            },
            {
                "pmId": 31,
                "pmName": "Shopping",
                "moName": "SHOPPING"
            },
            {
                "pmId": 32,
                "pmName": "Social Networking",
                "moName": "ONLINE_COMMUNITIES"
            },
            {
                "pmId": 33,
                "pmName": "Sports",
                "moName": "SPORTS"
            },
            {
                "pmId": 34,
                "pmName": "Technology",
                "moName": "COMPUTERS_AND_ELECTRONICS"
            },
            {
                "pmId": 36,
                "pmName": "Travel",
                "moName": "TRAVEL"
            },
            {
                "pmId": 38,
                "pmName": "Women''s Interest",
                "moName": "REFERENCE"
            }
        ],
        "adSizes": [
            {
                "pmId": 7,
                "pmName": "Leaderboard",
                "moName": "728x90"
            },
            {
                "pmId": 9,
                "pmName": "Sidekick",
                "moName": "300x250"
            },
            {
                "pmId": 10,
                "pmName": "Wide Skyscraper",
                "moName": "160x600"
            }, {
                "pmId": 66,
                "pmName": "Leaderboard2",
                "moName": "700x90"
            },
            {
                "pmId": 88,
                "pmName": "Sidekick2",
                "moName": "400x250"
            }
        ]
    };
    var mo_adSizes = {}, mo_positions = {}, mo_categories = {};

    function getMOadSizes() {
        $http.get("/api/mediaOcean/mappings/adSizes", function(data) {
            mo_data.adSizes = data;
        });
    }

    function getMOpositions() {
        $http.get("/api/mediaOcean/mappings/positions", function(data) {
            mo_data.positions = data;
        });
    }

    function getMOcategories() {
        $http.get("/api/mediaOcean/mappings/categories", function(data) {
            mo_data.categories = data;
        });
    }

    function getHttpMOData() {
        getMOadSizes();
        getMOpositions();
        getMOcategories();
    }

    function getMOData() {
        return mo_data;
    }

    /**
     * for performance reason, add a function for singleton usage.
     * @returns {{mo_data_adSize}}
     */
    function get_mo_data_size() {
        if (Object.keys(mo_adSizes).length !== 0) {
            return mo_adSizes;
        }

        // return ["Leaderboard", "Sidekick", "Wide Skyscraper"]
        mo_adSizes.pmNames = mo_data.adSizes.map(function(as) {
            return as.pmName;
        });

        // return ["300x250", "160x600", "728x90"];
        mo_adSizes.moNames = mo_data.adSizes.map(function(as) {
            return as.moName;
        });
    }

    // return [{"Leaderboard":"728x90"},{"Sidekick":"300x250"},{"Wide Skyscraper":"160x600"}]
    function pmMoNameMapping(pmName) {
        var pm = pmName;
        mo_data.adSizes.forEach(function(as) {
            if (as.pmName === pmName) {
                pm = as.moName;
            }
        });
        return pm;
    }

    function validate_size(prod) {

        // make `mo_adSizes` available and only once load.
        get_mo_data_size();

        /**
         * validation from here:
         * 1. if media_ocean, return true; (OK or WARNING)
         * 2. otherwise return false;      (ERROR)
         * var regexp = /[0-9x]+/i;
         */
        if (!prod.adSizes) {
            return {
                "ERROR": "selected Product has no adSizes definition."
            };
        }

        // product name matches ["Leaderboard", "Sidekick", "Wide Skyscraper"]?
        var matchName = prod.adSizes.some(function(v) {
            return mo_adSizes.pmNames.indexOf(v.name) !== -1;
        });
        if (!matchName) {
            return {
                'ERROR': 'selected Product are not in line with ["Leaderboard", "Sidekick", "Wide Skyscraper"].'
            }
        }

        /**
         * OK: length=1 and match ["Leaderboard", "Sidekick", "Wide Skyscraper"].
         * fix: TypeError: Cannot read property '0' of null
         * var matched = mo_adSizes.moNames.indexOf(prod.adSizes[0].name.match(regexp));
         */
        if (prod.adSizes.length === 1) {
            return {
                'OK': mo_data.adSizes.filter(function(v) {
                    return v.pmName === prod.adSizes[0].name
                })[0].moName //Sidekick => 300x250
            };
        }

        /**
         * WARN: howMany>1, and how many it matches
         */
        var howMany = [];
        prod.adSizes.forEach(function(v) {
            if (["Leaderboard", "Sidekick", "Wide Skyscraper"].indexOf(v.name) !== -1) {
                howMany.push(v.name);
            }
        });
        //["Leaderboard", "Leaderboard"]
        var unique = howMany.reverse().reduce(function(p, c) {
            if (p.indexOf(c) < 0) p.push(c);
            return p;
        }, []);

        // not only including MediaOcean, but other adSizes.
        if (howMany.length !== prod.adSizes.length) {
            return {
                'ERROR': 'selected Product are mixed with MediaOcean.'
            }
        }

        if (unique.length > 1) {
            return {
                'WARN': unique
            };
        }
        else if (unique.length === 1) {
            return {
                'OK': unique[0]
            }
        }
        else {
            return {
                'ERROR': 'selected Product adSizes no match.'
            };
        }
    }

    function validate_position(prod) {
        var positions = prod.adFoldPlacements;
        var re = new RegExp("(Partially Above the Fold|Unknown)", "i");

        //not exist or null/empty
        if (typeof positions !== 'object' || positions === null) {
            return {
                'ERROR': 'selected Product has no position definition.'
            };
        }

        var valid_positions = ['Above the Fold', 'Below the Fold'];
        /**
         * OK
         */
        if (positions.length === 1 && positions[0].name && valid_positions.indexOf(positions[0].name !== -1)) {
            return {
                'OK': positions[0].name
            };
        }

        /**
         * WARN
         * valid: 'Above the Fold', 'Below the Fold'
         */
        var matched = [];
        positions.forEach(function(v) {
            if (!re.test(v.name)) {
                matched.push(v.name);
            }
        });
        if (matched.length === 1) {
            return {
                'OK': matched[0]
            }
        }
        else if (matched.length > 1) {
            return {
                'WARN': valid_positions
            }
        }
        else {
            return {
                'ERROR': 'selected Product has no matched positions'
            };
        }
    }

    function get_mo_data_category() {
        if (Object.keys(mo_categories).length !== 0) {
            return mo_categories;
        }
        mo_categories.pmNames = mo_data.categories.map(function(v) {
            return v.pmName;
        });
        mo_categories.moNames = mo_data.categories.map(function(v) {
            return v.moName;
        })
    }

    function validate_category(prod) {

        get_mo_data_category();

        if (typeof prod.productCategory !== 'object' || !prod.productCategory) {
            return {
                'ERROR': 'selected Product has no category definition.'
            };
        }

        var cats = prod.productCategory;
        if (cats.length === 1 && cats[0].name && mo_categories.pmNames.indexOf(cats[0].name !== -1)) {
            return {
                'OK': cats[0].name
            }
        }

        var howMany = [];
        prod.productCategory.forEach(function(v) {
            if (mo_categories.pmNames.indexOf(v.name) !== -1) {
                howMany.push(v.name);
            }
        });
        /**
         * WARN
         */
        if (howMany.length > 1) {
            return {
                'WARN': howMany
            };
        }
        else if (howMany.length === 1) {
            /**
             * OK
             */
            return {
                'OK': howMany[0]
            };
        }
        /**
         * ERROR
         */
        else {
            return {
                'ERROR': 'selected Product has no Category to match.'
            };
        }
    }

    return {
        validateSize: validate_size,
        validatePosition: validate_position,
        validateCategory: validate_category,
        pmMoNameMapping: pmMoNameMapping,
        getHttpMOData: getHttpMOData,
        getMOData: getMOData
    }
}]);


choice.factory("MediaOceanHubMappings", ["$resource", function($resource) {
    var validationFields = ["sizes", "positions", "categories"]
    var moMappings = {sizes: [], positions: [], categories: []};
    var moRequest = $resource("/api/mediaOcean/mappings/combined").get(function(data) {
        validationFields.map(function(k) {
            moMappings[k] = moRequest[("sizes" === k) ? "adSizes" : k].map(function(e) {
                return e.pmName
            });
        });
    });
    var validateValue = function(v, l) {
        return -1 !== l.indexOf(v.name)
    };
    var validateList = function(vl, l) {
        return vl.filter(function(v) {
            return validateValue(v, l)
        })
    };

    // this checks for both presence of some valid entries (if chk is true) and invalid ones (if chk is false)
    var checkList = function(vl, l, chk) {
        return vl.some(function(v) {
            return (chk === validateValue(v, l))
        })
    };

    // this checks all fields in products for both valid and invalid entries based on chk argument
    var checkProduct = function(prod, chk) {
        if (!prod) return false;
        return validationFields.map(function(k) {
            return checkList(prod[k], moMappings[k], chk)
        })
            // when checking for valid entries (chk is true) validate that all fields have at least some valid entries (AND)
            // when checking for invalid entries (chk is false) chack whether any of the fields have at least some invalid entries (OR)
            .reduce(function(a, b) {
                return chk ? (a && b) : (a || b)
            });
    };

    var filterProduct = function(prod) {
        var res = angular.copy(prod);
        validationFields.forEach(function(k) {
            res[k] = validateList(res[k], moMappings[k]);
        });
        return res;
    };

    var validateProduct = function(prod) {
        if (!checkProduct(prod, true)) return "ERROR";
        if (!checkProduct(prod, false)) return "OK";
        return "WARNING";
    }

    return {
        validateProduct: validateProduct,
        filterProduct: filterProduct
    };
}]);

