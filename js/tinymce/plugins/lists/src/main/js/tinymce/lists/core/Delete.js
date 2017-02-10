/**
 * Delete.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define("tinymce.lists.core.Delete", [
	"global!tinymce.dom.TreeWalker",
	"global!tinymce.dom.RangeUtils",
	"global!tinymce.util.VK",
	"tinymce.lists.core.Selection",
	"tinymce.lists.core.NodeType",
	"tinymce.lists.core.Bookmark",
	"tinymce.lists.core.Range",
	"tinymce.lists.core.NormalizeLists",
	"tinymce.lists.actions.ToggleList"
], function (
	TreeWalker, RangeUtils, VK, Selection, NodeType, Bookmark, Range, NormalizeLists, ToggleList
) {
	var findNextCaretContainer = function (editor, rng, isForward) {
		var node = rng.startContainer, offset = rng.startOffset;
		var nonEmptyBlocks, walker;

		if (node.nodeType === 3 && (isForward ? offset < node.data.length : offset > 0)) {
			return node;
		}

		nonEmptyBlocks = editor.schema.getNonEmptyElements();
		if (node.nodeType === 1) {
			node = RangeUtils.getNode(node, offset);
		}

		walker = new TreeWalker(node, editor.getBody());

		// Delete at <li>|<br></li> then jump over the bogus br
		if (isForward) {
			if (NodeType.isBogusBr(editor.dom, node)) {
				walker.next();
			}
		}

		while ((node = walker[isForward ? 'next' : 'prev2']())) {
			if (node.nodeName === 'LI' && !node.hasChildNodes()) {
				return node;
			}

			if (nonEmptyBlocks[node.nodeName]) {
				return node;
			}

			if (node.nodeType === 3 && node.data.length > 0) {
				return node;
			}
		}
	};

	var mergeLiElements = function (dom, fromElm, toElm) {
		var node, listNode, ul = fromElm.parentNode;

		if (!NodeType.isChildOfBody(dom, fromElm) || !NodeType.isChildOfBody(dom, toElm)) {
			return;
		}

		if (NodeType.isListNode(toElm.lastChild)) {
			listNode = toElm.lastChild;
		}

		if (ul === toElm.lastChild) {
			if (NodeType.isBr(ul.previousSibling)) {
				dom.remove(ul.previousSibling);
			}
		}

		node = toElm.lastChild;
		if (node && NodeType.isBr(node) && fromElm.hasChildNodes()) {
			dom.remove(node);
		}

		if (NodeType.isEmpty(dom, toElm, true)) {
			dom.$(toElm).empty();
		}

		if (!NodeType.isEmpty(dom, fromElm, true)) {
			while ((node = fromElm.firstChild)) {
				toElm.appendChild(node);
			}
		}

		if (listNode) {
			toElm.appendChild(listNode);
		}

		dom.remove(fromElm);

		if (NodeType.isEmpty(dom, ul) && ul !== dom.getRoot()) {
			dom.remove(ul);
		}
	};

	var backspaceDeleteFromListToListCaret = function (editor, isForward) {
		var dom = editor.dom, selection = editor.selection;
		var li = dom.getParent(selection.getStart(), 'LI'), ul, rng, otherLi;

		if (li) {
			ul = li.parentNode;
			if (ul === editor.getBody() && NodeType.isEmpty(dom, ul)) {
				return true;
			}

			rng = Range.normalizeRange(selection.getRng(true));
			otherLi = dom.getParent(findNextCaretContainer(editor, rng, isForward), 'LI');

			if (otherLi && otherLi !== li) {
				var bookmark = Bookmark.createBookmark(rng);

				if (isForward) {
					mergeLiElements(dom, otherLi, li);
				} else {
					mergeLiElements(dom, li, otherLi);
				}

				editor.selection.setRng(Bookmark.resolveBookmark(bookmark));

				return true;
			} else if (!otherLi) {
				if (!isForward && ToggleList.removeList(editor, ul.nodeName)) {
					return true;
				}
			}
		}

		return false;
	};

	var backspaceDeleteIntoListCaret = function (editor, isForward) {
		var dom = editor.dom;
		var block = dom.getParent(editor.selection.getStart(), dom.isBlock);

		if (block && dom.isEmpty(block)) {
			var rng = Range.normalizeRange(editor.selection.getRng(true));
			var otherLi = dom.getParent(findNextCaretContainer(editor, rng, isForward), 'LI');

			if (otherLi) {
				editor.undoManager.transact(function () {
					dom.remove(block);
					ToggleList.mergeWithAdjacentLists(dom, otherLi.parentNode);
					editor.selection.select(otherLi, true);
					editor.selection.collapse(isForward);
				});

				return true;
			}
		}

		return false;
	};

	var backspaceDeleteCaret = function (editor, isForward) {
		return backspaceDeleteFromListToListCaret(editor, isForward) || backspaceDeleteIntoListCaret(editor, isForward);
	};

	var backspaceDeleteRange = function (editor) {
		var startListParent = editor.dom.getParent(editor.selection.getStart(), 'LI,DT,DD');

		if (startListParent || Selection.getSelectedListItems(editor).length > 0) {
			editor.undoManager.transact(function () {
				editor.execCommand('Delete');
				NormalizeLists.normalizeLists(editor.dom, editor.getBody());
			});

			return true;
		}

		return false;
	};

	var backspaceDelete = function (editor, isForward) {
		return editor.selection.isCollapsed() ? backspaceDeleteCaret(editor, isForward) : backspaceDeleteRange(editor);
	};

	var setup = function (editor) {
		editor.on('keydown', function (e) {
			if (e.keyCode === VK.BACKSPACE) {
				if (backspaceDelete(editor, false)) {
					e.preventDefault();
				}
			} else if (e.keyCode === VK.DELETE) {
				if (backspaceDelete(editor, true)) {
					e.preventDefault();
				}
			}
		});
	};

	return {
		setup: setup,
		backspaceDelete: backspaceDelete
	};
});

