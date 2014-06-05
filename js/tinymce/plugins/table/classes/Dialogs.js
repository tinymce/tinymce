/**
 * Dialogs.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * ...
 *
 * @class tinymce.tableplugin.Dialogs
 * @private
 */
define("tinymce/tableplugin/Dialogs", [
	"tinymce/util/Tools",
	"tinymce/Env"
], function(Tools, Env) {
	var each = Tools.each;

	return function(editor) {
		var self = this;

		function removePxSuffix(size) {
			return size ? size.replace(/px$/, '') : "";
		}

		function addSizeSuffix(size) {
			if (/^[0-9]+$/.test(size)) {
				size += "px";
			}

			return size;
		}

		function unApplyAlign(elm) {
			each('left center right'.split(' '), function(name) {
				editor.formatter.remove('align' + name, {}, elm);
			});
		}
		
		function unApplyVAlign(elm) {
			each('top middle bottom'.split(' '), function(name) {
				editor.formatter.remove('valign' + name, {}, elm);
			});
		}

		function buildListItems(inputList, itemCallback, startItems) {
			function appendItems(values, output) {
				output = output || [];

				Tools.each(values, function(item) {
					var menuItem = {text: item.text || item.title};

					if (item.menu) {
						menuItem.menu = appendItems(item.menu);
					} else {
						menuItem.value = item.value;

						if (itemCallback) {
							itemCallback(menuItem);
						}
					}

					output.push(menuItem);
				});

				return output;
			}

			return appendItems(inputList, startItems || []);
		}

		self.table = function() {
			var dom = editor.dom, tableElm, colsCtrl, rowsCtrl, classListCtrl, data;

			tableElm = dom.getParent(editor.selection.getStart(), 'table');

			data = {
				width: removePxSuffix(dom.getStyle(tableElm, 'width') || dom.getAttrib(tableElm, 'width')),
				height: removePxSuffix(dom.getStyle(tableElm, 'height') || dom.getAttrib(tableElm, 'height')),
				cellspacing: tableElm ? dom.getAttrib(tableElm, 'cellspacing') : '',
				cellpadding: tableElm ? dom.getAttrib(tableElm, 'cellpadding') : '',
				border: tableElm ? dom.getAttrib(tableElm, 'border') : '',
				caption: !!dom.select('caption', tableElm)[0],
				'class': dom.getAttrib(tableElm, 'class')
			};

			each('left center right'.split(' '), function(name) {
				if (editor.formatter.matchNode(tableElm, 'align' + name)) {
					data.align = name;
				}
			});

			if (!tableElm) {
				colsCtrl = {label: 'Cols', name: 'cols'};
				rowsCtrl = {label: 'Rows', name: 'rows'};
			}

			if (editor.settings.table_class_list) {
				if (data["class"]) {
					data["class"] = data["class"].replace(/\s*mce\-item\-table\s*/g, '');
				}

				classListCtrl = {
					name: 'class',
					type: 'listbox',
					label: 'Class',
					values: buildListItems(
						editor.settings.table_class_list,
						function(item) {
							if (item.value) {
								item.textStyle = function() {
									return editor.formatter.getCssText({block: 'table', classes: [item.value]});
								};
							}
						}
					)
				};
			}

			var generalForm = {
				type: 'form',
				layout: 'flex',
				direction: 'column',
				labelGapCalc: 'children',
				padding: 0,
				items: [
					{
						type: 'form',
						labelGapCalc: false,
						padding: 0,
						layout: 'grid',
						columns: 2,
						data: data,
						defaults: {
							type: 'textbox',
							maxWidth: 50
						},
						items: [
							colsCtrl,
							rowsCtrl,
							{label: 'Width', name: 'width'},
							{label: 'Height', name: 'height'},
							{label: 'Cell spacing', name: 'cellspacing'},
							{label: 'Cell padding', name: 'cellpadding'},
							{label: 'Border', name: 'border'},
							{label: 'Caption', name: 'caption', type: 'checkbox'}
						]
					},

					{
						label: 'Alignment',
						name: 'align',
						type: 'listbox',
						text: 'None',
						values: [
							{text: 'None', value: ''},
							{text: 'Left', value: 'left'},
							{text: 'Center', value: 'center'},
							{text: 'Right', value: 'right'}
						]
					},

					classListCtrl
				]
			};

			editor.windowManager.open({
				title: "Table properties",
				bodyType: 'tabpanel',
				body: [
					{
						title: 'General',
						type: 'form',
						items: generalForm
					},

					{
						title: 'Advanced',
						type: 'form',
						items: [
							{
								label: 'Style',
								name: 'style',
								type: 'textbox'
							},

							{
								type: 'form',
								padding: 0,
								formItemDefaults: {
									layout: 'grid',
									alignH: ['start', 'right'],
								},
								defaults: {
									size: 7
								},
								items: [
									{
										label: 'Border color',
										type: 'colorbox',
										name: 'borderColor'
									},

									{
										label: 'Background color',
										type: 'colorbox',
										name: 'backgroundColor'
									}
								]
							}
						]
					}
				],

				onsubmit: function() {
					var captionElm;

					data = Tools.extend(data, this.toJSON());

					editor.undoManager.transact(function() {
						if (!tableElm) {
							tableElm = editor.plugins.table.insertTable(data.cols || 1, data.rows || 1);
						}

						editor.dom.setAttribs(tableElm, {
							cellspacing: data.cellspacing,
							cellpadding: data.cellpadding,
							border: data.border,
							'class': data['class']
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
							captionElm.innerHTML = !Env.ie ? '<br data-mce-bogus="1"/>' : '\u00a0';
							tableElm.insertBefore(captionElm, tableElm.firstChild);
						}

						unApplyAlign(tableElm);
						if (data.align) {
							editor.formatter.apply('align' + data.align, {}, tableElm);
						}

						editor.focus();
						editor.addVisual();
					});
				}
			});
		};

		self.merge = function(grid, cell) {
			editor.windowManager.open({
				title: "Merge cells",
				body: [
					{label: 'Cols', name: 'cols', type: 'textbox', value: '1', size: 10},
					{label: 'Rows', name: 'rows', type: 'textbox', value: '1', size: 10}
				],
				onsubmit: function() {
					var data = this.toJSON();

					editor.undoManager.transact(function() {
						grid.merge(cell, data.cols, data.rows);
					});
				}
			});
		};

		self.cell = function() {
			var dom = editor.dom, cellElm, data, classListCtrl, cells = [];

			// Get selected cells or the current cell
			cells = editor.dom.select('td.mce-item-selected,th.mce-item-selected');
			cellElm = editor.dom.getParent(editor.selection.getStart(), 'td,th');
			if (!cells.length && cellElm) {
				cells.push(cellElm);
			}

			cellElm = cellElm || cells[0];

			if (!cellElm) {
				// If this element is null, return now to avoid crashing.
				return;
			}

			data = {
				width: removePxSuffix(dom.getStyle(cellElm, 'width') || dom.getAttrib(cellElm, 'width')),
				height: removePxSuffix(dom.getStyle(cellElm, 'height') || dom.getAttrib(cellElm, 'height')),
				scope: dom.getAttrib(cellElm, 'scope'),
				'class': dom.getAttrib(cellElm, 'class')
			};

			data.type = cellElm.nodeName.toLowerCase();

			each('left center right'.split(' '), function(name) {
				if (editor.formatter.matchNode(cellElm, 'align' + name)) {
					data.align = name;
				}
			});

			each('top middle bottom'.split(' '), function(name) {
				if (editor.formatter.matchNode(cellElm, 'valign' + name)) {
					data.valign = name;
				}
			});

			if (editor.settings.table_cell_class_list) {
				classListCtrl = {
					name: 'class',
					type: 'listbox',
					label: 'Class',
					values: buildListItems(
						editor.settings.table_cell_class_list,
						function(item) {
							if (item.value) {
								item.textStyle = function() {
									return editor.formatter.getCssText({block: 'td', classes: [item.value]});
								};
							}
						}
					)
				};
			}

			editor.windowManager.open({
				title: "Cell properties",
				items: {
					type: 'form',
					layout: 'flex',
					direction: 'column',
					labelGapCalc: 'children',
					data: data,
					items: [
						{
							type: 'form',
							layout: 'grid',
							columns: 2,
							labelGapCalc: false,
							padding: 0,
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
									values: [
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
									values: [
										{text: 'None', value: ''},
										{text: 'Row', value: 'row'},
										{text: 'Column', value: 'col'},
										{text: 'Row group', value: 'rowgroup'},
										{text: 'Column group', value: 'colgroup'}
									]
								},
								{
									label: 'H Align',
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
								},
								{
									label: 'V Align',
									name: 'valign',
									type: 'listbox',
									text: 'None',
									minWidth: 90,
									maxWidth: null,
									values: [
										{text: 'None', value: ''},
										{text: 'Top', value: 'top'},
										{text: 'Middle', value: 'middle'},
										{text: 'Bottom', value: 'bottom'}
									]
								}
							]
						},

						classListCtrl
					]
				},

				onsubmit: function() {
					data = Tools.extend(data, this.toJSON());

					editor.undoManager.transact(function() {
						each(cells, function(cellElm) {
							editor.dom.setAttribs(cellElm, {
								scope: data.scope,
								'class': data['class']
							});

							editor.dom.setStyles(cellElm, {
								width: addSizeSuffix(data.width),
								height: addSizeSuffix(data.height)
							});

							// Switch cell type
							if (data.type && cellElm.nodeName.toLowerCase() != data.type) {
								cellElm = dom.rename(cellElm, data.type);
							}

							// Apply/remove alignment
							unApplyAlign(cellElm);
							if (data.align) {
								editor.formatter.apply('align' + data.align, {}, cellElm);
							}

							// Apply/remove vertical alignment
							unApplyVAlign(cellElm);
							if (data.valign) {
								editor.formatter.apply('valign' + data.valign, {}, cellElm);
							}
						});

						editor.focus();
					});
				}
			});
		};

		self.row = function() {
			var dom = editor.dom, tableElm, cellElm, rowElm, classListCtrl, data, rows = [];

			tableElm = editor.dom.getParent(editor.selection.getStart(), 'table');
			cellElm = editor.dom.getParent(editor.selection.getStart(), 'td,th');

			each(tableElm.rows, function(row) {
				each(row.cells, function(cell) {
					if (dom.hasClass(cell, 'mce-item-selected') || cell == cellElm) {
						rows.push(row);
						return false;
					}
				});
			});

			rowElm = rows[0];
			if (!rowElm) {
				// If this element is null, return now to avoid crashing.
				return;
			}

			data = {
				height: removePxSuffix(dom.getStyle(rowElm, 'height') || dom.getAttrib(rowElm, 'height')),
				scope: dom.getAttrib(rowElm, 'scope'),
				'class': dom.getAttrib(rowElm, 'class')
			};

			data.type = rowElm.parentNode.nodeName.toLowerCase();

			each('left center right'.split(' '), function(name) {
				if (editor.formatter.matchNode(rowElm, 'align' + name)) {
					data.align = name;
				}
			});

			if (editor.settings.table_row_class_list) {
				classListCtrl = {
					name: 'class',
					type: 'listbox',
					label: 'Class',
					values: buildListItems(
						editor.settings.table_row_class_list,
						function(item) {
							if (item.value) {
								item.textStyle = function() {
									return editor.formatter.getCssText({block: 'tr', classes: [item.value]});
								};
							}
						}
					)
				};
			}

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
							values: [
								{text: 'Header', value: 'thead'},
								{text: 'Body', value: 'tbody'},
								{text: 'Footer', value: 'tfoot'}
							]
						},
						{
							type: 'listbox',
							name: 'align',
							label: 'Alignment',
							text: 'None',
							maxWidth: null,
							values: [
								{text: 'None', value: ''},
								{text: 'Left', value: 'left'},
								{text: 'Center', value: 'center'},
								{text: 'Right', value: 'right'}
							]
						},
						{label: 'Height', name: 'height'},
						classListCtrl
					]
				},

				onsubmit: function() {
					var tableElm, oldParentElm, parentElm;

					data = Tools.extend(data, this.toJSON());

					editor.undoManager.transact(function() {
						var toType = data.type;

						each(rows, function(rowElm) {
							editor.dom.setAttribs(rowElm, {
								scope: data.scope,
								'class': data['class']
							});

							editor.dom.setStyles(rowElm, {
								height: addSizeSuffix(data.height)
							});

							if (toType != rowElm.parentNode.nodeName.toLowerCase()) {
								tableElm = dom.getParent(rowElm, 'table');

								oldParentElm = rowElm.parentNode;
								parentElm = dom.select(toType, tableElm)[0];
								if (!parentElm) {
									parentElm = dom.create(toType);
									if (tableElm.firstChild) {
										tableElm.insertBefore(parentElm, tableElm.firstChild);
									} else {
										tableElm.appendChild(parentElm);
									}
								}

								parentElm.appendChild(rowElm);

								if (!oldParentElm.hasChildNodes()) {
									dom.remove(oldParentElm);
								}
							}

							// Apply/remove alignment
							unApplyAlign(rowElm);
							if (data.align) {
								editor.formatter.apply('align' + data.align, {}, rowElm);
							}
						});

						editor.focus();
					});
				}
			});
		};
	};
});
