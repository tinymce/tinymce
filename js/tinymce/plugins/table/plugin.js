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

// Included from: js/tinymce/plugins/table/classes/TableGrid.js

/**
 * TableGrid.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class creates a grid out of a table element. This
 * makes it a whole lot easier to handle complex tables with
 * col/row spans.
 *
 * @class tinymce.tableplugin.TableGrid
 * @private
 */
define("tinymce/tableplugin/TableGrid", [
	"tinymce/util/Tools",
	"tinymce/Env"
], function(Tools, Env) {
	var each = Tools.each;

	function getSpanVal(td, name) {
		return parseInt(td.getAttribute(name) || 1, 10);
	}

	return function(selection, table) {
		var grid, startPos, endPos, selectedCell, dom = selection.dom;

		function buildGrid() {
			var startY = 0;

			grid = [];

			each(['thead', 'tbody', 'tfoot'], function(part) {
				var rows = dom.select('> ' + part + ' tr', table);

				each(rows, function(tr, y) {
					y += startY;

					each(dom.select('> td, > th', tr), function(td, x) {
						var x2, y2, rowspan, colspan;

						// Skip over existing cells produced by rowspan
						if (grid[y]) {
							while (grid[y][x]) {
								x++;
							}
						}

						// Get col/rowspan from cell
						rowspan = getSpanVal(td, 'rowspan');
						colspan = getSpanVal(td, 'colspan');

						// Fill out rowspan/colspan right and down
						for (y2 = y; y2 < y + rowspan; y2++) {
							if (!grid[y2]) {
								grid[y2] = [];
							}

							for (x2 = x; x2 < x + colspan; x2++) {
								grid[y2][x2] = {
									part: part,
									real: y2 == y && x2 == x,
									elm: td,
									rowspan: rowspan,
									colspan: colspan
								};
							}
						}
					});
				});

				startY += rows.length;
			});
		}

		function cloneNode(node, children) {
			node = node.cloneNode(children);
			node.removeAttribute('id');

			return node;
		}

		function getCell(x, y) {
			var row;

			row = grid[y];
			if (row) {
				return row[x];
			}
		}

		function setSpanVal(td, name, val) {
			if (td) {
				val = parseInt(val, 10);

				if (val === 1) {
					td.removeAttribute(name, 1);
				} else {
					td.setAttribute(name, val, 1);
				}
			}
		}

		function isCellSelected(cell) {
			return cell && (dom.hasClass(cell.elm, 'mce-item-selected') || cell == selectedCell);
		}

		function getSelectedRows() {
			var rows = [];

			each(table.rows, function(row) {
				each(row.cells, function(cell) {
					if (dom.hasClass(cell, 'mce-item-selected') || cell == selectedCell.elm) {
						rows.push(row);
						return false;
					}
				});
			});

			return rows;
		}

		function deleteTable() {
			var rng = dom.createRng();

			rng.setStartAfter(table);
			rng.setEndAfter(table);

			selection.setRng(rng);

			dom.remove(table);
		}

		function cloneCell(cell) {
			var formatNode;

			// Clone formats
			Tools.walk(cell, function(node) {
				var curNode;

				if (node.nodeType == 3) {
					each(dom.getParents(node.parentNode, null, cell).reverse(), function(node) {
						node = cloneNode(node, false);

						if (!formatNode) {
							formatNode = curNode = node;
						} else if (curNode) {
							curNode.appendChild(node);
						}

						curNode = node;
					});

					// Add something to the inner node
					if (curNode) {
						curNode.innerHTML = Env.ie ? '&nbsp;' : '<br data-mce-bogus="1" />';
					}

					return false;
				}
			}, 'childNodes');

			cell = cloneNode(cell, false);
			setSpanVal(cell, 'rowSpan', 1);
			setSpanVal(cell, 'colSpan', 1);

			if (formatNode) {
				cell.appendChild(formatNode);
			} else {
				if (!Env.ie) {
					cell.innerHTML = '<br data-mce-bogus="1" />';
				}
			}

			return cell;
		}

		function cleanup() {
			var rng = dom.createRng(), row;

			// Empty rows
			each(dom.select('tr', table), function(tr) {
				if (tr.cells.length === 0) {
					dom.remove(tr);
				}
			});

			// Empty table
			if (dom.select('tr', table).length === 0) {
				rng.setStartAfter(table);
				rng.setEndAfter(table);
				selection.setRng(rng);
				dom.remove(table);
				return;
			}

			// Empty header/body/footer
			each(dom.select('thead,tbody,tfoot', table), function(part) {
				if (part.rows.length === 0) {
					dom.remove(part);
				}
			});

			// Restore selection to start position if it still exists
			buildGrid();

			// Restore the selection to the closest table position
			row = grid[Math.min(grid.length - 1, startPos.y)];
			if (row) {
				selection.select(row[Math.min(row.length - 1, startPos.x)].elm, true);
				selection.collapse(true);
			}
		}

		function fillLeftDown(x, y, rows, cols) {
			var tr, x2, r, c, cell;

			tr = grid[y][x].elm.parentNode;
			for (r = 1; r <= rows; r++) {
				tr = dom.getNext(tr, 'tr');

				if (tr) {
					// Loop left to find real cell
					for (x2 = x; x2 >= 0; x2--) {
						cell = grid[y + r][x2].elm;

						if (cell.parentNode == tr) {
							// Append clones after
							for (c = 1; c <= cols; c++) {
								dom.insertAfter(cloneCell(cell), cell);
							}

							break;
						}
					}

					if (x2 == -1) {
						// Insert nodes before first cell
						for (c = 1; c <= cols; c++) {
							tr.insertBefore(cloneCell(tr.cells[0]), tr.cells[0]);
						}
					}
				}
			}
		}

		function split() {
			each(grid, function(row, y) {
				each(row, function(cell, x) {
					var colSpan, rowSpan, i;

					if (isCellSelected(cell)) {
						cell = cell.elm;
						colSpan = getSpanVal(cell, 'colspan');
						rowSpan = getSpanVal(cell, 'rowspan');

						if (colSpan > 1 || rowSpan > 1) {
							setSpanVal(cell, 'rowSpan', 1);
							setSpanVal(cell, 'colSpan', 1);

							// Insert cells right
							for (i = 0; i < colSpan - 1; i++) {
								dom.insertAfter(cloneCell(cell), cell);
							}

							fillLeftDown(x, y, rowSpan - 1, colSpan);
						}
					}
				});
			});
		}

		function merge(cell, cols, rows) {
			var pos, startX, startY, endX, endY, x, y, startCell, endCell, children, count;

			// Use specified cell and cols/rows
			if (cell) {
				pos = getPos(cell);
				startX = pos.x;
				startY = pos.y;
				endX = startX + (cols - 1);
				endY = startY + (rows - 1);
			} else {
				startPos = endPos = null;

				// Calculate start/end pos by checking for selected cells in grid works better with context menu
				each(grid, function(row, y) {
					each(row, function(cell, x) {
						if (isCellSelected(cell)) {
							if (!startPos) {
								startPos = {x: x, y: y};
							}

							endPos = {x: x, y: y};
						}
					});
				});

				// Use selection
				startX = startPos.x;
				startY = startPos.y;
				endX = endPos.x;
				endY = endPos.y;
			}

			// Find start/end cells
			startCell = getCell(startX, startY);
			endCell = getCell(endX, endY);

			// Check if the cells exists and if they are of the same part for example tbody = tbody
			if (startCell && endCell && startCell.part == endCell.part) {
				// Split and rebuild grid
				split();
				buildGrid();

				// Set row/col span to start cell
				startCell = getCell(startX, startY).elm;
				setSpanVal(startCell, 'colSpan', (endX - startX) + 1);
				setSpanVal(startCell, 'rowSpan', (endY - startY) + 1);

				// Remove other cells and add it's contents to the start cell
				for (y = startY; y <= endY; y++) {
					for (x = startX; x <= endX; x++) {
						if (!grid[y] || !grid[y][x]) {
							continue;
						}

						cell = grid[y][x].elm;

						/*jshint loopfunc:true */
						if (cell != startCell) {
							// Move children to startCell
							children = Tools.grep(cell.childNodes);
							each(children, function(node) {
								startCell.appendChild(node);
							});

							// Remove bogus nodes if there is children in the target cell
							if (children.length) {
								children = Tools.grep(startCell.childNodes);
								count = 0;
								each(children, function(node) {
									if (node.nodeName == 'BR' && dom.getAttrib(node, 'data-mce-bogus') && count++ < children.length - 1) {
										startCell.removeChild(node);
									}
								});
							}

							dom.remove(cell);
						}
					}
				}

				// Remove empty rows etc and restore caret location
				cleanup();
			}
		}

		function insertRow(before) {
			var posY, cell, lastCell, x, rowElm, newRow, newCell, otherCell, rowSpan;

			// Find first/last row
			each(grid, function(row, y) {
				each(row, function(cell) {
					if (isCellSelected(cell)) {
						cell = cell.elm;
						rowElm = cell.parentNode;
						newRow = cloneNode(rowElm, false);
						posY = y;

						if (before) {
							return false;
						}
					}
				});

				if (before) {
					return !posY;
				}
			});

			for (x = 0; x < grid[0].length; x++) {
				// Cell not found could be because of an invalid table structure
				if (!grid[posY][x]) {
					continue;
				}

				cell = grid[posY][x].elm;

				if (cell != lastCell) {
					if (!before) {
						rowSpan = getSpanVal(cell, 'rowspan');
						if (rowSpan > 1) {
							setSpanVal(cell, 'rowSpan', rowSpan + 1);
							continue;
						}
					} else {
						// Check if cell above can be expanded
						if (posY > 0 && grid[posY - 1][x]) {
							otherCell = grid[posY - 1][x].elm;
							rowSpan = getSpanVal(otherCell, 'rowSpan');
							if (rowSpan > 1) {
								setSpanVal(otherCell, 'rowSpan', rowSpan + 1);
								continue;
							}
						}
					}

					// Insert new cell into new row
					newCell = cloneCell(cell);
					setSpanVal(newCell, 'colSpan', cell.colSpan);

					newRow.appendChild(newCell);

					lastCell = cell;
				}
			}

			if (newRow.hasChildNodes()) {
				if (!before) {
					dom.insertAfter(newRow, rowElm);
				} else {
					rowElm.parentNode.insertBefore(newRow, rowElm);
				}
			}
		}

		function insertCol(before) {
			var posX, lastCell;

			// Find first/last column
			each(grid, function(row) {
				each(row, function(cell, x) {
					if (isCellSelected(cell)) {
						posX = x;

						if (before) {
							return false;
						}
					}
				});

				if (before) {
					return !posX;
				}
			});

			each(grid, function(row, y) {
				var cell, rowSpan, colSpan;

				if (!row[posX]) {
					return;
				}

				cell = row[posX].elm;
				if (cell != lastCell) {
					colSpan = getSpanVal(cell, 'colspan');
					rowSpan = getSpanVal(cell, 'rowspan');

					if (colSpan == 1) {
						if (!before) {
							dom.insertAfter(cloneCell(cell), cell);
							fillLeftDown(posX, y, rowSpan - 1, colSpan);
						} else {
							cell.parentNode.insertBefore(cloneCell(cell), cell);
							fillLeftDown(posX, y, rowSpan - 1, colSpan);
						}
					} else {
						setSpanVal(cell, 'colSpan', cell.colSpan + 1);
					}

					lastCell = cell;
				}
			});
		}

		function deleteCols() {
			var cols = [];

			// Get selected column indexes
			each(grid, function(row) {
				each(row, function(cell, x) {
					if (isCellSelected(cell) && Tools.inArray(cols, x) === -1) {
						each(grid, function(row) {
							var cell = row[x].elm, colSpan;

							colSpan = getSpanVal(cell, 'colSpan');

							if (colSpan > 1) {
								setSpanVal(cell, 'colSpan', colSpan - 1);
							} else {
								dom.remove(cell);
							}
						});

						cols.push(x);
					}
				});
			});

			cleanup();
		}

		function deleteRows() {
			var rows;

			function deleteRow(tr) {
				var nextTr, pos, lastCell;

				nextTr = dom.getNext(tr, 'tr');

				// Move down row spanned cells
				each(tr.cells, function(cell) {
					var rowSpan = getSpanVal(cell, 'rowSpan');

					if (rowSpan > 1) {
						setSpanVal(cell, 'rowSpan', rowSpan - 1);
						pos = getPos(cell);
						fillLeftDown(pos.x, pos.y, 1, 1);
					}
				});

				// Delete cells
				pos = getPos(tr.cells[0]);
				each(grid[pos.y], function(cell) {
					var rowSpan;

					cell = cell.elm;

					if (cell != lastCell) {
						rowSpan = getSpanVal(cell, 'rowSpan');

						if (rowSpan <= 1) {
							dom.remove(cell);
						} else {
							setSpanVal(cell, 'rowSpan', rowSpan - 1);
						}

						lastCell = cell;
					}
				});
			}

			// Get selected rows and move selection out of scope
			rows = getSelectedRows();

			// Delete all selected rows
			each(rows.reverse(), function(tr) {
				deleteRow(tr);
			});

			cleanup();
		}

		function cutRows() {
			var rows = getSelectedRows();

			dom.remove(rows);
			cleanup();

			return rows;
		}

		function copyRows() {
			var rows = getSelectedRows();

			each(rows, function(row, i) {
				rows[i] = cloneNode(row, true);
			});

			return rows;
		}

		function pasteRows(rows, before) {
			var selectedRows = getSelectedRows(),
				targetRow = selectedRows[before ? 0 : selectedRows.length - 1],
				targetCellCount = targetRow.cells.length;

			// Nothing to paste
			if (!rows) {
				return;
			}

			// Calc target cell count
			each(grid, function(row) {
				var match;

				targetCellCount = 0;
				each(row, function(cell) {
					if (cell.real) {
						targetCellCount += cell.colspan;
					}

					if (cell.elm.parentNode == targetRow) {
						match = 1;
					}
				});

				if (match) {
					return false;
				}
			});

			if (!before) {
				rows.reverse();
			}

			each(rows, function(row) {
				var i, cellCount = row.cells.length, cell;

				// Remove col/rowspans
				for (i = 0; i < cellCount; i++) {
					cell = row.cells[i];
					setSpanVal(cell, 'colSpan', 1);
					setSpanVal(cell, 'rowSpan', 1);
				}

				// Needs more cells
				for (i = cellCount; i < targetCellCount; i++) {
					row.appendChild(cloneCell(row.cells[cellCount - 1]));
				}

				// Needs less cells
				for (i = targetCellCount; i < cellCount; i++) {
					dom.remove(row.cells[i]);
				}

				// Add before/after
				if (before) {
					targetRow.parentNode.insertBefore(row, targetRow);
				} else {
					dom.insertAfter(row, targetRow);
				}
			});

			// Remove current selection
			dom.removeClass(dom.select('td.mce-item-selected,th.mce-item-selected'), 'mce-item-selected');
		}

		function getPos(target) {
			var pos;

			each(grid, function(row, y) {
				each(row, function(cell, x) {
					if (cell.elm == target) {
						pos = {x : x, y : y};
						return false;
					}
				});

				return !pos;
			});

			return pos;
		}

		function setStartCell(cell) {
			startPos = getPos(cell);
		}

		function findEndPos() {
			var maxX, maxY;

			maxX = maxY = 0;

			each(grid, function(row, y) {
				each(row, function(cell, x) {
					var colSpan, rowSpan;

					if (isCellSelected(cell)) {
						cell = grid[y][x];

						if (x > maxX) {
							maxX = x;
						}

						if (y > maxY) {
							maxY = y;
						}

						if (cell.real) {
							colSpan = cell.colspan - 1;
							rowSpan = cell.rowspan - 1;

							if (colSpan) {
								if (x + colSpan > maxX) {
									maxX = x + colSpan;
								}
							}

							if (rowSpan) {
								if (y + rowSpan > maxY) {
									maxY = y + rowSpan;
								}
							}
						}
					}
				});
			});

			return {x : maxX, y : maxY};
		}

		function setEndCell(cell) {
			var startX, startY, endX, endY, maxX, maxY, colSpan, rowSpan, x, y;

			endPos = getPos(cell);

			if (startPos && endPos) {
				// Get start/end positions
				startX = Math.min(startPos.x, endPos.x);
				startY = Math.min(startPos.y, endPos.y);
				endX = Math.max(startPos.x, endPos.x);
				endY = Math.max(startPos.y, endPos.y);

				// Expand end positon to include spans
				maxX = endX;
				maxY = endY;

				// Expand startX
				for (y = startY; y <= maxY; y++) {
					cell = grid[y][startX];

					if (!cell.real) {
						if (startX - (cell.colspan - 1) < startX) {
							startX -= cell.colspan - 1;
						}
					}
				}

				// Expand startY
				for (x = startX; x <= maxX; x++) {
					cell = grid[startY][x];

					if (!cell.real) {
						if (startY - (cell.rowspan - 1) < startY) {
							startY -= cell.rowspan - 1;
						}
					}
				}

				// Find max X, Y
				for (y = startY; y <= endY; y++) {
					for (x = startX; x <= endX; x++) {
						cell = grid[y][x];

						if (cell.real) {
							colSpan = cell.colspan - 1;
							rowSpan = cell.rowspan - 1;

							if (colSpan) {
								if (x + colSpan > maxX) {
									maxX = x + colSpan;
								}
							}

							if (rowSpan) {
								if (y + rowSpan > maxY) {
									maxY = y + rowSpan;
								}
							}
						}
					}
				}

				// Remove current selection
				dom.removeClass(dom.select('td.mce-item-selected,th.mce-item-selected'), 'mce-item-selected');

				// Add new selection
				for (y = startY; y <= maxY; y++) {
					for (x = startX; x <= maxX; x++) {
						if (grid[y][x]) {
							dom.addClass(grid[y][x].elm, 'mce-item-selected');
						}
					}
				}
			}
		}

		table = table || dom.getParent(selection.getNode(), 'table');

		buildGrid();

		selectedCell = dom.getParent(selection.getStart(), 'th,td');
		if (selectedCell) {
			startPos = getPos(selectedCell);
			endPos = findEndPos();
			selectedCell = getCell(startPos.x, startPos.y);
		}

		Tools.extend(this, {
			deleteTable: deleteTable,
			split: split,
			merge: merge,
			insertRow: insertRow,
			insertCol: insertCol,
			deleteCols: deleteCols,
			deleteRows: deleteRows,
			cutRows: cutRows,
			copyRows: copyRows,
			pasteRows: pasteRows,
			getPos: getPos,
			setStartCell: setStartCell,
			setEndCell: setEndCell
		});
	};
});

