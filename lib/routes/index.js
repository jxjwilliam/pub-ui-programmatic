"use strict";

exports.analyticsApi = require("./analyticsApi").index;
//exports.inventoryDoc = require("./inventoryDoc").index;
exports.inventoryApi = require("./inventoryApi").index;
exports.inventoryApiPost = require("./inventoryApiPost").index;
exports.inventoryApiPut = require("./inventoryApiPut").index;
//exports.audienceDoc = require("./audienceDoc").index;
exports.audienceApi = require("./audienceApi").index;
//exports.brandcontrolDoc = require("./brandcontrolDoc").index;
exports.brandcontrolApi = require("./brandcontrolApi").index;
//exports.commonDoc = require("./commonDoc").index;
exports.commonApi = require("./commonApi").index;
exports.programmaticApi = require("./programmaticApi").index;
//exports.castrumDoc = require("./castrumDoc").index;

// Routes for orders
exports.ordersApi = require("./ordersApi").index;
exports.lineItemsApi = require("./lineItemsApi").index;

// William for AMG-306:
var castrumApi = require("./castrumApi");
exports.castrumApi = castrumApi.index;
exports.userFeaturesMap = castrumApi.userFeaturesMap;
exports.userFeaturesList = castrumApi.userFeaturesList;

//AG: William: put all callbacks into a single file.
var agOffers = require("./agOffersApi");
exports.agOffersAdd = agOffers.index;
exports.agOffersQuery = agOffers.findOne;
exports.agOffersAll = agOffers.findAll;
exports.agOffersEdit = agOffers.edit;
exports.agOffersUpdate = agOffers.update;
exports.agOffersDelete = agOffers.remove;

// All Offer:
exports.getAllOffers = require("./allOffersApi").index;

// AG-307:
var moMappings = require("./mediaOceanHubApi");

exports.moMappingsAdSizes = moMappings.adSizes;
exports.moMappingsPositions = moMappings.positions;
exports.moMappingsCategories = moMappings.categories;
exports.moMappingsOrderMappings = moMappings.orderMappings;
exports.moGapUrlMappings = moMappings.moGapUrlMappings;

exports.moMappingsCombined = moMappings.combined;
exports.moMappingsSelected = moMappings.selected;
