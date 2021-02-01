/*jslint node: true */
'use strict';

module.exports = function (grunt) {

    // load all grunt tasks
    require('load-grunt-tasks')(grunt);
    require('grunt-contrib-copy')(grunt);
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
                tasks: ['concat'] //all the tasks are run dynamically during the watch event handler

            }
        },

        
        /**
         * Concat app files to bundle.js
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
                        "www/js/sprites/energyBarSprite.js",
                        "www/js/sprites/predatorSprite.js",
                        "www/js/sprites/survivorSprite.js",
                        "www/js/sprites/selectedSprite.js",
                        "www/js/sprites/buttonSprite.js",
                        "www/js/sprites/cursorSprite.js",
                        "www/js/creatures/*.js",
                        "www/js/stateManager.js"],
                dest : "www/js/bundle.js"
            }
        },

        /**
         * Copy required files to Dist
         */

         copy : {
             jsbundle : {
                expand:true, 
                cwd : "www/js",
                src : "bundle.js",
                dest: "dist/js"
             },
             jsmain : {
                expand:true, 
                cwd : "www/js",
                src : "main.js",
                dest: "dist/js"
             },
             jslib : {
                expand:true, 
                cwd : "www/js/lib",
                src : "**",
                dest: "dist/js/lib"
             },
             css : {
                 expand:true,
                 cwd:"www/css",
                 src: "**",
                 dest: "dist/css/"
             },
             img : {
                 expand :true,
                 cwd:"www/img",
                 src:"**",
                 dest:"dist/img"
             },
             base : {
                 expand : true,
                 cwd : "www",
                 src:"index.html",
                 dest:"dist"
             },
             favicon : {
                expand : true,
                cwd : "www",
                src:"favicon.ico",
                dest:"dist"
            }
         }

    });

    grunt.registerTask('serve', [ 'concat', 'connect:main','watch']);
    grunt.registerTask('publish', ['concat', 'copy']); 

};
