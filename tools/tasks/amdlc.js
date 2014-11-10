module.exports = function(grunt) {
	grunt.registerMultiTask("amdlc", "Compiles AMD modules to libraries.", function() {
		var config = grunt.config([this.name, this.target]).options;

		config.reporter = {
			level: "debug",

			debug: function(message) {
				grunt.log.debug(message);
			},

			info: function(message) {
				grunt.log.ok(message);
			},

			warning: function(message) {
				grunt.fail.warn(message);
			},

			error: function(message) {
				grunt.log.error(message);
			},

			fatal: function(message) {
				grunt.log.error(message);
			}
		};

		require("amdlc").compile(config);
	});
};
