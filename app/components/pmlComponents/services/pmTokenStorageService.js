/*global angular*/
(function(angular) {
    "use strict";

    angular
        .module("pmlComponents")
        .factory("pmTokenStorageService", function() {

            // The AUTH_TYPE is either "PubToken" or "Authorization"
            // The AUTH_TOKEN is the PubToken or Apigee Token used for API authentication
            // The REF_LOGIN_ORIGIN_APP is the application used to goto Analytics: "publisher" or "demand"
            // The REF_LOGIN_ORIGIN_URL is the return URL to redirect the user back
            // The REF_SIGNOUT_URL is the URL to redirect to process signout
            // The RESOURCE_ID is the Publisher ID or Buyer ID or DSP ID
            // The RESOURCE_TYPE is either "publisher", "buyer" or "dsp"
            var AUTH_TYPE = "apiAuthKey",
                AUTH_TOKEN = "apiAuthValue",
                REF_LOGIN_ORIGIN_APP = "originApp",
                REF_LOGIN_ORIGIN_URL = "originUrl",
                REF_SIGNOUT_URL = "signoutUrl",
                RESOURCE_ID = "resourceId",
                RESOURCE_TYPE = "resourceType";


            return {
                setAuthType: function setAuthType(type) {
                    sessionStorage.setItem(AUTH_TYPE, type);
                },
                setAuthToken: function setAuthToken(token) {
                    sessionStorage.setItem(AUTH_TOKEN, token);
                },
                setRefLoginOriginApp: function setRefLoginOriginApp(app) {
                    sessionStorage.setItem(REF_LOGIN_ORIGIN_APP, app);
                },
                setRefLoginOriginUrl: function setRefLoginOriginUrl(url) {
                    url = decodeURIComponent(url);
                    sessionStorage.setItem(REF_LOGIN_ORIGIN_URL, url);
                },
                setRefSignoutUrl: function setRefSignoutUrl(url) {
                    url = decodeURIComponent(url);
                    sessionStorage.setItem(REF_SIGNOUT_URL, url);
                },
                setResourceId: function setResourceId(id) {
                    sessionStorage.setItem(RESOURCE_ID, id);
                },
                setResourceType: function setResourceType(type) {
                    sessionStorage.setItem(RESOURCE_TYPE, type);
                },
                getAuthType: function getAuthType() {
                    return sessionStorage.getItem(AUTH_TYPE);
                },
                getAuthToken: function getAuthToken() {
                    return sessionStorage.getItem(AUTH_TOKEN);
                },
                getRefLoginOriginApp: function getRefLoginOriginApp() {
                    return sessionStorage.getItem(REF_LOGIN_ORIGIN_APP);
                },
                getRefLoginOriginUrl: function getRefLoginOriginUrl() {
                    return sessionStorage.getItem(REF_LOGIN_ORIGIN_URL);
                },
                getRefSignoutUrl: function getRefSignoutUrl() {
                    return sessionStorage.getItem(REF_SIGNOUT_URL);
                },
                getResourceId: function getResourceId() {
                    return sessionStorage.getItem(RESOURCE_ID);
                },
                getResourceType: function getResourceType() {
                    return sessionStorage.getItem(RESOURCE_TYPE);
                },
                getResourceTypeId: function getResourceType() {
                    if( sessionStorage.getItem(RESOURCE_TYPE) === "publisher" ){
                        return 1;
                    } else {
                        return null;
                    }
                },
                clearAllSessionStorage: function clearAllSessionStorage() {
                    sessionStorage.removeItem(AUTH_TYPE);
                    sessionStorage.removeItem(AUTH_TOKEN);
                    sessionStorage.removeItem(REF_LOGIN_ORIGIN_APP);
                    sessionStorage.removeItem(REF_LOGIN_ORIGIN_URL);
                    sessionStorage.removeItem(REF_SIGNOUT_URL);
                    sessionStorage.removeItem(RESOURCE_ID);
                    sessionStorage.removeItem(RESOURCE_TYPE);
                }
            };
        });

}).call(this, angular);
