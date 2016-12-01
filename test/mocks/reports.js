(function (angular) {
    "use strict";

    //var app = angular.module("pubSlicerDataService");
    var app = angular.module("pubApplication");

    app.value("reportsMock", [
        {
            "groups": [
                "Favorites"
            ],
            "value": "Nike Revenue Report",
            "link": "#/slice/advertiser=nike,site?chartType=barchart&reportTitle=Nike%20Revenue%20Report"
        },
        {
            "groups": [
                "Favorites"
            ],
            "value": "Show me the Money! (Commission basis)",
            "link": "#/slice/advertiser=nike,site?chartType=areachart&reportTitle=Show me the Money! (Commission basis)"
        },
        {
            "groups": [
                "Favorites"
            ],
            "value": "Reebok  Report",
            "link": "#/slice/advertiser=nike,site?chartType=heatmap&reportTitle=Reebok  Report"
        },
        {
            "groups": [
                "Favorites"
            ],
            "value": "eCPM Alerts",
            "link": "#/slice/advertiser=nike,site?chartType=barchart&reportTitle=eCPM Alerts"
        },
        {
            "groups": [
                "Canned Reports"
            ],
            "value": "Demand Insights Daily",
            "link": "#/slice/advertiser=nike,site?chartType=barchart&reportTitle=Demand Insights Daily"
        },
        {
            "groups": [
                "Canned Reports"
            ],
            "value": "Demand Sources",
            "link": "#/slice/advertiser=nike,site?chartType=barchart&reportTitle=Demand Sources"
        },
        {
            "groups": [
                "Canned Reports"
            ],
            "value": "Ad Tags",
            "link": "#/slice/advertiser=nike,site?chartType=barchart&reportTitle=Ad Tags"
        },
        {
            "groups": [
                "Canned Reports"
            ],
            "value": "Detailed Demand Insights",
            "link": "#/slice/advertiser=nike,site?chartType=areachart&reportTitle=Detailed%Demand%Insights"
        },
        {
            "groups": [
                "Canned Reports"
            ],
            "value": "RTB Advertiser Insights",
            "link": "#/slice/advertiser=nike,site?chartType=areachart&reportTitle=RTB%Advertiser%Insights"
        },
        {
            "groups": [
                "Canned Reports"
            ],
            "value": "Fill Report",
            "link": "#/slice/advertiser=nike,site?chartType=areachart&reportTitle=Fill Report"
        },
        {
            "groups": [
                "Canned Reports"
            ],
            "value": "Marketplace Deals",
            "link": "#/slice/advertiser=nike,site?chartType=barchart&reportTitle=Marketplace Deals"
        },
        {
            "groups": [
                "Canned Reports"
            ],
            "value": "Win/Loss Report",
            "link": "#/slice/advertiser=nike,site?chartType=areachart&reportTitle=Win/Loss Report"
        },
        {
            "groups": [
                "Canned Reports"
            ],
            "value": "Campaign Performance",
            "link": "#/slice/advertiser=nike,site?chartType=areachart&reportTitle=Campaign Performance"
        },
        {
            "groups": [
                "Canned Reports"
            ],
            "value": "Marketplace Summary",
            "link": "#/slice/advertiser=nike,site?chartType=areachart&reportTitle=Marketplace Summary"
        }
    ]);

}).call(this, angular);
