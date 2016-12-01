/**
 * Module dependencies.
 * tarique rehman
 */
var request = require('request');

//BASE_URL = "http://54.164.157.178:9090/ag-api/alloffers";

exports.index = function (req, res) {
    
    var config = req.app.get("config");
    var ag_env = req.app.get("env");

    var ordersUrl = 'http://' +
        config[ag_env].ag_server +
        config[ag_env].lineitems.api;

    var ownerId = req.headers.resourceid || req.headers.common.resourceId || 41809;
    var pageNumber = req.query.pageNumber || 1, pageSize = req.query.pageSize || 20;

    //var url = BASE_URL; //+ '?ownerId=' + ownerId + '&ownerTypeId=1&pageNumber=' + pageNumber + '&pageSize=' + pageSize;

    console.log('all lineitems query: ', ordersUrl + req.url.replace("/api/lineitems",""));
    request({
        url: ordersUrl + req.url.replace("/api/lineitems",""),
        headers: req.headers
    }).pipe(res);

}


/**
 * Redirect requests to middleware.  this is to be changed when we have centralized docs on apigee.
 */
 /*
exports.index = function(req, res) {
    var lineItems = {
    	"items": [
    	{
			 "id":1,
			 "name": " Line item 1",
			 "description":"some description",
			 "product":"Homepage Leaderboard",
			 "totalValue":"$5,000.00",
			 "status":"Pending",
			 "agency":"Mediaocean",
			 "advertiser":"Dunder Mifflin",
			 "startDate":"1/28/2015",
			 "endDate":"2/17/2015"
		},
    	{
			 "id":12,
			 "name": "Line item 2",
			 "description":"World",
			 "product":"Homepage Leaderboard",
			 "totalValue":"$15,000.00",
			 "status":"Pending",
			 "agency":"Vivaki",
			 "advertiser":"BMW",
			 "startDate":"3/10/2015",
			 "endDate":"3/15/2015"
		},
   		{
			 "id":3,
			 "name": "Line item 3",
			 "description":"Ebay banner 1",
			 "product":"Homepage Leaderboard",
			 "totalValue":"$23,985.00",
			 "status":"Approved",
			 "agency":"Digitas",
			 "advertiser":"Toys R Us",
			 "startDate":"2/1/2015",
			 "endDate":"2/25/2015"
		},
   		{
			 "id":4,
			 "name": "Line item 4",
			 "description":"Test banner run",
			 "product":"Homepage Leaderboard",
			 "totalValue":"$23,985.00",
			 "status":"Approved",
			 "agency":"Digitas Health",
			 "advertiser":"BMS",
			 "startDate":"4/12/2015",
			 "endDate":"4/17/2015"
		},
   		{
			 "id":5,
			 "name": "Line item 5",
			 "description":"Espn first banner 250x250",
			 "product":"Homepage Leaderboard",
			 "totalValue":"$35,000.00",
			 "status":"Approved",
			 "agency":"Huge",
			 "advertiser":"Target",
			 "startDate":"2/3/2015",
			 "endDate":"2/10/2015"
		},
		],
		"metaData": {
			"endIndex": 5,
			"request": {
				"dimensions": null,
				"filters": ["name like **"],
				"fromDate": "2010-01-02",
				"metrics": null,
				"pageNumber": 1,
				"pageSize": 10,
				"sort": "-modificationTime",
				"toDate": "2099-01-01",
				"tz": null,
				"useAllDimensions": true
			},
			"totalRecords": 5,
			"startEndex": 1
		}
    };
    res.send(lineItems)
};
*/
