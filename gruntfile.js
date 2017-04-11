module.exports = function (grunt) {

  grunt.initConfig({
    browserify: {
      client: {
        src: ['src/**.js'],
        dest: 'dist/m4n.js',
        options: {
          transform: ['babelify']
        }
      }
    },

    watch: {
      javascript: {
        tasks: ['default'],
        files: ['src/**.js']
      },
    },

    jshint: {
      beforeconcat: ['gruntfile.js', 'src/**.js'],
      options: {
        esversion: 6
      }
    },

    uglify: {
      options: {
        report: 'gzip'
      },
      default: {
        files: {
          'dist/m4n.min.js': ['dist/m4n.js']
        }
      }
    },

    clean: [
      'dist/*'
    ],

    env: {
      prod: {
        NODE_ENV : 'production',
        BABEL_ENV : 'production'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerTask('default', ['clean', 'jshint', 'browserify']);
  grunt.registerTask('production', ['env:prod', 'clean', 'jshint', 'browserify', 'uglify']);
};