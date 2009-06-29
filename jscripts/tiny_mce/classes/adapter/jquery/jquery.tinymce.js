/**
 * $Id: jquery.uri.js 453 2008-10-14 12:24:41Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function($) {
	var lazyLoading, delayedInits = [];

	function patch(type, name, patch_func) {
		var func;

		func = $.fn[name];

		$.fn[name] = function() {
			var val;

			if (type !== 'after') {
				val = patch_func.apply(this, arguments);

				// We got a return value pass out that instead
				if (val !== undefined)
					return val;
			}

			val = func.apply(this, arguments);

			if (type !== 'before')
				patch_func.apply(this, arguments);

			return val;
		};
	};

	$.fn.tinymce = function(settings) {
		var t = this, url, suffix = '', ed;

		// No match then just ignore the call
		if (!t.length)
			return;

		// Get editor instance
		if (!settings)
			return tinyMCE.get(this[0].id);

		function init() {
			// Apply patches once
			if (applyPatch) {
				applyPatch();
				applyPatch = null;
			}

			// Create an editor instance for each matched node
			t.each(function(i, n) {
				var ed, id = n.id || tinymce.DOM.uniqueId();

				n.id = id;
				ed = new tinymce.Editor(id, settings);

				ed.render();
			});
		};

		// Load TinyMCE on demand
		if (!window['tinymce'] && !lazyLoading && (url = settings.script_url)) {
			lazyLoading = 1;

			if (/_(src|dev)\.js/g.test(url))
				suffix = '_src';

			window.tinyMCEPreInit = {
				base : url.substring(0, url.lastIndexOf('/')),
				suffix : suffix,
				query : ''
			};

			$.getScript(url, function() {
				// Script is loaded time to initialize TinyMCE
				tinymce.dom.Event.domLoaded = 1;
				lazyLoading = 2;
				init();

				$.each(delayedInits, function(i, init) {
					init();
				});
			});
		} else {
			if (lazyLoading === 1)
				delayedInits.push(init);
			else
				init();
		}
	};

	// Add :tinymce psuedo selector
	$.extend($.expr[':'], {
		tinymce : function(e) {
			return e.id && !!tinyMCE.get(e.id);
		}
	});

	function applyPatch() {
		function removeEditors() {
			this.find('span.mceEditor,div.mceEditor').each(function(i, n) {
				var ed;

				if (ed = tinyMCE.get(n.id.replace(/_parent$/, ''))) {
					ed.remove();
				}
			});
		};

		function loadOrSave(value) {
			var ed;

			// Handle set value
			if (value !== undefined) {
				removeEditors.call(this);

				// Saves the contents before get/set value of textarea/div
				this.each(function(i, node) {
					var ed;

					if (ed = tinyMCE.get(node.id))
						ed.setContent(value);
				});
			} else if (this.length > 0) {
				// Handle get value
				if (ed = tinyMCE.get(this[0].id))
					return ed.getContent();
			}
		};

		// Patch various jQuery functions
		patch("both", 'text', function(value) {
			// Text encode value
			if (value !== undefined)
				return loadOrSave.call(this, value);

			// Get contents as plain text
			if (this.length > 0) {
				// Handle get value
				if (ed = tinyMCE.get(this[0].id))
					return ed.getContent().replace(/<[^>]+>/g, '');
			}
		});

		$.each(['val', 'html'], function(i, name) {
			patch("both", name, loadOrSave);
		});

		$.each(['append', 'prepend'], function(i, name) {
			patch("before", name, function(value) {
				if (value !== undefined) {
					this.each(function(i, node) {
						var ed;

						if (ed = tinyMCE.get(node.id)) {
							if (name === 'append')
								ed.setContent(ed.getContent() + value);
							else
								ed.setContent(value + ed.getContent());
						}
					});
				}
			});
		});

		patch("both", 'attr', function(name, value) {
			if (name && name === 'value')
				return loadOrSave.call(this, value);
		});

		$.each(['remove', 'replaceWith', 'replaceAll', 'empty'], function(i, name) {
			patch("before", name, removeEditors);
		});
	};
})(jQuery);