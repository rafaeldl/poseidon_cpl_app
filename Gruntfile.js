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
                  cwd: 'assets/img',
                  src: ['**/*.{png,jpg,gif}'],
                  dest: 'assets/img'
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
        files: 'assets/js-src/**/*',
        tasks: [ 'uglify' ]
      },
      jpg: {
          files: 'assets/img/**/*',
          tasks: [ 'imagemin' ]
      },
      png: {
          files: 'assets/img/**/*',
          tasks: [ 'imagemin' ]
      },
      gif: {
            files: 'assets/img/**/*',
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
        mangle: false
      },
      dist: {
        files: [{
            expand: true,
            cwd: 'assets/js-src',
            src: '**/*.js',
            dest: 'assets/js'
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
        src: '/Applications/XAMPP/xamppfiles/htdocs/aroma/',
        dest: '/public_html/aroma/',
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

