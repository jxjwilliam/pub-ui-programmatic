// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function (config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: '',

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ['mocha', 'chai', 'sinon'],

        reporters: ['spec'],


        // generate js files from html templates+
        preprocessors: {'app/components/**/*.html': 'ng-html2js'},

        // needed if you have used the Yeoman's generator-angular or the app dir
        ngHtml2JsPreprocessor: {
            stripPrefix: 'app/'
        },


        // list of files / patterns to load in the browser
        files: [
            // application files
            "app/bower_components/angular/angular.js",
            "app/bower_components/angular-mocks/angular-mocks.js",
            "app/bower_components/angular-resource/angular-resource.js",
            "app/bower_components/angular-route/angular-route.js",
            "app/bower_components/angular-animate/angular-animate.min.js",
            "app/bower_components/angular-strap/dist/angular-strap.js",
            "app/bower_components/angular-strap/dist/angular-strap.tpl.js",
            "app/bower_components/angular-foundation/mm-foundation-tpls.js",
            "app/bower_components/moment/moment.js",
            "app/bower_components/fastclick/lib/fastclick.js",
            "app/bower_components/isteven-angular-multiselect/angular-multi-select.js",
            "app/bower_components/angular-sanitize/angular-sanitize.min.js",
            "app/bower_components/ng-tags-input/ng-tags-input.min.js",
            "app/bower_components/ng-range-slider/dist/ng-range-slider.min.js",
            "app/bower_components/jquery/dist/jquery.min.js",
            "app/bower_components/bootstrap/dist/js/bootstrap.min.js",

            "app/components/idComponents/pmIdAgOfferCreateForm/pmIdAgOfferCreateForm-share.js",
            "app/components/idComponents/pmIdOfferChoiceForm/pmIdOfferChoiceForm-share.js",
      
            // TODO: uncomment when tests are created
            //"app/components/config.js",
            "app/components/app.js",
            //"components/app-controller.js",
            //"components/router.js",

            "app/components/pmlComponents/pmlComponent-module.js",
            "app/components/pmlComponents/**/*.js",
            "app/components/idComponents/**/*.js",
            "app/components/app.js",

            "app/components/**/*.js",
            "app/config/*.js",

            // test libs
            "test/lib/jquery-2.1.1.js",
            "test/lib/ngMidwayTester.js",
            "test/lib/fn-bind.js",

            // html
            "app/components/**/*.html",

            // test files
            "test/mocks/**/*.js",
            //"test/spec/run.test.js",
            "app/components/**/*.test.js",
            "test/spec/**/*.js",
            //"app/config/**/*.test.js"
        ],

        // list of files / patterns to exclude
        exclude: [],

        // web server port
        port: 9080,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        //browsers: ['Chrome'],
        // browsers: ['PhantomJS'],

        captureTimeout: 6000,


        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false
    });
};
