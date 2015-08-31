(function() {
	module("tinymce.plugins.Table", {
		setupModule: function() {
			QUnit.stop();

			tinymce.init({
				selector: "textarea",
				add_unload_trigger: false,
				skin: false,
				indent: false,
				plugins: 'table',
				valid_styles: {
					'*' : 'width,height,vertical-align,text-align,float,border-color,background-color,border,padding,border-spacing,border-collapse'
				},
				init_instance_callback: function(ed) {
					window.editor = ed;
					QUnit.start();
				}
			});
		},
		teardown: function() {
			var win = Utils.getFrontmostWindow();

			if (win) {
				win.close();
			}

			delete editor.settings.table_advtab;
			delete editor.settings.table_cell_advtab;
			delete editor.settings.table_class_list;
			delete editor.settings.table_cell_class_list;
			delete editor.settings.table_row_class_list;
			delete editor.settings.table_style_by_css;
		}
	});

	function fillAndSubmitWindowForm(data) {
		var win = Utils.getFrontmostWindow();

		win.fromJSON(data);
		win.find('form')[0].submit();
		win.close();
	}

	function cleanTableHtml(html) {
		return Utils.cleanHtml(html).replace(/<p>(&nbsp;|<br[^>]+>)<\/p>$/, '');
	}

	test("Table properties dialog (get data from plain table)", function() {
		editor.setContent('<table><tr><td>X</td></tr></table>');
		Utils.setSelection('td', 0);
		editor.execCommand('mceTableProps');

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
			"align": "",
			"border": "",
			"caption": false,
			"cellpadding": "",
			"cellspacing": "",
			"height": "",
			"width": "",
			"backgroundColor": "",
			"borderColor": "",
			"style": ""
		});
	});

	test("Table properties dialog (get/set data from/to plain table, no adv tab)", function() {
		editor.settings.table_advtab = false;

		editor.setContent('<table><tr><td>X</td></tr></table>');
		Utils.setSelection('td', 0);
		editor.execCommand('mceTableProps');

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
			"align": "",
			"border": "",
			"caption": false,
			"cellpadding": "",
			"cellspacing": "",
			"height": "",
			"width": ""
		});

		fillAndSubmitWindowForm({
			width: "100",
			height: "101"
		});

		equal(
			cleanTableHtml(editor.getContent()),
			'<table style="width: 100px; height: 101px;"><tbody><tr><td>x</td></tr></tbody></table>'
		);
	});

	test("Table properties dialog (get/set data from/to plain table, class list)", function() {
		editor.settings.table_class_list = [{title: 'Class1', value: 'class1'}];

		editor.setContent('<table><tr><td>X</td></tr></table>');
		Utils.setSelection('td', 0);
		editor.execCommand('mceTableProps');

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
			"align": "",
			"border": "",
			"caption": false,
			"cellpadding": "",
			"cellspacing": "",
			"height": "",
			"width": "",
			"backgroundColor": "",
			"borderColor": "",
			"style": "",
			"class": ""
		});

		fillAndSubmitWindowForm({
			width: "100",
			height: "101"
		});

		equal(
			cleanTableHtml(editor.getContent()),
			'<table style="width: 100px; height: 101px;"><tbody><tr><td>x</td></tr></tbody></table>'
		);
	});

	test("Table properties dialog (get data from full table)", function() {
		editor.setContent(
			'<table style="width: 100px; height: 101px;" border="4" cellspacing="2" cellpadding="3">' +
			'<caption>&nbsp;</caption>' +
			'<tbody>' +
			'<tr>' +
			'<td>&nbsp;</td>' +
			'</tr>' +
			'</tbody>' +
			'</table>'
		);

		Utils.setSelection('td', 0);
		editor.execCommand('mceTableProps');

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
			"align": "",
			"border": "4",
			"caption": true,
			"cellpadding": "3",
			"cellspacing": "2",
			"height": "101",
			"width": "100",
			"backgroundColor": "",
			"borderColor": "",
			"style": "width: 100px; height: 101px;"
		});
	});

	test("Table properties dialog (add caption)", function() {
		editor.setContent('<table><tr><td>X</td></tr></table>');
		Utils.setSelection('td', 0);
		editor.execCommand('mceTableProps');
		fillAndSubmitWindowForm({
			caption: true
		});

		equal(
			cleanTableHtml(editor.getContent()),
			'<table><caption>&nbsp;</caption><tbody><tr><td>x</td></tr></tbody></table>'
		);
	});

	test("Table properties dialog (remove caption)", function() {
		editor.setContent('<table><caption>&nbsp;</caption><tr><td>X</td></tr></table>');
		Utils.setSelection('td', 0);
		editor.execCommand('mceTableProps');
		fillAndSubmitWindowForm({
			caption: false
		});

		equal(
			cleanTableHtml(editor.getContent()),
			'<table><tbody><tr><td>x</td></tr></tbody></table>'
		);
	});

	test("Table properties dialog (change size in pixels)", function() {
		editor.setContent('<table><tr><td>X</td></tr></table>');
		Utils.setSelection('td', 0);
		editor.execCommand('mceTableProps');
		fillAndSubmitWindowForm({
			width: 100,
			height: 101
		});

		equal(
			cleanTableHtml(editor.getContent()),
			'<table style="width: 100px; height: 101px;"><tbody><tr><td>x</td></tr></tbody></table>'
		);
	});

	test("Table properties dialog (change size in %)", function() {
		editor.setContent('<table><tr><td>X</td></tr></table>');
		Utils.setSelection('td', 0);
		editor.execCommand('mceTableProps');
		fillAndSubmitWindowForm({
			width: "100%",
			height: "101%"
		});

		equal(
			cleanTableHtml(editor.getContent()),
			'<table style="width: 100%; height: 101%;"><tbody><tr><td>x</td></tr></tbody></table>'
		);
	});

	test("Table properties dialog (change: border,cellpadding,cellspacing,align,backgroundColor,borderColor)", function() {
		editor.setContent('<table style="border-color: red; background-color: blue"><tr><td>X</td></tr></table>');
		Utils.setSelection('td', 0);
		editor.execCommand('mceTableProps');
		fillAndSubmitWindowForm({
			border: "1",
			cellpadding: "2",
			cellspacing: "3",
			align: "right"
		});

		equal(
			cleanTableHtml(editor.getContent()),
			'<table style="float: right; border-color: red; background-color: blue;" border="1" cellspacing="3" cellpadding="2"><tbody><tr><td>x</td></tr></tbody></table>'
		);
	});

	test("Table properties dialog css border", function() {
		editor.settings.table_style_by_css = true;

		editor.setContent('<table><tr><td>X</td><td>Z</td></tr></table>');

		Utils.setSelection('td', 0);
		editor.execCommand('mceTableProps');
		fillAndSubmitWindowForm({
			border: "1px solid green"
		});
		equal(
			cleanTableHtml(editor.getContent()),
			'<table style=\"border: 1px solid green;\"><tbody><tr><td style=\"border: 1px solid green;\">x</td><td style=\"border: 1px solid green;\">z</td></tr></tbody></table>'
		);
	});

	test("Table properties dialog css cell padding", function() {
		editor.settings.table_style_by_css = true;

		editor.setContent('<table><tr><td>X</td><td>Z</td></tr></table>');

		Utils.setSelection('td', 0);
		editor.execCommand('mceTableProps');
		fillAndSubmitWindowForm({
			cellpadding: "2"
		});
		equal(
			cleanTableHtml(editor.getContent()),
			'<table><tbody><tr><td style=\"padding: 2px;\">x</td><td style=\"padding: 2px;\">z</td></tr></tbody></table>'
		);
	});

	test("Table properties dialog cell spacing", function() {
		editor.settings.table_style_by_css = true;

		editor.setContent('<table><tr><td>X</td><td>Z</td></tr></table>');

		Utils.setSelection('td', 0);
		editor.execCommand('mceTableProps');
		fillAndSubmitWindowForm({
			cellspacing: "3"
		});
		equal(
			cleanTableHtml(editor.getContent()),
			'<table style=\"border-spacing: 3px;\"><tbody><tr><td>x</td><td>z</td></tr></tbody></table>'
		);
	});

	test("Table properties dialog border-color", function() {
		editor.settings.table_style_by_css = true;

		editor.setContent('<table><tr><td>X</td><td>Z</td></tr></table>');

		Utils.setSelection('td', 0);
		editor.execCommand('mceTableProps');
		fillAndSubmitWindowForm({
			borderColor: "green"
		});
		equal(
			cleanTableHtml(editor.getContent()),
			'<table style=\"border-color: green;\"><tbody><tr><td>x</td><td>z</td></tr></tbody></table>'
		);
	});

	test("Table properties dialog css border, style", function() {
		editor.settings.table_style_by_css = true;

		editor.setContent('<table><tr><td>X</td><td>Z</td></tr></table>');

		Utils.setSelection('td', 0);
		editor.execCommand('mceTableProps');
		fillAndSubmitWindowForm({
			border: "1px solid green",
			style: "border-collapse: collapse"
		});
		equal(
			cleanTableHtml(editor.getContent()),
			'<table style=\"border: 1px solid green; border-collapse: collapse;\"><tbody><tr><td style=\"border: 1px solid green;\">x</td><td style=\"border: 1px solid green;\">z</td></tr></tbody></table>'
		);
	});

	test("Table properties dialog (get cell padding from styled cells)", function() {
		editor.settings.table_style_by_css = true;

		editor.setContent('<table><tr><td style="padding: 5px">X</td></tr><tr><td style="padding: 5px">X</td></tr></table>' +
			'<table><tr><td style="padding: 15px">X</td></tr><tr><td style="padding: 15px">X</td></tr></table>');
		Utils.setSelection('td', 0);
		editor.execCommand('mceTableProps');

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
		"align": "",
		"backgroundColor": "",
		"border": "",
		"borderColor": "",
		"caption": false,
		"cellpadding": "5px",
		"cellspacing": "",
		"height": "",
		"style": "",
		"width": ""
		});
	});

	test("Table cell properties dialog (get data from plain cell)", function() {
		editor.setContent('<table><tr><td>X</td></tr></table>');
		Utils.setSelection('td', 0);
		editor.execCommand('mceTableCellProps');

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
			"align": "",
			"valign": "",
			"height": "",
			"scope": "",
			"type": "td",
			"width": "",
			"backgroundColor": "",
			"borderColor": "",
			"style": ""
		});
	});

	test("Table cell properties dialog (get/set data from/to plain cell, no adv tab)", function() {
		editor.settings.table_cell_advtab = false;

		editor.setContent('<table><tr><td>X</td></tr></table>');
		Utils.setSelection('td', 0);
		editor.execCommand('mceTableCellProps');

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
			"align": "",
			"valign": "",
			"height": "",
			"scope": "",
			"type": "td",
			"width": ""
		});

		fillAndSubmitWindowForm({
			width: 100,
			height: 101
		});

		equal(
			cleanTableHtml(editor.getContent()),
			'<table><tbody><tr><td style="width: 100px; height: 101px;">x</td></tr></tbody></table>'
		);
	});

	test("Table cell properties dialog (get data from complex cell)", function() {
		editor.setContent('<table><tr><th style="text-align: right; vertical-align: top; width: 10px; height: 11px; border-color: red; background-color: blue" scope="row">X</th></tr></table>');
		Utils.setSelection('th', 0);
		editor.execCommand('mceTableCellProps');

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
			"align": "right",
			"valign": "top",
			"height": "11",
			"scope": "row",
			"type": "th",
			"width": "10",
			"backgroundColor": "blue",
			"borderColor": "red",
			"style": "width: 10px; height: 11px; vertical-align: top; text-align: right; border-color: red; background-color: blue;"
		});
	});

	test("Table cell properties dialog (update all)", function() {
		editor.setContent('<table><tr><td>X</td></tr></table>');
		Utils.setSelection('td', 0);
		editor.execCommand('mceTableCellProps');

		fillAndSubmitWindowForm({
			"align": "right",
			"height": "11",
			"scope": "row",
			"type": "th",
			"width": "10"
		});

		equal(
			cleanTableHtml(editor.getContent()),
			'<table><tbody><tr><th style="width: 10px; height: 11px; text-align: right;" scope="row">x</th></tr></tbody></table>'
		);
	});

	test("Table row properties dialog (get data from plain cell)", function() {
		editor.setContent('<table><tr><td>X</td></tr></table>');
		Utils.setSelection('td', 0);
		editor.execCommand('mceTableRowProps');

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
			"align": "",
			"height": "",
			"type": "tbody",
			"backgroundColor": "",
			"borderColor": "",
			"style": ""
		});
	});

	test("Table row properties dialog (get data from complex row)", function() {
		editor.setContent('<table><thead><tr style="height: 10px; text-align: right; border-color: red; background-color: blue"><td>X</td></tr></thead></table>');
		Utils.setSelection('td', 0);
		editor.execCommand('mceTableRowProps');

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
			"align": "right",
			"height": "10",
			"type": "thead",
			"backgroundColor": "blue",
			"borderColor": "red",
			"style": "height: 10px; text-align: right; border-color: red; background-color: blue;"
		});
	});

	test("Table row properties dialog (update all)", function() {
		editor.setContent('<table><tr><td>X</td></tr></table>');
		Utils.setSelection('td', 0);
		editor.execCommand('mceTableRowProps');

		fillAndSubmitWindowForm({
			"align": "right",
			"height": "10",
			"type": "thead"
		});

		equal(
			cleanTableHtml(editor.getContent()),
			'<table><thead><tr style="height: 10px; text-align: right;"><td>x</td></tr></thead></table>'
		);
	});

	test("mceTableDelete command", function() {
		editor.setContent('<table><tr><td>X</td></tr></table>');
		Utils.setSelection('td', 0);
		editor.execCommand('mceTableDelete');
		equal(cleanTableHtml(editor.getContent()), '');
	});

	test("mceTableDeleteCol command", function() {
		editor.setContent('<table><tr><td>1</td><td>2</td></tr></table>');
		Utils.setSelection('td', 0);
		editor.execCommand('mceTableDeleteCol');
		equal(cleanTableHtml(editor.getContent()), '<table><tbody><tr><td>2</td></tr></tbody></table>');
	});

	test("mceTableDeleteRow command", function() {
		editor.setContent('<table><tr><td>1</td></tr><tr><td>2</td></tr></table>');
		Utils.setSelection('td', 0);
		editor.execCommand('mceTableDeleteRow');
		equal(cleanTableHtml(editor.getContent()), '<table><tbody><tr><td>2</td></tr></tbody></table>');
	});

	test("mceTableInsertColAfter command", function() {
		editor.setContent('<table><tr><td>1</td></tr><tr><td>2</td></tr></table>');
		Utils.setSelection('td', 0);
		editor.execCommand('mceTableInsertColAfter');
		equal(cleanTableHtml(editor.getContent()), '<table><tbody><tr><td>1</td><td>&nbsp;</td></tr><tr><td>2</td><td>&nbsp;</td></tr></tbody></table>');
	});

	test("mceTableInsertColBefore command", function() {
		editor.setContent('<table><tr><td>1</td></tr><tr><td>2</td></tr></table>');
		Utils.setSelection('td', 0);
		editor.execCommand('mceTableInsertColBefore');
		equal(cleanTableHtml(editor.getContent()), '<table><tbody><tr><td>&nbsp;</td><td>1</td></tr><tr><td>&nbsp;</td><td>2</td></tr></tbody></table>');
	});

	test("mceTableInsertRowAfter command", function() {
		editor.setContent('<table><tr><td>1</td><td>2</td></tr></table>');
		Utils.setSelection('td', 0);
		editor.execCommand('mceTableInsertRowAfter');
		equal(cleanTableHtml(editor.getContent()), '<table><tbody><tr><td>1</td><td>2</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table>');
	});

	test("mceTableInsertRowBefore command", function() {
		editor.setContent('<table><tr><td>1</td><td>2</td></tr></table>');
		Utils.setSelection('td', 0);
		editor.execCommand('mceTableInsertRowBefore');
		equal(cleanTableHtml(editor.getContent()), '<table><tbody><tr><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>1</td><td>2</td></tr></tbody></table>');
	});

	test("mceTableMergeCells command with cell selection", function() {
		editor.getBody().innerHTML = '<table><tr><td class="mce-item-selected">1</td><td class="mce-item-selected">2</td></tr></table>';
		Utils.setSelection('td', 0);
		editor.execCommand('mceTableMergeCells');
		equal(cleanTableHtml(editor.getContent()), '<table><tbody><tr><td colspan="2">12</td></tr></tbody></table>');
	});

	test("mceTableSplitCells command", function() {
		editor.setContent('<table><tbody><tr><td colspan="2">12</td></tr></tbody></table>');
		Utils.setSelection('td', 0);
		editor.execCommand('mceTableSplitCells');
		equal(
			cleanTableHtml(editor.getContent()),
			'<table><tbody><tr><td>12</td><td>&nbsp;</td></tr></tbody></table>'
		);
	});

	test("Tab key navigation", function() {
		editor.setContent('<table><tbody><tr><td>A1</td><td>A2</td></tr><tr><td>B1</td><td>B2</td></tr></tbody></table><p>x</p>');

		Utils.setSelection('td', 0);
		editor.fire('keydown', {keyCode: 9});
		equal(editor.selection.getStart().innerHTML, 'A2');

		Utils.setSelection('td', 0);
		editor.fire('keydown', {keyCode: 9, shiftKey: true});
		equal(editor.selection.getStart().innerHTML, 'A1');

		Utils.setSelection('td:nth-child(2)', 0);
		editor.fire('keydown', {keyCode: 9, shiftKey: true});
		equal(editor.selection.getStart().innerHTML, 'A1');

		Utils.setSelection('tr:nth-child(2) td:nth-child(2)', 0);
		editor.fire('keydown', {keyCode: 9});
		equal(editor.selection.getStart(true).nodeName, 'TD');
		equal(
			editor.getContent(),
			'<table><tbody><tr><td>A1</td><td>A2</td></tr><tr><td>B1</td><td>B2</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table><p>x</p>'
		);
	});

	test("Delete selected cells", function() {
		editor.getBody().innerHTML = (
			'<table><tbody>' +
			'<tr><td class="mce-item-selected">A1</td><td>A2</td></tr>' +
			'<tr><td class="mce-item-selected">B1</td><td>B2</td></tr>' +
			'</tbody></table>' +
			'<p>x</p>'
		);

		Utils.setSelection('td', 0, 'td', 2);
		editor.fire('keydown', {keyCode: 46});

		equal(
			editor.getContent(),
			'<table><tbody><tr><td>&nbsp;</td><td>A2</td></tr><tr><td>&nbsp;</td><td>B2</td></tr></tbody></table><p>x</p>'
		);
	});

	test("Delete all cells", function() {
		editor.getBody().innerHTML = (
			'<table><tbody>' +
			'<tr><td class="mce-item-selected">A1</td><td class="mce-item-selected">A2</td></tr>' +
			'<tr><td class="mce-item-selected">B1</td><td class="mce-item-selected">B2</td></tr>' +
			'</tbody></table>' +
			'<p>x</p>'
		);

		Utils.setSelection('td', 0, 'td', 2);
		editor.fire('keydown', {keyCode: 46});

		equal(
			editor.getContent(),
			'<p>x</p>'
		);
	});

	test("Delete empty like table cell contents", function() {
		editor.getBody().innerHTML = (
			'<table><tbody>' +
			'<tr><td><p><br></p></td><td><p>a</p></td>' +
			'</tbody></table>' +
			'<p>x</p>'
		);

		Utils.setSelection('td', 0);
		editor.fire('keydown', {keyCode: 46});

		equal(
			editor.getContent(),
			'<table><tbody><tr><td>&nbsp;</td><td><p>a</p></td></tr></tbody></table><p>x</p>'
		);
	});

	var testResizeTable1 = '<table><tbody>' +
			'<tr><td style="width: 200px;" colspan="2" data-mce-style="width: 200px;">A1</td><td style="width: 100px;" data-mce-style="width: 100px;">A2</td><td style="width: 100px;" data-mce-style="width: 100px;">A3</td></tr>' +
			'<tr><td style="width: 100px;" data-mce-style="width: 100px;">B1</td><td style="width: 200px;" colspan="2" data-mce-style="width: 200px;">B2</td><td style="width: 100px;" data-mce-style="width: 100px;">B3</td></tr>' +
			'<tr><td style="width: 100px;" data-mce-style="width: 100px;">C1</td><td style="width: 100px;" data-mce-style="width: 100px;">C2</td><td style="width: 200px;" colspan="2" data-mce-style="width: 200px;">C3</td></tr>' +
			'<tr><td style="width: 400px;" colspan="4" data-mce-style="width: 400px;">D1</td></tr></tbody></table>';

	var testResizeTable2 = '<table border="1"><tbody>' +
	'<tr><th style="width: 20px;" data-mce-style="width: 20px;">A0</th><th style="width: 20px;" data-mce-style="width: 20px;">A1</th><th style="width: 20px;" data-mce-style="width: 20px;">A2</th>' +
	'<th style="width: 40px;" data-mce-style="width: 40px;">A3</th><th style="width: 10px;" data-mce-style="width: 10px;">A4</th></tr><tr><td style="width: 20px;" data-mce-style="width: 20px;">B0</td><td style="width: 20px; "' +
	'data-mce-style="width: 20px;">B1</td><td style="width: 20px;" data-mce-style="width: 20px;">B2</td><td style="width: 40px;" data-mce-style="width: 40px;">B3</td><td style="width: 10px;" rowspan="2" data-mce-style="width: 10px;">' +
	'B3</td></tr><tr><td style="width: 20px;" data-mce-style="width: 20px;">C0</td><td style="width: 20px;" data-mce-style="width: 20px;">C1</td><td style="width: 20px;" data-mce-style="width: 20px;">C2</td><td style="width: 40px;" ' +
	'data-mce-style="width: 40px;">C3</td></tr></tbody></table>';

	test("Get pixel widths/heights", function() {
		editor.setContent(testResizeTable1);

		var table = editor.dom.select('table')[0];
		var details = editor.plugins.table.resizeBars.getTableDetails(table);
		var jenga  = editor.plugins.table.resizeBars.getJengaGrid(details);

		deepEqual(
			editor.plugins.table.resizeBars.getPixelWidths(jenga),
			[100, 100, 100, 100]
		);

		deepEqual(
			editor.plugins.table.resizeBars.getPixelHeights(jenga),
			[10, 10, 10, 10]
		);

		editor.setContent(testResizeTable2);

		table = editor.dom.select('table')[0];
		details = editor.plugins.table.resizeBars.getTableDetails(table);
		jenga  = editor.plugins.table.resizeBars.getJengaGrid(details);

		deepEqual(
			editor.plugins.table.resizeBars.getPixelWidths(jenga),
			[20, 20, 20, 40, 10]
		);

		deepEqual(
			editor.plugins.table.resizeBars.getPixelHeights(jenga),
			[10, 10, 10]
		);
	});

	test("Draw bars/clear bars", function() {
		editor.setContent(testResizeTable1);

		var table = editor.dom.select('table')[0];

		editor.plugins.table.resizeBars.drawBars(table);

		equal(editor.dom.select('.mce-resize-bar-row').length,
			4);

		equal(editor.dom.select('.mce-resize-bar-col').length,
			4);

		editor.plugins.table.resizeBars.clearBars();

		equal(editor.dom.select('.mce-resize-bar-row').length,
			0);

		equal(editor.dom.select('.mce-resize-bar-col').length,
			0);
	});

	test("Determine deltas", function() {
		var deltas = editor.plugins.table.resizeBars.determineDeltas([100, 100, 100, 100], 0, 50, 10);

		deepEqual(deltas, [50, -50, 0, 0]);

		deltas = editor.plugins.table.resizeBars.determineDeltas([100, 100, 100, 100], 1, 50, 10);

		deepEqual(deltas, [0, 50, -50, 0]);

		deltas = editor.plugins.table.resizeBars.determineDeltas([100, 100, 100, 100], 2, 50, 10);

		deepEqual(deltas, [0, 0, 50, -50]);

		deltas = editor.plugins.table.resizeBars.determineDeltas([100, 100, 100, 100], 3, 50, 10);

		deepEqual(deltas, [0, 0, 0, 50]);
	});

	test("Adjust width", function() {
		editor.setContent(testResizeTable1);

		var table = editor.dom.select('table')[0];

		editor.plugins.table.resizeBars.adjustWidth(table, 50, 0);

		equal(editor.getContent(),
			'<table style="width: 400px;">' +
			'<tbody>' +
			'<tr>' +
			'<td style="width: 200px;" colspan="2">A1</td>' +
			'<td style="width: 100px;">A2</td>' +
			'<td style="width: 100px;">A3</td>' +
			'</tr>' +
			'<tr>' +
			'<td style="width: 150px;">B1</td>' +
			'<td style="width: 150px;" colspan="2">B2</td>' +
			'<td style="width: 100px;">B3</td>' +
			'</tr>' +
			'<tr>' +
			'<td style="width: 150px;">C1</td>' +
			'<td style="width: 50px;">C2</td>' +
			'<td style="width: 200px;" colspan="2">C3</td>' +
			'</tr>' +
			'<tr>' +
			'<td style="width: 400px;" colspan="4">D1</td>' +
			'</tr>' +
			'</tbody>' +
			'</table>');

		editor.setContent(testResizeTable1);

		table = editor.dom.select('table')[0];

		editor.plugins.table.resizeBars.adjustWidth(table, 50, 1);

		equal(editor.getContent(),
			'<table style="width: 400px;">' +
			'<tbody>' +
			'<tr>' +
			'<td style="width: 250px;" colspan="2">A1</td>' +
			'<td style="width: 50px;">A2</td>' +
			'<td style="width: 100px;">A3</td>' +
			'</tr>' +
			'<tr>' +
			'<td style="width: 100px;">B1</td>' +
			'<td style="width: 200px;" colspan="2">B2</td>' +
			'<td style="width: 100px;">B3</td>' +
			'</tr>' +
			'<tr>' +
			'<td style="width: 100px;">C1</td>' +
			'<td style="width: 150px;">C2</td>' +
			'<td style="width: 150px;" colspan="2">C3</td>' +
			'</tr>' +
			'<tr>' +
			'<td style="width: 400px;" colspan="4">D1</td>' +
			'</tr>' +
			'</tbody>' +
			'</table>');

		editor.setContent(testResizeTable1);

		table = editor.dom.select('table')[0];

		editor.plugins.table.resizeBars.adjustWidth(table, 50, 2);

		equal(editor.getContent(),
			'<table style="width: 400px;">' +
			'<tbody>' +
			'<tr>' +
			'<td style="width: 200px;" colspan="2">A1</td>' +
			'<td style="width: 150px;">A2</td>' +
			'<td style="width: 50px;">A3</td>' +
			'</tr>' +
			'<tr>' +
			'<td style="width: 100px;">B1</td>' +
			'<td style="width: 250px;" colspan="2">B2</td>' +
			'<td style="width: 50px;">B3</td>' +
			'</tr>' +
			'<tr>' +
			'<td style="width: 100px;">C1</td>' +
			'<td style="width: 100px;">C2</td>' +
			'<td style="width: 200px;" colspan="2">C3</td>' +
			'</tr>' +
			'<tr>' +
			'<td style="width: 400px;" colspan="4">D1</td>' +
			'</tr>' +
			'</tbody>' +
			'</table>');

		editor.setContent(testResizeTable1);

		table = editor.dom.select('table')[0];

		editor.plugins.table.resizeBars.adjustWidth(table, 50, 3);

		equal(editor.getContent(),
			'<table style="width: 450px;">' +
			'<tbody>' +
			'<tr>' +
			'<td style="width: 200px;" colspan="2">A1</td>' +
			'<td style="width: 100px;">A2</td>' +
			'<td style="width: 150px;">A3</td>' +
			'</tr>' +
			'<tr>' +
			'<td style="width: 100px;">B1</td>' +
			'<td style="width: 200px;" colspan="2">B2</td>' +
			'<td style="width: 150px;">B3</td>' +
			'</tr>' +
			'<tr>' +
			'<td style="width: 100px;">C1</td>' +
			'<td style="width: 100px;">C2</td>' +
			'<td style="width: 250px;" colspan="2">C3</td>' +
			'</tr>' +
			'<tr>' +
			'<td style="width: 450px;" colspan="4">D1</td>' +
			'</tr>' +
			'</tbody>' +
			'</table>');
	});

	test("Adjust height", function() {
		editor.setContent(testResizeTable2);

		var table = editor.dom.select('table')[0];

		editor.plugins.table.resizeBars.adjustHeight(table, 50, 0);

		equal(editor.getContent(),
			'<table border="1">' +
			'<tbody>' +
			'<tr style="height: 60px;">' +
			'<th style="width: 20px; height: 60px;">A0</th>' +
			'<th style="width: 20px; height: 60px;">A1</th>' +
			'<th style="width: 20px; height: 60px;">A2</th>' +
			'<th style="width: 40px; height: 60px;">A3</th>' +
			'<th style="width: 10px; height: 60px;">A4</th>' +
			'</tr>' +
			'<tr style="height: 10px;">' +
			'<td style="width: 20px; height: 10px;">B0</td>' +
			'<td style="width: 20px; height: 10px;">B1</td>' +
			'<td style="width: 20px; height: 10px;">B2</td>' +
			'<td style="width: 40px; height: 10px;">B3</td>' +
			'<td style="width: 10px; height: 20px;" rowspan="2">B3</td>' +
			'</tr>' +
			'<tr style="height: 10px;">' +
			'<td style="width: 20px; height: 10px;">C0</td>' +
			'<td style="width: 20px; height: 10px;">C1</td>' +
			'<td style="width: 20px; height: 10px;">C2</td>' +
			'<td style="width: 40px; height: 10px;">C3</td>' +
			'</tr>' +
			'</tbody>' +
			'</table>');

		editor.setContent(testResizeTable2);

		table = editor.dom.select('table')[0];

		editor.plugins.table.resizeBars.adjustHeight(table, 50, 1);

		equal(editor.getContent(),
			'<table border="1">' +
			'<tbody>' +
			'<tr style="height: 10px;">' +
			'<th style="width: 20px; height: 10px;">A0</th>' +
			'<th style="width: 20px; height: 10px;">A1</th>' +
			'<th style="width: 20px; height: 10px;">A2</th>' +
			'<th style="width: 40px; height: 10px;">A3</th>' +
			'<th style="width: 10px; height: 10px;">A4</th>' +
			'</tr>' +
			'<tr style="height: 60px;">' +
			'<td style="width: 20px; height: 60px;">B0</td>' +
			'<td style="width: 20px; height: 60px;">B1</td>' +
			'<td style="width: 20px; height: 60px;">B2</td>' +
			'<td style="width: 40px; height: 60px;">B3</td>' +
			'<td style="width: 10px; height: 70px;" rowspan="2">B3</td>' +
			'</tr>' +
			'<tr style="height: 10px;">' +
			'<td style="width: 20px; height: 10px;">C0</td>' +
			'<td style="width: 20px; height: 10px;">C1</td>' +
			'<td style="width: 20px; height: 10px;">C2</td>' +
			'<td style="width: 40px; height: 10px;">C3</td>' +
			'</tr>' +
			'</tbody>' +
			'</table>');

		editor.setContent(testResizeTable2);

		table = editor.dom.select('table')[0];

		editor.plugins.table.resizeBars.adjustHeight(table, 50, 2);

		equal(editor.getContent(),
			'<table border="1">' +
			'<tbody>' +
			'<tr style="height: 10px;">' +
			'<th style="width: 20px; height: 10px;">A0</th>' +
			'<th style="width: 20px; height: 10px;">A1</th>' +
			'<th style="width: 20px; height: 10px;">A2</th>' +
			'<th style="width: 40px; height: 10px;">A3</th>' +
			'<th style="width: 10px; height: 10px;">A4</th>' +
			'</tr>' +
			'<tr style="height: 10px;">' +
			'<td style="width: 20px; height: 10px;">B0</td>' +
			'<td style="width: 20px; height: 10px;">B1</td>' +
			'<td style="width: 20px; height: 10px;">B2</td>' +
			'<td style="width: 40px; height: 10px;">B3</td>' +
			'<td style="width: 10px; height: 70px;" rowspan="2">B3</td>' +
			'</tr>' +
			'<tr style="height: 60px;">' +
			'<td style="width: 20px; height: 60px;">C0</td>' +
			'<td style="width: 20px; height: 60px;">C1</td>' +
			'<td style="width: 20px; height: 60px;">C2</td>' +
			'<td style="width: 40px; height: 60px;">C3</td>' +
			'</tr>' +
			'</tbody>' +
			'</table>');

	});
})();
