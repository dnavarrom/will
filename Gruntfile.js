/*jslint node: true */
'use strict';

module.exports = function (grunt) {

    // load all grunt tasks
    require('load-grunt-tasks')(grunt);
    require('grunt-contrib-concat')(grunt);
    
    // Project configuration.
    grunt.initConfig({

        /**
         * Runs a webserver on http://localhost:9000.
         * It will be accessible on the local network by people who know the IP.
         */
        connect: {
            main: {
                options: {
                    base: 'www',
                    hostname: '*',
                    port: 9000,
                    livereload: true
                }
            }
        },

        /**
         * Watch for changes to files and automatically reload the page.
         */
        watch: {
            main: {
                options: {
                    livereload: true,
                    livereloadOnError: false,
                    spawn: false
                },
                files: ['www/*.html', 'www/js/**/*','www/**/*.html', 'www/img/*', 'less/**/*.less', 'less/*.less'],
                tasks: ['less','concat'] //all the tasks are run dynamically during the watch event handler

            }
        },

        /**
         * Compile LESS to CSS.
         */
        less: {
            production: {
                options: {},
                files: {
                    'www/css/main.css': 'less/main.less'
                }
            }
        },

        /**
         * Concat app files to bundle.js folder
         */
        concat : {
            bundler : {
                src : [ "www/js/utils/*.js",
                        "www/js/scenes/*.js",
                        "www/js/ga/*.js",
                        "www/js/factory/*.js",
                        "www/js/config.js",
                        "www/js/constants.js",
                        "www/js/sprites/customSprite.js",
                        "www/js/sprites/foodSprite.js",
                        "www/js/sprites/predatorSprite.js",
                        "www/js/sprites/survivorSprite.js",
                        "www/js/creatures/*.js",
                        "www/js/stateManager.js"],
                dest : "www/js/bundle.js"
            }
        }

    });

    grunt.registerTask('serve', ['connect:main', 'concat', 'watch']);

};
