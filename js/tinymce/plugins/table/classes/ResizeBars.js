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

			//Skip the first item in the array
			for (var i = 1; i < thingsToMeasure.length; i++) {
				var item = thingsToMeasure[i];
				//We need to zero index this again
				tablePositions.push(getInnerEdge(i - 1, item));
			}

			var lastTableLineToMake = thingsToMeasure[thingsToMeasure.length - 1];
			tablePositions.push(getOuterEdge(thingsToMeasure.length - 1, lastTableLineToMake));

			return tablePositions;
		}

		function clearBars() {
			var bars = editor.dom.select('.' + RESIZE_BAR_CLASS);
			Tools.each(bars, function(bar) {
				editor.dom.remove(bar);
			});
		}

		function generateBar(classToAdd, cursor, left, top, height, width) {
			return {
				'data-mce-bogus': true,
				'class': RESIZE_BAR_CLASS + ' ' + classToAdd,
				unselectable: true,
				style: 'cursor: row-resize; ' +
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
		}

		function drawRows(rowPositions, tableWidth, tablePosition) {
			Tools.each(rowPositions, function(rowPosition) {
				var left = tablePosition.x,
					top = rowPosition.y - RESIZE_BAR_THICKNESS / 2,
					height = RESIZE_BAR_THICKNESS,
					width = tableWidth;

				var bar = editor.dom.add(editor.getBody(), 'div',
					generateBar(RESIZE_BAR_ROW_CLASS, RESIZE_BAR_ROW_CURSOR_CLASS, left, top, height, width));

				bar.setAttribute('data-row', rowPosition.index);
			});
		}

		function drawCols(cellPositions, tableHeight, tablePosition) {
			Tools.each(cellPositions, function(cellPosition) {
				var left = cellPosition.x - RESIZE_BAR_THICKNESS / 2,
					top = tablePosition.y,
					height = tableHeight,
					width = RESIZE_BAR_THICKNESS;

				var bar = editor.dom.add(editor.getBody(), 'div',
					generateBar(RESIZE_BAR_COL_CLASS, RESIZE_BAR_COL_CURSOR_CLASS, left, top, height, width));

				bar.setAttribute('data-col', cellPosition.index);
			});
		}

		function drawBars(table) {
			var rows = table.rows;
			var cells = [];

			Tools.each(rows, function(row) {
				if (row.cells.length > cells.length) {
					cells = row.cells;
				}
			});

			var tablePosition = editor.dom.getPos(table);
			var rowPositions = rows.length > 0 ? findPositions(getTopEdge, getBottomEdge, rows) : [];
			//The below needs to be LTR/RTL
			var cellPositions = cells.length > 0 ? findPositions(getLeftEdge, getRightEdge, cells) : [];

			drawRows(rowPositions, table.offsetWidth, tablePosition);
			drawCols(cellPositions, table.offsetHeight, tablePosition);
		}

		// Add cell selection logic
		editor.on('MouseDown', function(e) {
			window.console.log('mousedown', e);
		});

		editor.on('mouseover', function(e) {
			var tableElement = editor.dom.getParent(e.target, 'table');

			if (e.target.nodeName === 'table' || tableElement) {
				clearBars();
				window.console.log('in table');
				drawBars(tableElement);
			}
		});

		editor.on('mouseout', function(e) {
			var tableElement = editor.dom.getParent(e.target, 'table');

			if (e.target.nodeName === 'table' || tableElement) {
				window.console.log('out table');
			}
		});

		return {
		};
	};
});