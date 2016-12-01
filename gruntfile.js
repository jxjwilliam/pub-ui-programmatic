// Generated on 2014-03-14 using generator-angular 0.7.1
"use strict";

// # Globbing
// for performance reasons we"re only matching one level down:
// "test/spec/{,*/}*.js"
// use this if you want to recursively match all subfolders:
// "test/spec/**/*.js"

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require("load-grunt-tasks")(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require("time-grunt")(grunt);

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        yeoman: {
            // configurable paths
            app: require("./bower.json").appPath || "app",
            dist: "dist"
        },
        express: {
            options: {
                port: process.env.PORT || 9000,
                bases: ["app", ".tmp"]
            },
            dev: {
                options: {
                    script: "server.js",
                    debug: true
                }
            },
            prod: {
                options: {
                    script: "dist/server.js",
                    "node_env": "production"
                }
            }
        },
        open: {
            server: {
                url: "http://localhost:<%= express.options.port %>"
            }
        },
        // Watches files for changes and runs tasks based on the changed files
        watch: {
            js: {
                files: ["<%= yeoman.app %>/scripts/{,*/}*.js",
                                "<%= yeoman.app %>/components/**/*.js"],
                tasks: ["jshint:all"],
                options: {
                    livereload: true
                }
            },
            jsTest: {
                //files: ["test/spec/{,*/}*.js"],
                files: ["app/components/**/*.test.js"],
                tasks: ["jshint:test", "karma"]
            },
            //compass: {
            //    files: ["<%= yeoman.app %>/styles/{,*/}*.{scss,sass}"],
            //    tasks: ["compass:server", "autoprefixer"]
            //},
            gruntfile: {
                files: ["Gruntfile.js"]
            },
            livereload: {
                options: {
                    livereload: "<%= connect.options.livereload %>"
                },
                files: [
                    "<%= yeoman.app %>/views/{,*//*}*.{html,jade}",
                    "{.tmp,<%= yeoman.app %>}/styles/{,*//*}*.css",
                    "{.tmp,<%= yeoman.app %>}/scripts/{,*//*}*.js",
                    "<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}",
                    "<%= yeoman.app %>/pub-ui-tophat/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}"
                ]
            }
        },

        // The actual grunt server settings
        connect: {
            options: {
                port: 9000,
                // Change this to "0.0.0.0" to access the server from outside.
                hostname: "localhost",
                livereload: 35729
            },
            livereload: {
                options: {
                    open: true,
                    base: [
                        ".tmp",
                        "<%= yeoman.app %>"
                    ]
                }
            },
            test: {
                options: {
                    port: 9001,
                    base: [
                        ".tmp",
                        "test",
                        "<%= yeoman.app %>"
                    ]
                }
            },
            dist: {
                options: {
                    base: "<%= yeoman.dist %>"
                }
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: ".jshintrc",
                reporter: require("jshint-stylish")
            },
            all: [
                "Gruntfile.js",
                "<%= yeoman.app %>/scripts/{,*/}*.js",
                "<%= yeoman.app %>/components/**/*.js"
            ],
            test: {
                options: {
                    jshintrc: ".jshintrc"
                },
                src: ["test/spec/{,*/}*.js"]
            }
        },

        ngdocs: {
            options: {
                //title: "PubMatic Markup Language",
                title: "",
                api: true,
                scripts: ["angular.js"],
                html5Mode: false
            },
            tags: {
                src: ["app/components/pmlComponents/elements/**/*.js"],
                title: "HTML Components"
            },
            templates: {
                src: ["app/components/pmlComponents/pageTemplates/**/*.js"],
                title: "Page Templates"
            }
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        ".tmp",
                        "<%= yeoman.dist %>/*",
                        "!<%= yeoman.dist %>/.git*"
                    ]
                }]
            },
            server: ".tmp"
        },

        // Add vendor prefixed styles
        autoprefixer: {
            options: {
                browsers: ["last 1 version"]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: ".tmp/styles/",
                    src: "{,*/}*.css",
                    dest: ".tmp/styles/"
                }]
            }
        },

        // Automatically inject Bower components into the app
        "bower-install": {
            app: {
                html: "<%= yeoman.app %>/index.html",
                ignorePath: "<%= yeoman.app %>/"
            }
        },

        // Renames files for browser caching purposes
        rev: {
            dist: {
                files: {
                    src: [
                        "<%= yeoman.dist %>/scripts/{,*/}*.js",
                        "<%= yeoman.dist %>/components/**/*.js",
                        //"<%= yeoman.dist %>/styles/{,*/}*.css",
                        //-- COMMENTED OUT as workaround:  https://stackoverflow.com/questions/21932451/assets-missing-in-angular-application-built-using-grunt
                        //"<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}",
                        "<%= yeoman.dist %>/styles/fonts/*"
                    ]
                }
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            html: "<%= yeoman.app %>/index.html",
            options: {
                dest: "<%= yeoman.dist %>"
            }
        },

        // Performs rewrites based on rev and the useminPrepare configuration
        usemin: {
            html: ["<%= yeoman.dist %>/{,*/}*.html"],
            css: ["<%= yeoman.dist %>/styles/{,*/}*.css"],
            options: {
                assetsDirs: ["<%= yeoman.dist %>"]
            }
        },

        // The following *-min tasks produce minified files in the dist folder
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: "<%= yeoman.app %>/images",
                    src: "{,*/}*.{png,jpg,jpeg,gif}",
                    dest: "<%= yeoman.dist %>/images"
                }]
            }
        },
        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: "<%= yeoman.app %>/images",
                    src: "{,*/}*.svg",
                    dest: "<%= yeoman.dist %>/images"
                }]
            }
        },
        htmlmin: {
            dist: {
                options: {
                    collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeCommentsFromCDATA: true,
                    removeOptionalTags: true
                },
                files: [{
                    expand: true,
                    cwd: "<%= yeoman.dist %>",
                    src: ["*.html", "views/{,*/}*.html", "components/**/*.html"],
                    dest: "<%= yeoman.dist %>"
                }]
            }
        },

        // Allow the use of non-minsafe AngularJS files. Automatically makes it
        // minsafe compatible so Uglify does not destroy the ng references
        ngmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: ".tmp/concat/scripts",
                    src: "*.js",
                    dest: ".tmp/concat/scripts"
                }]
            }
        },

        // Replace Google CDN references
        cdnify: {
            dist: {
                html: ["<%= yeoman.dist %>/*.html"]
            }
        },

        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: "<%= yeoman.app %>",
                    dest: "<%= yeoman.dist %>",
                    src: [
                        "*.{ico,png,txt}",
                        ".htaccess",
                        "*.html",
                        "views/{,*/}*.html",
                        "components/**/*.html",
                        "bower_components/**/*",
                        "pub-ui-tophat/**/*",
                        "REST/**/*",
                        "images/{,*/}*.{webp}",
                        "fonts/*"
                    ]
                }, {
                    expand: true,
                    cwd: ".tmp/images",
                    dest: "<%= yeoman.dist %>/images",
                    src: ["generated/*"]
                }, {
                    expand: true,
                    dest: "<%= yeoman.dist %>",
                    src: [
                        "package.json",
                        "server.js",
                        "lib/**/*",
                        "login/*",
                        "docs/**/*"
                    ]
                }]
            },
            styles: {
                expand: true,
                cwd: "<%= yeoman.app %>/styles",
                dest: ".tmp/styles/",
                src: "{,*/}*.css"
            }
        },

        // Run some tasks in parallel to speed up the build process
        concurrent: {
            server: [
                //"compass:server"
            ],
            test: [
                //"compass"
            ],
            dist: [
                //"compass:dist",
                "imagemin",
                "svgmin"
            ]
        },

        // Test settings
        karma: {
            unit: {
                configFile: "karma.conf.js",
                singleRun: true,
                browsers: ["PhantomJS"]
            }
        },
   
        shell: {
            installBundler: {
                options: {
                    stdout: true
                },
                command: "gem install bundler --no-ri --no-rdoc;"
            },

            installGems: {
                options: {
                    stdout: true
                },
                command: "bundler install;"
            }
        }
    });

    grunt.registerTask("express-keepalive", "Keep grunt running", function() {
        this.async();
    });

    grunt.registerTask("serve", function (target) {
        if (target === "dist") {
            return grunt.task.run(["build", "express:prod", "open", "express-keepalive"]);
        }

        grunt.task.run([
            "clean:server",
            "concurrent:server",
            "autoprefixer",
            "express:dev",
            "open",
            "watch"
        ]);

    });

    grunt.registerTask("test", [
        "clean:server",
        "concurrent:test",
        "autoprefixer",
        "connect:test",
        "karma"
    ]);

    grunt.registerTask("build", [
        "clean:dist",
        "useminPrepare",
        "concurrent:dist",
        "autoprefixer",
        "concat",
        "ngmin",
        "ngdocs",
        "copy:dist",
        "cdnify",
        //"cssmin",
        "uglify",
        "rev",
        "usemin",
        "htmlmin"
    ]);

    grunt.registerTask("default", [
        "jshint",
        "test",
        "build"
    ]);

    grunt.loadNpmTasks("grunt-karma");
};
