module.exports = (grunt) ->
  grunt.initConfig
    clean:
      build: ["build"]

    coffee:
      development:
        expand: true
        src:  "**/*.coffee"
        cwd:  "app/scripts"
        dest: "build/js"
        ext:  ".js"

    connect:
      server:
        options:
          port: 8888
          base: 'build'
          livereload: true
          open: true

    copy:
      development:
        files: [
          src: "app/index.html"
          dest: "build/index.html"
        ,
          src: "bower_components/d3/d3.js"
          dest: "build/js/lib/d3.js"
        ,
          src: "bower_components/requirejs/require.js"
          dest: "build/js/lib/require.js"
        ,
          src: "bower_components/director/build/director.min.js"
          dest: "build/js/lib/director.js"
        ]

    watch:
      options:
        livereload: true
      coffee:
        files: ["app/scripts/**/*.coffee"]
        tasks: ["coffee:development"]
      html:
        files: ["app/*.html"]
        tasks: ["copy:development"]

  grunt.loadNpmTasks "grunt-contrib-clean"
  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-copy"
  grunt.loadNpmTasks "grunt-contrib-stylus"
  grunt.loadNpmTasks "grunt-contrib-connect"
  grunt.loadNpmTasks "grunt-contrib-watch"

  grunt.registerTask "default", [
    "clean:build"
    "coffee:development"
    "copy:development"
    "connect"
    "watch"
  ]
