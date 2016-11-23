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

			editor.off('newcell newrow');
		}
	});

	function fillAndSubmitWindowForm(data) {
		var win = Utils.getFrontmostWindow();

		win.fromJSON(data);
		win.find('form')[0].submit();
		win.close();
	}

	function testCommand(command, tests) {
		tinymce.util.Tools.each(tests, function (test) {
			editor.getBody().innerHTML = test.before;
			editor.selection.select(editor.dom.select('td[data-mce-selected]')[0], true);
			editor.selection.collapse(true);
			editor.execCommand(command);
			equal(cleanTableHtml(editor.getContent()), test.after, test.message);
		});
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

	test("Table cell properties dialog update multiple cells", function() {
		editor.getBody().innerHTML = (
			'<table>' +
				'<tbody>' +
					'<tr>' +
						'<td style="width: 10px;" data-mce-selected="1">a</td>' +
						'<td style="width: 20px;" data-mce-selected="1">b</td>' +
					'</tr>' +
				'</tbody>' +
			'</table>'
		);
		Utils.setSelection('td:nth-child(2)', 0);
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
		}, 'Should not contain width');

		fillAndSubmitWindowForm({
			"height": "20"
		});

		equal(
			cleanTableHtml(editor.getContent()),
			(
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<td style="width: 10px; height: 20px;">a</td>' +
							'<td style="width: 20px; height: 20px;">b</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>'
			),
			'Width should be retained height should be changed'
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

	test("Table row properties dialog update multiple rows", function() {
		editor.getBody().innerHTML = (
			'<table>' +
				'<tbody>' +
					'<tr style="height: 20px;">' +
						'<td data-mce-selected="1">a</td>' +
						'<td data-mce-selected="1">b</td>' +
					'</tr>' +
					'<tr style="height: 20px;">' +
						'<td data-mce-selected="1">c</td>' +
						'<td data-mce-selected="1">d</td>' +
					'</tr>' +
				'</tbody>' +
			'</table>'
		);
		Utils.setSelection('tr:nth-child(2) td:nth-child(2)', 0);
		editor.execCommand('mceTableRowProps');

		deepEqual(Utils.getFrontmostWindow().toJSON(), {
			"align": "",
			"height": "",
			"type": "tbody",
			"backgroundColor": "",
			"borderColor": "",
			"style": ""
		}, 'Should not contain height');

		fillAndSubmitWindowForm({
			"align": "center"
		});

		equal(
			cleanTableHtml(editor.getContent()),
			(
				'<table>' +
					'<tbody>' +
						'<tr style="height: 20px; text-align: center;">' +
							'<td>a</td>' +
							'<td>b</td>' +
						'</tr>' +
						'<tr style="height: 20px; text-align: center;">' +
							'<td>c</td>' +
							'<td>d</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>'
			),
			'Width should be retained height should be changed'
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

	test("mceTableInsertRowAfter command on merged cells", function() {
		editor.setContent(
			'<table>' +
				'<tr><td>1</td><td>2</td><td>3</td></tr>' +
				'<tr><td>4</td><td colspan="2" rowspan="2">5</td></tr>' +
				'<tr><td>6</td></tr>' +
			'</table>'
		);

		Utils.setSelection('tr:nth-child(2) td', 0);
		editor.execCommand('mceTableInsertRowAfter');

		equal(
			cleanTableHtml(editor.getContent()),

			'<table>' +
				'<tbody>' +
					'<tr><td>1</td><td>2</td><td>3</td></tr>' +
					'<tr><td>4</td><td colspan="2" rowspan="3">5</td></tr>' +
					'<tr><td>&nbsp;</td></tr>' +
					'<tr><td>6</td></tr>' +
				'</tbody>' +
			'</table>'
		);
	});

	test("mceTablePasteRowBefore command", function() {
		editor.setContent(
			'<table>' +
				'<tr><td>1</td><td>2</td></tr>' +
				'<tr><td>2</td><td>3</td></tr>' +
			'</table>'
		);

		Utils.setSelection('tr:nth-child(1) td', 0);
		editor.execCommand('mceTableCopyRow');
		Utils.setSelection('tr:nth-child(2) td', 0);
		editor.execCommand('mceTablePasteRowBefore');

		equal(
			cleanTableHtml(editor.getContent()),

			'<table>' +
				'<tbody>' +
					'<tr><td>1</td><td>2</td></tr>' +
					'<tr><td>1</td><td>2</td></tr>' +
					'<tr><td>2</td><td>3</td></tr>' +
				'</tbody>' +
			'</table>'
		);

		Utils.setSelection('tr:nth-child(2) td', 0);
		editor.execCommand('mceTablePasteRowBefore');

		equal(
			cleanTableHtml(editor.getContent()),

			'<table>' +
				'<tbody>' +
					'<tr><td>1</td><td>2</td></tr>' +
					'<tr><td>1</td><td>2</td></tr>' +
					'<tr><td>1</td><td>2</td></tr>' +
					'<tr><td>2</td><td>3</td></tr>' +
				'</tbody>' +
			'</table>'
		);
	});

	test("mceTablePasteRowAfter command", function() {
		editor.setContent(
			'<table>' +
				'<tr><td>1</td><td>2</td></tr>' +
				'<tr><td>2</td><td>3</td></tr>' +
			'</table>'
		);

		Utils.setSelection('tr:nth-child(1) td', 0);
		editor.execCommand('mceTableCopyRow');
		Utils.setSelection('tr:nth-child(2) td', 0);
		editor.execCommand('mceTablePasteRowAfter');

		equal(
			cleanTableHtml(editor.getContent()),

			'<table>' +
				'<tbody>' +
					'<tr><td>1</td><td>2</td></tr>' +
					'<tr><td>2</td><td>3</td></tr>' +
					'<tr><td>1</td><td>2</td></tr>' +
				'</tbody>' +
			'</table>'
		);

		Utils.setSelection('tr:nth-child(2) td', 0);
		editor.execCommand('mceTablePasteRowAfter');

		equal(
			cleanTableHtml(editor.getContent()),

			'<table>' +
				'<tbody>' +
					'<tr><td>1</td><td>2</td></tr>' +
					'<tr><td>2</td><td>3</td></tr>' +
					'<tr><td>1</td><td>2</td></tr>' +
					'<tr><td>1</td><td>2</td></tr>' +
				'</tbody>' +
			'</table>'
		);
	});

	test("mceTablePasteRowAfter from merged row source", function() {
		editor.setContent(
			'<table>' +
				'<tbody>' +
					'<tr><td colspan="2">1 2</td><td rowspan="2">3</td></tr>' +
					'<tr><td>1</td><td>2</td></tr>' +
				'</tbody>' +
			'</table>'
		);

		Utils.setSelection('tr:nth-child(1) td', 0);
		editor.execCommand('mceTableCopyRow');
		Utils.setSelection('tr:nth-child(2) td:nth-child(2)', 0);
		editor.execCommand('mceTablePasteRowAfter');

		equal(
			cleanTableHtml(editor.getContent()),

			'<table>' +
				'<tbody>' +
					'<tr><td colspan="2">1 2</td><td rowspan="2">3</td></tr>' +
					'<tr><td>1</td><td>2</td></tr>' +
					'<tr><td>1 2</td><td>3</td><td>&nbsp;</td></tr>' +
				'</tbody>' +
			'</table>'
		);
	});

	test("mceTablePasteRowAfter from merged row source to merged row target", function() {
		editor.setContent(
			'<table>' +
				'<tbody>' +
					'<tr><td colspan="2">1 2</td><td rowspan="2">3</td></tr>' +
					'<tr><td>1</td><td>2</td></tr>' +
				'</tbody>' +
			'</table>'
		);

		Utils.setSelection('tr:nth-child(1) td', 0);
		editor.execCommand('mceTableCopyRow');
		Utils.setSelection('tr:nth-child(1) td', 0);
		editor.execCommand('mceTablePasteRowAfter');

		equal(
			cleanTableHtml(editor.getContent()),

			'<table>' +
				'<tbody>' +
					'<tr><td colspan="2">1 2</td><td>3</td></tr>' +
					'<tr><td>1 2</td><td>3</td><td>&nbsp;</td></tr>' +
					'<tr><td>1</td><td>2</td><td>&nbsp;</td></tr>' +
				'</tbody>' +
			'</table>'
		);
	});

	test("mceTablePasteRowAfter to wider table", function() {
		editor.setContent(
			'<table>' +
				'<tbody>' +
					'<tr><td>1a</td><td>2a</td><td>3a</td></tr>' +
				'</tbody>' +
			'</table>' +

			'<table>' +
				'<tbody>' +
					'<tr><td>1b</td><td>2b</td><td>3b</td><td>4b</td></tr>' +
				'</tbody>' +
			'</table>'
		);

		Utils.setSelection('table:nth-child(1) tr:nth-child(1) td', 0);
		editor.execCommand('mceTableCopyRow');

		Utils.setSelection('table:nth-child(2) td', 0);
		editor.execCommand('mceTablePasteRowAfter');

		equal(
			cleanTableHtml(editor.getContent()),

			'<table>' +
				'<tbody>' +
					'<tr><td>1a</td><td>2a</td><td>3a</td></tr>' +
				'</tbody>' +
			'</table>' +

			'<table>' +
				'<tbody>' +
					'<tr><td>1b</td><td>2b</td><td>3b</td><td>4b</td></tr>' +
					'<tr><td>1a</td><td>2a</td><td>3a</td><td>&nbsp;</td></tr>' +
				'</tbody>' +
			'</table>'
		);
	});

	test("mceTablePasteRowAfter to narrower table", function() {
		editor.setContent(
			'<table>' +
				'<tbody>' +
					'<tr><td>1a</td><td>2a</td><td>3a</td></tr>' +
				'</tbody>' +
			'</table>' +

			'<table>' +
				'<tbody>' +
					'<tr><td>1b</td><td>2b</td></tr>' +
				'</tbody>' +
			'</table>'
		);

		Utils.setSelection('table:nth-child(1) tr:nth-child(1) td', 0);
		editor.execCommand('mceTableCopyRow');

		Utils.setSelection('table:nth-child(2) td', 0);
		editor.execCommand('mceTablePasteRowAfter');

		equal(
			cleanTableHtml(editor.getContent()),

			'<table>' +
				'<tbody>' +
					'<tr><td>1a</td><td>2a</td><td>3a</td></tr>' +
				'</tbody>' +
			'</table>' +

			'<table>' +
				'<tbody>' +
					'<tr><td>1b</td><td>2b</td></tr>' +
					'<tr><td>1a</td><td>2a</td></tr>' +
				'</tbody>' +
			'</table>'
		);
	});

	test("row clipboard api", function() {
		var clipboardRows;

		function createRow(cellContents) {
			var tr = editor.dom.create('tr');

			tinymce.each(cellContents, function (html) {
				tr.appendChild(editor.dom.create('td', null, html));
			});

			return tr;
		}

		editor.setContent(
			'<table>' +
				'<tr><td>1</td><td>2</td></tr>' +
				'<tr><td>2</td><td>3</td></tr>' +
			'</table>'
		);

		Utils.setSelection('tr:nth-child(1) td', 0);
		editor.execCommand('mceTableCopyRow');

		clipboardRows = editor.plugins.table.getClipboardRows();

		equal(clipboardRows.length, 1);
		equal(clipboardRows[0].tagName, 'TR');

		editor.plugins.table.setClipboardRows(clipboardRows.concat([
			createRow(['a', 'b']),
			createRow(['c', 'd'])
		]));

		Utils.setSelection('tr:nth-child(2) td', 0);
		editor.execCommand('mceTablePasteRowAfter');

		equal(
			cleanTableHtml(editor.getContent()),

			'<table>' +
				'<tbody>' +
					'<tr><td>1</td><td>2</td></tr>' +
					'<tr><td>2</td><td>3</td></tr>' +
					'<tr><td>1</td><td>2</td></tr>' +
					'<tr><td>a</td><td>b</td></tr>' +
					'<tr><td>c</td><td>d</td></tr>' +
				'</tbody>' +
			'</table>'
		);
	});

	test("mceSplitColsBefore", function() {
		testCommand('mceSplitColsBefore', [
			{
				message: 'Should not change anything these is no table cell selection',
				before: '<p>a</p>',
				after: '<p>a</p>'
			},

			{
				message: 'Should not change anything since there is nothing to split (1 row)',
				before: (
					'<table>' +
						'<tbody>' +
							'<tr><td data-mce-selected="1">1a</td><td>2a</td><td>3a</td></tr>' +
						'</tbody>' +
					'</table>'
				),
				after: (
					'<table>' +
						'<tbody>' +
							'<tr><td>1a</td><td>2a</td><td>3a</td></tr>' +
						'</tbody>' +
					'</table>'
				)
			},

			{
				message: 'Should not change anything since there is nothing to split (2 rows)',
				before: (
					'<table>' +
						'<tbody>' +
							'<tr><td>1a</td><td>2a</td><td>3a</td></tr>' +
							'<tr><td data-mce-selected="1">1b</td><td>2b</td><td>3b</td></tr>' +
						'</tbody>' +
					'</table>'
				),
				after: (
					'<table>' +
						'<tbody>' +
						'<tr><td>1a</td><td>2a</td><td>3a</td></tr>' +
						'<tr><td>1b</td><td>2b</td><td>3b</td></tr>' +
						'</tbody>' +
					'</table>'
				)
			},

			{
				message: 'Should split at second row and remove rowspan',
				before: (
					'<table>' +
						'<tbody>' +
							'<tr><td rowspan="2">1a</td><td>2a</td><td rowspan="2">3a</td></tr>' +
							'<tr><td data-mce-selected="1">2b</td></tr>' +
						'</tbody>' +
					'</table>'
				),
				after: (
					'<table>' +
						'<tbody>' +
							'<tr><td>1a</td><td>2a</td><td>3a</td></tr>' +
							'<tr><td>&nbsp;</td><td>2b</td><td>&nbsp;</td></tr>' +
						'</tbody>' +
					'</table>'
				)
			},

			{
				message: 'Should split at third row and decrease rowspan',
				before: (
					'<table>' +
						'<tbody>' +
							'<tr><td rowspan="3">1a</td><td>2a</td><td rowspan="3">3a</td></tr>' +
							'<tr><td>2b</td></tr>' +
							'<tr><td data-mce-selected="1">2c</td></tr>' +
						'</tbody>' +
					'</table>'
				),
				after: (
					'<table>' +
						'<tbody>' +
							'<tr><td rowspan="2">1a</td><td>2a</td><td rowspan="2">3a</td></tr>' +
							'<tr><td>2b</td></tr>' +
							'<tr><td>&nbsp;</td><td>2c</td><td>&nbsp;</td></tr>' +
						'</tbody>' +
					'</table>'
				)
			}
		]);
	});

	test("mceSplitColsAfter", function() {
		testCommand('mceSplitColsAfter', [
			{
				message: 'Should not change anything these is no table cell selection',
				before: '<p>a</p>',
				after: '<p>a</p>'
			},

			{
				message: 'Should not change anything since there is nothing to split (1 row)',
				before: (
					'<table>' +
						'<tbody>' +
							'<tr><td data-mce-selected="1">1a</td><td>2a</td><td>3a</td></tr>' +
						'</tbody>' +
					'</table>'
				),
				after: (
					'<table>' +
						'<tbody>' +
							'<tr><td>1a</td><td>2a</td><td>3a</td></tr>' +
						'</tbody>' +
					'</table>'
				)
			},

			{
				message: 'Should not change anything since there is nothing to split (2 rows)',
				before: (
					'<table>' +
						'<tbody>' +
							'<tr><td data-mce-selected="1">1a</td><td>2a</td><td>3a</td></tr>' +
							'<tr><td>1b</td><td>2b</td><td>3b</td></tr>' +
						'</tbody>' +
					'</table>'
				),
				after: (
					'<table>' +
						'<tbody>' +
						'<tr><td>1a</td><td>2a</td><td>3a</td></tr>' +
						'<tr><td>1b</td><td>2b</td><td>3b</td></tr>' +
						'</tbody>' +
					'</table>'
				)
			},

			{
				message: 'Should split at second row and remove rowspan',
				before: (
					'<table>' +
						'<tbody>' +
							'<tr><td rowspan="2" data-mce-selected="1">1a</td><td>2a</td><td rowspan="2">3a</td></tr>' +
							'<tr><td>2b</td></tr>' +
						'</tbody>' +
					'</table>'
				),
				after: (
					'<table>' +
						'<tbody>' +
							'<tr><td>1a</td><td>2a</td><td>3a</td></tr>' +
							'<tr><td>&nbsp;</td><td>2b</td><td>&nbsp;</td></tr>' +
						'</tbody>' +
					'</table>'
				)
			},

			{
				message: 'Should split at first row and produce td:s with decreased rowspans below',
				before: (
					'<table>' +
						'<tbody>' +
							'<tr><td rowspan="3" data-mce-selected="1">1a</td><td>2a</td><td rowspan="3">3a</td></tr>' +
							'<tr><td>2b</td></tr>' +
							'<tr><td>2c</td></tr>' +
						'</tbody>' +
					'</table>'
				),
				after: (
					'<table>' +
						'<tbody>' +
							'<tr><td>1a</td><td>2a</td><td>3a</td></tr>' +
							'<tr><td rowspan="2">&nbsp;</td><td>2b</td><td rowspan="2">&nbsp;</td></tr>' +
							'<tr><td>2c</td></tr>' +
						'</tbody>' +
					'</table>'
				)
			}
		]);
	});

	test("mceTableInsertRowBefore command", function() {
		editor.setContent('<table><tr><td>1</td><td>2</td></tr></table>');
		Utils.setSelection('td', 0);
		editor.execCommand('mceTableInsertRowBefore');
		equal(cleanTableHtml(editor.getContent()), '<table><tbody><tr><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>1</td><td>2</td></tr></tbody></table>');
	});

	test("mceTableMergeCells", function() {
		testCommand('mceTableMergeCells', [
			{
				message: 'Should merge all cells into one',
				before: (
					'<table>' +
						'<tbody>' +
							'<tr><td data-mce-selected="1">a1</td><td data-mce-selected="1">b1</td></tr>' +
							'<tr><td data-mce-selected="1">a2</td><td data-mce-selected="1">b2</td></tr>' +
						'</tbody>' +
					'</table>'
				),

				after: (
					'<table>' +
						'<tbody>' +
							'<tr><td>a1b1a2b2</td></tr>' +
						'</tbody>' +
					'</table>'
				)
			},

			{
				message: 'Should merge cells in two cols/rows into one cell with colspan',
				before: (
					'<table>' +
						'<tbody>' +
							'<tr><td data-mce-selected="1">a1</td><td data-mce-selected="1">b1</td></tr>' +
							'<tr><td data-mce-selected="1">a2</td><td data-mce-selected="1">b2</td></tr>' +
							'<tr><td>a3</td><td>b3</td></tr>' +
						'</tbody>' +
					'</table>'
				),

				after: (
					'<table>' +
						'<tbody>' +
							'<tr><td colspan="2">a1b1a2b2</td></tr>' +
							'<tr><td>a3</td><td>b3</td></tr>' +
						'</tbody>' +
					'</table>'
				)
			},

			{
				message: 'Should remove all rowspans since the table is fully merged',
				before: (
					'<table>' +
						'<tbody>' +
							'<tr><td rowspan="2">a1</td><td data-mce-selected="1">b1</td></tr>' +
							'<tr><td data-mce-selected="1">b2</td></tr>' +
						'</tbody>' +
					'</table>'
				),
				after: (
					'<table>' +
						'<tbody>' +
							'<tr><td>a1</td><td>b1b2</td></tr>' +
						'</tbody>' +
					'</table>'
				)
			},

			{
				message: 'Should remove all colspans since the table is fully merged',
				before: (
					'<table>' +
						'<tbody>' +
							'<tr><td colspan="2">a1</td></tr>' +
							'<tr><td data-mce-selected="1">a2</td><td data-mce-selected="1">b2</td></tr>' +
						'</tbody>' +
					'</table>'
				),
				after: (
					'<table>' +
						'<tbody>' +
							'<tr><td>a1</td></tr>' +
							'<tr><td>a2b2</td></tr>' +
						'</tbody>' +
					'</table>'
				)
			},

			{
				message: 'Should remove rowspans since the table is fully merged',
				before: (
					'<table>' +
						'<tbody>' +
							'<tr><td rowspan="3">a1</td><td rowspan="3">b1</td><td data-mce-selected="1">c1</td></tr>' +
							'<tr><td data-mce-selected="1">c2</td></tr>' +
							'<tr><td data-mce-selected="1">c3</td></tr>' +
						'</tbody>' +
					'</table>'
				),
				after: (
					'<table>' +
						'<tbody>' +
							'<tr><td>a1</td><td>b1</td><td>c1c2c3</td></tr>' +
						'</tbody>' +
					'</table>'
				)
			},

			{
				message: 'Should remove colspans since the table is fully merged',
				before: (
					'<table>' +
						'<tbody>' +
							'<tr><td data-mce-selected="1">a1</td><td data-mce-selected="1">b1</td><td data-mce-selected="1">c1</td></tr>' +
							'<tr><td colspan="3">a2</td></tr>' +
							'<tr><td colspan="3">a3</td></tr>' +
						'</tbody>' +
					'</table>'
				),
				after: (
					'<table>' +
						'<tbody>' +
							'<tr><td>a1b1c1</td></tr>' +
							'<tr><td>a2</td></tr>' +
							'<tr><td>a3</td></tr>' +
						'</tbody>' +
					'</table>'
				)
			},

			{
				message: 'Should reduce rowspans to 2 keep the colspan and remove one tr',
				before: (
					'<table>' +
						'<tbody>' +
							'<tr><td colspan="2" rowspan="2">a1</td><td rowspan="3">b1</td><td data-mce-selected="1">c1</td></tr>' +
							'<tr><td data-mce-selected="1">c2</td></tr>' +
							'<tr><td>a3</td><td>b3</td><td data-mce-selected="1">c3</td></tr>' +
						'</tbody>' +
					'</table>'
				),
				after: (
					'<table>' +
						'<tbody>' +
							'<tr><td colspan="2">a1</td><td rowspan="2">b1</td><td rowspan="2">c1c2c3</td></tr>' +
							'<tr><td>a3</td><td>b3</td></tr>' +
						'</tbody>' +
					'</table>'
				)
			},

			{
				message: 'Should reduce colspans to 2 keep the rowspan',
				before: (
					'<table>' +
						'<tbody>' +
							'<tr><td data-mce-selected="1">a1</td><td data-mce-selected="1">b1</td><td data-mce-selected="1">c1</td></tr>' +
							'<tr><td colspan="3">a2</td></tr>' +
							'<tr><td colspan="2" rowspan="2">a3</td><td>c3</td></tr>' +
							'<tr><td>c4</td></tr>' +
						'</tbody>' +
					'</table>'
				),
				after: (
					'<table>' +
						'<tbody>' +
							'<tr><td colspan="2">a1b1c1</td></tr>' +
							'<tr><td colspan="2">a2</td></tr>' +
							'<tr><td rowspan="2">a3</td><td>c3</td></tr>' +
							'<tr><td>c4</td></tr>' +
						'</tbody>' +
					'</table>'
				)
			},

			{
				message: 'Should merge b3+c3 but not reduce a2a3',
				before: (
					'<table>' +
						'<tbody>' +
							'<tr>' +
								'<td>a1</td>' +
								'<td>b1</td>' +
								'<td>c1</td>' +
							'</tr>' +
							'<tr>' +
								'<td rowspan="2">a2a3</td>' +
								'<td>b2</td>' +
								'<td>c2</td>' +
							'</tr>' +
							'<tr>' +
								'<td data-mce-selected="1">b3</td>' +
								'<td data-mce-selected="1">c3</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>'
				),
				after: (
					'<table>' +
						'<tbody>' +
							'<tr>' +
								'<td>a1</td>' +
								'<td>b1</td>' +
								'<td>c1</td>' +
							'</tr>' +
							'<tr>' +
								'<td rowspan="2">a2a3</td>' +
								'<td>b2</td>' +
								'<td>c2</td>' +
							'</tr>' +
							'<tr>' +
								'<td colspan="2">b3c3</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>'
				)
			},

			{
				message: 'Should merge b1+c1 and reduce a2',
				before: (
					'<table>' +
						'<tbody>' +
							'<tr>' +
								'<td>a1</td>' +
								'<td data-mce-selected="1">b1</td>' +
								'<td data-mce-selected="1">c1</td>' +
							'</tr>' +
							'<tr>' +
								'<td colspan="3">a2</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>'
				),
				after: (
					'<table>' +
						'<tbody>' +
							'<tr>' +
								'<td>a1</td>' +
								'<td>b1c1</td>' +
							'</tr>' +
							'<tr>' +
								'<td colspan="2">a2</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>'
				)
			},

			{
				message: 'Should merge a2+a3 and reduce b1',
				before: (
					'<table>' +
						'<tbody>' +
							'<tr>' +
								'<td>a1</td>' +
								'<td rowspan="3">b1</td>' +
							'</tr>' +
							'<tr>' +
								'<td data-mce-selected="1">a2</td>' +
							'</tr>' +
							'<tr>' +
								'<td data-mce-selected="1">a3</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>'
				),
				after: (
					'<table>' +
						'<tbody>' +
							'<tr>' +
								'<td>a1</td>' +
								'<td rowspan="2">b1</td>' +
							'</tr>' +
							'<tr>' +
								'<td>a2a3</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>'
				)
			}
		]);
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
			'<tr><td data-mce-selected="1">A1</td><td>A2</td></tr>' +
			'<tr><td data-mce-selected="1">B1</td><td>B2</td></tr>' +
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
			'<tr><td data-mce-selected="1">A1</td><td data-mce-selected="1">A2</td></tr>' +
			'<tr><td data-mce-selected="1">B1</td><td data-mce-selected="1">B2</td></tr>' +
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

	var testResizeTable1 = '<table style="width: 426px"><tbody>' +
			'<tr><td style="height: 20px; width: 200px;" colspan="2" data-mce-style="height: 20px; width: 200px;">A1</td><td style="height: 20px; width: 100px;" data-mce-style="height: 20px; width: 100px;">A2</td><td style="height: 20px; width: 100px;" data-mce-style="height: 20px; width: 100px;">A3</td></tr>' +
			'<tr><td style="height: 20px; width: 100px;" data-mce-style="height: 20px; width: 100px;">B1</td><td style="height: 20px; width: 200px;" colspan="2" data-mce-style="height: 20px; width: 200px;">B2</td><td style="height: 20px; width: 100px;" data-mce-style="height: 20px; width: 100px;">B3</td></tr>' +
			'<tr><td style="height: 20px; width: 100px;" data-mce-style="height: 20px; width: 100px;">C1</td><td style="height: 20px; width: 100px;" data-mce-style="height: 20px; width: 100px;">C2</td><td style="height: 20px; width: 200px;" colspan="2" data-mce-style="height: 20px; width: 200px;">C3</td></tr>' +
			'<tr><td style="height: 20px; width: 400px;" colspan="4" data-mce-style="height: 20px; width: 400px;">D1</td></tr></tbody></table>';

	var testResizeTable2 = '<table border="1"><tbody>' +
	'<tr><th style="height: 20px; width: 20px;" data-mce-style="height: 20px; width: 20px;">A0</th><th style="height: 20px; width: 20px;" data-mce-style="height: 20px; width: 20px;">A1</th><th style="height: 20px; width: 20px;" data-mce-style="height: 20px; width: 20px;">A2</th>' +
	'<th style="height: 20px; width: 40px;" data-mce-style="height: 20px; width: 40px;">A3</th><th style="height: 20px; width: 10px;" data-mce-style="height: 20px; width: 10px;">A4</th></tr><tr><td style="height: 20px; width: 20px;" data-mce-style="height: 20px; width: 20px;">B0</td><td style="height: 20px; width: 20px; "' +
	'data-mce-style="height: 20px; width: 20px;">B1</td><td style="height: 20px; width: 20px;" data-mce-style="height: 20px; width: 20px;">B2</td><td style="height: 20px; width: 40px;" data-mce-style="height: 20px; width: 40px;">B3</td><td style="height: 40px; width: 10px;" rowspan="2" data-mce-style="height: 20px; width: 10px;">' +
	'B3</td></tr><tr><td style="height: 20px; width: 20px;" data-mce-style="height: 20px; width: 20px;">C0</td><td style="height: 20px; width: 20px;" data-mce-style="height: 20px; width: 20px;">C1</td><td style="height: 20px; width: 20px;" data-mce-style="height: 20px; width: 20px;">C2</td><td style="height: 20px; width: 40px;" ' +
	'data-mce-style="height: 20px; width: 40px;">C3</td></tr></tbody></table>';

	var testResizeTable3 = '<div style=\"display: block; width: 400px;\"><table style=\"border-collapse: collapse; border: 1px solid black;\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\"><tbody><tr><td rowspan=\"2\" width=\"25%\">&nbsp;a</td><td width=\"25%\">&nbsp;b</td><td width=\"25%\">&nbsp;</td>' +
	'<td width=\"25%\">&nbsp;c</td></tr><tr><td width=\"25%\">&nbsp;d</td><td width=\"25%\">&nbsp;</td><td rowspan=\"2\" width=\"25%\">&nbsp;e</td></tr><tr><td width=\"25%\">&nbsp;f</td><td width=\"25%\">&nbsp;g</td><td width=\"25%\">&nbsp;</td></tr><tr><td width=\"25%\">&nbsp;h</td><td width=\"25%\">&nbsp;i</td><td width=\"25%\">&nbsp;</td><td width=\"25%\">j&nbsp;</td></tr></tbody></table></div>';

	var testResizeTable4 = (
		'<table>' +
			'<tbody>' +
				'<tr>' +
					'<td>a</td>' +
					'<td>b</td>' +
				'</tr>' +
				'<tr>' +
					'<td>a</td>' +
					'<td>b</td>' +
					'<td>c</td>' +
				'</tr>' +
				'<tr>' +
					'<td>a</td>' +
				'</tr>' +
				'<tr>' +
					'<td>a</td>' +
					'<td>b</td>' +
					'<td colspan="2">c</td>' +
				'</tr>' +
			'</tbody>' +
		'</table>'
	);

	test("Is Pixel/Percentage Based Width", function() {
		var pixelWidths = ['125px', '200px', '300em'];
		var percentageWidths = ['25%', '30%', '100%'];
		var i, pixelBasedSize, percentBasedSize;

		for (i = 0; i < pixelWidths.length; i++) {
			pixelBasedSize = editor.plugins.table.resizeBars.isPixelBasedSize(pixelWidths[i]);
			deepEqual(pixelBasedSize, true);
			percentBasedSize = editor.plugins.table.resizeBars.isPercentageBasedSize(pixelWidths[i]);
			deepEqual(percentBasedSize, false);
		}
		for (i = 0; i < percentageWidths.length; i++) {
			pixelBasedSize = editor.plugins.table.resizeBars.isPixelBasedSize(percentageWidths[i]);
			deepEqual(pixelBasedSize, false);
			percentBasedSize = editor.plugins.table.resizeBars.isPercentageBasedSize(percentageWidths[i]);
			deepEqual(percentBasedSize, true);
		}
	});

	test("Get widths/heights", function() {
		editor.setContent(testResizeTable1);

		var table = editor.dom.select('table')[0];
		var details = editor.plugins.table.resizeBars.getTableDetails(table);
		var tableGrid = editor.plugins.table.resizeBars.getTableGrid(details);

		deepEqual(
			editor.plugins.table.resizeBars.getWidths(tableGrid, false, table),
			[100, 100, 100, 100]
		);

		deepEqual(
			editor.plugins.table.resizeBars.getPixelHeights(tableGrid),
			[20, 20, 20, 20]
		);

		editor.setContent(testResizeTable2);

		table = editor.dom.select('table')[0];
		details = editor.plugins.table.resizeBars.getTableDetails(table);
		tableGrid = editor.plugins.table.resizeBars.getTableGrid(details);

		deepEqual(
			editor.plugins.table.resizeBars.getWidths(tableGrid, false, table),
			[20, 20, 20, 40, 10]
		);

		deepEqual(
			editor.plugins.table.resizeBars.getPixelHeights(tableGrid),
			[20, 20, 20]
		);

		editor.setContent(testResizeTable3);

		table = editor.dom.select('table')[0];
		details = editor.plugins.table.resizeBars.getTableDetails(table);
		tableGrid = editor.plugins.table.resizeBars.getTableGrid(details);

		deepEqual(
			editor.plugins.table.resizeBars.getWidths(tableGrid, true, table),
			[25, 25, 25, 25]
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

	test("Draw bars/clear bars on invalid table", function() {
		editor.setContent(testResizeTable4);

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
		var deltas = editor.plugins.table.resizeBars.determineDeltas([100, 100, 100, 100], 0, 50, 10, false);

		deepEqual(deltas, [50, -50, 0, 0]);

		deltas = editor.plugins.table.resizeBars.determineDeltas([100, 100, 100, 100], 1, 50, 10, false);

		deepEqual(deltas, [0, 50, -50, 0]);

		deltas = editor.plugins.table.resizeBars.determineDeltas([100, 100, 100, 100], 2, 50, 10, false);

		deepEqual(deltas, [0, 0, 50, -50]);

		deltas = editor.plugins.table.resizeBars.determineDeltas([100, 100, 100, 100], 3, 50, 10, false);

		deepEqual(deltas, [0, 0, 0, 50]);

		deltas = editor.plugins.table.resizeBars.determineDeltas([50], 0, 5, 10, true);

		deepEqual(deltas, [50]); // 50 + 50 = 100, one column, percent case

		deltas = editor.plugins.table.resizeBars.determineDeltas([25, 25, 25, 25], 1, 5, 10, true);

		deepEqual(deltas, [0, 5, -5, 0]);
	});

	test("Adjust width", function() {
		editor.setContent(testResizeTable1);

		var table = editor.dom.select('table')[0];

		editor.plugins.table.resizeBars.adjustWidth(table, 50, 0);

		equal(editor.getContent(),
			'<table style=\"width: 426px;\">' +
			'<tbody>' +
			'<tr>' +
			'<td style=\"width: 200px; height: 20px;\" colspan=\"2\">A1</td>' +
			'<td style=\"width: 100px; height: 20px;\">A2</td>' +
			'<td style=\"width: 100px; height: 20px;\">A3</td>' +
			'</tr>' +
			'<tr>' +
			'<td style=\"width: 150px; height: 20px;\">B1</td>' +
			'<td style=\"width: 150px; height: 20px;\" colspan=\"2\">B2</td>' +
			'<td style=\"width: 100px; height: 20px;\">B3</td>' +
			'</tr>' +
			'<tr>' +
			'<td style=\"width: 150px; height: 20px;\">C1</td>' +
			'<td style=\"width: 50px; height: 20px;\">C2</td>' +
			'<td style=\"width: 200px; height: 20px;\" colspan=\"2\">C3</td>' +
			'</tr>' +
			'<tr>' +
			'<td style=\"width: 400px; height: 20px;\" colspan=\"4\">D1</td>' +
			'</tr>' +
			'</tbody>' +
			'</table>');

		editor.setContent(testResizeTable1);

		table = editor.dom.select('table')[0];

		editor.plugins.table.resizeBars.adjustWidth(table, 50, 1);

		equal(editor.getContent(),
			'<table style=\"width: 426px;\">' +
			'<tbody>' +
			'<tr>' +
			'<td style=\"width: 250px; height: 20px;\" colspan=\"2\">A1</td>' +
			'<td style=\"width: 50px; height: 20px;\">A2</td>' +
			'<td style=\"width: 100px; height: 20px;\">A3</td>' +
			'</tr>' +
			'<tr>' +
			'<td style=\"width: 100px; height: 20px;\">B1</td>' +
			'<td style=\"width: 200px; height: 20px;\" colspan=\"2\">B2</td>' +
			'<td style=\"width: 100px; height: 20px;\">B3</td>' +
			'</tr>' +
			'<tr>' +
			'<td style=\"width: 100px; height: 20px;\">C1</td>' +
			'<td style=\"width: 150px; height: 20px;\">C2</td>' +
			'<td style=\"width: 150px; height: 20px;\" colspan=\"2\">C3</td>' +
			'</tr>' +
			'<tr>' +
			'<td style=\"width: 400px; height: 20px;\" colspan=\"4\">D1</td>' +
			'</tr>' +
			'</tbody>' +
			'</table>');

		editor.setContent(testResizeTable1);

		table = editor.dom.select('table')[0];

		editor.plugins.table.resizeBars.adjustWidth(table, 50, 2);

		equal(editor.getContent(),
			'<table style=\"width: 426px;\">' +
			'<tbody>' +
			'<tr>' +
			'<td style=\"width: 200px; height: 20px;\" colspan=\"2\">A1</td>' +
			'<td style=\"width: 150px; height: 20px;\">A2</td>' +
			'<td style=\"width: 50px; height: 20px;\">A3</td>' +
			'</tr>' +
			'<tr>' +
			'<td style=\"width: 100px; height: 20px;\">B1</td>' +
			'<td style=\"width: 250px; height: 20px;\" colspan=\"2\">B2</td>' +
			'<td style=\"width: 50px; height: 20px;\">B3</td>' +
			'</tr>' +
			'<tr>' +
			'<td style=\"width: 100px; height: 20px;\">C1</td>' +
			'<td style=\"width: 100px; height: 20px;\">C2</td>' +
			'<td style=\"width: 200px; height: 20px;\" colspan=\"2\">C3</td>' +
			'</tr>' +
			'<tr>' +
			'<td style=\"width: 400px; height: 20px;\" colspan=\"4\">D1</td>' +
			'</tr>' +
			'</tbody>' +
			'</table>');

		editor.setContent(testResizeTable1);

		table = editor.dom.select('table')[0];

		editor.plugins.table.resizeBars.adjustWidth(table, 50, 3);

		equal(editor.getContent(),
			'<table style=\"width: 476px;\">' +
			'<tbody>' +
			'<tr>' +
			'<td style=\"width: 200px; height: 20px;\" colspan=\"2\">A1</td>' +
			'<td style=\"width: 100px; height: 20px;\">A2</td>' +
			'<td style=\"width: 150px; height: 20px;\">A3</td>' +
			'</tr>' +
			'<tr>' +
			'<td style=\"width: 100px; height: 20px;\">B1</td>' +
			'<td style=\"width: 200px; height: 20px;\" colspan=\"2\">B2</td>' +
			'<td style=\"width: 150px; height: 20px;\">B3</td>' +
			'</tr>' +
			'<tr>' +
			'<td style=\"width: 100px; height: 20px;\">C1</td>' +
			'<td style=\"width: 100px; height: 20px;\">C2</td>' +
			'<td style=\"width: 250px; height: 20px;\" colspan=\"2\">C3</td>' +
			'</tr>' +
			'<tr>' +
			'<td style=\"width: 450px; height: 20px;\" colspan=\"4\">D1</td>' +
			'</tr>' +
			'</tbody>' +
			'</table>');
	});

	test("Adjust height", function() {
		editor.setContent(testResizeTable2);

		var table = editor.dom.select('table')[0];

		editor.plugins.table.resizeBars.adjustHeight(table, 50, 0);

		equal(editor.getContent(),
			'<table border=\"1\">' +
			'<tbody>' +
			'<tr style=\"height: 70px;\">' +
			'<th style=\"width: 20px; height: 70px;\">A0</th>' +
			'<th style=\"width: 20px; height: 70px;\">A1</th>' +
			'<th style=\"width: 20px; height: 70px;\">A2</th>' +
			'<th style=\"width: 40px; height: 70px;\">A3</th>' +
			'<th style=\"width: 10px; height: 70px;\">A4</th>' +
			'</tr>' +
			'<tr style=\"height: 20px;\">' +
			'<td style=\"width: 20px; height: 20px;\">B0</td>' +
			'<td style=\"width: 20px; height: 20px;\">B1</td>' +
			'<td style=\"width: 20px; height: 20px;\">B2</td>' +
			'<td style=\"width: 40px; height: 20px;\">B3</td>' +
			'<td style=\"width: 10px; height: 40px;\" rowspan=\"2\">B3</td>' +
			'</tr>' +
			'<tr style=\"height: 20px;\">' +
			'<td style=\"width: 20px; height: 20px;\">C0</td>' +
			'<td style=\"width: 20px; height: 20px;\">C1</td>' +
			'<td style=\"width: 20px; height: 20px;\">C2</td>' +
			'<td style=\"width: 40px; height: 20px;\">C3</td>' +
			'</tr>' +
			'</tbody>' +
			'</table>');

		editor.setContent(testResizeTable2);

		table = editor.dom.select('table')[0];

		editor.plugins.table.resizeBars.adjustHeight(table, 50, 1);

		equal(editor.getContent(),
			'<table border=\"1\">' +
			'<tbody>' +
			'<tr style=\"height: 20px;\">' +
			'<th style=\"width: 20px; height: 20px;\">A0</th>' +
			'<th style=\"width: 20px; height: 20px;\">A1</th>' +
			'<th style=\"width: 20px; height: 20px;\">A2</th>' +
			'<th style=\"width: 40px; height: 20px;\">A3</th>' +
			'<th style=\"width: 10px; height: 20px;\">A4</th>' +
			'</tr>' +
			'<tr style=\"height: 70px;\">' +
			'<td style=\"width: 20px; height: 70px;\">B0</td>' +
			'<td style=\"width: 20px; height: 70px;\">B1</td>' +
			'<td style=\"width: 20px; height: 70px;\">B2</td>' +
			'<td style=\"width: 40px; height: 70px;\">B3</td>' +
			'<td style=\"width: 10px; height: 90px;\" rowspan=\"2\">B3</td>' +
			'</tr>' +
			'<tr style=\"height: 20px;\">' +
			'<td style=\"width: 20px; height: 20px;\">C0</td>' +
			'<td style=\"width: 20px; height: 20px;\">C1</td>' +
			'<td style=\"width: 20px; height: 20px;\">C2</td>' +
			'<td style=\"width: 40px; height: 20px;\">C3</td>' +
			'</tr>' +
			'</tbody>' +
			'</table>');

		editor.setContent(testResizeTable2);

		table = editor.dom.select('table')[0];

		editor.plugins.table.resizeBars.adjustHeight(table, 50, 2);

		equal(editor.getContent(),
			'<table border=\"1\">' +
			'<tbody>' +
			'<tr style=\"height: 20px;\">' +
			'<th style=\"width: 20px; height: 20px;\">A0</th>' +
			'<th style=\"width: 20px; height: 20px;\">A1</th>' +
			'<th style=\"width: 20px; height: 20px;\">A2</th>' +
			'<th style=\"width: 40px; height: 20px;\">A3</th>' +
			'<th style=\"width: 10px; height: 20px;\">A4</th>' +
			'</tr>' +
			'<tr style=\"height: 20px;\">' +
			'<td style=\"width: 20px; height: 20px;\">B0</td>' +
			'<td style=\"width: 20px; height: 20px;\">B1</td>' +
			'<td style=\"width: 20px; height: 20px;\">B2</td>' +
			'<td style=\"width: 40px; height: 20px;\">B3</td>' +
			'<td style=\"width: 10px; height: 90px;\" rowspan=\"2\">B3</td>' +
			'</tr>' +
			'<tr style=\"height: 70px;\">' +
			'<td style=\"width: 20px; height: 70px;\">C0</td>' +
			'<td style=\"width: 20px; height: 70px;\">C1</td>' +
			'<td style=\"width: 20px; height: 70px;\">C2</td>' +
			'<td style=\"width: 40px; height: 70px;\">C3</td>' +
			'</tr>' +
			'</tbody>' +
			'</table>');

	});

	test("Table newcell/newrow events", function() {
		var cells = [], rows = [], counter = 0;

		editor.on('newcell', function(e) {
			cells.push(e.node);
			e.node.setAttribute('data-counter', counter++);
		});

		editor.on('newrow', function(e) {
			rows.push(e.node);
			e.node.setAttribute('data-counter', counter++);
		});

		editor.plugins.table.insertTable(2, 3);

		equal(cells.length, 6);
		equal(rows.length, 3);

		equal(cells[cells.length - 1].getAttribute('data-counter'), "8");
		equal(rows[rows.length - 1].getAttribute('data-counter'), "6");
	});

	function assertTableSelection(tableHtml, selectCells, cellContents) {
		function selectRangeXY(table, startTd, endTd) {
			editor.fire('mousedown', {target: startTd});
			editor.fire('mouseover', {target: endTd});
			editor.fire('mouseup', {target: endTd});
		}

		function getCells(table) {
			return editor.$(table).find('td').toArray();
		}

		function getSelectedCells(table) {
			return editor.$(table).find('td[data-mce-selected]').toArray();
		}

		editor.setContent(tableHtml);

		var table = editor.$('table')[0];
		var cells = getCells(table);

		var startTd = tinymce.grep(cells, function(elm) {
			return elm.innerHTML === selectCells[0];
		})[0];

		var endTd = tinymce.grep(cells, function(elm) {
			return elm.innerHTML === selectCells[1];
		})[0];

		selectRangeXY(table, startTd, endTd);

		var selection = getSelectedCells(table);
		selection = tinymce.map(selection, function(elm) {
			return elm.innerHTML;
		});

		deepEqual(selection, cellContents);
	}

	test("Table grid selection", function() {
		assertTableSelection('<table><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></table>', ['1', '2'], ['1', '2']);
		assertTableSelection('<table><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></table>', ['1', '3'], ['1', '3']);
		assertTableSelection('<table><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></table>', ['1', '4'], ['1', '2', '3', '4']);
		assertTableSelection('<table><tr><td colspan="2" rowspan="2">1</td><td>3</td></tr><tr><td>6</td></tr></table>', ['1', '6'], ['1', '3', '6']);
		assertTableSelection(
			'<table>' +
				'<tr>' +
					'<td>1</td>' +
					'<td>2</td>' +
					'<td>3</td>' +
				'</tr>' +
				'<tr>' +
					'<td colspan="2" rowspan="2">4</td>' +
					'<td>5</td>' +
				'</tr>' +
				'<tr>' +
					'<td>6</td>' +
				'</tr>' +
			'</table>',
			['2', '6'],
			['2', '3', '4', '5', '6']
		);
	});
})();
