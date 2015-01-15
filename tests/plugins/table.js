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
			var win = Utils.getFontmostWindow();

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
		var win = Utils.getFontmostWindow();

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

		deepEqual(Utils.getFontmostWindow().toJSON(), {
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

		deepEqual(Utils.getFontmostWindow().toJSON(), {
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

		deepEqual(Utils.getFontmostWindow().toJSON(), {
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

		deepEqual(Utils.getFontmostWindow().toJSON(), {
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

		deepEqual(Utils.getFontmostWindow().toJSON(), {
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

		deepEqual(Utils.getFontmostWindow().toJSON(), {
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

		deepEqual(Utils.getFontmostWindow().toJSON(), {
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

		deepEqual(Utils.getFontmostWindow().toJSON(), {
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

		deepEqual(Utils.getFontmostWindow().toJSON(), {
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

		deepEqual(Utils.getFontmostWindow().toJSON(), {
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
})();