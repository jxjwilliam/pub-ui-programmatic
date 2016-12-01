/*global angular*/
(function (angular) {
    "use strict";

    var app = angular.module("pubApplication");

    app.controller("pubConfigScreenCtrl", [
        "$scope",
        "config",

        function ($scope, config) {
            /** Aapplication version */
            $scope.version = config.version;

            /** Build version was created at */
            $scope.buildDate = config.buildDate;

            /** Git hash */
            $scope.gitCommit = config.gitCommit;
        }
    ]);
}).call(this, angular);
