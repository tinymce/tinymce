/**
 * ResizeBars.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class handles table cell selection by faking it using a css class that gets applied
 * to cells when dragging the mouse from one cell to another.
 *
 * @class tinymce.tableplugin.ResizeBars
 * @private
 */
define("tinymce/tableplugin/ResizeBars", [
	"tinymce/util/Tools"
], function(Tools) {
	return function(editor) {
		var RESIZE_BAR_CLASS = 'mce-resize-bar',
			RESIZE_BAR_ROW_CLASS = 'mce-resize-bar-row',
			RESIZE_BAR_ROW_CURSOR_CLASS = 'row-resize',
			RESIZE_BAR_COL_CLASS = 'mce-resize-bar-col',
			RESIZE_BAR_COL_CURSOR_CLASS = 'col-resize',
			RESIZE_BAR_THICKNESS = 4,
			RESIZE_MINIMUM_WIDTH = 10;

		function getTopEdge(index, row) {
			return {
				index: index,
				y: editor.dom.getPos(row).y
			};
		}

		function getBottomEdge(index, row) {
			return {
				index: index,
				y: editor.dom.getPos(row).y + row.offsetHeight
			};
		}

		function getLeftEdge(index, cell) {
			return {
				index: index,
				x: editor.dom.getPos(cell).x
			};
		}

		function getRightEdge(index, cell) {
			return {
				index: index,
				x: editor.dom.getPos(cell).x + cell.offsetWidth
			};
		}

		function findPositions(getInnerEdge, getOuterEdge, thingsToMeasure) {
			var tablePositions = [];

			//Skip the first item in the array = no left (LTR), right (RTL) or top bars
			for (var i = 1; i < thingsToMeasure.length; i++) {
				//Get the element from the details
				var item = thingsToMeasure[i].element;
				//We need to zero index this again
				tablePositions.push(getInnerEdge(i - 1, item));
			}

			var lastTableLineToMake = thingsToMeasure[thingsToMeasure.length - 1];
			tablePositions.push(getOuterEdge(thingsToMeasure.length - 1, lastTableLineToMake.element));

			return tablePositions;
		}

		function clearBars() {
			var bars = editor.dom.select('.' + RESIZE_BAR_CLASS);
			Tools.each(bars, function(bar) {
				editor.dom.remove(bar);
			});
		}

		function generateBar(classToAdd, cursor, left, top, height, width, indexAttr, index) {
			var bar = {
				'data-mce-bogus': 'all',
				'class': RESIZE_BAR_CLASS + ' ' + classToAdd,
				unselectable: true,
				style: 'cursor: ' + cursor + '; ' +
					'margin: 0; ' +
					'padding: 0; ' +
					'position: absolute; ' +
					'left: ' + left + 'px; ' +
					'top: ' + top + 'px; ' +
					'height: ' + height + 'px; ' +
					'width: ' + width + 'px; ' +
					'background-color: blue; ' +
					'opacity: 0.5'
			};

			bar[indexAttr] = index;

			return bar;
		}

		function drawRows(rowPositions, tableWidth, tablePosition) {
			Tools.each(rowPositions, function(rowPosition) {
				var left = tablePosition.x,
					top = rowPosition.y - RESIZE_BAR_THICKNESS / 2,
					height = RESIZE_BAR_THICKNESS,
					width = tableWidth;

				editor.dom.add(editor.getBody(), 'div',
					generateBar(RESIZE_BAR_ROW_CLASS, RESIZE_BAR_ROW_CURSOR_CLASS,
						left, top, height, width, 'data-row', rowPosition.index));
			});
		}

		function drawCols(cellPositions, tableHeight, tablePosition) {
			Tools.each(cellPositions, function(cellPosition) {
				var left = cellPosition.x - RESIZE_BAR_THICKNESS / 2,
					top = tablePosition.y,
					height = tableHeight,
					width = RESIZE_BAR_THICKNESS;

				editor.dom.add(editor.getBody(), 'div',
					generateBar(RESIZE_BAR_COL_CLASS, RESIZE_BAR_COL_CURSOR_CLASS,
						left, top, height, width, 'data-col', cellPosition.index));
			});
		}

		function getTableDetails(table) {
			return Tools.map(table.rows, function(row) {

				var cells = Tools.map(row.cells, function(cell) {

					var rowspan = cell.hasAttribute('rowspan') ? parseInt(cell.getAttribute('rowspan'), 10) : 1;
					var colspan = cell.hasAttribute('colspan') ? parseInt(cell.getAttribute('colspan'), 10) : 1;

					return {
						element: cell,
						rowspan: rowspan,
						colspan: colspan
					};
				});

				return {
					element: row,
					cells: cells
				};

			});

		}

		function getJengaGrid(tableDetails) {
			function key(rowIndex, colIndex) {
				return rowIndex + ',' + colIndex;
			}

			function getAt(rowIndex, colIndex) {
				return access[key(rowIndex, colIndex)];
			}

			function getAllCells() {
				var allCells = [];
				Tools.each(cells, function(cell) {
					allCells = allCells.concat(cell.cells);
				});
				return allCells;
			}

			var access = {};
			var cells = [];

			var maxRows = 0;
			var maxCols = 0;

			Tools.each(tableDetails, function(row, rowIndex) {
				var currentRow = [];

				Tools.each(row.cells, function(cell) {

					var start = 0;

					while (access[key(rowIndex, start)] !== undefined) {
						start++;
					}

					var current = {
						element: cell.element,
						colspan: cell.colspan,
						rowspan: cell.rowspan,
						rowIndex: rowIndex,
						colIndex: start
					};

					for (var i = 0; i < cell.colspan; i++) {
						for (var j = 0; j < cell.rowspan; j++) {
							var cr = rowIndex + j;
							var cc = start + i;
							access[key(cr, cc)] = current;
							maxRows = Math.max(maxRows, cr + 1);
							maxCols = Math.max(maxCols, cc + 1);
						}
					}

					currentRow.push(current);
				});

				cells.push({
					element: row.element,
					cells: currentRow
				});
			});

			return {
				grid: {
					maxRows: maxRows,
					maxCols: maxCols
				},
				getAt: getAt,
				getAllCells: getAllCells
			};
		}

		function range(start, end) {
			var r = [];

			for (var i = start; i < end; i++) {
				r.push(i);
			}

			return r;
		}

		function decide(getBlock, isSingle, getFallback) {
			var inBlock = getBlock();
			var singleInBlock;

			for (var i = 0; i < inBlock.length; i++) {
				if (isSingle(inBlock[i])) {
					singleInBlock = inBlock[i];
				}
			}
			//Is this necessary?  inblock[0] and getfallback should be the same thing?
			singleInBlock = singleInBlock ? singleInBlock : inBlock[0];
			return singleInBlock ? singleInBlock : getFallback();
		}

		function getColumnBlocks(jenga) {
			var cols = range(0, jenga.grid.maxCols);
			var rows = range(0, jenga.grid.maxRows);

			return Tools.map(cols, function(col) {

				function getBlock() {
					for (var i = 0; i < rows.length; i++) {
						var detail = jenga.getAt(i, col);
						if (detail.colIndex === col) {
							return [detail];
						}
					}
				}

				function isSingle(detail) {
					return detail.colspan === 1;
				}

				function getFallback() {
					return jenga.getAt(0, col);
				}

				return decide(getBlock, isSingle, getFallback);

			});
		}

		function getRowBlocks(jenga) {

			var cols = range(0, jenga.grid.maxCols);
			var rows = range(0, jenga.grid.maxRows);

			return Tools.map(rows, function(row) {

				function getBlock() {
					for (var i = 0; i < cols.length; i++) {
						var detail = jenga.getAt(row, i);
						if (detail.rowIndex === row) {
							return [detail];
						}
					}
				}

				function isSingle(detail) {
					return detail.rowspan === 1;
				}

				function getFallback() {
					jenga.getAt(row, 0);
				}

				return decide(getBlock, isSingle, getFallback);
			});
		}

		function drawBars(table) {
			var tableDetails = getTableDetails(table);
			var jenga = getJengaGrid(tableDetails);
			var rows = getRowBlocks(jenga);
			var cols = getColumnBlocks(jenga);

			var tablePosition = editor.dom.getPos(table);
			var rowPositions = rows.length > 0 ? findPositions(getTopEdge, getBottomEdge, rows) : [];
			//The below needs to be LTR/RTL
			//TODO: Fix this since it doesn't work
			var getInner = editor.rtl ? getRightEdge : getLeftEdge;
			var getOuter = editor.rtl ? getLeftEdge : getRightEdge;
			var colPositions = cols.length > 0 ? findPositions(getInner, getOuter, cols) : [];

			drawRows(rowPositions, table.offsetWidth, tablePosition);
			drawCols(colPositions, table.offsetHeight, tablePosition);
		}

		function deduceSize(deducables, index) {
			if (index < 0 || index >= deducables.length - 1) {
				return "";
			}

			var current = deducables[index];

			if (current) {
				current = {
					value: current,
					delta: 0
				};
			} else {
				var reversedUpToIndex = deducables.slice(0, index).reverse();
				for (var i = 0; i < reversedUpToIndex.length; i++) {
					if (reversedUpToIndex[i]) {
						current = {
							value: reversedUpToIndex[i],
							delta: i + 1
						};
					}
				}
			}

			var next = deducables[index + 1];

			if (next) {
				next = {
					value: next,
					delta: 1
				};
			} else {
				var rest = deducables.slice(index + 1);
				for (var j = 0; j < rest.length; j++) {
					if (rest[j]) {
						next = {
							value: rest[j],
							delta: j + 1
						};
					}
				}
			}

			var extras = next.delta - current.delta;
			return Math.abs(next.value - current.value) / extras;
		}

		function getPixelWidths(jenga) {
			var cols = getColumnBlocks(jenga);

			var backups = Tools.map(cols, function(col) {
				//TODO LTR RTL
				return editor.rtl ? getRightEdge(col.colIndex, col.element).x : getLeftEdge(col.colIndex, col.element).x;
			});

			var widths = [];

			for (var i = 0; i < cols.length; i++) {
				var span = cols[i].element.hasAttribute('colspan') ? parseInt(cols[i].element.getAttribute('colspan'), 10) : 1;
				//Deduce if the column has colspan of more than 1
				var width = span > 1 ? deduceSize(backups, i) : cols[i].element.offsetWidth;
				//If everything's failed and we still don't have a width
				width = width ? width : RESIZE_MINIMUM_WIDTH;
				widths.push(width);
			}

			return widths;
		}

		function determineDeltas(sizes, column, step, min) {

			var result = sizes.slice(0);

			function generateZeros(array) {
				return Tools.map(array, function() {
					return 0;
				});
			}

			function onLeftOrMiddle(index, next) {

				var startZeros = generateZeros(result.slice(0, index));
				var endZeros = generateZeros(result.slice(next + 1));
				var deltas;

				if (step >= 0) {
					var newNext = Math.max(min, result[index] - step);
					deltas = startZeros.concat([step, newNext - result[next]]).concat(endZeros);
				} else {
					var newThis = Math.max(min, result[index] + step);
					var diffx = result[index] - newThis;
					deltas = startZeros.concat([newThis - result[index], diffx]).concat(endZeros);
				}

				return deltas;
			}

			function onRight(previous, index) {
				var startZeros = generateZeros(result.slice(0, index));
				var deltas;

				if (step >= 0) {
					deltas = startZeros.concat([step]);
				} else {
					var size = Math.max(min, result[index] + step);
					deltas = startZeros.concat([size - result[index]]);
				}

				return deltas;

			}

			var deltas;

			if (sizes.length === 0) { //No Columns
				deltas = [];
			} else if (sizes.length === 1) { //One Column
				var newNext = Math.max(min, result[0] + step);
				deltas = [newNext - result[0]];
			} else if (column === 0) { //Left Column
				deltas = onLeftOrMiddle(0, 1);
			} else if (column > 0 && column < sizes.length - 1) { //Middle Column
				deltas = onLeftOrMiddle(column, column + 1);
			} else if (column === sizes.length - 1) { // Right Column
				deltas = onRight(column - 1, column);
			} else {
				deltas = [];
			}

			return deltas;
		}

		function total(start, end, measures) {
			var r = 0;
			for (var i = start; i < end; i++) {
				r += measures[i];
			}
			return r;
		}

		function recalculateWidths(jenga, widths) {
			var allCells = jenga.getAllCells();
			return Tools.map(allCells, function(cell) {
				var width = total(cell.colIndex, cell.colIndex + cell.colspan, widths);
				return {
					element: cell.element,
					width: width,
					colspan: cell.colspan
				};
			});
		}

		function adjustWidth(table, delta, index) {
			delta = delta ? delta : 25;
			index = index ? index : 3;

			var tableDetails = getTableDetails(table);
			var jenga = getJengaGrid(tableDetails);

			var widths = getPixelWidths(jenga);
			window.console.log('widths', widths);
			var deltas = determineDeltas(widths, index, delta, RESIZE_MINIMUM_WIDTH);
			window.console.log('deltas', deltas);
			var newWidths = [], oldTotalWidth = 0, newTotalWidth = 0;

			for (var i = 0; i < deltas.length; i++) {
				oldTotalWidth += widths[i];
				newWidths.push(deltas[i] + widths[i]);
				newTotalWidth += newWidths[i];
			}
			window.console.log('newWidths', newWidths);
			var newSizes = recalculateWidths(jenga, newWidths);
			window.console.log('newSizes', newSizes);

			Tools.each(newSizes, function(cell) {
				cell.element.style.width = cell.width + 'px';
			});

			table.style.width = newTotalWidth + 'px';

			window.console.log('old', oldTotalWidth, 'new', newTotalWidth);
		}

		editor.on('MouseDown', function(e) {
			var tableElement = editor.dom.getParent(e.target, 'table');

			if (e.target.nodeName === 'table' || tableElement) {
				adjustWidth(tableElement);
			}
		});

		editor.on('mouseover', function(e) {
			var tableElement = editor.dom.getParent(e.target, 'table');

			if (e.target.nodeName === 'table' || tableElement) {
				clearBars();
				drawBars(tableElement);
			}
		});

		/*editor.on('mouseout', function(e) {
			var tableElement = editor.dom.getParent(e.target, 'table');

			if (e.target.nodeName === 'table' || tableElement) {
				window.console.log('out table');
			}
		});*/

		return {
			clear: clearBars
		};
	};
});