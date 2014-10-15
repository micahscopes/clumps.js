/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    concat: {
      dist: {
        src: ['bower_components/underscore/underscore.js','src/*.js'],
        dest: 'clumps.js'
      }
    },
    uglify: {
      dist: {
        src: ['clumps.js'],
        dest: 'clumps.min.js'
      }
     }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task.
  grunt.registerTask('default', ['concat', 'uglify']);

};
