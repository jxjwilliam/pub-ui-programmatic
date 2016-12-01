"use strict";

var amg = angular.module("pmlComponents.pmIdAgOfferCreate",
    ["pmlComponents.pmIdOffersChoice", "ngTagsInput"]);

/**
 * the configuration for generic usage should be here.
 */
amg.config(function () {
    //console.log("ag config is starting.");
});

//TODO: reminding messages should be in a center-configurable place to maintain.
amg.value("AGCreateURL", "http://localhost:9000/api/agoffers");

/**
 * one-time run: bootstrap.
 */
amg.run(function () {
    //console.log("ag.run is running");
});