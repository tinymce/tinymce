module.exports = function(grunt) {
	grunt.registerMultiTask("amdlc", "Compiles AMD modules to libraries.", function() {
		require("amdlc").compile(grunt.config([this.name, this.target]).options);
	});
};
