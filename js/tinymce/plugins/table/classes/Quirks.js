/**
 * Quirks.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class includes fixes for various browser quirks.
 *
 * @class tinymce.tableplugin.Quirks
 * @private
 */
define("tinymce/tableplugin/Quirks", [
	"tinymce/util/VK",
	"tinymce/util/Delay",
	"tinymce/Env",
	"tinymce/util/Tools",
	"tinymce/tableplugin/Utils"
], function(VK, Delay, Env, Tools, Utils) {
	var each = Tools.each, getSpanVal = Utils.getSpanVal;

	return function(editor) {
		/**
		 * Fixed caret movement around tables on WebKit.
		 */
		function moveWebKitSelection() {
			function eventHandler(e) {
				var key = e.keyCode;

				function handle(upBool, sourceNode) {
					var siblingDirection = upBool ? 'previousSibling' : 'nextSibling';
					var currentRow = editor.dom.getParent(sourceNode, 'tr');
					var siblingRow = currentRow[siblingDirection];

					if (siblingRow) {
						moveCursorToRow(editor, sourceNode, siblingRow, upBool);
						e.preventDefault();
						return true;
					}

					var tableNode = editor.dom.getParent(currentRow, 'table');
					var middleNode = currentRow.parentNode;
					var parentNodeName = middleNode.nodeName.toLowerCase();
					if (parentNodeName === 'tbody' || parentNodeName === (upBool ? 'tfoot' : 'thead')) {
						var targetParent = getTargetParent(upBool, tableNode, middleNode, 'tbody');
						if (targetParent !== null) {
							return moveToRowInTarget(upBool, targetParent, sourceNode);
						}
					}

					return escapeTable(upBool, currentRow, siblingDirection, tableNode);
				}

				function getTargetParent(upBool, topNode, secondNode, nodeName) {
					var tbodies = editor.dom.select('>' + nodeName, topNode);
					var position = tbodies.indexOf(secondNode);
					if (upBool && position === 0 || !upBool && position === tbodies.length - 1) {
						return getFirstHeadOrFoot(upBool, topNode);
					} else if (position === -1) {
						var topOrBottom = secondNode.tagName.toLowerCase() === 'thead' ? 0 : tbodies.length - 1;
						return tbodies[topOrBottom];
					}

					return tbodies[position + (upBool ? -1 : 1)];
				}

				function getFirstHeadOrFoot(upBool, parent) {
					var tagName = upBool ? 'thead' : 'tfoot';
					var headOrFoot = editor.dom.select('>' + tagName, parent);
					return headOrFoot.length !== 0 ? headOrFoot[0] : null;
				}

				function moveToRowInTarget(upBool, targetParent, sourceNode) {
					var targetRow = getChildForDirection(targetParent, upBool);

					if (targetRow) {
						moveCursorToRow(editor, sourceNode, targetRow, upBool);
					}

					e.preventDefault();
					return true;
				}

				function escapeTable(upBool, currentRow, siblingDirection, table) {
					var tableSibling = table[siblingDirection];

					if (tableSibling) {
						moveCursorToStartOfElement(tableSibling);
						return true;
					}

					var parentCell = editor.dom.getParent(table, 'td,th');
					if (parentCell) {
						return handle(upBool, parentCell, e);
					}

					var backUpSibling = getChildForDirection(currentRow, !upBool);
					moveCursorToStartOfElement(backUpSibling);
					e.preventDefault();
					return false;
				}

				function getChildForDirection(parent, up) {
					var child = parent && parent[up ? 'lastChild' : 'firstChild'];
					// BR is not a valid table child to return in this case we return the table cell
					return child && child.nodeName === 'BR' ? editor.dom.getParent(child, 'td,th') : child;
				}

				function moveCursorToStartOfElement(n) {
					editor.selection.setCursorLocation(n, 0);
				}

				function isVerticalMovement() {
					return key == VK.UP || key == VK.DOWN;
				}

				function isInTable(editor) {
					var node = editor.selection.getNode();
					var currentRow = editor.dom.getParent(node, 'tr');
					return currentRow !== null;
				}

				function columnIndex(column) {
					var colIndex = 0;
					var c = column;
					while (c.previousSibling) {
						c = c.previousSibling;
						colIndex = colIndex + getSpanVal(c, "colspan");
					}
					return colIndex;
				}

				function findColumn(rowElement, columnIndex) {
					var c = 0, r = 0;

					each(rowElement.children, function(cell, i) {
						c = c + getSpanVal(cell, "colspan");
						r = i;
						if (c > columnIndex) {
							return false;
						}
					});
					return r;
				}

				function moveCursorToRow(ed, node, row, upBool) {
					var srcColumnIndex = columnIndex(editor.dom.getParent(node, 'td,th'));
					var tgtColumnIndex = findColumn(row, srcColumnIndex);
					var tgtNode = row.childNodes[tgtColumnIndex];
					var rowCellTarget = getChildForDirection(tgtNode, upBool);
					moveCursorToStartOfElement(rowCellTarget || tgtNode);
				}

				function shouldFixCaret(preBrowserNode) {
					var newNode = editor.selection.getNode();
					var newParent = editor.dom.getParent(newNode, 'td,th');
					var oldParent = editor.dom.getParent(preBrowserNode, 'td,th');

					return newParent && newParent !== oldParent && checkSameParentTable(newParent, oldParent);
				}

				function checkSameParentTable(nodeOne, NodeTwo) {
					return editor.dom.getParent(nodeOne, 'TABLE') === editor.dom.getParent(NodeTwo, 'TABLE');
				}

				if (isVerticalMovement() && isInTable(editor)) {
					var preBrowserNode = editor.selection.getNode();
					Delay.setEditorTimeout(editor, function() {
						if (shouldFixCaret(preBrowserNode)) {
							handle(!e.shiftKey && key === VK.UP, preBrowserNode, e);
						}
					}, 0);
				}
			}

			editor.on('KeyDown', function(e) {
				eventHandler(e);
			});
		}

		function fixBeforeTableCaretBug() {
			// Checks if the selection/caret is at the start of the specified block element
			function isAtStart(rng, par) {
				var doc = par.ownerDocument, rng2 = doc.createRange(), elm;

				rng2.setStartBefore(par);
				rng2.setEnd(rng.endContainer, rng.endOffset);

				elm = doc.createElement('body');
				elm.appendChild(rng2.cloneContents());

				// Check for text characters of other elements that should be treated as content
				return elm.innerHTML.replace(/<(br|img|object|embed|input|textarea)[^>]*>/gi, '-').replace(/<[^>]+>/g, '').length === 0;
			}

			// Fixes an bug where it's impossible to place the caret before a table in Gecko
			// this fix solves it by detecting when the caret is at the beginning of such a table
			// and then manually moves the caret infront of the table
			editor.on('KeyDown', function(e) {
				var rng, table, dom = editor.dom;

				// On gecko it's not possible to place the caret before a table
				if (e.keyCode == 37 || e.keyCode == 38) {
					rng = editor.selection.getRng();
					table = dom.getParent(rng.startContainer, 'table');

					if (table && editor.getBody().firstChild == table) {
						if (isAtStart(rng, table)) {
							rng = dom.createRng();

							rng.setStartBefore(table);
							rng.setEndBefore(table);

							editor.selection.setRng(rng);

							e.preventDefault();
						}
					}
				}
			});
		}

		// Fixes an issue on Gecko where it's impossible to place the caret behind a table
		// This fix will force a paragraph element after the table but only when the forced_root_block setting is enabled
		function fixTableCaretPos() {
			editor.on('KeyDown SetContent VisualAid', function() {
				var last;

				// Skip empty text nodes from the end
				for (last = editor.getBody().lastChild; last; last = last.previousSibling) {
					if (last.nodeType == 3) {
						if (last.nodeValue.length > 0) {
							break;
						}
					} else if (last.nodeType == 1 && (last.tagName == 'BR' || !last.getAttribute('data-mce-bogus'))) {
						break;
					}
				}

				if (last && last.nodeName == 'TABLE') {
					if (editor.settings.forced_root_block) {
						editor.dom.add(
							editor.getBody(),
							editor.settings.forced_root_block,
							editor.settings.forced_root_block_attrs,
							Env.ie && Env.ie < 10 ? '&nbsp;' : '<br data-mce-bogus="1" />'
						);
					} else {
						editor.dom.add(editor.getBody(), 'br', {'data-mce-bogus': '1'});
					}
				}
			});

			editor.on('PreProcess', function(o) {
				var last = o.node.lastChild;

				if (last && (last.nodeName == "BR" || (last.childNodes.length == 1 &&
					(last.firstChild.nodeName == 'BR' || last.firstChild.nodeValue == '\u00a0'))) &&
					last.previousSibling && last.previousSibling.nodeName == "TABLE") {
					editor.dom.remove(last);
				}
			});
		}

		// this nasty hack is here to work around some WebKit selection bugs.
		function fixTableCellSelection() {
			function tableCellSelected(ed, rng, n, currentCell) {
				// The decision of when a table cell is selected is somewhat involved.  The fact that this code is
				// required is actually a pointer to the root cause of this bug. A cell is selected when the start
				// and end offsets are 0, the start container is a text, and the selection node is either a TR (most cases)
				// or the parent of the table (in the case of the selection containing the last cell of a table).
				var TEXT_NODE = 3, table = ed.dom.getParent(rng.startContainer, 'TABLE');
				var tableParent, allOfCellSelected, tableCellSelection;

				if (table) {
					tableParent = table.parentNode;
				}

				allOfCellSelected = rng.startContainer.nodeType == TEXT_NODE &&
					rng.startOffset === 0 &&
					rng.endOffset === 0 &&
					currentCell &&
					(n.nodeName == "TR" || n == tableParent);

				tableCellSelection = (n.nodeName == "TD" || n.nodeName == "TH") && !currentCell;

				return allOfCellSelected || tableCellSelection;
			}

			function fixSelection() {
				var rng = editor.selection.getRng();
				var n = editor.selection.getNode();
				var currentCell = editor.dom.getParent(rng.startContainer, 'TD,TH');

				if (!tableCellSelected(editor, rng, n, currentCell)) {
					return;
				}

				if (!currentCell) {
					currentCell = n;
				}

				// Get the very last node inside the table cell
				var end = currentCell.lastChild;
				while (end.lastChild) {
					end = end.lastChild;
				}

				// Select the entire table cell. Nothing outside of the table cell should be selected.
				if (end.nodeType == 3) {
					rng.setEnd(end, end.data.length);
					editor.selection.setRng(rng);
				}
			}

			editor.on('KeyDown', function() {
				fixSelection();
			});

			editor.on('MouseDown', function(e) {
				if (e.button != 2) {
					fixSelection();
				}
			});
		}

		/**
		 * Delete table if all cells are selected.
		 */
		function deleteTable() {
			function placeCaretInCell(cell) {
				editor.selection.select(cell, true);
				editor.selection.collapse(true);
			}

			function clearCell(cell) {
				editor.$(cell).empty();
				Utils.paddCell(cell);
			}

			editor.on('keydown', function(e) {
				if ((e.keyCode == VK.DELETE || e.keyCode == VK.BACKSPACE) && !e.isDefaultPrevented()) {
					var table, tableCells, selectedTableCells, cell;

					table = editor.dom.getParent(editor.selection.getStart(), 'table');
					if (table) {
						tableCells = editor.dom.select('td,th', table);
						selectedTableCells = Tools.grep(tableCells, function(cell) {
							return !!editor.dom.getAttrib(cell, 'data-mce-selected');
						});

						if (selectedTableCells.length === 0) {
							// If caret is within an empty table cell then empty it for real
							cell = editor.dom.getParent(editor.selection.getStart(), 'td,th');
							if (editor.selection.isCollapsed() && cell && editor.dom.isEmpty(cell)) {
								e.preventDefault();
								clearCell(cell);
								placeCaretInCell(cell);
							}

							return;
						}

						e.preventDefault();

						editor.undoManager.transact(function() {
							if (tableCells.length == selectedTableCells.length) {
								editor.execCommand('mceTableDelete');
							} else {
								Tools.each(selectedTableCells, clearCell);
								placeCaretInCell(selectedTableCells[0]);
							}
						});
					}
				}
			});
		}

		/**
		 * When caption is empty and we continue to delete, caption gets deleted along with the contents.
		 * So, we take over delete operation (both forward and backward) and once caption is empty, we do
		 * prevent it from disappearing.
		 */
		function handleDeleteInCaption() {
			var isTableCaptionNode = function(node) {
				return node && node.nodeName == 'CAPTION' && node.parentNode.nodeName == 'TABLE';
			};

			var restoreCaretPlaceholder = function(node, insertCaret) {
				var rng = editor.selection.getRng();
				var caretNode = node.ownerDocument.createTextNode('\u00a0');

				// we could always append it, but caretNode somehow gets appended before caret,
				// rather then after it, effectively preventing backspace deletion
				if (rng.startOffset) {
					node.insertBefore(caretNode, node.firstChild);
				} else {
					node.appendChild(caretNode);
				}

				if (insertCaret) {
					// put the caret into the placeholder
					editor.selection.select(caretNode, true);
					editor.selection.collapse(true);
				}
			};

			var deleteBtnPressed = function(e) {
				return (e.keyCode == VK.DELETE || e.keyCode == VK.BACKSPACE) && !e.isDefaultPrevented();
			};

			var getSingleChildNode = function(node) {
				return node.firstChild === node.lastChild && node.firstChild;
			};

			var isTextNode = function(node) {
				return node && node.nodeType === 3;
			};

			var getSingleChr = function(node) {
				var childNode = getSingleChildNode(node);
				return isTextNode(childNode) && childNode.data.length === 1 ? childNode.data : null;
			};

			var hasNoCaretPlaceholder = function(node) {
				var childNode = getSingleChildNode(node);
				var chr = getSingleChr(node);
				return childNode && !isTextNode(childNode) || chr && !isNBSP(chr);
			};

			var isEmptyNode = function(node) {
				return editor.dom.isEmpty(node) || isNBSP(getSingleChr(node));
			};

			var isNBSP = function(chr) {
				return chr === '\u00a0';
			};

			editor.on('keydown', function(e) {
				if (!deleteBtnPressed(e)) {
					return;
				}

				var container = editor.dom.getParent(editor.selection.getStart(), 'caption');
				if (!isTableCaptionNode(container)) {
					return;
				}

				// in IE caption collapses if caret placeholder is deleted (and it is very much possible)
				if (Env.ie) {
					if (!editor.selection.isCollapsed()) {
						// if the whole contents are selected, caret placeholder will be deleted too
						// and we take over delete operation here to restore it if this happens
						editor.undoManager.transact(function () {
							editor.execCommand('Delete');

							if (isEmptyNode(container)) {
								// caret springs off from the caption (to the first td), we need to bring it back as well
								restoreCaretPlaceholder(container, true);
							}
						});

						e.preventDefault();
					} else if (hasNoCaretPlaceholder(container)) {
						// if caret placeholder got accidentally deleted and caption will collapse
						// after this operation, we need to put placeholder back
						restoreCaretPlaceholder(container);
					}
				}

				// TODO:
				// 1. in Chrome it is easily possible to select beyond the boundaries of the caption,
				// currently this results in removal of the contents with the whole caption as well;
				// 2. we could take over delete operation to address this, but then we will need to adjust
				// the selection, otherwise delete operation will remove first row of the table too;
				// 3. current behaviour is logical, so it has sense to leave it like that, until a better
				// solution

				if (isEmptyNode(container)) {
					e.preventDefault();
				}
			});
		}


		deleteTable();
		handleDeleteInCaption();

		if (Env.webkit) {
			moveWebKitSelection();
			fixTableCellSelection();
		}

		if (Env.gecko) {
			fixBeforeTableCaretBug();
			fixTableCaretPos();
		}

		if (Env.ie > 9) {
			fixBeforeTableCaretBug();
			fixTableCaretPos();
		}
	};
});
