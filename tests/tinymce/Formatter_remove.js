module("tinymce.Formatter - Remove", {
	setupModule: function() {
		document.getElementById('view').innerHTML = '<textarea id="elm1"></textarea><div id="elm2"></div>';
		QUnit.stop();

		tinymce.init({
			selector: "textarea",
			plugins: "noneditable",
			indent: false,
			add_unload_trigger: false,
			skin: false,
			extended_valid_elements: 'b,i,span[style|contenteditable]',
			entities: 'raw',
			valid_styles: {
				'*': 'color,font-size,font-family,background-color,font-weight,font-style,text-decoration,float,margin,margin-top,margin-right,margin-bottom,margin-left,display'
			},
			disable_nodechange: true,
			init_instance_callback: function(ed) {
				window.editor = ed;
				QUnit.start();
			}
		});
	}
});

function getContent() {
	return editor.getContent().toLowerCase().replace(/[\r]+/g, '');
}

test('Inline element on selected text', function() {
	editor.formatter.register('format', {inline : 'b'});
	editor.getBody().innerHTML = '<p><b>1234</b></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('b')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('b')[0].firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.remove('format');
	equal(getContent(), '<p>1234</p>', 'Inline element on selected text');
});

test('Inline element on selected text with remove=all', function() {
	editor.formatter.register('format', {selector : 'b', remove : 'all'});
	editor.getBody().innerHTML = '<p><b title="text">1234</b></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('b')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('b')[0].firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.remove('format');
	equal(getContent(), '<p>1234</p>', 'Inline element on selected text with remove=all');
});

test('Inline element on selected text with remove=none', function() {
	editor.formatter.register('format', {selector : 'span', styles : {fontWeight : 'bold'}, remove : 'none'});
	editor.getBody().innerHTML = '<p><span style="font-weight:bold">1234</span></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0], 0);
	rng.setEnd(editor.dom.select('p')[0], 1);
	editor.selection.setRng(rng);
	editor.formatter.remove('format');
	equal(getContent(), '<p><span>1234</span></p>', 'Inline element on selected text with remove=none');
});

test('Inline element style where element is format root', function() {
	editor.formatter.register('format', {inline : 'span', styles : {fontWeight : 'bold'}});
	editor.getBody().innerHTML = '<p><span style="font-weight:bold; color:#FF0000"><em>1234</em></span></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('em')[0].firstChild, 1);
	rng.setEnd(editor.dom.select('em')[0].firstChild, 3);
	editor.selection.setRng(rng);
	editor.formatter.remove('format');
	equal(getContent(),
		'<p><span style="color: #ff0000; font-weight: bold;">' +
		'<em>1</em></span><span style="color: #ff0000;"><em>23</em></span>' +
		'<span style=\"color: #ff0000; font-weight: bold;\"><em>4' +
		'</em></span></p>',
	'Inline element style where element is format root');
});

