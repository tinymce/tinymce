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
	"tinymce/util/JSONRequest",
	"tinymce/util/URI"
], function(DomTextMatcher, PluginManager, Tools, Menu, DOMUtils, JSONRequest, URI) {
	PluginManager.add('spellchecker', function(editor, url) {
		var languageMenuItems, self = this, lastSuggestions, started, suggestionsMenu, settings = editor.settings;

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
			Tools.map(languagesString.split(','),
				function(lang_pair) {
					var lang = lang_pair.split('=');

					return {
						name: lang[0],
						value: lang[1]
					};
				}
			)
		);

		function isEmpty(obj) {
			/*jshint unused:false*/
			/*eslint no-unused-vars:0 */
			for (var name in obj) {
				return false;
			}

			return true;
		}

		function showSuggestions(match) {
			var items = [], suggestions = lastSuggestions[match.text];

			Tools.each(suggestions, function(suggestion) {
				items.push({
					text: suggestion,
					onclick: function() {
						var rng = getTextMatcher().replace(match, suggestion);
						rng.collapse(false);
						editor.selection.setRng(rng);
						checkIfFinished();
					}
				});
			});

			items.push.apply(items, [
				{text: '-'},

				{text: 'Ignore', onclick: function() {
					ignoreWord(match);
				}},

				{text: 'Ignore all', onclick: function() {
					ignoreWord(match, true);
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
			var matchNode = getTextMatcher().elementFromMatch(match);
			var pos = DOMUtils.DOM.getPos(editor.getContentAreaContainer());
			var targetPos = editor.dom.getPos(matchNode);
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

			suggestionsMenu.moveTo(pos.x, pos.y + matchNode.offsetHeight);
		}

		function spellcheck() {
			var words = [], uniqueWords = {};

			if (started) {
				finish();
				return;
			} else {
				finish();
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

				getTextMatcher().filter(function(match) {
					return !!suggestions[match.text];
				}).wrap(function() {
					return editor.dom.create('span', {
						"class": 'mce-spellchecker-word',
						"data-mce-bogus": 1
					});
				});

				editor.fire('SpellcheckStart');
			}

			// Regexp for finding word specific characters this will split words by
			// spaces, quotes, copy right characters etc. It's escaped with unicode characters
			// to make it easier to output scripts on servers using different encodings
			// so if you add any characters outside the 128 byte range make sure to escape it
			var nonWordSeparatorCharacters = editor.getParam('spellchecker_wordchar_pattern') || new RegExp("[^" +
				"\\s!\"#$%&()*+,-./:;<=>?@[\\]^_{|}`" +
				"\u00a7\u00a9\u00ab\u00ae\u00b1\u00b6\u00b7\u00b8\u00bb" +
				"\u00bc\u00bd\u00be\u00bf\u00d7\u00f7\u00a4\u201d\u201c\u201e" +
			"]+", "g");

			// Find all words and make an unique words array
			getTextMatcher().find(nonWordSeparatorCharacters).each(function(match) {
				var word = match.text;

				// TODO: Fix so it remembers correctly spelled words
				if (!uniqueWords[word]) {
					// Ignore numbers and single character words
					if (/^\d+$/.test(word) || word.length == 1) {
						return;
					}

					words.push(word);
					uniqueWords[word] = true;
				}
			});

			function defaultSpellcheckCallback(method, words, doneCallback) {
				JSONRequest.sendRPC({
					url: new URI(url).toAbsolute(settings.spellchecker_rpc_url),
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
						finish();
					}
				});
			}

			editor.setProgressState(true);

			var spellCheckCallback = settings.spellchecker_callback || defaultSpellcheckCallback;
			spellCheckCallback("spellcheck", words, doneCallback);

			editor.focus();
		}

		function checkIfFinished() {
			if (!editor.dom.select('span.mce-spellchecker-word').length) {
				finish();
			}
		}

		function ignoreWord(wordMatch, all) {
			editor.selection.collapse();

			if (all) {
				getTextMatcher().each(function(match) {
					if (match.text == wordMatch.text) {
						getTextMatcher().unwrap(match);
					}
				});
			} else {
				getTextMatcher().unwrap(wordMatch);
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

		editor.on('click', function(e) {
			if (e.target.className == "mce-spellchecker-word") {
				e.preventDefault();

				var match = getTextMatcher().matchFromElement(e.target);
				editor.selection.setRng(getTextMatcher().rangeFromMatch(match));

				showSuggestions(match);
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

		function updateSelection(e) {
			var selectedLanguage = settings.spellchecker_language;

			e.control.items().each(function(ctrl) {
				ctrl.active(ctrl.settings.data === selectedLanguage);
			});
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

		this.getTextMatcher = getTextMatcher;

		// Set default spellchecker language if it's not specified
		settings.spellchecker_language = settings.spellchecker_language || settings.language || 'en';
	});
});
