module("tinymce.plugins.Table", {
	setupModule: function() {
		QUnit.stop();

		tinymce.init({
			selector: "textarea",
			add_unload_trigger: false,
			skin: false,
			plugins: 'table',
			valid_styles: {
				'*' : 'width,height,text-align,float'
			},
			init_instance_callback: function(ed) {
				window.editor = ed;
				QUnit.start();
			}
		});
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
	editor.execCommand('mceInsertTable');

	deepEqual(Utils.getFontmostWindow().toJSON(), {
		"align": "",
		"border": "",
		"caption": false,
		"cellpadding": "",
		"cellspacing": "",
		"height": "",
		"width": ""
	});

	Utils.getFontmostWindow().close();
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
	editor.execCommand('mceInsertTable');

	deepEqual(Utils.getFontmostWindow().toJSON(), {
		"align": "",
		"border": "4",
		"caption": true,
		"cellpadding": "3",
		"cellspacing": "2",
		"height": "101",
		"width": "100"
	});

	Utils.getFontmostWindow().close();
});

test("Table properties dialog (add caption)", function() {
	editor.setContent('<table><tr><td>X</td></tr></table>');
	Utils.setSelection('td', 0);
	editor.execCommand('mceInsertTable');
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
	editor.execCommand('mceInsertTable');
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
	editor.execCommand('mceInsertTable');
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
	editor.execCommand('mceInsertTable');
	fillAndSubmitWindowForm({
		width: "100%",
		height: "101%"
	});

	equal(
		cleanTableHtml(editor.getContent()),
		'<table style="width: 100%; height: 101%;"><tbody><tr><td>x</td></tr></tbody></table>'
	);
});

test("Table properties dialog (change: border,cellpadding,cellspacing,align)", function() {
	editor.setContent('<table><tr><td>X</td></tr></table>');
	Utils.setSelection('td', 0);
	editor.execCommand('mceInsertTable');
	fillAndSubmitWindowForm({
		border: "1",
		cellpadding: "2",
		cellspacing: "3",
		align: "right"
	});

	equal(
		cleanTableHtml(editor.getContent()),
		'<table style="float: right;" border="1" cellspacing="3" cellpadding="2"><tbody><tr><td>x</td></tr></tbody></table>'
	);
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
		"width": ""
	});

	Utils.getFontmostWindow().close();
});

test("Table cell properties dialog (get data from complex cell)", function() {
	editor.setContent('<table><tr><th style="text-align: right; vertical-align: top; width: 10px; height: 11px" scope="row">X</th></tr></table>');
	Utils.setSelection('th', 0);
	editor.execCommand('mceTableCellProps');

	deepEqual(Utils.getFontmostWindow().toJSON(), {
		"align": "right",
		"valign": "top",
		"height": "11",
		"scope": "row",
		"type": "th",
		"width": "10"
	});

	Utils.getFontmostWindow().close();
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
		"type": "tbody"
	});

	Utils.getFontmostWindow().close();
});

test("Table row properties dialog (get data from complex cell)", function() {
	editor.setContent('<table><thead><tr style="height: 10px; text-align: right"><td>X</td></tr></thead></table>');
	Utils.setSelection('td', 0);
	editor.execCommand('mceTableRowProps');

	deepEqual(Utils.getFontmostWindow().toJSON(), {
		"align": "right",
		"height": "10",
		"type": "thead"
	});

	Utils.getFontmostWindow().close();
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
	editor.setContent('<table><tr><td class="mce-item-selected">1</td><td class="mce-item-selected">2</td></tr></table>');
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
