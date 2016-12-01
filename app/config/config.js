/*global angular*/
(function (angular) {

    var app;

    app = angular.module("pubApplicationConfig", []);

    // Values in "{{{}}}" are replaced by the build process
    app.value("config", {
        // Application version
        version: "0.1.{{{BUILD_NUMBER}}}",
        // Build Date
        buildDate: "{{{BUILD_DATE}}}",
        // Git Commit SHA-1
        gitCommit: "{{{GIT-COMMIT_SHA}}}",
        // Middleware version
        middlewareVersion: "v1",
        // Middleware prefix
        middlewarePrefix: "" // api
    });

}).call(this, angular);