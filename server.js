"use strict";

/** Module dependencies. */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var http = require("http");
var express = require("express");
var app = module.exports = express();
var routes = require('./lib/routes');
var config = require('./lib/config')(app);
var request=require("request");
app.use(express.bodyParser());

// Inventory API & Doc
app.all("/api/analytics/*", routes.analyticsApi);
app.post("/api/inventory/*", routes.inventoryApiPost);
app.put("/api/inventory/*", routes.inventoryApiPut);
app.all("/api/inventory/*", routes.inventoryApi);
app.all("/api/audience/*", routes.audienceApi);
app.all("/api/brandcontrol/*", routes.brandcontrolApi);
app.all("/api/common/*", routes.commonApi);
app.all("/api/castrum/*", routes.castrumApi);

//AG: orders
app.all('/api/orders/*', routes.ordersApi);
app.all('/api/lineItems/*', routes.lineItemsApi);

//AG: routes/index.js, routes/agOffersApi.js
app.post("/api/agoffers", routes.agOffersAdd);
app.put("/api/agoffers", routes.agOffersUpdate);
app.put("/api/agoffers/:id", routes.agOffersEdit);
app.delete("/api/agoffers/:id", routes.agOffersDelete);

app.all("/api/alloffers", routes.getAllOffers);

app.get("/api/agoffers", routes.agOffersAll);

app.get("/api/agoffers/:id", routes.agOffersQuery);

// Run Server
http.createServer(app).listen(app.get("port"), function () {
    console.log("Node.js Listening on port: " + app.get("port"));
});

process.on("uncaughtException", function (err) {
    console.log("/api/agoffers?:", err);
    if (err.code && err.code === "ECONNREFUSED") {
        console.log("--- uncaughtException: agoffers ---");
    }
    else {
        console.log("--- uncaughtException: combined ---");
    }
});


//MediaOceanHub mappings API
app.get("/api/mediaOcean/mappings/adSizes", routes.moMappingsAdSizes);
app.get("/api/mediaOcean/mappings/positions", routes.moMappingsPositions);
app.get("/api/mediaOcean/mappings/categories", routes.moMappingsCategories);
app.get("/api/mediaOcean/mappings/orderMappings", routes.moMappingsOrderMappings);
app.get("/api/moGapUrl", routes.moGapUrlMappings);

app.get("/api/mediaOcean/mappings/combined", routes.moMappingsCombined);

app.post("/api/mediaOcean/mappings/selected", routes.moMappingsSelected);
