/**
 * jquery.tinymce.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

(function($) {
	var undef,
		lazyLoading,
		delayedInits = [],
		win = window;

	$.fn.tinymce = function(settings) {
		var self = this, url, ed, base, pos, lang, query = "", suffix = "";

		// No match then just ignore the call
		if (!self.length)
			return self;

		// Get editor instance
		if (!settings)
			return tinyMCE.get(self[0].id);

		self.css('visibility', 'hidden'); // Hide textarea to avoid flicker

		function init() {
			var editors = [], initCount = 0;

			// Apply patches to the jQuery object, only once
			if (applyPatch) {
				applyPatch();
				applyPatch = null;
			}

			// Create an editor instance for each matched node
			self.each(function(i, node) {
				var ed, id = node.id, oninit = settings.oninit;

				// Generate unique id for target element if needed
				if (!id)
					node.id = id = tinymce.DOM.uniqueId();

				// Create editor instance and render it
				ed = new tinymce.Editor(id, settings);
				editors.push(ed);

				ed.onInit.add(function() {
					var scope, func = oninit;

					self.css('visibility', '');

					// Run this if the oninit setting is defined
					// this logic will fire the oninit callback ones each
					// matched editor instance is initialized
					if (oninit) {
						// Fire the oninit event ones each editor instance is initialized
						if (++initCount == editors.length) {
							if (tinymce.is(func, "string")) {
								scope = (func.indexOf(".") === -1) ? null : tinymce.resolve(func.replace(/\.\w+$/, ""));
								func = tinymce.resolve(func);
							}

							// Call the oninit function with the object
							func.apply(scope || tinymce, editors);
						}
					}
				});
			});

			// Render the editor instances in a separate loop since we
			// need to have the full editors array used in the onInit calls
			$.each(editors, function(i, ed) {
				ed.render();
			});
		}

		// Load TinyMCE on demand, if we need to
		if (!win.tinymce && !lazyLoading && (url = settings.script_url)) {
			lazyLoading = 1;
			base = url.substring(0, url.lastIndexOf("/"));

			// Check if it's a dev/src version they want to load then
			// make sure that all plugins, themes etc are loaded in source mode aswell
			if (/_(src|dev)\.js/g.test(url))
				suffix = "_src";

			// Parse out query part, this will be appended to all scripts, css etc to clear browser cache
			pos = url.lastIndexOf("?");
			if (pos != -1)
				query = url.substring(pos + 1);

			// Setup tinyMCEPreInit object this will later be used by the TinyMCE
			// core script to locate other resources like CSS files, dialogs etc
			// You can also predefined a tinyMCEPreInit object and then it will use that instead
			win.tinyMCEPreInit = win.tinyMCEPreInit || {
				base : base,
				suffix : suffix,
				query : query
			};

			// url contains gzip then we assume it's a compressor
			if (url.indexOf('gzip') != -1) {
				lang = settings.language || "en";
				url = url + (/\?/.test(url) ? '&' : '?') + "js=true&core=true&suffix=" + escape(suffix) + "&themes=" + escape(settings.theme) + "&plugins=" + escape(settings.plugins) + "&languages=" + lang;

				// Check if compressor script is already loaded otherwise setup a basic one
				if (!win.tinyMCE_GZ) {
					tinyMCE_GZ = {
						start : function() {
							tinymce.suffix = suffix;

							function load(url) {
								tinymce.ScriptLoader.markDone(tinyMCE.baseURI.toAbsolute(url));
							}

							// Add core languages
							load("langs/" + lang + ".js");

							// Add themes with languages
							load("themes/" + settings.theme + "/editor_template" + suffix + ".js");
							load("themes/" + settings.theme + "/langs/" + lang + ".js");

							// Add plugins with languages
							$.each(settings.plugins.split(","), function(i, name) {
								if (name) {
									load("plugins/" + name + "/editor_plugin" + suffix + ".js");
									load("plugins/" + name + "/langs/" + lang + ".js");
								}
							});
						},

						end : function() {
						}
					}
				}
			}

			// Load the script cached and execute the inits once it's done
			$.ajax({
				type : "GET",
				url : url,
				dataType : "script",
				cache : true,
				success : function() {
					tinymce.dom.Event.domLoaded = 1;
					lazyLoading = 2;

					// Execute callback after mainscript has been loaded and before the initialization occurs
					if (settings.script_loaded)
						settings.script_loaded();

					init();

					$.each(delayedInits, function(i, init) {
						init();
					});
				}
			});
		} else {
			// Delay the init call until tinymce is loaded
			if (lazyLoading === 1)
				delayedInits.push(init);
			else
				init();
		}

		return self;
	};

	// Add :tinymce psuedo selector this will select elements that has been converted into editor instances
	// it's now possible to use things like $('*:tinymce') to get all TinyMCE bound elements.
	$.extend($.expr[":"], {
		tinymce : function(e) {
			return !!(e.id && tinyMCE.get(e.id));
		}
	});

	// This function patches internal jQuery functions so that if
	// you for example remove an div element containing an editor it's
	// automatically destroyed by the TinyMCE API
	function applyPatch() {
		// Removes any child editor instances by looking for editor wrapper elements
		function removeEditors(name) {
			// If the function is remove
			if (name === "remove") {
				this.each(function(i, node) {
					var ed = tinyMCEInstance(node);

					if (ed)
						ed.remove();
				});
			}

			this.find("span.mceEditor,div.mceEditor").each(function(i, node) {
				var ed = tinyMCE.get(node.id.replace(/_parent$/, ""));

				if (ed)
					ed.remove();
			});
		}

		// Loads or saves contents from/to textarea if the value
		// argument is defined it will set the TinyMCE internal contents
		function loadOrSave(value) {
			var self = this, ed;

			// Handle set value
			if (value !== undef) {
				removeEditors.call(self);

				// Saves the contents before get/set value of textarea/div
				self.each(function(i, node) {
					var ed;

					if (ed = tinyMCE.get(node.id))
						ed.setContent(value);
				});
			} else if (self.length > 0) {
				// Handle get value
				if (ed = tinyMCE.get(self[0].id))
					return ed.getContent();
			}
		}

		// Returns tinymce instance for the specified element or null if it wasn't found
		function tinyMCEInstance(element) {
			var ed = null;

			(element) && (element.id) && (win.tinymce) && (ed = tinyMCE.get(element.id));

			return ed;
		}

		// Checks if the specified set contains tinymce instances
		function containsTinyMCE(matchedSet) {
			return !!((matchedSet) && (matchedSet.length) && (win.tinymce) && (matchedSet.is(":tinymce")));
		}

		// Patch various jQuery functions
		var jQueryFn = {};

		// Patch some setter/getter functions these will
		// now be able to set/get the contents of editor instances for
		// example $('#editorid').html('Content'); will update the TinyMCE iframe instance
		$.each(["text", "html", "val"], function(i, name) {
			var origFn = jQueryFn[name] = $.fn[name],
				textProc = (name === "text");

			 $.fn[name] = function(value) {
				var self = this;

				if (!containsTinyMCE(self))
					return origFn.apply(self, arguments);

				if (value !== undef) {
					loadOrSave.call(self.filter(":tinymce"), value);
					origFn.apply(self.not(":tinymce"), arguments);

					return self; // return original set for chaining
				} else {
					var ret = "";
					var args = arguments;
					
					(textProc ? self : self.eq(0)).each(function(i, node) {
						var ed = tinyMCEInstance(node);

						ret += ed ? (textProc ? ed.getContent().replace(/<(?:"[^"]*"|'[^']*'|[^'">])*>/g, "") : ed.getContent()) : origFn.apply($(node), args);
					});

					return ret;
				}
			 };
		});

		// Makes it possible to use $('#id').append("content"); to append contents to the TinyMCE editor iframe
		$.each(["append", "prepend"], function(i, name) {
			var origFn = jQueryFn[name] = $.fn[name],
				prepend = (name === "prepend");

			 $.fn[name] = function(value) {
				var self = this;

				if (!containsTinyMCE(self))
					return origFn.apply(self, arguments);

				if (value !== undef) {
					self.filter(":tinymce").each(function(i, node) {
						var ed = tinyMCEInstance(node);

						ed && ed.setContent(prepend ? value + ed.getContent() : ed.getContent() + value);
					});

					origFn.apply(self.not(":tinymce"), arguments);

					return self; // return original set for chaining
				}
			 };
		});

		// Makes sure that the editor instance gets properly destroyed when the parent element is removed
		$.each(["remove", "replaceWith", "replaceAll", "empty"], function(i, name) {
			var origFn = jQueryFn[name] = $.fn[name];

			$.fn[name] = function() {
				removeEditors.call(this, name);

				return origFn.apply(this, arguments);
			};
		});

		jQueryFn.attr = $.fn.attr;

		// Makes sure that $('#tinymce_id').attr('value') gets the editors current HTML contents
		$.fn.attr = function(name, value) {
			var self = this;

			if ((!name) || (name !== "value") || (!containsTinyMCE(self))) {
				if (value !== undef) {
					return jQueryFn.attr.call(self, name, value);
				} else {
					return jQueryFn.attr.call(self, name);
				}
			}

			if (value !== undef) {
				loadOrSave.call(self.filter(":tinymce"), value);
				jQueryFn.attr.call(self.not(":tinymce"), name, value);

				return self; // return original set for chaining
			} else {
				var node = self[0], ed = tinyMCEInstance(node);

				return ed ? ed.getContent() : jQueryFn.attr.call($(node), name, value);
			}
		};
	}
})(jQuery);