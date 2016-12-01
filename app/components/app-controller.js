/*global angular*/
(function (angular) {
    "use strict";

    var app = angular.module("pubApplication");

    app.controller("pubApplicationCtrl", ["$scope",

        function ($scope) {
            //console.log("the controller");
            $scope.loaded=true;
        }

    ]);
    
}).call(this, angular);
