var argv = process.argv;

exports.isEmpty = function() {
	return argv.length <= 2;
};

exports.get = function(name, required) {
	var names = name.split(/[, ]/);

	for (var i = 0; i < names.length; i++) {
		var index = argv.indexOf('--' + names[i]);

		if (index !== -1) {
			var value = argv[index + 1];

			// Check if the value for the option is missing
			if (required && (typeof(value) == "undefined" || /^--/.test(value))) {
				console.error("Error: --" + names[i] + " requires an argument.");
				process.exit(0);
				return;
			}

			return value;
		}
	}
};

exports.has = function(name) {
	var names = name.split(/[, ]/);

	for (var i = 0; i < names.length; i++) {
		if (argv.indexOf('--' + names[i]) !== -1) {
			return true;
		}
	}

	return false;
};

exports.item = function(offset) {
	offset = argv.length - 1 - offset;

	if (typeof(argv[offset]) != "undefined" && !/^--/.test(argv[offset])) {
		return argv[offset];
	}
};
