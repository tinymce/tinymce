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
	return function(regex, node, schema) {
		var m, matches = [], text, count = 0, doc;
		var blockElementsMap, hiddenTextElementsMap, shortEndedElementsMap;

		doc = node.ownerDocument;
		blockElementsMap = schema.getBlockElements(); // H1-H6, P, TD etc
		hiddenTextElementsMap = schema.getWhiteSpaceElements(); // TEXTAREA, PRE, STYLE, SCRIPT
		shortEndedElementsMap = schema.getShortEndedElements(); // BR, IMG, INPUT

		function getMatchIndexes(m) {
			if (!m[0]) {
				throw 'findAndReplaceDOMText cannot handle zero-length matches';
			}

			var index = m.index;

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
		if (text && regex.global) {
			while ((m = regex.exec(text))) {
				matches.push(getMatchIndexes(m));
			}
		}

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

		function each(callback) {
			for (var i = 0, l = matches.length; i < l; i++) {
				if (callback(matches[i], i) === false) {
					break;
				}
			}

			/*jshint validthis:true*/
			return this;
		}

		function mark(replacementNode) {
			if (matches.length) {
				count = matches.length;
				stepThroughMatches(node, matches, genReplacer(replacementNode));
			}

			/*jshint validthis:true*/
			return this;
		}

		return {
			text: text,
			count: count,
			matches: matches,
			each: each,
			filter: filter,
			mark: mark
		};
	};
});
