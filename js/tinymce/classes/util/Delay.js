/**
 * Delay.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Utility class for working with delayed actions like setTimeout.
 *
 * @class tinymce.util.Delay
 */
define("tinymce/util/Delay", [
	"tinymce/util/Promise"
], function(Promise) {
	var requestAnimationFramePromise;

	function requestAnimationFrame(callback, element) {
		var i, requestAnimationFrameFunc = window.requestAnimationFrame, vendors = ['ms', 'moz', 'webkit'];

		function featurefill(callback) {
			window.setTimeout(callback, 0);
		}

		for (i = 0; i < vendors.length && !requestAnimationFrameFunc; i++) {
			requestAnimationFrameFunc = window[vendors[i] + 'RequestAnimationFrame'];
		}

		if (!requestAnimationFrameFunc) {
			requestAnimationFrameFunc = featurefill;
		}

		requestAnimationFrameFunc(callback, element);
	}

	function wrappedSetTimeout(callback, time) {
		if (typeof time != 'number') {
			time = 0;
		}

		return setTimeout(callback, time);
	}

	function wrappedSetInterval(callback, time) {
		if (typeof time != 'number') {
			time = 0;
		}

		return setInterval(callback, time);
	}

	function wrappedClearTimeout(id) {
		return clearTimeout(id);
	}

	function wrappedClearInterval(id) {
		return clearInterval(id);
	}

	return {
		/**
		 * Requests an animation frame and fallbacks to a timeout on older browsers.
		 *
		 * @method requestAnimationFrame
		 * @param {function} callback Callback to execute when a new frame is available.
		 * @param {DOMElement} element Optional element to scope it to.
		 */
		requestAnimationFrame: function(callback, element) {
			if (requestAnimationFramePromise) {
				requestAnimationFramePromise.then(callback);
				return;
			}

			requestAnimationFramePromise = new Promise(function(resolve) {
				if (!element) {
					element = document.body;
				}

				requestAnimationFrame(resolve, element);
			}).then(callback);
		},

		/**
		 * Sets a timer in ms and executes the specified callback when the timer runs out.
		 *
		 * @method setTimeout
		 * @param {function} callback Callback to execute when timer runs out.
		 * @param {Number} time Optional time to wait before the callback is executed, defaults to 0.
		 * @return {Number} Timeout id number.
		 */
		setTimeout: wrappedSetTimeout,

		/**
		 * Sets an interval timer in ms and executes the specified callback at every interval of that time.
		 *
		 * @method setInterval
		 * @param {function} callback Callback to execute when interval time runs out.
		 * @param {Number} time Optional time to wait before the callback is executed, defaults to 0.
		 * @return {Number} Timeout id number.
		 */
		setInterval: wrappedSetInterval,

		/**
		 * Sets an editor timeout it's similar to setTimeout except that it checks if the editor instance is
		 * still alive when the callback gets executed.
		 *
		 * @method setEditorTimeout
		 * @param {tinymce.Editor} editor Editor instance to check the removed state on.
		 * @param {function} callback Callback to execute when timer runs out.
		 * @param {Number} time Optional time to wait before the callback is executed, defaults to 0.
		 * @return {Number} Timeout id number.
		 */
		setEditorTimeout: function(editor, callback, time) {
			return wrappedSetTimeout(function() {
				if (!editor.removed) {
					callback();
				}
			}, time);
		},

		/**
		 * Sets an interval timer it's similar to setInterval except that it checks if the editor instance is
		 * still alive when the callback gets executed.
		 *
		 * @method setEditorInterval
		 * @param {function} callback Callback to execute when interval time runs out.
		 * @param {Number} time Optional time to wait before the callback is executed, defaults to 0.
		 * @return {Number} Timeout id number.
		 */
		setEditorInterval: function(editor, callback, time) {
			var timer;

			timer = wrappedSetInterval(function() {
				if (!editor.removed) {
					callback();
				} else {
					clearInterval(timer);
				}
			}, time);

			return timer;
		},

		/**
		 * Clears an interval timer so it won't execute.
		 *
		 * @method clearInterval
		 * @param {Number} Interval timer id number.
		 */
		clearInterval: wrappedClearInterval,

		/**
		 * Clears an timeout timer so it won't execute.
		 *
		 * @method clearTimeout
		 * @param {Number} Timeout timer id number.
		 */
		clearTimeout: wrappedClearTimeout
	};
});