// Included from: js/tinymce/plugins/table/classes/Quirks.js

/**
 * Quirks.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
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
	"tinymce/Env",
	"tinymce/util/Tools"
], function(VK, Env, Tools) {
	var each = Tools.each;

	function getSpanVal(td, name) {
		return parseInt(td.getAttribute(name) || 1, 10);
	}

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
					} else {
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
				}

				function getTargetParent(upBool, topNode, secondNode, nodeName) {
					var tbodies = editor.dom.select('>' + nodeName, topNode);
					var position = tbodies.indexOf(secondNode);
					if (upBool && position === 0 || !upBool && position === tbodies.length - 1) {
						return getFirstHeadOrFoot(upBool, topNode);
					} else if (position === -1) {
						var topOrBottom = secondNode.tagName.toLowerCase() === 'thead' ? 0 : tbodies.length - 1;
						return tbodies[topOrBottom];
					} else {
						return tbodies[position + (upBool ? -1 : 1)];
					}
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
					} else {
						var parentCell = editor.dom.getParent(table, 'td,th');
						if (parentCell) {
							return handle(upBool, parentCell, e);
						} else {
							var backUpSibling = getChildForDirection(currentRow, !upBool);
							moveCursorToStartOfElement(backUpSibling);
							e.preventDefault();
							return false;
						}
					}
				}

				function getChildForDirection(parent, up) {
					var child =  parent && parent[up ? 'lastChild' : 'firstChild'];
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
					setTimeout(function() {
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
					} else if (last.nodeType == 1 && !last.getAttribute('data-mce-bogus')) {
						break;
					}
				}

				if (last && last.nodeName == 'TABLE') {
					if (editor.settings.forced_root_block) {
						editor.dom.add(
							editor.getBody(),
							editor.settings.forced_root_block,
							null,
							Env.ie ? '&nbsp;' : '<br data-mce-bogus="1" />'
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

				allOfCellSelected =rng.startContainer.nodeType == TEXT_NODE &&
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
					currentCell=n;
				}

				// Get the very last node inside the table cell
				var end = currentCell.lastChild;
				while (end.lastChild) {
					end = end.lastChild;
				}

				// Select the entire table cell. Nothing outside of the table cell should be selected.
				rng.setEnd(end, end.nodeValue.length);
				editor.selection.setRng(rng);
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

		if (Env.webkit) {
			moveWebKitSelection();
			fixTableCellSelection();
		}

		if (Env.gecko) {
			fixBeforeTableCaretBug();
			fixTableCaretPos();
		}
	};
});

// Included from: js/tinymce/plugins/table/classes/CellSelection.js

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
		var dom = editor.dom, tableGrid, startCell, startTable, hasCellSelection = true;

		function clear() {
			// Restore selection possibilities
			editor.getBody().style.webkitUserSelect = '';

			if (hasCellSelection) {
				editor.dom.removeClass(
					editor.dom.select('td.mce-item-selected,th.mce-item-selected'),
					'mce-item-selected'
				);

				hasCellSelection = false;
			}
		}

		// Add cell selection logic
		editor.on('MouseDown', function(e) {
			if (e.button != 2) {
				clear();

				startCell = dom.getParent(e.target, 'td,th');
				startTable = dom.getParent(startCell, 'table');
			}
		});

		dom.bind(editor.getDoc(), 'mouseover', function(e) {
			var sel, table, target = e.target;

			if (startCell && (tableGrid || target != startCell) && (target.nodeName == 'TD' || target.nodeName == 'TH')) {
				table = dom.getParent(target, 'table');
				if (table == startTable) {
					if (!tableGrid) {
						tableGrid = new TableGrid(editor.selection, table);
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
		});

		editor.on('MouseUp', function() {
			var rng, sel = editor.selection, selectedCells, walker, node, lastNode, endNode;

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
					endNode = selectedCells[selectedCells.length - 1];
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

		editor.on('KeyUp', function() {
			clear();
		});

		return {
			clear: clear
		};
	};
});

// Included from: js/tinymce/plugins/table/classes/Plugin.js

/**
 * Plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class contains all core logic for the table plugin.
 *
 * @class tinymce.tableplugin.Plugin
 * @private
 */
