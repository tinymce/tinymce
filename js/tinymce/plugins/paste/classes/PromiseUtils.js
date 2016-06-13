/**
 * PromiseUtils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Various utility functions when working with propmises.
 *
 * @class tinymce.pasteplugin.PromiseUtils
 * @private
 */
define("tinymce/pasteplugin/PromiseUtils", [
	"tinymce/util/Promise"
], function (Promise) {
	var resolve = function (value) {
		return Promise.resolve(value);
	};

	var reject = function (value) {
		return Promise.reject(value);
	};

	var until = function (args, actions) {
		var id = function (value) {
			return value;
		};

		var next = function () {
			var action = actions.shift();
			return action ? action.apply(null, args).then(id, next) : null;
		};

		return next();
	};

	return {
		resolve: resolve,
		reject: reject,
		until: until
	};
});
