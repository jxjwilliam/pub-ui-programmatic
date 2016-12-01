/*global angular*/
(function (angular) {
    "use strict";

    var app;

    app = angular.module("pubApplication");

    /**
     * Set up $httpBackend mock for all unit testings
     */
    app.run([
        "$httpBackend",
        //"middlewareRoutes",
        "analyticMock",
        "reportsMock",

        function ($httpBackend, middlewareRoutes, analyticMock, reportsMock) {
            $httpBackend.whenGET(middlewareRoutes.reports).respond(reportsMock);
            $httpBackend.whenGET(middlewareRoutes.analytic).respond(analyticMock);
        }
    ]);

}).call(this, angular);