define("tinymce/tableplugin/Plugin", [
	"tinymce/tableplugin/TableGrid",
	"tinymce/tableplugin/Quirks",
	"tinymce/tableplugin/CellSelection",
	"tinymce/util/Tools",
	"tinymce/dom/TreeWalker",
	"tinymce/Env",
	"tinymce/PluginManager"
], function(TableGrid, Quirks, CellSelection, Tools, TreeWalker, Env, PluginManager) {
	var each = Tools.each;

	function Plugin(editor) {
		var winMan, clipboardRows, self = this; // Might be selected cells on reload

		function removePxSuffix(size) {
			return size ? size.replace(/px$/, '') : "";
		}

		function addSizeSuffix(size) {
			if (/^[0-9]+$/.test(size)) {
				size += "px";
			}

			return size;
		}

		function tableDialog() {
			var dom = editor.dom, tableElm, data;

			tableElm = editor.dom.getParent(editor.selection.getNode(), 'table');

			data = {
				width: removePxSuffix(dom.getStyle(tableElm, 'width') || dom.getAttrib(tableElm, 'width')),
				height: removePxSuffix(dom.getStyle(tableElm, 'height') || dom.getAttrib(tableElm, 'height')),
				cellspacing: dom.getAttrib(tableElm, 'cellspacing'),
				cellpadding: dom.getAttrib(tableElm, 'cellpadding'),
				border: dom.getAttrib(tableElm, 'border'),
				caption: !!dom.select('caption', tableElm)[0]
			};

			each('left center right'.split(' '), function(name) {
				if (editor.formatter.matchNode(tableElm, 'align' + name)) {
					data.align = name;
				}
			});

			editor.windowManager.open({
				title: "Table properties",
				items: {
					type: 'form',
					layout: 'grid',
					columns: 2,
					data: data,
					defaults: {
						type: 'textbox',
						maxWidth: 50
					},
					items: [
						{label: 'Cols', name: 'cols'},
						{label: 'Rows', name: 'rows'},
						{label: 'Width', name: 'width'},
						{label: 'Height', name: 'height'},
						{label: 'Cell spacing', name: 'cellspacing'},
						{label: 'Cell padding', name: 'cellpadding'},
						{label: 'Border', name: 'border'},
						{label: 'Caption', name: 'caption', type: 'checkbox'},
						{
							label: 'Alignment',
							minWidth: 90,
							name: 'align',
							type: 'listbox',
							text: 'None',
							maxWidth: null,
							values: [
								{text: 'None', value: ''},
								{text: 'Left', value: 'left'},
								{text: 'Center', value: 'center'},
								{text: 'Right', value: 'right'}
							]
						}
					]
				},

				onsubmit: function() {
					var data = this.toJSON(), captionElm;

					editor.undoManager.transact(function() {
						editor.dom.setAttribs(tableElm, {
							cellspacing: data.cellspacing,
							cellpadding: data.cellpadding,
							border: data.border
						});

						editor.dom.setStyles(tableElm, {
							width: addSizeSuffix(data.width),
							height: addSizeSuffix(data.height)
						});

						// Toggle caption on/off
						captionElm = dom.select('caption', tableElm)[0];

						if (captionElm && !data.caption) {
							dom.remove(captionElm);
						}

						if (!captionElm && data.caption) {
							captionElm = dom.create('caption');

							if (!Env.ie) {
								captionElm.innerHTML = '<br data-mce-bogus="1"/>';
							}

							tableElm.insertBefore(captionElm, tableElm.firstChild);
						}

						// Apply/remove alignment
						if (data.align) {
							editor.formatter.apply('align' + data.align, {}, tableElm);
						} else {
							each('left center right'.split(' '), function(name) {
								editor.formatter.remove('align' + name, {}, tableElm);
							});
						}

						editor.focus();
						editor.addVisual();
					});
				}
			});
		}

		function mergeDialog(grid, cell) {
			editor.windowManager.open({
				title: "Merge cells",
				body: [
					{label: 'Columns', name: 'cols', type: 'textbox', size: 5},
					{label: 'Rows', name: 'rows', type: 'textbox', size: 5}
				],
				onsubmit: function() {
					var data = this.toJSON();

					editor.undoManager.transact(function() {
						grid.merge(cell, data.cols, data.rows);
					});
				}
			});
		}

		function cellDialog() {
			var dom = editor.dom, cellElm, data, cells = [];

			// Get selected cells or the current cell
			cells = editor.dom.select('td.mce-item-selected,th.mce-item-selected');
			cellElm = editor.dom.getParent(editor.selection.getNode(), 'td,th');
			if (!cells.length && cellElm) {
				cells.push(cellElm);
			}

			cellElm = cellElm || cells[0];

			data = {
				width: removePxSuffix(dom.getStyle(cellElm, 'width') || dom.getAttrib(cellElm, 'width')),
				height: removePxSuffix(dom.getStyle(cellElm, 'height') || dom.getAttrib(cellElm, 'height')),
				scope: dom.getAttrib(cellElm, 'scope')
			};

			data.type = cellElm.nodeName.toLowerCase();

			each('left center right'.split(' '), function(name) {
				if (editor.formatter.matchNode(cellElm, 'align' + name)) {
					data.align = name;
				}
			});

			editor.windowManager.open({
				title: "Cell properties",
				items: {
					type: 'form',
					data: data,
					layout: 'grid',
					columns: 2,
					defaults: {
						type: 'textbox',
						maxWidth: 50
					},
					items: [
						{label: 'Width', name: 'width'},
						{label: 'Height', name: 'height'},
						{
							label: 'Cell type',
							name: 'type',
							type: 'listbox',
							text: 'None',
							minWidth: 90,
							maxWidth: null,
							menu: [
								{text: 'Cell', value: 'td'},
								{text: 'Header cell', value: 'th'}
							]
						},
						{
							label: 'Scope',
							name: 'scope',
							type: 'listbox',
							text: 'None',
							minWidth: 90,
							maxWidth: null,
							menu: [
								{text: 'None', value: ''},
								{text: 'Row', value: 'row'},
								{text: 'Column', value: 'col'},
								{text: 'Row group', value: 'rowgroup'},
								{text: 'Column group', value: 'colgroup'}
							]
						},
						{
							label: 'Alignment',
							name: 'align',
							type: 'listbox',
							text: 'None',
							minWidth: 90,
							maxWidth: null,
							values: [
								{text: 'None', value: ''},
								{text: 'Left', value: 'left'},
								{text: 'Center', value: 'center'},
								{text: 'Right', value: 'right'}
							]
						}
					]
				},

				onsubmit: function() {
					var data = this.toJSON();

					editor.undoManager.transact(function() {
						each(cells, function(cellElm) {
							editor.dom.setAttrib(cellElm, 'scope', data.scope);

							editor.dom.setStyles(cellElm, {
								width: addSizeSuffix(data.width),
								height: addSizeSuffix(data.height)
							});

							// Switch cell type
							if (data.type && cellElm.nodeName.toLowerCase() != data.type) {
								cellElm = dom.rename(cellElm, data.type);
							}

							// Apply/remove alignment
							if (data.align) {
								editor.formatter.apply('align' + data.align, {}, cellElm);
							} else {
								each('left center right'.split(' '), function(name) {
									editor.formatter.remove('align' + name, {}, cellElm);
								});
							}
						});

						editor.focus();
					});
				}
			});
		}

		function rowDialog() {
			var dom = editor.dom, tableElm, cellElm, rowElm, data, rows = [];

			tableElm = editor.dom.getParent(editor.selection.getNode(), 'table');
			cellElm = editor.dom.getParent(editor.selection.getNode(), 'td,th');

			each(tableElm.rows, function(row) {
				each(row.cells, function(cell) {
					if (dom.hasClass(cell, 'mce-item-selected') || cell == cellElm) {
						rows.push(row);
						return false;
					}
				});
			});

			rowElm = rows[0];

			data = {
				height: removePxSuffix(dom.getStyle(rowElm, 'height') || dom.getAttrib(rowElm, 'height')),
				scope: dom.getAttrib(rowElm, 'scope')
			};

			data.type = rowElm.parentNode.nodeName.toLowerCase();

			each('left center right'.split(' '), function(name) {
				if (editor.formatter.matchNode(rowElm, 'align' + name)) {
					data.align = name;
				}
			});

			editor.windowManager.open({
				title: "Row properties",
				items: {
					type: 'form',
					data: data,
					columns: 2,
					defaults: {
						type: 'textbox'
					},
					items: [
						{
							type: 'listbox',
							name: 'type',
							label: 'Row type',
							text: 'None',
							maxWidth: null,
							menu: [
								{text: 'header', value: 'thead'},
								{text: 'body', value: 'tbody'},
								{text: 'footer', value: 'tfoot'}
							]
						},
						{
							type: 'listbox',
							name: 'align',
							label: 'Alignment',
							text: 'None',
							maxWidth: null,
							menu: [
								{text: 'None', value: ''},
								{text: 'Left', value: 'left'},
								{text: 'Center', value: 'center'},
								{text: 'Right', value: 'right'}
							]
						},
						{label: 'Height', name: 'height'}
					]
				},

				onsubmit: function() {
					var data = this.toJSON(), tableElm, oldParentElm, parentElm;

					editor.undoManager.transact(function() {
						each(rows, function(rowElm) {
							editor.dom.setAttrib(rowElm, 'scope', data.scope);

							editor.dom.setStyles(rowElm, {
								height: addSizeSuffix(data.height)
							});

							if (data.type != rowElm.parentNode.nodeName.toLowerCase()) {
								tableElm = dom.getParent(rowElm, 'table');

								oldParentElm = rowElm.parentNode;
								parentElm = dom.select(tableElm, data.type)[0];
								if (!parentElm) {
									parentElm = dom.create(data.type);
									if (tableElm.firstChild) {
										tableElm.insertBefore(parentElm, tableElm.firstChild);
									} else {
										tableElm.appendChild(parentElm);
									}
								}

								parentElm.insertBefore(rowElm, parentElm.firstChild);

								if (!oldParentElm.hasChildNodes()) {
									dom.remove(oldParentElm);
								}
							}

							// Apply/remove alignment
							if (data.align) {
								editor.formatter.apply('align' + data.align, {}, rowElm);
							} else {
								each('left center right'.split(' '), function(name) {
									editor.formatter.remove('align' + name, {}, rowElm);
								});
							}
						});

						editor.focus();
					});
				}
			});
		}

		function cmd(command) {
			return function() {
				editor.execCommand(command);
			};
		}

		function insertTable(cols, rows) {
			var y, x, html;

			html = '<table><tbody>';

			for (y = 0; y < rows; y++) {
				html += '<tr>';

				for (x = 0; x < cols; x++) {
					html += '<td>' + (Env.ie ? " " : '<br>') + '</td>';
				}

				html += '</tr>';
			}

			html += '</tbody></table>';

			editor.insertContent(html);
		}

		function postRender() {
			/*jshint validthis:true*/
			var self = this;

			function bindStateListener() {
				self.disabled(!editor.dom.getParent(editor.selection.getNode(), 'table'));

				editor.selection.selectorChanged('table', function(state) {
					self.disabled(!state);
				});
			}

			if (editor.initialized) {
				bindStateListener();
			} else {
				editor.on('init', bindStateListener);
			}
		}

		// Register buttons
		each([
			['table', 'Insert/edit table', 'mceInsertTable'],
			['delete_table', 'Delete table', 'mceTableDelete'],
			['delete_col', 'Delete column', 'mceTableDeleteCol'],
			['delete_row', 'Delete row', 'mceTableDeleteRow'],
			['col_after', 'Insert column after', 'mceTableInsertColAfter'],
			['col_before', 'Insert column before', 'mceTableInsertColBefore'],
			['row_after', 'Insert row after', 'mceTableInsertRowAfter'],
			['row_before', 'Insert row before', 'mceTableInsertRowBefore'],
			['row_props', 'Row properties', 'mceTableRowProps'],
			['cell_props', 'Cell properties', 'mceTableCellProps'],
			['split_cells', 'Split cells', 'mceTableSplitCells'],
			['merge_cells', 'Merge cells', 'mceTableMergeCells']
		], function(c) {
			editor.addButton(c[0], {
				title : c[1],
				cmd : c[2],
				onPostRender: postRender
			});
		});

		function generateTableGrid() {
			var html = '';

			html = '<table role="presentation" class="mce-grid mce-grid-border">';

			for (var y = 0; y < 10; y++) {
				html += '<tr>';

				for (var x = 0; x < 10; x++) {
					html += '<td><a href="#" data-mce-index="' + x + ',' + y + '"></a></td>';
				}

				html += '</tr>';
			}

			html += '</table>';

			html += '<div class="mce-text-center">0 x 0</div>';

			return html;
		}

		editor.addMenuItem('inserttable', {
			text: 'Insert table',
			icon: 'table',
			context: 'table',
			onhide: function() {
				editor.dom.removeClass(this.menu.items()[0].getEl().getElementsByTagName('a'), 'mce-active');
			},
			menu: [
				{
					type: 'container',
					html: generateTableGrid(),

					onmousemove: function(e) {
						var target = e.target;

						if (target.nodeName == 'A') {
							var table = editor.dom.getParent(target, 'table');
							var pos = target.getAttribute('data-mce-index');

							if (pos != this.lastPos) {
								pos = pos.split(',');

								pos[0] = parseInt(pos[0], 10);
								pos[1] = parseInt(pos[1], 10);

								for (var y = 0; y < 10; y++) {
									for (var x = 0; x < 10; x++) {
										editor.dom.toggleClass(
											table.rows[y].childNodes[x].firstChild,
											'mce-active',
											x <= pos[0] && y <= pos[1]
										);
									}
								}

								table.nextSibling.innerHTML = (pos[0] + 1) + ' x '+ (pos[1] + 1);
								this.lastPos = pos;
							}
						}
					},

					onclick: function(e) {
						if (e.target.nodeName == 'A' && this.lastPos) {
							e.preventDefault();

							insertTable(this.lastPos[0] + 1, this.lastPos[1] + 1);

							// TODO: Maybe rework this?
							this.parent().cancel(); // Close parent menu as if it was a click
						}
					}
				}
			]
		});

		editor.addMenuItem('tableprops', {
			text: 'Table properties',
			context: 'table',
			onPostRender: postRender,
			onclick: tableDialog
		});

		editor.addMenuItem('deletetable', {
			text: 'Delete table',
			context: 'table',
			onPostRender: postRender,
			cmd: 'mceTableDelete'
		});

		editor.addMenuItem('cell', {
			separator: 'before',
			text: 'Cell',
			context: 'table',
			menu: [
				{text: 'Cell properties', onclick: cmd('mceTableCellProps'), onPostRender: postRender},
				{text: 'Merge cells', onclick: cmd('mceTableMergeCells'), onPostRender: postRender},
				{text: 'Split cell', onclick: cmd('mceTableSplitCells'), onPostRender: postRender}
			]
		});

		editor.addMenuItem('row', {
			text: 'Row',
			context: 'table',
			menu: [
				{text: 'Insert row before', onclick: cmd('mceTableInsertRowBefore'), onPostRender: postRender},
				{text: 'Insert row after', onclick: cmd('mceTableInsertRowAfter'), onPostRender: postRender},
				{text: 'Delete row', onclick: cmd('mceTableDeleteRow'), onPostRender: postRender},
				{text: 'Row properties', onclick: cmd('mceTableRowProps'), onPostRender: postRender},
				{text: '-'},
				{text: 'Cut row', onclick: cmd('mceTableCutRow'), onPostRender: postRender},
				{text: 'Copy row', onclick: cmd('mceTableCopyRow'), onPostRender: postRender},
				{text: 'Paste row before', onclick: cmd('mceTablePasteRowBefore'), onPostRender: postRender},
				{text: 'Paste row after', onclick: cmd('mceTablePasteRowAfter'), onPostRender: postRender}
			]
		});

		editor.addMenuItem('column', {
			text: 'Column',
			context: 'table',
			menu: [
				{text: 'Insert column before', onclick: cmd('mceTableInsertColBefore'), onPostRender: postRender},
				{text: 'Insert column after', onclick: cmd('mceTableInsertColAfter'), onPostRender: postRender},
				{text: 'Delete column', onclick: cmd('mceTableDeleteCol'), onPostRender: postRender}
			]
		});

		// Select whole table is a table border is clicked
		if (!Env.isIE) {
			editor.on('click', function(e) {
				e = e.target;

				if (e.nodeName === 'TABLE') {
					editor.selection.select(e);
					editor.nodeChanged();
				}
			});
		}

		self.quirks = new Quirks(editor);

		editor.on('Init', function() {
			winMan = editor.windowManager;
			self.cellSelection = new CellSelection(editor);
		});

		// Register action commands
		each({
			mceTableSplitCells: function(grid) {
				grid.split();
			},

			mceTableMergeCells: function(grid) {
				var rowSpan, colSpan, cell;

				cell = editor.dom.getParent(editor.selection.getNode(), 'th,td');
				if (cell) {
					rowSpan = cell.rowSpan;
					colSpan = cell.colSpan;
				}

				if (!editor.dom.select('td.mce-item-selected,th.mce-item-selected').length) {
					mergeDialog(grid, cell);
				} else {
					grid.merge();
				}
			},

			mceTableInsertRowBefore: function(grid) {
				grid.insertRow(true);
			},

			mceTableInsertRowAfter: function(grid) {
				grid.insertRow();
			},

			mceTableInsertColBefore: function(grid) {
				grid.insertCol(true);
			},

			mceTableInsertColAfter: function(grid) {
				grid.insertCol();
			},

			mceTableDeleteCol: function(grid) {
				grid.deleteCols();
			},

			mceTableDeleteRow: function(grid) {
				grid.deleteRows();
			},

			mceTableCutRow: function(grid) {
				clipboardRows = grid.cutRows();
			},

			mceTableCopyRow: function(grid) {
				clipboardRows = grid.copyRows();
			},

			mceTablePasteRowBefore: function(grid) {
				grid.pasteRows(clipboardRows, true);
			},

			mceTablePasteRowAfter: function(grid) {
				grid.pasteRows(clipboardRows);
			},

			mceTableDelete: function(grid) {
				grid.deleteTable();
			}
		}, function(func, name) {
			editor.addCommand(name, function() {
				var grid = new TableGrid(editor.selection);

				if (grid) {
					func(grid);
					editor.execCommand('mceRepaint');
					self.cellSelection.clear();
				}
			});
		});

		// Register dialog commands
		each({
			mceInsertTable: function() {
				tableDialog();
			},

			mceTableRowProps: rowDialog,
			mceTableCellProps: cellDialog
		}, function(func, name) {
			editor.addCommand(name, function(ui, val) {
				func(val);
			});
		});
	}

	PluginManager.add('table', Plugin);
});

expose(["tinymce/tableplugin/TableGrid","tinymce/tableplugin/Quirks","tinymce/tableplugin/CellSelection","tinymce/tableplugin/Plugin"]);
})(this);