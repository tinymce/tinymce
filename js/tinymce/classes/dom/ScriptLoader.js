/**
 * ScriptLoader.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*globals console*/

/**
 * This class handles asynchronous/synchronous loading of JavaScript files it will execute callbacks
 * when various items gets loaded. This class is useful to load external JavaScript files.
 *
 * @class tinymce.dom.ScriptLoader
 * @example
 * // Load a script from a specific URL using the global script loader
 * tinymce.ScriptLoader.load('somescript.js');
 *
 * // Load a script using a unique instance of the script loader
 * var scriptLoader = new tinymce.dom.ScriptLoader();
 *
 * scriptLoader.load('somescript.js');
 *
 * // Load multiple scripts
 * var scriptLoader = new tinymce.dom.ScriptLoader();
 *
 * scriptLoader.add('somescript1.js');
 * scriptLoader.add('somescript2.js');
 * scriptLoader.add('somescript3.js');
 *
 * scriptLoader.loadQueue(function() {
 *    alert('All scripts are now loaded.');
 * });
 */
define("tinymce/dom/ScriptLoader", [
	"tinymce/dom/DOMUtils",
	"tinymce/util/Tools"
], function(DOMUtils, Tools) {
	var DOM = DOMUtils.DOM;
	var each = Tools.each, grep = Tools.grep;

	function ScriptLoader() {
		var QUEUED = 0,
			LOADING = 1,
			LOADED = 2,
			states = {},
			queue = [],
			scriptLoadedCallbacks = {},
			queueLoadedCallbacks = [],
			loading = 0,
			undef;

		/**
		 * Loads a specific script directly without adding it to the load queue.
		 *
		 * @method load
		 * @param {String} url Absolute URL to script to add.
		 * @param {function} callback Optional callback function to execute ones this script gets loaded.
		 * @param {Object} scope Optional scope to execute callback in.
		 */
		function loadScript(url, callback) {
			var dom = DOM, elm, id;

			// Execute callback when script is loaded
			function done() {
				dom.remove(id);

				if (elm) {
					elm.onreadystatechange = elm.onload = elm = null;
				}

				callback();
			}

			function error() {
				// Report the error so it's easier for people to spot loading errors
				if (typeof(console) !== "undefined" && console.log) {
					console.log("Failed to load: " + url);
				}

				// We can't mark it as done if there is a load error since
				// A) We don't want to produce 404 errors on the server and
				// B) the onerror event won't fire on all browsers.
				// done();
			}

			id = dom.uniqueId();

			// Create new script element
			elm = document.createElement('script');
			elm.id = id;
			elm.type = 'text/javascript';
			elm.src = url;

			// Seems that onreadystatechange works better on IE 10 onload seems to fire incorrectly
			if ("onreadystatechange" in elm) {
				elm.onreadystatechange = function() {
					if (/loaded|complete/.test(elm.readyState)) {
						done();
					}
				};
			} else {
				elm.onload = done;
			}

			// Add onerror event will get fired on some browsers but not all of them
			elm.onerror = error;

			// Add script to document
			(document.getElementsByTagName('head')[0] || document.body).appendChild(elm);
		}

		/**
		 * Returns true/false if a script has been loaded or not.
		 *
		 * @method isDone
		 * @param {String} url URL to check for.
		 * @return {Boolean} true/false if the URL is loaded.
		 */
		this.isDone = function(url) {
			return states[url] == LOADED;
		};

		/**
		 * Marks a specific script to be loaded. This can be useful if a script got loaded outside
		 * the script loader or to skip it from loading some script.
		 *
		 * @method markDone
		 * @param {string} u Absolute URL to the script to mark as loaded.
		 */
		this.markDone = function(url) {
			states[url] = LOADED;
		};

		/**
		 * Adds a specific script to the load queue of the script loader.
		 *
		 * @method add
		 * @param {String} url Absolute URL to script to add.
		 * @param {function} callback Optional callback function to execute ones this script gets loaded.
		 * @param {Object} scope Optional scope to execute callback in.
		 */
		this.add = this.load = function(url, callback, scope) {
			var state = states[url];

			// Add url to load queue
			if (state == undef) {
				queue.push(url);
				states[url] = QUEUED;
			}

			if (callback) {
				// Store away callback for later execution
				if (!scriptLoadedCallbacks[url]) {
					scriptLoadedCallbacks[url] = [];
				}

				scriptLoadedCallbacks[url].push({
					func: callback,
					scope: scope || this
				});
			}
		};

		/**
		 * Starts the loading of the queue.
		 *
		 * @method loadQueue
		 * @param {function} callback Optional callback to execute when all queued items are loaded.
		 * @param {Object} scope Optional scope to execute the callback in.
		 */
		this.loadQueue = function(callback, scope) {
			this.loadScripts(queue, callback, scope);
		};

		/**
		 * Loads the specified queue of files and executes the callback ones they are loaded.
		 * This method is generally not used outside this class but it might be useful in some scenarios.
		 *
		 * @method loadScripts
		 * @param {Array} scripts Array of queue items to load.
		 * @param {function} callback Optional callback to execute ones all items are loaded.
		 * @param {Object} scope Optional scope to execute callback in.
		 */
		this.loadScripts = function(scripts, callback, scope) {
			var loadScripts;

			function execScriptLoadedCallbacks(url) {
				// Execute URL callback functions
				each(scriptLoadedCallbacks[url], function(callback) {
					callback.func.call(callback.scope);
				});

				scriptLoadedCallbacks[url] = undef;
			}

			queueLoadedCallbacks.push({
				func: callback,
				scope: scope || this
			});

			loadScripts = function() {
				var loadingScripts = grep(scripts);

				// Current scripts has been handled
				scripts.length = 0;

				// Load scripts that needs to be loaded
				each(loadingScripts, function(url) {
					// Script is already loaded then execute script callbacks directly
					if (states[url] == LOADED) {
						execScriptLoadedCallbacks(url);
						return;
					}

					// Is script not loading then start loading it
					if (states[url] != LOADING) {
						states[url] = LOADING;
						loading++;

						loadScript(url, function() {
							states[url] = LOADED;
							loading--;

							execScriptLoadedCallbacks(url);

							// Load more scripts if they where added by the recently loaded script
							loadScripts();
						});
					}
				});

				// No scripts are currently loading then execute all pending queue loaded callbacks
				if (!loading) {
					each(queueLoadedCallbacks, function(callback) {
						callback.func.call(callback.scope);
					});

					queueLoadedCallbacks.length = 0;
				}
			};

			loadScripts();
		};
	}

	ScriptLoader.ScriptLoader = new ScriptLoader();

	return ScriptLoader;
});
