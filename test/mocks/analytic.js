(function (angular) {
    "use strict";

    //var app = angular.module("pubSlicerDataService");
    var app = angular.module("pubApplication");

    app.value("analyticMock", {
        "publisherList": [
            31445
        ],
        "dspList": [
            111,
            222
        ],
        "timezone": "MDT7MST",
        "currency": "USD",
        "realtimeConfiguration": {
            "dimensions": [
                {
                    "apiName": "Site",
                    "displayValue": "Site"
                },
                {
                    "apiName": "Platform",
                    "displayValue": "Platform"
                },
                {
                    "apiName": "Category",
                    "displayValue": "Category"
                },
                {
                    "apiName": "DSP",
                    "displayValue": "DSP"
                },
                {
                    "apiName": "ATD",
                    "displayValue": "ATD"
                },
                {
                    "apiName": "Advertiser",
                    "displayValue": "Advertiser"
                },
                {
                    "apiName": "Rule",
                    "displayValue": "Rule"
                },
                {
                    "apiName": "Campaign",
                    "displayValue": "Campaign"
                }
            ],
            "metrics": [
                {
                    "apiName": "Revenue",
                    "displayValue": "buyer",
                    "type": "pubCurrency",
                    "decimal": 0,
                    "comma": true
                },
                {
                    "apiName": "Impressions",
                    "displayValue": "campaign",
                    "type": "pubNumber",
                    "decimal": 0,
                    "comma": true
                },
                {
                    "apiName": "eCPM",
                    "displayValue": "ecpm",
                    "type": "pubCurrency",
                    "decimal": 2,
                    "comma": true
                },
                {
                    "apiName": "Bids",
                    "displayValue": "bids",
                    "type": "pubNumber",
                    "decimal": 0,
                    "comma": true
                },
                {
                    "apiName": "Fill Rate",
                    "displayValue": "fill",
                    "type": "pubPercentage",
                    "decimal": 0,
                    "comma": false
                }
            ]
        },
        "historicConfiguration": {
            "dimensions": [
                {
                    "apiName": "Site",
                    "displayValue": "Site"
                },
                {
                    "apiName": "Platform",
                    "displayValue": "Platform"
                },
                {
                    "apiName": "Category",
                    "displayValue": "Category"
                },
                {
                    "apiName": "DSP",
                    "displayValue": "DSP"
                },
                {
                    "apiName": "ATD",
                    "displayValue": "ATD"
                },
                {
                    "apiName": "Advertiser",
                    "displayValue": "Advertiser"
                },
                {
                    "apiName": "Rule",
                    "displayValue": "Rule"
                },
                {
                    "apiName": "Campaign",
                    "displayValue": "Campaign"
                }
            ],
            "metrics": [
                {
                    "apiName": "Revenue",
                    "displayValue": "buyer",
                    "type": "pubCurrency",
                    "decimal": 0,
                    "comma": true
                },
                {
                    "apiName": "Impressions",
                    "displayValue": "campaign",
                    "type": "pubNumber",
                    "decimal": 0,
                    "comma": true
                },
                {
                    "apiName": "eCPM",
                    "displayValue": "ecpm",
                    "type": "pubCurrency",
                    "decimal": 2,
                    "comma": true
                },
                {
                    "apiName": "Bids",
                    "displayValue": "bids",
                    "type": "pubNumber",
                    "decimal": 0,
                    "comma": true
                },
                {
                    "apiName": "Fill Rate",
                    "displayValue": "fill",
                    "type": "pubPercentage",
                    "decimal": 0,
                    "comma": false
                }
            ]
        }
    });

}).call(this, angular);
