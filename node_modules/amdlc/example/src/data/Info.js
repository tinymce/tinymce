/**
 * This is a private class that won't be exposed to the global namespace.
 *
 * @class mylib.data.Info
 * @private
 */
define("mylib/data/Info", [], function() {
	return function(data) {
		this.data = data;
	};
});
