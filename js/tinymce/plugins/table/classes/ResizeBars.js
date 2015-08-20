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
			RESIZE_BAR_THICKNESS = 4;

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
					row: currentRow
				});
			});

			return {
				grid: {
					maxRows: maxRows,
					maxCols: maxCols
				},
				getAt: getAt
			};
		}

		function getStructuralBlocks(jenga) {
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

			function getCols(jenga) {
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

			function getRows(jenga) {

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
			return {
				rows: getRows(jenga),
				cols: getCols(jenga)
			};
		}

		function drawBars(table) {
			var tableDetails = getTableDetails(table);
			var jenga = getJengaGrid(tableDetails);
			var blocks = getStructuralBlocks(jenga);

			var tablePosition = editor.dom.getPos(table);
			var rowPositions = blocks.rows.length > 0 ? findPositions(getTopEdge, getBottomEdge, blocks.rows) : [];
			//The below needs to be LTR/RTL
			//TODO: Fix this since it doesn't work
			var getInner = editor.rtl ? getRightEdge : getLeftEdge;
			var getOuter = editor.rtl ? getLeftEdge : getRightEdge;
			var colPositions = blocks.cols.length > 0 ? findPositions(getInner, getOuter, blocks.cols) : [];

			drawRows(rowPositions, table.offsetWidth, tablePosition);
			drawCols(colPositions, table.offsetHeight, tablePosition);
		}

		/*editor.on('MouseDown', function(e) {
			window.console.log('mousedown', e);
		});*/

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