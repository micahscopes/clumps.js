/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    concat: {
      dist: {
        src: ['bower_components/underscore/underscore.js','src/*.js'],
        dest: 'dist/clumps.js'
      }
    },
    uglify: {
      dist: {
        src: ['dist/clumps.js'],
        dest: 'dist/clumps.min.js'
      }
     }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task.
  grunt.registerTask('default', ['concat', 'uglify']);

};
