/**
 * plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*jshint smarttabs:true, undef:true, unused:true, latedef:true, curly:true, bitwise:true */
/*eslint no-labels:0, no-constant-condition: 0 */
/*global tinymce:true */

(function() {
	// Based on work developed by: James Padolsey http://james.padolsey.com
	// released under UNLICENSE that is compatible with LGPL
	// TODO: Handle contentEditable edgecase:
	// <p>text<span contentEditable="false">text<span contentEditable="true">text</span>text</span>text</p>
	function findAndReplaceDOMText(regex, node, replacementNode, captureGroup, schema) {
		var m, matches = [], text, count = 0, doc;
		var blockElementsMap, hiddenTextElementsMap, shortEndedElementsMap;

		doc = node.ownerDocument;
		blockElementsMap = schema.getBlockElements(); // H1-H6, P, TD etc
		hiddenTextElementsMap = schema.getWhiteSpaceElements(); // TEXTAREA, PRE, STYLE, SCRIPT
		shortEndedElementsMap = schema.getShortEndedElements(); // BR, IMG, INPUT

		function getMatchIndexes(m, captureGroup) {
			captureGroup = captureGroup || 0;

			if (!m[0]) {
				throw 'findAndReplaceDOMText cannot handle zero-length matches';
			}

			var index = m.index;

			if (captureGroup > 0) {
				var cg = m[captureGroup];

				if (!cg) {
					throw 'Invalid capture group';
				}

				index += m[0].indexOf(cg);
				m[0] = cg;
			}

			return [index, index + m[0].length, [m[0]]];
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
				matchLocation = matches.shift(), matchIndex = 0;

			out: while (true) {
				if (blockElementsMap[curNode.nodeName] || shortEndedElementsMap[curNode.nodeName]) {
					atIndex++;
				}

				if (curNode.nodeType === 3) {
					if (!endNode && curNode.length + atIndex >= matchLocation[1]) {
						// We've found the ending
						endNode = curNode;
						endNodeIndex = matchLocation[1] - atIndex;
					} else if (startNode) {
						// Intersecting node
						innerNodes.push(curNode);
					}

					if (!startNode && curNode.length + atIndex > matchLocation[0]) {
						// We've found the match start
						startNode = curNode;
						startNodeIndex = matchLocation[0] - atIndex;
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
						match: matchLocation[2],
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
		function genReplacer(nodeName) {
			var makeReplacementNode;

			if (typeof nodeName != 'function') {
				var stencilNode = nodeName.nodeType ? nodeName : doc.createElement(nodeName);

				makeReplacementNode = function(fill, matchIndex) {
					var clone = stencilNode.cloneNode(false);

					clone.setAttribute('data-mce-index', matchIndex);

					if (fill) {
						clone.appendChild(doc.createTextNode(fill));
					}

					return clone;
				};
			} else {
				makeReplacementNode = nodeName;
			}

			return function(range) {
				var before, after, parentNode, startNode = range.startNode,
					endNode = range.endNode, matchIndex = range.matchIndex;

				if (startNode === endNode) {
					var node = startNode;

					parentNode = node.parentNode;
					if (range.startNodeIndex > 0) {
						// Add `before` text node (before the match)
						before = doc.createTextNode(node.data.substring(0, range.startNodeIndex));
						parentNode.insertBefore(before, node);
					}

					// Create the replacement node:
					var el = makeReplacementNode(range.match[0], matchIndex);
					parentNode.insertBefore(el, node);
					if (range.endNodeIndex < node.length) {
						// Add `after` text node (after the match)
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

		text = getText(node);
		if (!text) {
			return;
		}

		if (regex.global) {
			while ((m = regex.exec(text))) {
				matches.push(getMatchIndexes(m, captureGroup));
			}
		} else {
			m = text.match(regex);
			matches.push(getMatchIndexes(m, captureGroup));
		}

		if (matches.length) {
			count = matches.length;
			stepThroughMatches(node, matches, genReplacer(replacementNode));
		}

		return count;
	}

	function Plugin(editor) {
		var self = this, currentIndex = -1;

		function showDialog() {
			var last = {};

			function updateButtonStates() {
				win.statusbar.find('#next').disabled(!findSpansByIndex(currentIndex + 1).length);
				win.statusbar.find('#prev').disabled(!findSpansByIndex(currentIndex - 1).length);
			}

			function notFoundAlert() {
				tinymce.ui.MessageBox.alert('Could not find the specified string.', function() {
					win.find('#find')[0].focus();
				});
			}

			var win = tinymce.ui.Factory.create({
				type: 'window',
				layout: "flex",
				pack: "center",
				align: "center",
				onClose: function() {
					editor.focus();
					self.done();
				},
				onSubmit: function(e) {
					var count, caseState, text, wholeWord;

					e.preventDefault();

					caseState = win.find('#case').checked();
					wholeWord = win.find('#words').checked();

					text = win.find('#find').value();
					if (!text.length) {
						self.done(false);
						win.statusbar.items().slice(1).disabled(true);
						return;
					}

					if (last.text == text && last.caseState == caseState && last.wholeWord == wholeWord) {
						if (findSpansByIndex(currentIndex + 1).length === 0) {
							notFoundAlert();
							return;
						}

						self.next();
						updateButtonStates();
						return;
					}

					count = self.find(text, caseState, wholeWord);
					if (!count) {
						notFoundAlert();
					}

					win.statusbar.items().slice(1).disabled(count === 0);
					updateButtonStates();

					last = {
						text: text,
						caseState: caseState,
						wholeWord: wholeWord
					};
				},
				buttons: [
					{text: "Find", subtype: 'primary', onclick: function() {
						win.submit();
					}},
					{text: "Replace", disabled: true, onclick: function() {
						if (!self.replace(win.find('#replace').value())) {
							win.statusbar.items().slice(1).disabled(true);
							currentIndex = -1;
							last = {};
						}
					}},
					{text: "Replace all", disabled: true, onclick: function() {
						self.replace(win.find('#replace').value(), true, true);
						win.statusbar.items().slice(1).disabled(true);
						last = {};
					}},
					{type: "spacer", flex: 1},
					{text: "Prev", name: 'prev', disabled: true, onclick: function() {
						self.prev();
						updateButtonStates();
					}},
					{text: "Next", name: 'next', disabled: true, onclick: function() {
						self.next();
						updateButtonStates();
					}}
				],
				title: "Find and replace",
				items: {
					type: "form",
					padding: 20,
					labelGap: 30,
					spacing: 10,
					items: [
						{type: 'textbox', name: 'find', size: 40, label: 'Find', value: editor.selection.getNode().src},
						{type: 'textbox', name: 'replace', size: 40, label: 'Replace with'},
						{type: 'checkbox', name: 'case', text: 'Match case', label: ' '},
						{type: 'checkbox', name: 'words', text: 'Whole words', label: ' '}
					]
				}
			}).renderTo().reflow();
		}

		self.init = function(ed) {
			ed.addMenuItem('searchreplace', {
				text: 'Find and replace',
				shortcut: 'Meta+F',
				onclick: showDialog,
				separator: 'before',
				context: 'edit'
			});

			ed.addButton('searchreplace', {
				tooltip: 'Find and replace',
				shortcut: 'Meta+F',
				onclick: showDialog
			});

			ed.addCommand("SearchReplace", showDialog);
			ed.shortcuts.add('Meta+F', '', showDialog);
		};

		function getElmIndex(elm) {
			var value = elm.getAttribute('data-mce-index');

			if (typeof value == "number") {
				return "" + value;
			}

			return value;
		}

		function markAllMatches(regex) {
			var node, marker;

			marker = editor.dom.create('span', {
				"data-mce-bogus": 1
			});

			marker.className = 'mce-match-marker'; // IE 7 adds class="mce-match-marker" and class=mce-match-marker
			node = editor.getBody();

			self.done(false);

			return findAndReplaceDOMText(regex, node, marker, false, editor.schema);
		}

		function unwrap(node) {
			var parentNode = node.parentNode;

			if (node.firstChild) {
				parentNode.insertBefore(node.firstChild, node);
			}

			node.parentNode.removeChild(node);
		}

		function findSpansByIndex(index) {
			var nodes, spans = [];

			nodes = tinymce.toArray(editor.getBody().getElementsByTagName('span'));
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

		function moveSelection(forward) {
			var testIndex = currentIndex, dom = editor.dom;

			forward = forward !== false;

			if (forward) {
				testIndex++;
			} else {
				testIndex--;
			}

			dom.removeClass(findSpansByIndex(currentIndex), 'mce-match-marker-selected');

			var spans = findSpansByIndex(testIndex);
			if (spans.length) {
				dom.addClass(findSpansByIndex(testIndex), 'mce-match-marker-selected');
				editor.selection.scrollIntoView(spans[0]);
				return testIndex;
			}

			return -1;
		}

		function removeNode(node) {
			node.parentNode.removeChild(node);
		}

		self.find = function(text, matchCase, wholeWord) {
			text = text.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
			text = wholeWord ? '\\b' + text + '\\b' : text;

			var count = markAllMatches(new RegExp(text, matchCase ? 'g' : 'gi'));

			if (count) {
				currentIndex = -1;
				currentIndex = moveSelection(true);
			}

			return count;
		};

		self.next = function() {
			var index = moveSelection(true);

			if (index !== -1) {
				currentIndex = index;
			}
		};

		self.prev = function() {
			var index = moveSelection(false);

			if (index !== -1) {
				currentIndex = index;
			}
		};

		self.replace = function(text, forward, all) {
			var i, nodes, node, matchIndex, currentMatchIndex, nextIndex = currentIndex, hasMore;

			forward = forward !== false;

			node = editor.getBody();
			nodes = tinymce.toArray(node.getElementsByTagName('span'));
			for (i = 0; i < nodes.length; i++) {
				var nodeIndex = getElmIndex(nodes[i]);

				if (nodeIndex === null || !nodeIndex.length) {
					continue;
				}

				matchIndex = currentMatchIndex = parseInt(nodeIndex, 10);
				if (all || matchIndex === currentIndex) {
					if (text.length) {
						nodes[i].firstChild.nodeValue = text;
						unwrap(nodes[i]);
					} else {
						removeNode(nodes[i]);
					}

					while (nodes[++i]) {
						matchIndex = getElmIndex(nodes[i]);

						if (nodeIndex === null || !nodeIndex.length) {
							continue;
						}

						if (matchIndex === currentMatchIndex) {
							removeNode(nodes[i]);
						} else {
							i--;
							break;
						}
					}

					if (forward) {
						nextIndex--;
					}
				} else if (currentMatchIndex > currentIndex) {
					nodes[i].setAttribute('data-mce-index', currentMatchIndex - 1);
				}
			}

			editor.undoManager.add();
			currentIndex = nextIndex;

			if (forward) {
				hasMore = findSpansByIndex(nextIndex + 1).length > 0;
				self.next();
			} else {
				hasMore = findSpansByIndex(nextIndex - 1).length > 0;
				self.prev();
			}

			return !all && hasMore;
		};

		self.done = function(keepEditorSelection) {
			var i, nodes, startContainer, endContainer;

			nodes = tinymce.toArray(editor.getBody().getElementsByTagName('span'));
			for (i = 0; i < nodes.length; i++) {
				var nodeIndex = getElmIndex(nodes[i]);

				if (nodeIndex !== null && nodeIndex.length) {
					if (nodeIndex === currentIndex.toString()) {
						if (!startContainer) {
							startContainer = nodes[i].firstChild;
						}

						endContainer = nodes[i].firstChild;
					}

					unwrap(nodes[i]);
				}
			}

			if (startContainer && endContainer) {
				var rng = editor.dom.createRng();
				rng.setStart(startContainer, 0);
				rng.setEnd(endContainer, endContainer.data.length);

				if (keepEditorSelection !== false) {
					editor.selection.setRng(rng);
				}

				return rng;
			}
		};
	}

	tinymce.PluginManager.add('searchreplace', Plugin);
})();
