module.exports = function(grunt) {
  grunt.initConfig({
    connect: {
      server: {
        port: 8000,
        livereload: true,
        base: '.'
      }
    },
    open: {
      server: {
        path: 'http://127.0.0.1:8000'
      }
    },
    compass: {
      dist: {
        options: {
          sassDir: 'styles',
          cssDir: '.',
          imagesDir: 'img',
          noLineComments: true,
          outputStyle: 'compressed',
          environment: 'production'
        }
      },
      dev: {
        options: {
          sassDir: 'styles',
          cssDir: '.',
          imagesDir: 'img',
          outputStyle: 'nested',
          environment: 'development'
        }
      }
    },
    watch: {
      files: ['styles/{*/,}*.{scss,sass}'],
      tasks: ['compass:dev'],
      options: {
        livereload: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-open');

  grunt.registerTask('serve', ['compass:dev', 'connect:server', 'open:server', 'watch']);
  grunt.registerTask('build', ['compass:dist'])
  grunt.registerTask('default', ['serve']);
};
