/**
 * CellSelection.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class handles table cell selection by faking it using a css class that gets applied
 * to cells when dragging the mouse from one cell to another.
 *
 * @class tinymce.tableplugin.CellSelection
 * @private
 */
define("tinymce/tableplugin/CellSelection", [
	"tinymce/tableplugin/TableGrid",
	"tinymce/dom/TreeWalker",
	"tinymce/util/Tools"
], function(TableGrid, TreeWalker, Tools) {
	return function(editor) {
		var dom = editor.dom, tableGrid, startCell, startTable, hasCellSelection = true, resizing;

		function clear(force) {
			// Restore selection possibilities
			editor.getBody().style.webkitUserSelect = '';

			if (force || hasCellSelection) {
				editor.dom.removeClass(
					editor.dom.select('td.mce-item-selected,th.mce-item-selected'),
					'mce-item-selected'
				);

				hasCellSelection = false;
			}
		}

		function cellSelectionHandler(e) {
			var sel, table, target = e.target;

			if (resizing) {
				return;
			}

			if (startCell && (tableGrid || target != startCell) && (target.nodeName == 'TD' || target.nodeName == 'TH')) {
				table = dom.getParent(target, 'table');
				if (table == startTable) {
					if (!tableGrid) {
						tableGrid = new TableGrid(editor, table);
						tableGrid.setStartCell(startCell);

						editor.getBody().style.webkitUserSelect = 'none';
					}

					tableGrid.setEndCell(target);
					hasCellSelection = true;
				}

				// Remove current selection
				sel = editor.selection.getSel();

				try {
					if (sel.removeAllRanges) {
						sel.removeAllRanges();
					} else {
						sel.empty();
					}
				} catch (ex) {
					// IE9 might throw errors here
				}

				e.preventDefault();
			}
		}

		// Add cell selection logic
		editor.on('MouseDown', function(e) {
			if (e.button != 2 && !resizing) {
				clear();

				startCell = dom.getParent(e.target, 'td,th');
				startTable = dom.getParent(startCell, 'table');
			}
		});

		editor.on('mouseover', cellSelectionHandler);

		editor.on('remove', function() {
			dom.unbind(editor.getDoc(), 'mouseover', cellSelectionHandler);
		});

		editor.on('MouseUp', function() {
			var rng, sel = editor.selection, selectedCells, walker, node, lastNode;

			function setPoint(node, start) {
				var walker = new TreeWalker(node, node);

				do {
					// Text node
					if (node.nodeType == 3 && Tools.trim(node.nodeValue).length !== 0) {
						if (start) {
							rng.setStart(node, 0);
						} else {
							rng.setEnd(node, node.nodeValue.length);
						}

						return;
					}

					// BR element
					if (node.nodeName == 'BR') {
						if (start) {
							rng.setStartBefore(node);
						} else {
							rng.setEndBefore(node);
						}

						return;
					}
				} while ((node = (start ? walker.next() : walker.prev())));
			}

			// Move selection to startCell
			if (startCell) {
				if (tableGrid) {
					editor.getBody().style.webkitUserSelect = '';
				}

				// Try to expand text selection as much as we can only Gecko supports cell selection
				selectedCells = dom.select('td.mce-item-selected,th.mce-item-selected');
				if (selectedCells.length > 0) {
					rng = dom.createRng();
					node = selectedCells[0];
					rng.setStartBefore(node);
					rng.setEndAfter(node);

					setPoint(node, 1);
					walker = new TreeWalker(node, dom.getParent(selectedCells[0], 'table'));

					do {
						if (node.nodeName == 'TD' || node.nodeName == 'TH') {
							if (!dom.hasClass(node, 'mce-item-selected')) {
								break;
							}

							lastNode = node;
						}
					} while ((node = walker.next()));

					setPoint(lastNode);

					sel.setRng(rng);
				}

				editor.nodeChanged();
				startCell = tableGrid = startTable = null;
			}
		});

		editor.on('KeyUp Drop SetContent', function(e) {
			clear(e.type == 'setcontent');
			startCell = tableGrid = startTable = null;
			resizing = false;
		});

		editor.on('ObjectResizeStart ObjectResized', function(e) {
			resizing = e.type != 'objectresized';
		});

		return {
			clear: clear
		};
	};
});