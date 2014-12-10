"use strict";

var mozjpeg = require('imagemin-mozjpeg');

module.exports = function( grunt ) {

  // Load all tasks
  require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

  grunt.initConfig({

      // Imagemin
     imagemin: {
          dynamic: {
              options: {
                  optimizationLevel: 3,
                  use: [mozjpeg()]
              },
              files: [{
                  expand: true,
                  cwd: 'www/img',
                  src: ['**/*.{png,jpg,gif}'],
                  dest: 'www/img'
              }]
          }
    },

    // Watch
    watch: {
      css: {
        files: [ 'assets/sass/**/*' ],
        tasks: [ 'compass' ]
      },
      js: {
        files: 'js-src/**/*',
        tasks: [ 'uglify' ]
      },
      jpg: {
          files: 'www/img/**/*',
          tasks: [ 'imagemin' ]
      },
      png: {
          files: 'www/img/**/*',
          tasks: [ 'imagemin' ]
      },
      gif: {
            files: 'www/img/**/*',
            tasks: [ 'imagemin' ]
      }
    },

    // Compile scss
    compass: {
      dist: {
        options: {
          force: true,
          config: 'config.rb',
          outputStyle: 'compressed'
        }
      }
    },

    // Concat and minify javascripts
    uglify: {
      options: {
        mangle: false,
        beautify: false
      },
      dist: {
        files: [{
            expand: true,
            cwd: 'js-src',
            src: '**/*.js',
            dest: 'www/js'
        }]
      }
    },

    // FTP deployment
    'ftp-deploy': {
      build: {
        auth: {
          host: 'ftp.deon.com.br',
          port: 21,
          authKey: 'key1'
        },
        src: '/',
        dest: '/',
        exclusions: [
          '/Applications/XAMPP/xamppfiles/htdocs/aroma/.DS_Store',
          '/Applications/XAMPP/xamppfiles/htdocs/aroma/Thumbs.db',
          '/Applications/XAMPP/xamppfiles/htdocs/aroma/.git',
          '/Applications/XAMPP/xamppfiles/htdocs/aroma/.gitignore',
          '/Applications/XAMPP/xamppfiles/htdocs/aroma/README.md',
          '/Applications/XAMPP/xamppfiles/htdocs/aroma/app/src'
        ]
      }
    }

  });

  // registrando tarefa default
  grunt.registerTask( 'default', [ 'watch' ] );

  // registrando tarefa para deploy
  grunt.registerTask( 'deploy', [ 'ftp-deploy' ] );

};

