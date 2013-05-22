/**
 * plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*jshint smarttabs:true, undef:true, unused:true, latedef:true, curly:true, bitwise:true */
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

			if (hiddenTextElementsMap[node.nodeName]) {
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
				} else if (!hiddenTextElementsMap[curNode.nodeName] && curNode.firstChild) {
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

			return function replace(range) {
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
		var self = this, currentIndex = -1, spellcheckerEnabled;

		function showDialog() {
			var win = tinymce.ui.Factory.create({
				type: 'window',
				layout: "flex",
				pack: "center",
				align: "center",
				onClose: function() {
					editor.focus();
					spellcheckerEnabled = false;
					self.unmarkAllMatches();
				},
				buttons: [
					{text: "Find", onclick: function() {
						win.find('form')[0].submit();
					}},
					{text: "Replace", disabled: true, onclick: function() {
						if (!self.replace(win.find('#replace').value())) {
							win.statusbar.items().slice(1).disabled(true);
						}
					}},
					{text: "Replace all", disabled: true, onclick: function() {
						self.replaceAll(win.find('#replace').value());
						win.statusbar.items().slice(1).disabled(true);
					}},
					{type: "spacer", flex: 1},
					{text: "Prev", disabled: true, onclick: function() {
						self.prev();
					}},
					{text: "Next", disabled: true, onclick: function() {
						self.next();
					}}
				],
				title: "Find and replace",
				items: {
					type: "form",
					padding: 20,
					labelGap: 30,
					spacing: 10,
					onsubmit: function(e) {
						var count, regEx, caseState, text, wholeWord;

						e.preventDefault();

						caseState = win.find('#case').checked();
						wholeWord = win.find('#words').checked();

						text = win.find('#find').value();
						if (!text.length) {
							self.unmarkAllMatches();
							win.statusbar.items().slice(1).disabled(true);
							return;
						}

						text = text.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
						text = wholeWord ? '\\b' + text + '\\b' : text;
						regEx = new RegExp(text, caseState ? 'g' : 'gi');
						count = self.markAllMatches(regEx);

						if (count) {
							self.first();
						} else {
							tinymce.ui.MessageBox.alert('Could not find the specified string.');
						}

						win.statusbar.items().slice(1).disabled(count === 0);
					},
					items: [
						{type: 'textbox', name: 'find', size: 40, label: 'Find', value: editor.selection.getNode().src},
						{type: 'textbox', name: 'replace', size: 40, label: 'Replace with'},
						{type: 'checkbox', name: 'case', text: 'Match case', label: ' '},
						{type: 'checkbox', name: 'words', text: 'Whole words', label: ' '}
					]
				}
			}).renderTo().reflow();

			spellcheckerEnabled = true;
		}

		self.init = function(ed) {
			ed.addMenuItem('searchreplace', {
				text: 'Find and replace',
				shortcut: 'Ctrl+F',
				onclick: showDialog,
				separator: 'before',
				context: 'edit'
			});

			ed.addButton('searchreplace', {
				tooltip: 'Find and replace',
				shortcut: 'Ctrl+F',
				onclick: showDialog
			});

			ed.shortcuts.add('Ctrl+F', '', showDialog);
		};

		self.markAllMatches = function(regex) {
			var node, marker;

			marker = editor.dom.create('span', {
				"class": 'mce-match-marker',
				"data-mce-bogus": 1
			});

			node = editor.getBody();

			self.unmarkAllMatches(node);

			return findAndReplaceDOMText(regex, node, marker, false, editor.schema);
		};

		function unwrap(node) {
			var parentNode = node.parentNode;
			parentNode.insertBefore(node.firstChild, node);
			node.parentNode.removeChild(node);
		}

		function moveSelection(forward, fromStart) {
			var selection = editor.selection, rng = selection.getRng(true), currentIndex = -1,
				startContainer, endContainer;

			forward = forward !== false;

			function walkToIndex() {
				var node, walker;

				if (fromStart) {
					node = editor.getBody()[forward ? 'firstChild' : 'lastChild'];
				} else {
					node = rng[forward ? 'endContainer' : 'startContainer'];
				}

				walker = new tinymce.dom.TreeWalker(node, editor.getBody());

				while ((node = walker.current())) {
					if (node.nodeType == 1 && node.nodeName == "SPAN" && node.getAttribute('data-mce-index') !== null) {
						currentIndex = node.getAttribute('data-mce-index');
						startContainer = node.firstChild;

						while ((node = walker.current())) {
							if (node.nodeType == 1 && node.nodeName == "SPAN" && node.getAttribute('data-mce-index') !== null) {
								if (node.getAttribute('data-mce-index') === currentIndex) {
									endContainer = node.firstChild;
								} else {
									return;
								}
							}

							walker[forward ? 'next' : 'prev']();
						}
					}

					walker[forward ? 'next' : 'prev']();
				}
			}

			walkToIndex();

			if (startContainer && endContainer) {
				editor.focus();

				if (forward) {
					rng.setStart(startContainer, 0);
					rng.setEnd(endContainer, endContainer.length);
				} else {
					rng.setStart(endContainer, 0);
					rng.setEnd(startContainer, startContainer.length);
				}

				selection.scrollIntoView(startContainer.parentNode);
				selection.setRng(rng);
			}

			return currentIndex;
		}

		function removeNode(node) {
			node.parentNode.removeChild(node);
		}

		self.first = function() {
			currentIndex = moveSelection(true, true);
			return currentIndex !== -1;
		};

		self.next = function() {
			currentIndex = moveSelection(true);
			return currentIndex !== -1;
		};

		self.prev = function() {
			currentIndex = moveSelection(false);
			return currentIndex !== -1;
		};

		self.replace = function(text, forward, all) {
			var i, nodes, node, matchIndex, currentMatchIndex, nextIndex;

			if (currentIndex === -1) {
				currentIndex = moveSelection(forward);
			}

			nextIndex = moveSelection(forward);

			node = editor.getBody();
			nodes = tinymce.toArray(node.getElementsByTagName('span'));
			if (nodes.length) {
				for (i = 0; i < nodes.length; i++) {
					var nodeIndex = nodes[i].getAttribute('data-mce-index');

					if (nodeIndex === null || !nodeIndex.length) {
						continue;
					}

					matchIndex = currentMatchIndex = nodes[i].getAttribute('data-mce-index');
					if (all || matchIndex === currentIndex) {
						if (text.length) {
							nodes[i].firstChild.nodeValue = text;
							unwrap(nodes[i]);
						} else {
							removeNode(nodes[i]);
						}

						while (nodes[++i]) {
							matchIndex = nodes[i].getAttribute('data-mce-index');

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
					}
				}
			}

			if (nextIndex == -1) {
				nextIndex = moveSelection(forward, true);
			}

			currentIndex = nextIndex;

			if (all) {
				editor.selection.setCursorLocation(editor.getBody(), 0);
			}

			editor.undoManager.add();

			return currentIndex !== -1;
		};

		self.replaceAll = function(text) {
			self.replace(text, true, true);
		};

		self.unmarkAllMatches = function() {
			var i, nodes, node;

			node = editor.getBody();
			nodes = node.getElementsByTagName('span');
			i = nodes.length;
			while (i--) {
				node = nodes[i];
				if (node.getAttribute('data-mce-index')) {
					unwrap(node);
				}
			}
		};

		editor.on('beforeaddundo keydown', function(e) {
			if (spellcheckerEnabled) {
				e.preventDefault();
				return false;
			}
		});
	}

	tinymce.PluginManager.add('searchreplace', Plugin);
})();