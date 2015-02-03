module.exports = function(grunt) {
  grunt.initConfig({
    compass: {
      dist: {
        options: {
          sassDir: 'styles',
          cssDir: '.',
          noLineComments: true,
          outputStyle: 'compressed',
          environment: 'production'
        }
      },
      dev: {
        options: {
          sassDir: 'styles',
          cssDir: '.',
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

  grunt.registerTask('serve', ['compass:dev', 'watch']);
  grunt.registerTask('build', ['compass:dist'])
  grunt.registerTask('default', ['serve']);
};
