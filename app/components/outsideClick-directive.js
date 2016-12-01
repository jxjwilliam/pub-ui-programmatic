/*jshint unused:false*/
"use strict";
var app = angular.module( "multi-select");

app.directive("outsideClick", ["$document","$parse", function( $document, $parse ){
    return {
        link: function( $scope, $element, $attributes ){
            var scopeExpression = $attributes.outsideClick,
                onDocumentClick = function(event){

                    /*jshint jquery:true */
                    var isChild = $($element).find(event.target).length > 0;

                    if(!isChild) {
                        if ($scope.isOpen) {
                            $scope.$apply(scopeExpression);
                            $scope.isOpen = false;
                        }
                    } else {
                        $scope.isOpen = true;
                    }
                };

            $document.on("click", onDocumentClick);

            $element.on("$destroy", function() {
                $document.off("click", onDocumentClick);
            });
        }
    };
}]);