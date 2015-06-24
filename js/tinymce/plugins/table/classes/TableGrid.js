/**
 * TableGrid.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
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
	"tinymce/Env",
	"tinymce/tableplugin/Utils"
], function(Tools, Env, Utils) {
	var each = Tools.each, getSpanVal = Utils.getSpanVal;

	return function(editor, table) {
		var grid, gridWidth, startPos, endPos, selectedCell, selection = editor.selection, dom = selection.dom;

		function buildGrid() {
			var startY = 0;

			grid = [];
			gridWidth = 0;

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

						gridWidth = Math.max(gridWidth, x + 1);
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
					if (dom.hasClass(cell, 'mce-item-selected') || (selectedCell && cell == selectedCell.elm)) {
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
			var formatNode, cloneFormats = {};

			if (editor.settings.table_clone_elements !== false) {
				cloneFormats = Tools.makeMap(
					(editor.settings.table_clone_elements || 'strong em b i span font h1 h2 h3 h4 h5 h6 p div').toUpperCase(),
					/[ ,]/
				);
			}

			// Clone formats
			Tools.walk(cell, function(node) {
				var curNode;

				if (node.nodeType == 3) {
					each(dom.getParents(node.parentNode, null, cell).reverse(), function(node) {
						if (!cloneFormats[node.nodeName]) {
							return;
						}

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
				Utils.paddCell(cell);
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
				rng.setStartBefore(table);
				rng.setEndBefore(table);
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

			// If we have a valid startPos object
			if (startPos) {
				// Restore the selection to the closest table position
				row = grid[Math.min(grid.length - 1, startPos.y)];
				if (row) {
					selection.select(row[Math.min(row.length - 1, startPos.x)].elm, true);
					selection.collapse(true);
				}
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

				// Use selection, but make sure startPos is valid before accessing
				if (startPos) {
					startX = startPos.x;
					startY = startPos.y;
					endX = endPos.x;
					endY = endPos.y;
				}
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
						/*eslint no-loop-func:0 */
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

			// If posY is undefined there is nothing for us to do here...just return to avoid crashing below
			if (posY === undefined) {
				return;
			}

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
				var pos, lastCell;

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
						pos = {x: x, y: y};
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

			return {x: maxX, y: maxY};
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

		function moveRelIdx(cellElm, delta) {
			var pos, index, cell;

			pos = getPos(cellElm);
			index = pos.y * gridWidth + pos.x;

			do {
				index += delta;
				cell = getCell(index % gridWidth, Math.floor(index / gridWidth));

				if (!cell) {
					break;
				}

				if (cell.elm != cellElm) {
					selection.select(cell.elm, true);

					if (dom.isEmpty(cell.elm)) {
						selection.collapse(true);
					}

					return true;
				}
			} while (cell.elm == cellElm);

			return false;
		}

		table = table || dom.getParent(selection.getStart(), 'table');

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
			setEndCell: setEndCell,
			moveRelIdx: moveRelIdx,
			refresh: buildGrid
		});
	};
});