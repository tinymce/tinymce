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
	"tinymce/util/XHR",
	"tinymce/util/URI",
	"tinymce/util/JSON"
], function(DomTextMatcher, PluginManager, Tools, Menu, DOMUtils, XHR, URI, JSON) {
	PluginManager.add('spellchecker', function(editor, url) {
		var languageMenuItems, self = this, lastSuggestions, started, suggestionsMenu, settings = editor.settings;
		var hasDictionarySupport;

		function getTextMatcher() {
			if (!self.textMatcher) {
				self.textMatcher = new DomTextMatcher(editor.getBody(), editor);
			}

			return self.textMatcher;
		}

		function buildMenuItems(listName, languageValues) {
			var items = [];

			Tools.each(languageValues, function(languageValue) {
				items.push({
					selectable: true,
					text: languageValue.name,
					data: languageValue.value
				});
			});

			return items;
		}

		var languagesString = settings.spellchecker_languages ||
			'English=en,Danish=da,Dutch=nl,Finnish=fi,French=fr_FR,' +
			'German=de,Italian=it,Polish=pl,Portuguese=pt_BR,' +
			'Spanish=es,Swedish=sv';

		languageMenuItems = buildMenuItems('Language',
			Tools.map(languagesString.split(','), function(langPair) {
				langPair = langPair.split('=');

				return {
					name: langPair[0],
					value: langPair[1]
				};
			})
		);

		function isEmpty(obj) {
			/*jshint unused:false*/
			/*eslint no-unused-vars:0 */
			for (var name in obj) {
				return false;
			}

			return true;
		}

		function showSuggestions(word, spans) {
			var items = [], suggestions = lastSuggestions[word];

			Tools.each(suggestions, function(suggestion) {
				items.push({
					text: suggestion,
					onclick: function() {
						editor.insertContent(editor.dom.encode(suggestion));
						editor.dom.remove(spans);
						checkIfFinished();
					}
				});
			});

			items.push({text: '-'});

			if (hasDictionarySupport) {
				items.push({text: 'Add to Dictionary', onclick: function() {
					addToDictionary(word, spans);
				}});
			}

			items.push.apply(items, [
				{text: 'Ignore', onclick: function() {
					ignoreWord(word, spans);
				}},

				{text: 'Ignore all', onclick: function() {
					ignoreWord(word, spans, true);
				}}
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
			var targetPos = editor.dom.getPos(spans[0]);
			var root = editor.dom.getRoot();

			// Adjust targetPos for scrolling in the editor
			if (root.nodeName == 'BODY') {
				targetPos.x -= root.ownerDocument.documentElement.scrollLeft || root.scrollLeft;
				targetPos.y -= root.ownerDocument.documentElement.scrollTop || root.scrollTop;
			} else {
				targetPos.x -= root.scrollLeft;
				targetPos.y -= root.scrollTop;
			}

			pos.x += targetPos.x;
			pos.y += targetPos.y;

			suggestionsMenu.moveTo(pos.x, pos.y + spans[0].offsetHeight);
		}

		function getWordCharPattern() {
			// Regexp for finding word specific characters this will split words by
			// spaces, quotes, copy right characters etc. It's escaped with unicode characters
			// to make it easier to output scripts on servers using different encodings
			// so if you add any characters outside the 128 byte range make sure to escape it
			return editor.getParam('spellchecker_wordchar_pattern') || new RegExp("[^" +
				"\\s!\"#$%&()*+,-./:;<=>?@[\\]^_{|}`" +
				"\u00a7\u00a9\u00ab\u00ae\u00b1\u00b6\u00b7\u00b8\u00bb" +
				"\u00bc\u00bd\u00be\u00bf\u00d7\u00f7\u00a4\u201d\u201c\u201e\u00a0\u2002\u2003\u2009" +
			"]+", "g");
		}

		function defaultSpellcheckCallback(method, text, doneCallback, errorCallback) {
			var data = {method: method}, postData = '';

			if (method == "spellcheck") {
				data.text = text;
				data.lang = settings.spellchecker_language;
			}

			if (method == "addToDictionary") {
				data.word = text;
			}

			Tools.each(data, function(value, key) {
				if (postData) {
					postData += '&';
				}

				postData += key + '=' + encodeURIComponent(value);
			});

			XHR.send({
				url: new URI(url).toAbsolute(settings.spellchecker_rpc_url),
				type: "post",
				content_type: 'application/x-www-form-urlencoded',
				data: postData,
				success: function(result) {
					result = JSON.parse(result);

					if (!result) {
						errorCallback("Sever response wasn't proper JSON.");
					} else if (result.error) {
						errorCallback(result.error);
					} else {
						doneCallback(result);
					}
				},
				error: function(type, xhr) {
					errorCallback("Spellchecker request error: " + xhr.status);
				}
			});
		}

		function sendRpcCall(name, data, successCallback, errorCallback) {
			var spellCheckCallback = settings.spellchecker_callback || defaultSpellcheckCallback;
			spellCheckCallback.call(self, name, data, successCallback, errorCallback);
		}

		function spellcheck() {
			if (started) {
				finish();
				return;
			} else {
				finish();
			}

			function errorCallback(message) {
				editor.windowManager.alert(message);
				editor.setProgressState(false);
				finish();
			}

			editor.setProgressState(true);
			sendRpcCall("spellcheck", getTextMatcher().text, markErrors, errorCallback);
			editor.focus();
		}

		function checkIfFinished() {
			if (!editor.dom.select('span.mce-spellchecker-word').length) {
				finish();
			}
		}

		function addToDictionary(word, spans) {
			editor.setProgressState(true);

			sendRpcCall("addToDictionary", word, function() {
				editor.setProgressState(false);
				editor.dom.remove(spans, true);
				checkIfFinished();
			}, function(message) {
				editor.windowManager.alert(message);
				editor.setProgressState(false);
			});
		}

		function ignoreWord(word, spans, all) {
			editor.selection.collapse();

			if (all) {
				Tools.each(editor.dom.select('span.mce-spellchecker-word'), function(span) {
					if (span.getAttribute('data-mce-word') == word) {
						editor.dom.remove(span, true);
					}
				});
			} else {
				editor.dom.remove(spans, true);
			}

			checkIfFinished();
		}

		function finish() {
			getTextMatcher().reset();
			self.textMatcher = null;

			if (started) {
				started = false;
				editor.fire('SpellcheckEnd');
			}
		}

		function getElmIndex(elm) {
			var value = elm.getAttribute('data-mce-index');

			if (typeof value == "number") {
				return "" + value;
			}

			return value;
		}

		function findSpansByIndex(index) {
			var nodes, spans = [];

			nodes = Tools.toArray(editor.getBody().getElementsByTagName('span'));
			if (nodes.length) {
				for (var i = 0; i < nodes.length; i++) {
					var nodeIndex = getElmIndex(nodes[i]);

					if (nodeIndex === null || !nodeIndex.length) {
						continue;
					}

					if (nodeIndex === index.toString()) {
						spans.push(nodes[i]);
					}
				}
			}

			return spans;
		}

		editor.on('click', function(e) {
			var target = e.target;

			if (target.className == "mce-spellchecker-word") {
				e.preventDefault();

				var spans = findSpansByIndex(getElmIndex(target));

				if (spans.length > 0) {
					var rng = editor.dom.createRng();
					rng.setStartBefore(spans[0]);
					rng.setEndAfter(spans[spans.length - 1]);
					editor.selection.setRng(rng);
					showSuggestions(target.getAttribute('data-mce-word'), spans);
				}
			}
		});

		editor.addMenuItem('spellchecker', {
			text: 'Spellcheck',
			context: 'tools',
			onclick: spellcheck,
			selectable: true,
			onPostRender: function() {
				var self = this;

				self.active(started);

				editor.on('SpellcheckStart SpellcheckEnd', function() {
					self.active(started);
				});
			}
		});

		function updateSelection(e) {
			var selectedLanguage = settings.spellchecker_language;

			e.control.items().each(function(ctrl) {
				ctrl.active(ctrl.settings.data === selectedLanguage);
			});
		}

		/**
		 * Find the specified words and marks them. It will also show suggestions for those words.
		 *
		 * @example
		 * editor.plugins.spellchecker.markErrors({
		 *     dictionary: true,
		 *     words: {
		 *         "word1": ["suggestion 1", "Suggestion 2"]
		 *     }
		 * });
		 * @param {Object} data Data object containing the words with suggestions.
		 */
		function markErrors(data) {
			var suggestions;

			if (data.words) {
				hasDictionarySupport = !!data.dictionary;
				suggestions = data.words;
			} else {
				// Fallback to old format
				suggestions = data;
			}

			editor.setProgressState(false);

			if (isEmpty(suggestions)) {
				editor.windowManager.alert('No misspellings found');
				started = false;
				return;
			}

			lastSuggestions = suggestions;

			getTextMatcher().find(getWordCharPattern()).filter(function(match) {
				return !!suggestions[match.text];
			}).wrap(function(match) {
				return editor.dom.create('span', {
					"class": 'mce-spellchecker-word',
					"data-mce-bogus": 1,
					"data-mce-word": match.text
				});
			});

			started = true;
			editor.fire('SpellcheckStart');
		}

		var buttonArgs = {
			tooltip: 'Spellcheck',
			onclick: spellcheck,
			onPostRender: function() {
				var self = this;

				editor.on('SpellcheckStart SpellcheckEnd', function() {
					self.active(started);
				});
			}
		};

		if (languageMenuItems.length > 1) {
			buttonArgs.type = 'splitbutton';
			buttonArgs.menu = languageMenuItems;
			buttonArgs.onshow = updateSelection;
			buttonArgs.onselect = function(e) {
				settings.spellchecker_language = e.control.settings.data;
			};
		}

		editor.addButton('spellchecker', buttonArgs);
		editor.addCommand('mceSpellCheck', spellcheck);

		editor.on('remove', function() {
			if (suggestionsMenu) {
				suggestionsMenu.remove();
				suggestionsMenu = null;
			}
		});

		editor.on('change', checkIfFinished);

		this.getTextMatcher = getTextMatcher;
		this.getWordCharPattern = getWordCharPattern;
		this.markErrors = markErrors;
		this.getLanguage = function() {
			return settings.spellchecker_language;
		};

		// Set default spellchecker language if it's not specified
		settings.spellchecker_language = settings.spellchecker_language || settings.language || 'en';
	});
});