test('Partially selected inline element text', function() {
	editor.formatter.register('format', {inline : 'b'});
	editor.getBody().innerHTML = '<p><b>1234</b></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('b')[0].firstChild, 2);
	rng.setEnd(editor.dom.select('b')[0].firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.remove('format');
	equal(getContent(), '<p><b>12</b>34</p>', 'Partially selected inline element text');
});

test('Partially selected inline element text with children', function() {
	editor.formatter.register('format', {inline : 'b'});
	editor.getBody().innerHTML = '<p><b><em><span>1234</span></em></b></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('span')[0].firstChild, 2);
	rng.setEnd(editor.dom.select('span')[0].firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.remove('format');
	equal(getContent(), '<p><b><em><span>12</span></em></b><em><span>34</span></em></p>', 'Partially selected inline element text with children');
});

test('Partially selected inline element text with complex children', function() {
	editor.formatter.register('format', {inline : 'span', styles : {fontWeight : 'bold'}});
	editor.getBody().innerHTML = '<p><span style="font-weight:bold"><em><span style="color:#ff0000;font-weight:bold">1234</span></em></span></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('span')[1].firstChild, 2);
	rng.setEnd(editor.dom.select('span')[1].firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.remove('format');
	equal(getContent(), '<p><span style="font-weight: bold;"><em><span style="color: #ff0000; font-weight: bold;">12</span></em></span><em><span style="color: #ff0000;">34</span></em></p>', 'Partially selected inline element text with complex children');
});

test('Inline elements with exact flag', function() {
	editor.formatter.register('format', {inline : 'span', styles : {color : '#ff0000'}, exact : true});
	editor.getBody().innerHTML = '<p><span style="font-size:10px;color:#ff0000">1234</span><span style="font-size:10px;color:#00ff00">1234</span></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0], 0);
	rng.setEnd(editor.dom.select('p')[0], 2);
	editor.selection.setRng(rng);
	editor.formatter.remove('format');
	equal(getContent(), '<p><span style="font-size: 10px;">1234</span><span style="color: #00ff00; font-size: 10px;">1234</span></p>', 'Inline elements with exact flag');
});

test('Inline elements with variables', function() {
	editor.formatter.register('format', {inline : 'span', styles : {color : '%color'}, exact : true});
	editor.getBody().innerHTML = '<p><span style="font-size:10px;color:#ff0000">1234</span><span style="font-size:10px;color:#00ff00">1234</span></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0], 0);
	rng.setEnd(editor.dom.select('p')[0], 2);
	editor.selection.setRng(rng);
	editor.formatter.remove('format', {color : '#ff0000'});
	equal(getContent(), '<p><span style="font-size: 10px;">1234</span><span style="color: #00ff00; font-size: 10px;">1234</span></p>', 'Inline elements on selected text with variables');
});

test('Inline elements with functions and variables', function() {
	editor.formatter.register('format', {
		inline : 'span',
		styles : {
			color : function(vars) {
				return vars.color + "00";
			}
		},
		exact : true
	});

	editor.getBody().innerHTML = '<p><span style="font-size:10px;color:#ff0000">1234</span><span style="font-size:10px;color:#00ff00">1234</span></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0], 0);
	rng.setEnd(editor.dom.select('p')[0], 2);
	editor.selection.setRng(rng);
	editor.formatter.remove('format', {
		color : '#ff00'
	});
	equal(getContent(), '<p><span style="font-size: 10px;">1234</span><span style="color: #00ff00; font-size: 10px;">1234</span></p>', 'Inline elements with functions and variables');
});

test('End within start element', function() {
	editor.formatter.register('format', {inline : 'b'});
	editor.getBody().innerHTML = '<p><b>1234<b>5678</b></b></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0], 0);
	rng.setEnd(editor.dom.select('b')[0], 2);
	editor.selection.setRng(rng);
	editor.formatter.remove('format');
	equal(getContent(), '<p>12345678</p>', 'End within start element');
});

test('Start and end within similar format 1', function() {
	editor.formatter.register('format', {inline : 'b'});
	editor.getBody().innerHTML = '<p><b><em><b>1234<b>5678</b></b></em></b></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('em')[0], 0);
	rng.setEnd(editor.dom.select('b')[1], 2);
	editor.selection.setRng(rng);
	editor.formatter.remove('format');
	equal(getContent(), '<p><em>12345678</em></p>', 'Start and end within similar format 1');
});

test('Start and end within similar format 2', function() {
	editor.formatter.register('format', {inline : 'b'});
	editor.getBody().innerHTML = '<p><b><em><b>1234</b><b>5678</b></em></b></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('em')[0], 0);
	rng.setEnd(editor.dom.select('em')[0], 1);
	editor.selection.setRng(rng);
	editor.formatter.remove('format');
	equal(getContent(), '<p><em>1234</em><b><em><b>5678</b></em></b></p>', 'Start and end within similar format 2');
});

test('Start and end within similar format 3', function() {
	editor.formatter.register('format', {inline : 'b'});
	editor.getBody().innerHTML = '<p><b><em><b>1234</b></em></b></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('em')[0], 0);
	rng.setEnd(editor.dom.select('em')[0], 1);
	editor.selection.setRng(rng);
	editor.formatter.remove('format');
	equal(getContent(), '<p><em>1234</em></p>', 'Start and end within similar format 3');
});

test('End within start', function() {
	editor.formatter.register('format', {inline : 'b'});
	editor.getBody().innerHTML = '<p><b><em>x<b>abc</b>y</em></b></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0], 0);
	rng.setEnd(editor.dom.select('b')[1].firstChild, 3);
	editor.selection.setRng(rng);
	editor.formatter.remove('format');
	equal(getContent(), '<p><em>x</em><em>abc</em><b><em>y</em></b></p>', 'End within start');
});

test('Remove block format', function() {
	editor.formatter.register('format', {block : 'h1'});
	editor.getBody().innerHTML = '<h1>text</h1>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('h1')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('h1')[0].firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.remove('format');
	equal(getContent(), '<p>text</p>', 'Remove block format');
});

test('Remove wrapper block format', function() {
	editor.formatter.register('format', {block : 'blockquote', wrapper : true});
	editor.getBody().innerHTML = '<blockquote><p>text</p></blockquote>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('p')[0].firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.remove('format');
	equal(getContent(), '<p>text</p>', 'Remove wrapper block format');
});

test('Remove span format within block with style', function() {
	editor.formatter.register('format', {selector : 'span', attributes : ['style', 'class'], remove : 'empty', split : true, expand : false, deep : true});
	var rng = editor.dom.createRng();
	editor.getBody().innerHTML = '<p style="color:#ff0000"><span style="color:#00ff00">text</span></p>';
	rng.setStart(editor.dom.select('span')[0].firstChild, 1);
	rng.setEnd(editor.dom.select('span')[0].firstChild, 3);
	editor.selection.setRng(rng);
	editor.formatter.remove('format');
	equal(getContent(), '<p style="color: #ff0000;"><span style="color: #00ff00;">t</span>ex<span style="color: #00ff00;">t</span></p>', 'Remove span format within block with style');
});

test('Remove and verify start element', function() {
	editor.formatter.register('format', {inline : 'b'});
	var rng = editor.dom.createRng();
	editor.getBody().innerHTML = '<p><b>text</b></p>';
	rng.setStart(editor.dom.select('b')[0].firstChild, 1);
	rng.setEnd(editor.dom.select('b')[0].firstChild, 3);
	editor.selection.setRng(rng);
	editor.formatter.remove('format');
	equal(getContent(), '<p><b>t</b>ex<b>t</b></p>');
	equal(editor.selection.getStart().nodeName, 'P');
});

test('Remove with selection collapsed ensure correct caret position', function() {
	var content = '<p>test</p><p>testing</p>';

	editor.formatter.register('format', {block : 'p'});
	var rng = editor.dom.createRng();
	editor.getBody().innerHTML = content;
	rng.setStart(editor.dom.select('p')[0].firstChild, 4);
	rng.setEnd(editor.dom.select('p')[0].firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.remove('format');
	equal(getContent(), content);
	equal(editor.selection.getStart(), editor.dom.select('p')[0]);
});

test('Caret format at middle of text', function() {
	editor.setContent('<p><b>abc</b></p>');
	editor.formatter.register('format', {inline: 'b'});
	Utils.setSelection('b', 1, 'b', 1);
	editor.formatter.remove('format');
	equal(editor.getContent(), '<p>abc</p>');
});

test('Caret format at end of text', function() {
	editor.setContent('<p><b>abc</b></p>');
	editor.formatter.register('format', {inline: 'b'});
	Utils.setSelection('b', 3, 'b', 3);
	editor.formatter.remove('format');
	Utils.type('d');
	equal(editor.getContent(), '<p><b>abc</b>d</p>');
});

test('Caret format at end of text inside other format', function() {
	editor.setContent('<p><em><b>abc</b></em></p>');
	editor.formatter.register('format', {inline: 'b'});
	Utils.setSelection('b', 3, 'b', 3);
	editor.formatter.remove('format');
	Utils.type('d');
	equal(editor.getContent(), '<p><em><b>abc</b>d</em></p>');
});

test('Caret format at end of text inside other format with text after 1', function() {
	editor.setContent('<p><em><b>abc</b></em>e</p>');
	editor.formatter.register('format', {inline: 'b'});
	Utils.setSelection('b', 3, 'b', 3);
	editor.formatter.remove('format');
	Utils.type('d');
	equal(editor.getContent(), '<p><em><b>abc</b>d</em>e</p>');
});

test('Caret format at end of text inside other format with text after 2', function() {
	editor.setContent('<p><em><b>abc</b></em>e</p>');
	editor.formatter.register('format', {inline: 'em'});
	Utils.setSelection('b', 3, 'b', 3);
	editor.formatter.remove('format');
	Utils.type('d');
	equal(editor.getContent(), '<p><em><b>abc</b></em><b>d</b>e</p>');
});

test('Toggle styles at the end of the content don\' removes the format where it is not needed.', function() {
	editor.setContent('<p><em><b>abce</b></em></p>');
	editor.formatter.register('b', {inline: 'b'});
	editor.formatter.register('em', {inline: 'em'});
	Utils.setSelection('b', 4, 'b', 4);
	editor.formatter.remove('b');
	editor.formatter.remove('em');
	equal(editor.getContent(), '<p><em><b>abce</b></em></p>');
});

test('Caret format on second word in table cell', function() {
	editor.setContent('<table><tbody><tr><td>one <b>two</b></td></tr></tbody></table>');
	editor.formatter.register('format', {inline: 'b'});
	Utils.setSelection('b', 2, 'b', 2);
	editor.formatter.remove('format');
	equal(editor.getContent(), '<table><tbody><tr><td>one two</td></tr></tbody></table>');
});

test('contentEditable: false on start and contentEditable: true on end', function() {
	if (tinymce.Env.ie) {
		ok("Skipped since IE doesn't support selection of parts of a cE=false element", true);
		return;
	}

	editor.formatter.register('format', {inline: 'b'});
	editor.setContent('<p>abc</p><p contenteditable="false"><b>def</b></p><p><b>ghj</b></p>');
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('b')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('b')[1].firstChild, 3);
	editor.selection.setRng(rng);
	editor.formatter.remove('format');
	equal(editor.getContent(), '<p>abc</p><p contenteditable="false"><b>def</b></p><p>ghj</p>', 'Text in last paragraph is not bold');
});

test('contentEditable: true on start and contentEditable: false on end', function() {
	editor.formatter.register('format', {inline: 'b'});
	editor.setContent('<p>abc</p><p><b>def</b></p><p contenteditable="false"><b>ghj</b></p>');
	Utils.setSelection('p:nth-child(2) b', 0, 'p:last b', 3);
	editor.formatter.remove('format');
	equal(editor.getContent(), '<p>abc</p><p>def</p><p contenteditable="false"><b>ghj</b></p>', 'Text in first paragraph is not bold');
});

test('contentEditable: true inside contentEditable: false', function() {
	editor.formatter.register('format', {inline: 'b'});
	editor.setContent('<p>abc</p><p contenteditable="false"><span contenteditable="true"><b>def</b></span></p>');
	Utils.setSelection('b', 0, 'b', 3);
	editor.formatter.remove('format');
	equal(editor.getContent(), '<p>abc</p><p contenteditable="false"><span contenteditable="true">def</span></p>', 'Text is not bold');
});

test('remove format block on contentEditable: false block', function() {
	editor.formatter.register('format', {block: 'h1'});
	editor.setContent('<p>abc</p><h1 contenteditable="false">def</h1>');
	Utils.setSelection('h1:nth-child(2)', 0, 'h1:nth-child(2)', 3);
	editor.formatter.remove('format');
	equal(editor.getContent(), '<p>abc</p><h1 contenteditable="false">def</h1>', 'H1 is still not h1');
});

test('remove format on del using removeformat format', function() {
	editor.getBody().innerHTML = '<p><del>abc</del></p>';
	Utils.setSelection('del', 0, 'del', 3);
	editor.formatter.remove('removeformat');
	equal(Utils.cleanHtml(editor.getBody().innerHTML), '<p>abc</p>');
});

test('remove format on span with class using removeformat format', function() {
	editor.getBody().innerHTML = '<p><span class="x">abc</span></p>';
	Utils.setSelection('span', 0, 'span', 3);
	editor.formatter.remove('removeformat');
	equal(Utils.cleanHtml(editor.getBody().innerHTML), '<p>abc</p>');
});

test('remove format on span with internal class using removeformat format', function() {
	editor.getBody().innerHTML = '<p><span class="mce-item-internal">abc</span></p>';
	Utils.setSelection('span', 0, 'span', 3);
	editor.formatter.remove('removeformat');
	equal(Utils.normalizeHtml(Utils.cleanHtml(editor.getBody().innerHTML)), '<p><span class="mce-item-internal">abc</span></p>');
});

test('Remove format bug 1', function() {
	editor.setContent('<p><b><i>ab</i>c</b></p>');
	editor.formatter.register('format', {inline: 'b'});
	Utils.setSelection('i', 1, 'i', 2);
	editor.formatter.remove('format');
	equal(editor.getContent(), '<p><b><i>a</i></b><i>b</i><b>c</b></p>');
});

test('Remove format bug 2', function() {
	editor.setContent('<p>ab<b>c</b></p>');
	editor.formatter.register('format', {inline: 'b'});
	Utils.setSelection('b', 0, 'b', 1);
	editor.formatter.remove('format');
	equal(editor.getContent(), '<p>abc</p>');
});

test('Remove format bug 3', function() {
	editor.setContent('<p><b><i>ab</i></b></p>');
	editor.formatter.register('format', {inline: 'b'});
	Utils.setSelection('i', 1, 'i', 2);
	editor.formatter.remove('format');
	equal(editor.getContent(), '<p><b><i>a</i></b><i>b</i></p>');
});
