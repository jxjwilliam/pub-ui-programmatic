/*global describe, it, beforeEach, expect, inject*/
/*jshint expr: true */
(function () {
    "use strict";

    describe("Controller: pubApplicationCtrl", function () {

        beforeEach(module("pubApplication"));

        beforeEach(inject(function ($rootScope, $controller) {
            this.$scope = $rootScope.$new();
            this.controller = $controller("pubApplicationCtrl", {
                $scope: this.$scope
            });
        }));

        it("should exist", function () {
            expect(this.controller).to.exist;
            expect(this.controller).to.be.an("object");
        });
        /*

        describe("scope", function () {

            it("should exist", function () {
                expect(this.$scope).to.exist;
                expect(this.$scope).to.be.an("object");
            });

            describe("pubsearch", function () {

                it.skip("should exist", function () {
                    expect(this.$scope.pubsearch).to.exist;
                });

                it.skip("should be a string", function () {
                    expect(this.$scope.pubsearch).to.be.a("string");
                });

                it.skip("should empty by default", function () {
                    expect(this.$scope.pubsearch).to.equal("");
                });

            });

            describe("sidebarwidth", function () {

                it("should exist", function () {
                    expect(this.$scope.sidebarwidth).to.exist;
                });

                it("should be a number", function () {
                    expect(this.$scope.sidebarwidth).to.be.a("number");
                });

                it("should be equal 250", function () {
                    expect(this.$scope.sidebarwidth).to.equal(250);
                });

            });

            describe("bodywidth", function () {

                it("should exist", function () {
                    expect(this.$scope.bodywidth).to.exist;
                });

                it("should be a number", function () {
                    expect(this.$scope.bodywidth).to.be.a("number");
                });

            });

            describe("slidesidebar", function () {

                it("should exist", function () {
                    expect(this.$scope.slidesidebar).to.exist;
                });

                it("should be a function", function () {
                    expect(this.$scope.slidesidebar).to.be.a("function");
                });

            });

        });*/

    });
}).call(this);
