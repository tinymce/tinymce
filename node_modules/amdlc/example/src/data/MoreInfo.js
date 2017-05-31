/**
 * This is a private class that won't be exposed to the global namespace.
 *
 * @class mylib.data.MoreInfo
 * @private
 */
define("mylib/data/MoreInfo", [], function() {
	return function(data) {
		this.data = data;
	};
});
