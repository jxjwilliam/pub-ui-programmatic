/*jshint unused:false*/
"use strict";
//  Angular "service recipe"  More on providers here: http://docs.angularjs.org/guide/providers

var pmlComponents = angular.module("pmlComponents");

pmlComponents.service("pmSharedObjectService",
    function () {
        var _sharedObject = {
            item: {}
        };
        return {
            setSharedObject: function(sharedObject) {
                _sharedObject.item = sharedObject;
            },
            getSharedObject: function() {
                return _sharedObject.item;
            }
        };
    }
);
