/*jshint unused:false*/
"use strict";

/**
 *
 * @ngdoc directive
 * @name pmApplicationPage
 * @restrict E
 * @description Add a simple page to a PubMatic UI Application using a single HTML tag
 *
 * @param {string} title Main title
 * @param {string} subtitle Page subtitle
 * @param {string} description Page description
 *
 * @example Generate a brand new Inventory Discovery page with 2 HTML tags
 <pre>
     <pm-application-page
         title="My First Page"
         sub-title="Subtitle for my first page"
         description="This is a simple page I created using a single HTML tag.">

         My Page Content Here!

     </pm-application-page>
 </pre>
 *
 */
var pmlComponents = angular.module("pmlComponents");

pmlComponents.directive("pmApplicationPage", [
        function() {
            return {
                templateUrl:"components/pmlComponents/pageTemplates/pmApplicationPage/pmApplicationPage-directive.html",
                restrict: "E",
                transclude: true,
                scope: {
                    title:        "@pageTitle",
                    subtitle:     "@subtitle",
                    description:  "@description"
                }
            };
        }
    ]
);
