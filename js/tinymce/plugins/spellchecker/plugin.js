/**
 * Compiled inline version. (Library mode)
 */

/*jshint smarttabs:true, undef:true, latedef:true, curly:true, bitwise:true, camelcase:true */
/*globals $code */

(function(exports, undefined) {
	"use strict";

	var modules = {};

	function require(ids, callback) {
		var module, defs = [];

		for (var i = 0; i < ids.length; ++i) {
			module = modules[ids[i]] || resolve(ids[i]);
			if (!module) {
				throw 'module definition dependecy not found: ' + ids[i];
			}

			defs.push(module);
		}

		callback.apply(null, defs);
	}

	function define(id, dependencies, definition) {
		if (typeof id !== 'string') {
			throw 'invalid module definition, module id must be defined and be a string';
		}

		if (dependencies === undefined) {
			throw 'invalid module definition, dependencies must be specified';
		}

		if (definition === undefined) {
			throw 'invalid module definition, definition function must be specified';
		}

		require(dependencies, function() {
			modules[id] = definition.apply(null, arguments);
		});
	}

	function defined(id) {
		return !!modules[id];
	}

	function resolve(id) {
		var target = exports;
		var fragments = id.split(/[.\/]/);

		for (var fi = 0; fi < fragments.length; ++fi) {
			if (!target[fragments[fi]]) {
				return;
			}

			target = target[fragments[fi]];
		}

		return target;
	}

	function expose(ids) {
		for (var i = 0; i < ids.length; i++) {
			var target = exports;
			var id = ids[i];
			var fragments = id.split(/[.\/]/);

			for (var fi = 0; fi < fragments.length - 1; ++fi) {
				if (target[fragments[fi]] === undefined) {
					target[fragments[fi]] = {};
				}

				target = target[fragments[fi]];
			}

			target[fragments[fragments.length - 1]] = modules[id];
		}
	}

// Included from: js/tinymce/plugins/spellchecker/classes/DomTextMatcher.js

/**
 * DomTextMatcher.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class logic for filtering text and matching words.
 *
 * @class tinymce.spellcheckerplugin.TextFilter
 * @private
 */
define("tinymce/spellcheckerplugin/DomTextMatcher", [], function() {
	// Based on work developed by: James Padolsey http://james.padolsey.com
	// released under UNLICENSE that is compatible with LGPL
	// TODO: Handle contentEditable edgecase:
	// <p>text<span contentEditable="false">text<span contentEditable="true">text</span>text</span>text</p>
	return function(node, editor) {
		var m, matches = [], text, dom = editor.dom;
		var blockElementsMap, hiddenTextElementsMap, shortEndedElementsMap;

		blockElementsMap = editor.schema.getBlockElements(); // H1-H6, P, TD etc
		hiddenTextElementsMap = editor.schema.getWhiteSpaceElements(); // TEXTAREA, PRE, STYLE, SCRIPT
		shortEndedElementsMap = editor.schema.getShortEndedElements(); // BR, IMG, INPUT

		function createMatch(m, data) {
			if (!m[0]) {
				throw 'findAndReplaceDOMText cannot handle zero-length matches';
			}

			return {
				start: m.index,
				end: m.index + m[0].length,
				text: m[0],
				data: data
			};
		}

		function getText(node) {
			var txt;

			if (node.nodeType === 3) {
				return node.data;
			}

			if (hiddenTextElementsMap[node.nodeName] && !blockElementsMap[node.nodeName]) {
				return '';
			}

			txt = '';

			if (blockElementsMap[node.nodeName] || shortEndedElementsMap[node.nodeName]) {
				txt += '\n';
			}

			if ((node = node.firstChild)) {
				do {
					txt += getText(node);
				} while ((node = node.nextSibling));
			}

			return txt;
		}

		function stepThroughMatches(node, matches, replaceFn) {
			var startNode, endNode, startNodeIndex,
				endNodeIndex, innerNodes = [], atIndex = 0, curNode = node,
				matchLocation, matchIndex = 0;

			matches = matches.slice(0);
			matches.sort(function(a, b) {
				return a.start - b.start;
			});

			matchLocation = matches.shift();

			out: while (true) {
				if (blockElementsMap[curNode.nodeName] || shortEndedElementsMap[curNode.nodeName]) {
					atIndex++;
				}

				if (curNode.nodeType === 3) {
					if (!endNode && curNode.length + atIndex >= matchLocation.end) {
						// We've found the ending
						endNode = curNode;
						endNodeIndex = matchLocation.end - atIndex;
					} else if (startNode) {
						// Intersecting node
						innerNodes.push(curNode);
					}

					if (!startNode && curNode.length + atIndex > matchLocation.start) {
						// We've found the match start
						startNode = curNode;
						startNodeIndex = matchLocation.start - atIndex;
					}

					atIndex += curNode.length;
				}

				if (startNode && endNode) {
					curNode = replaceFn({
						startNode: startNode,
						startNodeIndex: startNodeIndex,
						endNode: endNode,
						endNodeIndex: endNodeIndex,
						innerNodes: innerNodes,
						match: matchLocation.text,
						matchIndex: matchIndex
					});

					// replaceFn has to return the node that replaced the endNode
					// and then we step back so we can continue from the end of the
					// match:
					atIndex -= (endNode.length - endNodeIndex);
					startNode = null;
					endNode = null;
					innerNodes = [];
					matchLocation = matches.shift();
					matchIndex++;

					if (!matchLocation) {
						break; // no more matches
					}
				} else if ((!hiddenTextElementsMap[curNode.nodeName] || blockElementsMap[curNode.nodeName]) && curNode.firstChild) {
					// Move down
					curNode = curNode.firstChild;
					continue;
				} else if (curNode.nextSibling) {
					// Move forward:
					curNode = curNode.nextSibling;
					continue;
				}

				// Move forward or up:
				while (true) {
					if (curNode.nextSibling) {
						curNode = curNode.nextSibling;
						break;
					} else if (curNode.parentNode !== node) {
						curNode = curNode.parentNode;
					} else {
						break out;
					}
				}
			}
		}

		/**
		* Generates the actual replaceFn which splits up text nodes
		* and inserts the replacement element.
		*/
		function genReplacer(callback) {
			function makeReplacementNode(fill, matchIndex) {
				var match = matches[matchIndex];

				if (!match.stencil) {
					match.stencil = callback(match);
				}

				var clone = match.stencil.cloneNode(false);
				clone.setAttribute('data-mce-index', matchIndex);

				if (fill) {
					clone.appendChild(dom.doc.createTextNode(fill));
				}

				return clone;
			}

			return function replace(range) {
				var before, after, parentNode, startNode = range.startNode,
					endNode = range.endNode, matchIndex = range.matchIndex,
					doc = dom.doc;

				if (startNode === endNode) {
					var node = startNode;

					parentNode = node.parentNode;
					if (range.startNodeIndex > 0) {
						// Add "before" text node (before the match)
						before = doc.createTextNode(node.data.substring(0, range.startNodeIndex));
						parentNode.insertBefore(before, node);
					}

					// Create the replacement node:
					var el = makeReplacementNode(range.match, matchIndex);
					parentNode.insertBefore(el, node);
					if (range.endNodeIndex < node.length) {
						// Add "after" text node (after the match)
						after = doc.createTextNode(node.data.substring(range.endNodeIndex));
						parentNode.insertBefore(after, node);
					}

					node.parentNode.removeChild(node);

					return el;
				} else {
					// Replace startNode -> [innerNodes...] -> endNode (in that order)
					before = doc.createTextNode(startNode.data.substring(0, range.startNodeIndex));
					after = doc.createTextNode(endNode.data.substring(range.endNodeIndex));
					var elA = makeReplacementNode(startNode.data.substring(range.startNodeIndex), matchIndex);
					var innerEls = [];

					for (var i = 0, l = range.innerNodes.length; i < l; ++i) {
						var innerNode = range.innerNodes[i];
						var innerEl = makeReplacementNode(innerNode.data, matchIndex);
						innerNode.parentNode.replaceChild(innerEl, innerNode);
						innerEls.push(innerEl);
					}

					var elB = makeReplacementNode(endNode.data.substring(0, range.endNodeIndex), matchIndex);

					parentNode = startNode.parentNode;
					parentNode.insertBefore(before, startNode);
					parentNode.insertBefore(elA, startNode);
					parentNode.removeChild(startNode);

					parentNode = endNode.parentNode;
					parentNode.insertBefore(elB, endNode);
					parentNode.insertBefore(after, endNode);
					parentNode.removeChild(endNode);

					return elB;
				}
			};
		}

		function unwrapElement(element) {
			var parentNode = element.parentNode;
			parentNode.insertBefore(element.firstChild, element);
			element.parentNode.removeChild(element);
		}

		function getWrappersByIndex(index) {
			var elements = node.getElementsByTagName('*'), wrappers = [];

			index = typeof(index) == "number" ? "" + index : null;

			for (var i = 0; i < elements.length; i++) {
				var element = elements[i], dataIndex = element.getAttribute('data-mce-index');

				if (dataIndex !== null && dataIndex.length) {
					if (dataIndex === index || index === null) {
						wrappers.push(element);
					}
				}
			}

			return wrappers;
		}

		/**
		 * Returns the index of a specific match object or -1 if it isn't found.
		 *
		 * @param  {Match} match Text match object.
		 * @return {Number} Index of match or -1 if it isn't found.
		 */
		function indexOf(match) {
			var i = matches.length;
			while (i--) {
				if (matches[i] === match) {
					return i;
				}
			}

			return -1;
		}

		/**
		 * Filters the matches. If the callback returns true it stays if not it gets removed.
		 *
		 * @param {Function} callback Callback to execute for each match.
		 * @return {DomTextMatcher} Current DomTextMatcher instance.
		 */
		function filter(callback) {
			var filteredMatches = [];

			each(function(match, i) {
				if (callback(match, i)) {
					filteredMatches.push(match);
				}
			});

			matches = filteredMatches;

			/*jshint validthis:true*/
			return this;
		}

		/**
		 * Executes the specified callback for each match.
		 *
		 * @param {Function} callback  Callback to execute for each match.
		 * @return {DomTextMatcher} Current DomTextMatcher instance.
		 */
		function each(callback) {
			for (var i = 0, l = matches.length; i < l; i++) {
				if (callback(matches[i], i) === false) {
					break;
				}
			}

			/*jshint validthis:true*/
			return this;
		}

		/**
		 * Wraps the current matches with nodes created by the specified callback.
		 * Multiple clones of these matches might occur on matches that are on multiple nodex.
		 *
		 * @param {Function} callback Callback to execute in order to create elements for matches.
		 * @return {DomTextMatcher} Current DomTextMatcher instance.
		 */
		function wrap(callback) {
			if (matches.length) {
				stepThroughMatches(node, matches, genReplacer(callback));
			}

			/*jshint validthis:true*/
			return this;
		}

		/**
		 * Finds the specified regexp and adds them to the matches collection.
		 *
		 * @param {RegExp} regex Global regexp to search the current node by.
		 * @param {Object} [data] Optional custom data element for the match.
		 * @return {DomTextMatcher} Current DomTextMatcher instance.
		 */
		function find(regex, data) {
			if (text && regex.global) {
				while ((m = regex.exec(text))) {
					matches.push(createMatch(m, data));
				}
			}

			return this;
		}

		/**
		 * Unwraps the specified match object or all matches if unspecified.
		 *
		 * @param {Object} [match] Optional match object.
		 * @return {DomTextMatcher} Current DomTextMatcher instance.
		 */
		function unwrap(match) {
			var i, elements = getWrappersByIndex(match ? indexOf(match) : null);

			i = elements.length;
			while (i--) {
				unwrapElement(elements[i]);
			}

			return this;
		}

		/**
		 * Returns a match object by the specified DOM element.
		 *
		 * @param {DOMElement} element Element to return match object for.
		 * @return {Object} Match object for the specified element.
		 */
		function matchFromElement(element) {
			return matches[element.getAttribute('data-mce-index')];
		}

		/**
		 * Returns a DOM element from the specified match element. This will be the first element if it's split
		 * on multiple nodes.
		 *
		 * @param {Object} match Match element to get first element of.
		 * @return {DOMElement} DOM element for the specified match object.
		 */
		function elementFromMatch(match) {
			return getWrappersByIndex(indexOf(match))[0];
		}

		/**
		 * Adds match the specified range for example a grammar line.
		 *
		 * @param {Number} start Start offset.
		 * @param {Number} length Length of the text.
		 * @param {Object} data Custom data object for match.
		 * @return {DomTextMatcher} Current DomTextMatcher instance.
		 */
		function add(start, length, data) {
			matches.push({
				start: start,
				end: start + length,
				text: text.substr(start, length),
				data: data
			});

			return this;
		}

		/**
		 * Returns a DOM range for the specified match.
		 *
		 * @param  {Object} match Match object to get range for.
		 * @return {DOMRange} DOM Range for the specified match.
		 */
		function rangeFromMatch(match) {
			var wrappers = getWrappersByIndex(indexOf(match));

			var rng = editor.dom.createRng();
			rng.setStartBefore(wrappers[0]);
			rng.setEndAfter(wrappers[wrappers.length - 1]);

			return rng;
		}

		/**
		 * Replaces the specified match with the specified text.
		 *
		 * @param {Object} match Match object to replace.
		 * @param {String} text Text to replace the match with.
		 * @return {DOMRange} DOM range produced after the replace.
		 */
		function replace(match, text) {
			var rng = rangeFromMatch(match);

			rng.deleteContents();

			if (text.length > 0) {
				rng.insertNode(editor.dom.doc.createTextNode(text));
			}

			return rng;
		}

		/**
		 * Resets the DomTextMatcher instance. This will remove any wrapped nodes and remove any matches.
		 *
		 * @return {[type]} [description]
		 */
		function reset() {
			matches.splice(0, matches.length);
			unwrap();

			return this;
		}

		text = getText(node);

		return {
			text: text,
			matches: matches,
			each: each,
			filter: filter,
			reset: reset,
			matchFromElement: matchFromElement,
			elementFromMatch: elementFromMatch,
			find: find,
			add: add,
			wrap: wrap,
			unwrap: unwrap,
			replace: replace,
			rangeFromMatch: rangeFromMatch,
			indexOf: indexOf
		};
	};
});

// Included from: js/tinymce/plugins/spellchecker/classes/Plugin.js

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

expose(["tinymce/spellcheckerplugin/DomTextMatcher","tinymce/spellcheckerplugin/Plugin"]);
})(this);