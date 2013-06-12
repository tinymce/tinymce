/**
 * Plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*jshint camelcase:false */

/**
 * This class contains all core logic for the spellchecker plugin.
 *
 * @class tinymce.spellcheckerplugin.Plugin
 * @private
 */
define("tinymce/spellcheckerplugin/Plugin", [
	"tinymce/spellcheckerplugin/DomTextMatcher",
	"tinymce/PluginManager",
	"tinymce/util/Tools",
	"tinymce/ui/Menu",
	"tinymce/dom/DOMUtils",
	"tinymce/util/JSONRequest"
], function(DomTextMatcher, PluginManager, Tools, Menu, DOMUtils, JSONRequest) {
	PluginManager.add('spellchecker', function(editor) {
		var lastSuggestions, started, suggestionsMenu, settings = editor.settings;

		function isEmpty(obj) {
			/*jshint unused:false*/
			for (var name in obj) {
				return false;
			}

			return true;
		}

		function showSuggestions(target, word) {
			var items = [], suggestions = lastSuggestions[word];

			Tools.each(suggestions, function(suggestion) {
				items.push({
					text: suggestion,
					onclick: function() {
						editor.insertContent(suggestion);
						checkIfFinished();
					}
				});
			});

			items.push.apply(items, [
				{text: '-'},

				{text: 'Ignore', onclick: function() {
					ignoreWord(target, word);
				}},

				{text: 'Ignore all', onclick: function() {
					ignoreWord(target, word, true);
				}},

				{text: 'Finish', onclick: finish}
			]);

			// Render menu
			suggestionsMenu = new Menu({
				items: items,
				context: 'contextmenu',
				onautohide: function(e) {
					if (e.target.className.indexOf('spellchecker') != -1) {
						e.preventDefault();
					}
				},
				onhide: function() {
					suggestionsMenu.remove();
					suggestionsMenu = null;
				}
			});

			suggestionsMenu.renderTo(document.body);

			// Position menu
			var pos = DOMUtils.DOM.getPos(editor.getContentAreaContainer());
			var targetPos = editor.dom.getPos(target);

			pos.x += targetPos.x;
			pos.y += targetPos.y;

			suggestionsMenu.moveTo(pos.x, pos.y + target.offsetHeight);
		}

		function spellcheck() {
			var textFilter, words = [], uniqueWords = {};

			if (started) {
				finish();
				return;
			}

			started = true;

			function doneCallback(suggestions) {
				editor.setProgressState(false);

				if (isEmpty(suggestions)) {
					editor.windowManager.alert('No misspellings found');
					started = false;
					return;
				}

				lastSuggestions = suggestions;

				textFilter.filter(function(match) {
					return !!suggestions[match[2][0]];
				}).mark(editor.dom.create('span', {
					"class": 'mce-spellchecker-word',
					"data-mce-bogus": 1
				}));

				textFilter = null;
				editor.fire('SpellcheckStart');
			}

			// Find all words and make an unique words array
			textFilter = new DomTextMatcher(/\w+/g, editor.getBody(), editor.schema).each(function(match) {
				if (!uniqueWords[match[2][0]]) {
					words.push(match[2][0]);
					uniqueWords[match[2][0]] = true;
				}
			});

			function defaultSpellcheckCallback(method, words, doneCallback) {
				JSONRequest.sendRPC({
					url: settings.spellchecker_rpc_url,
					method: method,
					params: {
						lang: settings.spellchecker_language || "en",
						words: words
					},
					success: function(result) {
						doneCallback(result);
					},
					error: function(error, xhr) {
						if (error == "JSON Parse error.") {
							error = "Non JSON response:" + xhr.responseText;
						} else {
							error = "Error: " + error;
						}

						editor.windowManager.alert(error);
						editor.setProgressState(false);
						textFilter = null;
					}
				});
			}

			editor.setProgressState(true);

			var spellCheckCallback = settings.spellcheck_callback || defaultSpellcheckCallback;
			spellCheckCallback("spellcheck", words, doneCallback);
		}

		function checkIfFinished() {
			if (!editor.dom.select('span.mce-spellchecker-word').length) {
				finish();
			}
		}

		function unwrap(node) {
			var parentNode = node.parentNode;
			parentNode.insertBefore(node.firstChild, node);
			node.parentNode.removeChild(node);
		}

		function ignoreWord(target, word, all) {
			if (all) {
				Tools.each(editor.dom.select('span.mce-spellchecker-word'), function(item) {
					var text = item.innerText || item.textContent;

					if (text == word) {
						unwrap(item);
					}
				});
			} else {
				unwrap(target);
			}

			checkIfFinished();
		}

		function finish() {
			var i, nodes, node;

			started = false;
			node = editor.getBody();
			nodes = node.getElementsByTagName('span');
			i = nodes.length;
			while (i--) {
				node = nodes[i];
				if (node.getAttribute('data-mce-index')) {
					unwrap(node);
				}
			}

			editor.fire('SpellcheckEnd');
		}

		function selectMatch(index) {
			var nodes, i, spanElm, spanIndex = -1, startContainer, endContainer;

			index = "" + index;
			nodes = editor.getBody().getElementsByTagName("span");
			for (i = 0; i < nodes.length; i++) {
				spanElm = nodes[i];
				if (spanElm.className == "mce-spellchecker-word") {
					spanIndex = spanElm.getAttribute('data-mce-index');
					if (spanIndex === index) {
						spanIndex = index;

						if (!startContainer) {
							startContainer = spanElm.firstChild;
						}

						endContainer = spanElm.firstChild;
					}

					if (spanIndex !== index && endContainer) {
						break;
					}
				}
			}

			var rng = editor.dom.createRng();
			rng.setStart(startContainer, 0);
			rng.setEnd(endContainer, endContainer.length);
			editor.selection.setRng(rng);

			return rng;
		}

		editor.on('click', function(e) {
			if (e.target.className == "mce-spellchecker-word") {
				e.preventDefault();

				var rng = selectMatch(e.target.getAttribute('data-mce-index'));
				showSuggestions(e.target, rng.toString());
			}
		});

		editor.addMenuItem('spellchecker', {
			text: 'Spellcheck',
			context: 'tools',
			onclick: spellcheck,
			selectable: true,
			onPostRender: function() {
				var self = this;

				editor.on('SpellcheckStart SpellcheckEnd', function() {
					self.active(started);
				});
			}
		});

		editor.addButton('spellchecker', {
			tooltip: 'Spellcheck',
			onclick: spellcheck,
			onPostRender: function() {
				var self = this;

				editor.on('SpellcheckStart SpellcheckEnd', function() {
					self.active(started);
				});
			}
		});

		editor.on('remove', function() {
			if (suggestionsMenu) {
				suggestionsMenu.remove();
				suggestionsMenu = null;
			}
		});
	});
});