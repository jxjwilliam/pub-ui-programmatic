/*jshint unused:false, camelcase:false,curly: false*/
/*jshint -W108 */
/*jshint -W109 */
'use strict';
/**
 * use a seperate function instead of directly embed into the  directive. It is more easy to maintain and extend.
 */
var amg = angular.module("pmlComponents.pmIdAgOfferCreate");

amg.controller('amgCtrl', ["$scope", "pmAclHttpService", "NavLinks", function($scope, pmAclHttpService, NavLinks) {

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


// extract directive controller out of `directive` definition.
amg.pmIdAgCreateFormCtrl = function(pmApiService,
                                    $scope,
                                    $location,
                                    $rootScope,
                                    $routeParams,
                                    AutomatedGuaranteed,
                                    ProductAgOption,
                                    $timeout,
                                    amgFormValues,
                                    AgOffers,
                                    pmCommonApiService,
                                    pmTokenStorageService) {

    $scope.panelView = "close";
    //$rootScope.showOverlay = "none";

    if ($routeParams.id && !/\d$/.test($routeParams.id)) {
        //get the production options from 'offers' page.
        $scope.agProduct = ProductAgOption.getOption();
        if (!$scope.agProduct.name) {
            $location.path("/offers");
            return false;
        }

        //["media_ocean_choice", "karntar_media_choice"]
        var partnerChoice = ProductAgOption.getPartnerChoice();

        var isMedia = partnerChoice.indexOf('media_ocean_choice') !== -1;
        var isWarn = /(WARN|OK)/.test(ProductAgOption.getMediaOceanChoice());
        $scope.showPartnerShip = isMedia && isWarn;

        var mo = $scope.media_ocean = ProductAgOption.getMediaOcean();

        //Object.keys(mo).every(function(key) { return mo[key].length!==0; }
        var moLen = Object.keys(mo).length;
        if (moLen !== 0 && (mo.sizes && mo.sizes.length > 0)) {
            if (mo.sizes && mo.sizes.length > 0) {
                mo.size = mo.sizes[0];
            }
            if (mo.positions && mo.positions.length > 0) {
                mo.position = mo.positions[0];
            }
            if (mo.categories && mo.categories.length > 0) {
                mo.category = mo.categories[0];
            }
        }
        else {
            $scope.media_ocean = ProductAgOption.getDemandPartners();
        }
    }

    $scope.getDemandmetaData = function() {

        var selected = ProductAgOption.getSelectedProduct();
        var partnerChoice = ProductAgOption.getPartnerChoice();

        if (partnerChoice.indexOf('media_ocean_choice') === -1) {
            ProductAgOption.setDemandPartners(selected);
            return {
                kantar: ProductAgOption.getDemandPartners(),
                mediaocean: {}
            };
        }
        else {
            /**
             * media_ocean_choice is true:
             */
            var sid = selected.adSizes[0].id || 0,
                pid = selected.adFoldPlacements[0].id || 0,
                cid = selected.productCategory[0].id || 0;

            return {
                kantar: {},
                mediaocean: {
                    size: {id: sid, name: mo.size.name},
                    position: {id: pid, name: mo.position.name},
                    category: {id: cid, name: mo.category.name}
                }
            };
        }
    };

    $scope.cancel = function() {
        $location.path("/offers");
        return false;
    };

    /**
     * fix the bug user hit ENTER key to submit.
     */
    $scope.createOrUpdate = function() {

        if ($scope.form.$valid) {
            console.log('createOrUpdate', $scope.amg, $scope.form);

            if ($scope.amg && !isNaN(+$scope.amg.id)) {
                $scope.update();
            }
            else {
                $scope.create();
            }
        }
        //else $scope.form.$invalid=true
        return false;
    };


    /**
     * - optlock should be null on offer creation
     * - ownerId is the publisher ID that was used at log-in
     * - ownerTypeId should be 1 - it means publisher
     */
    $scope.create = function() {
        var types = [];
        if ($scope.amg.gif) types.push('GIF');
        if ($scope.amg.swf) types.push('SWF');
        if ($scope.amg.jpg) types.push('JPG');

        var tags = [];
        angular.forEach($scope.amg.tags, function(v) {
            this.push(v.text);
        }, tags);

        var agoffers = {
            "optlock": null,
            "name": $scope.amg.name,
            "description": $scope.amg.description,
            "ownerId": +pmTokenStorageService.getResourceId(),
            "ownerTypeId": 1,
            "keywords": tags.join('|'),
            "minSpendAmount": $scope.amg.minimum_amount,
            "priceAmount": $scope.amg.price,
            "currency": "USD",
            "publicRateCardAmount": $scope.amg.public_rate_card,
            "costType": "CPM",
            "status": $scope.amg.offer_status.toUpperCase(),
            "deleted": false,
            "productId": +$scope.agProduct.id,
            //product": null,
            "maxDailyImpressions": $scope.amg.max_daily_impressions,
            "url": $scope.amg.url,
            "userGeneratedContent": $scope.amg.user_generated_content,
            "creativeTypes": types
        };

        /**
         * /agoffers added 3 items in `offer` table:
         * timestamp and text ???
         * TEXT max is 64K (65,535 bytes), so it is much safer.
         * also timestamp is more accurate and better performance than datatime, especially is input span various timezone.
         */

        agoffers.notes = $scope.amg.publisher_notes;
        agoffers.demandMetadata = JSON.stringify($scope.getDemandmetaData());
        console.log('demandMetadata:', agoffers.demandMetadata);

        AgOffers.save(agoffers, function(data) {
            var to_url = pmCommonApiService.getPreviousUrl() || '/products';
            if (/offers/.test(to_url)) to_url = '/offers';

            if ($scope.media_ocean && $scope.media_ocean.size) {
                sessionStorage.setItem('AG_' + data.id, JSON.stringify(agoffers.demandMetadata));
            }

            // clean up the cache, otherwise bug.
            $scope.releaseCache();

            $timeout(function() {
                $scope.$apply(function() {
                    ProductAgOption.setAction('create');
                    $location.path(to_url);
                });
            }, 1);
            return false;
        });
    };

    $scope.renderDemandPartner = function(data) {

        if (!data.demandMetadata) {
            return false;
        }
        var dmd = JSON.parse(data.demandMetadata);

        // backward compatible:
        if (typeof dmd === 'string') {
            dmd = JSON.parse(dmd);
        }

        if (Object.keys(dmd.mediaocean).length === 0) {
            $scope.media_ocean = $scope.media_ocean || {};
            $scope.media_ocean.sizes = dmd.kantar.sizes;
            $scope.media_ocean.positions = dmd.kantar.positions;
            $scope.media_ocean.categories = dmd.kantar.categories;
        }
        else {
            // show if have.
            $scope.showPartnerShip = true;

            $scope.media_ocean = $scope.media_ocean || {};
            $scope.media_ocean.size = dmd.mediaocean.size;
            ($scope.media_ocean.sizes = []).push(dmd.mediaocean.size);
            $scope.media_ocean.position = dmd.mediaocean.position;
            ($scope.media_ocean.positions = []).push(dmd.mediaocean.position);
            $scope.media_ocean.category = dmd.mediaocean.category;
            ($scope.media_ocean.categories = []).push(dmd.mediaocean.category);

        }
    };


    $scope.render = function(agoffers) {
        if (!agoffers || Object.keys(agoffers).length === 0) return;
        var amg = {
            id: agoffers.id,
            optlock: agoffers.optlock,
            name: agoffers.name,
            description: agoffers.description,
            ownerId: pmTokenStorageService.getResourceId(),
            ownerTypeId: 1, //agoffers.ownerTypeId,
            minimum_amount: agoffers.minSpendAmount,
            price: agoffers.priceAmount,
            currency: agoffers.currency,
            public_rate_card: agoffers.publicRateCardAmount,
            costType: agoffers.costType,
            offer_status: agoffers.status,
            deleted: agoffers.deleted,
            productId: agoffers.productId,
            product: agoffers.product,
            max_daily_impressions: agoffers.maxDailyImpressions,
            url: agoffers.url,
            user_generated_content: agoffers.userGeneratedContent
            //create_types: agoffers.creativeTypes.join(),
        };

        amg.publisher_notes = agoffers.notes;

        amg.tags = [];
        /** william fix keywords is null bug:
         *
         */
        if (agoffers.keywords && agoffers.keywords.length > 0) {
            angular.forEach(agoffers.keywords.split('|'), function(value) {
                amg.tags.push({text: value});
            });
        }

        var tmp = agoffers.creativeTypes;
        for (var i = 0; i < tmp.length; i++) {
            if (/GIF/i.test(tmp[i])) amg.gif = true;
            if (/JPG/i.test(tmp[i])) amg.jpg = true;
            if (/SWF/i.test(tmp[i])) amg.swf = true;
        }
        $scope.amg = amg;
    };

    /**
     * CURD: Resource: $promise, $resolved, id.. description, name, ...
     */
    $scope.findOne = function(id) {
        var oid = id || $scope.offer_id;
        AgOffers.get({id: oid}).$promise.then(function(data) {
            console.log('findOne: ', data);
            if (data.id && Object.keys(data).length > 2) {
                /**
                 * remove id=18) from AG-from
                 */
                    //$scope.screenTitle += ' (id=' + data.id + ')';

                    // this is render `form`.
                $scope.render(data);

                //this is render `demand partners`
                $scope.renderDemandPartner(data);

                //save this data
                $scope.readonlyDemandmetaData = data.demandMetadata;
            }
        });
    };

    $scope.findAll = function() {
        var offers = AgOffers.query(function(data) {
            console.log('findAll: ', offers, data);
        });
    };

    $scope.update = function() {

        var types = [];
        if ($scope.amg.gif) types.push('GIF');
        if ($scope.amg.swf) types.push('SWF');
        if ($scope.amg.jpg) types.push('JPG');

        var agoffer = {
            id: $scope.amg.id,
            optlock: $scope.amg.optlock,
            name: $scope.amg.name,
            description: $scope.amg.description,
            ownerId: $scope.amg.ownerId,
            ownerTypeId: $scope.amg.ownerTypeId,
            minSpendAmount: $scope.amg.minimum_amount,
            priceAmount: $scope.amg.price,
            currency: $scope.amg.currency,
            publicRateCardAmount: $scope.amg.public_rate_card,
            costType: $scope.amg.costType,
            status: $scope.amg.offer_status,
            deleted: $scope.amg.deleted,
            productId: $scope.amg.productId,
            product: null, //$scope.amg.product,
            maxDailyImpressions: $scope.amg.max_daily_impressions,
            url: $scope.amg.url,
            userGeneratedContent: $scope.amg.user_generated_content,
            notes: $scope.amg.publisher_notes,
            creativeTypes: types //$scope.amg.create_types
        };

        var keywords = [];
        angular.forEach($scope.amg.tags, function(v, k) {
            keywords.push(v.text);
        });

        agoffer.keywords = keywords.join('|');

        /**
         * for edit, if don't send demandMetadata, the metaData is still there after edit?
         * william add for display correct after edit.
         * agoffer.demandMetadata = JSON.stringify($scope.getDemandmetaData());
         * angular.noop();
         */
        agoffer.demandMetadata = $scope.readonlyDemandmetaData;

        AgOffers.update({id: agoffer.id}, agoffer, function(data) {
            console.log('update!', data);
            var to_url = pmCommonApiService.getPreviousUrl() || '/products';
            if (!to_url) to_url = '/offers';
            if (/offers/.test(to_url)) to_url = '/offers'; // "/offers/choose", "offers/choose"

            $scope.releaseCache();

            $timeout(function() {
                $scope.$apply(function() {
                    ProductAgOption.setAction('update');
                    $location.path(to_url);
                });
            }, 1);

        });
    };

    $scope.releaseCache = function() {
        ProductAgOption.resetPartnerChoice();
        ProductAgOption.resetDemandPartners();
        ProductAgOption.resetMediaOcean(); //sizes, positions, categories
        ProductAgOption.resetMediaOceanChoice();
    };

    //TODO: CRUD's delete:
    $scope.delete = function() {
        var oid = $scope.offer_id || 11;
        AgOffers.delete({id: oid}).$promise.then(function(data) {
            console.log('delete: ', data);
        });
    };

    if (typeof $routeParams.id !== "undefined") {
        if ($routeParams.id === "add") {
            $scope.mode = "add";
            $scope.screenTitle = "Create an AG Offer";
            $scope.buttonTitle = "Create Offer";
            $scope.submit_button_content = 'Create';
        }
        else {
            $scope.mode = "edit";
            $scope.screenTitle = "Edit an AG Offer";
            $scope.submit_button_content = 'Edit';
            $scope.buttonTitle = "Update Offer";

            $scope.findOne($routeParams.id);
        }
        $scope.panelView = "open";
        $rootScope.$emit("showOverlay", "block");
    }
    else {
        if ($location.path() === '/offers/ag/add') {
            $scope.mode = "add";
            $scope.panelView = "open";
            $scope.screenTitle = "Create an AG Offer";
            $scope.submit_button_content = 'Create';
            $rootScope.$emit("showOverlay", "block");
        }
        else {
            $scope.panelView = "close";
            $rootScope.$emit("showOverlay", "none");
        }
    }

};
