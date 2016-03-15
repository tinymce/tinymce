module("tinymce.EditorCommands", {
	setupModule: function() {
		QUnit.stop();

		tinymce.init({
			selector: "textarea",
			add_unload_trigger: false,
			disable_nodechange: true,
			indent: false,
			skin: false,
			entities: 'raw',
			convert_urls: false,
			valid_styles: {
				'*': 'color,font-size,font-family,background-color,font-weight,font-style,text-decoration,float,margin,margin-top,margin-right,margin-bottom,margin-left,padding-left,text-align,display'
			},
			init_instance_callback: function(ed) {
				window.editor = ed;
				QUnit.start();
			}
		});
	}
});

function getContent() {
	return editor.getContent({format:'raw'}).toLowerCase().replace(/[\r\n]+/g, '');
}

test('mceInsertContent - p inside text of p', function() {
	var rng;

	expect(7);

	editor.setContent('<p>1234</p>');
	editor.focus();
	rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 1);
	rng.setEnd(editor.dom.select('p')[0].firstChild, 3);
	editor.selection.setRng(rng);
	editor.execCommand('mceInsertContent', false, '<p>abc</p>');
	equal(getContent(), '<p>1</p><p>abc</p><p>4</p>');
	rng = Utils.normalizeRng(editor.selection.getRng(true));
	ok(rng.collapsed);
	equal(rng.startContainer.nodeName, 'P');
	equal(rng.startOffset, 1);
	equal(rng.endContainer.nodeName, 'P');
	equal(rng.endOffset, 1);
	equal(rng.startContainer.innerHTML, 'abc');
});

test('mceInsertContent before HR', function() {
	var rng;

	editor.setContent('<hr>');
	editor.focus();
	rng = editor.dom.createRng();
	rng.setStart(editor.getBody(), 0);
	rng.setEnd(editor.getBody(), 0);
	editor.selection.setRng(rng);
	editor.execCommand('mceInsertContent', false, 'x');
	equal(getContent(), '<p>x</p><hr />');
});

test('mceInsertContent HR at end of H1', function() {
	editor.setContent('<h1>abc</h1>');
	Utils.setSelection('h1', 3);
	editor.execCommand('mceInsertContent', false, '<hr>');
	equal(editor.selection.getNode(), editor.getBody().lastChild);
	equal(editor.selection.getNode().nodeName, 'H1');
	equal(getContent(), '<h1>abc</h1><hr /><h1>\u00a0</h1>');
});

test('mceInsertContent HR at end of H1 with P sibling', function() {
	editor.setContent('<h1>abc</h1><p>def</p>');
	Utils.setSelection('h1', 3);
	editor.execCommand('mceInsertContent', false, '<hr>');
	equal(editor.selection.getNode(), editor.getBody().lastChild);
	equal(editor.selection.getNode().nodeName, 'P');
	equal(getContent(), '<h1>abc</h1><hr /><p>def</p>');
});

test('mceInsertContent HR at end of H1 with P sibling', function() {
	editor.setContent('<h1>abc</h1><p>def</p>');
	Utils.setSelection('h1', 3);
	editor.execCommand('mceInsertContent', false, '<table><tr><td></td></tr></table>');
	equal(editor.selection.getNode().nodeName, 'TD');
	equal(getContent(), '<h1>abc</h1><table><tbody><tr><td>\u00a0</td></tr></tbody></table><p>def</p>');
});

test('mceInsertContent - p inside whole p', function() {
	var rng;

	expect(7);

	editor.setContent('<p>1234</p>');
	rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('p')[0].firstChild, 4);
	editor.selection.setRng(rng);
	editor.execCommand('mceInsertContent', false, '<p>abc</p>');
	equal(getContent(), '<p>abc</p>');
	rng = Utils.normalizeRng(editor.selection.getRng(true));
	ok(rng.collapsed);
	equal(rng.startContainer.nodeName, 'P');
	equal(rng.startOffset, 1);
	equal(rng.endContainer.nodeName, 'P');
	equal(rng.endOffset, 1);
	equal(rng.startContainer.innerHTML, 'abc');
});

test('mceInsertContent - pre in text of pre', function() {
	var rng;

	expect(7);

	editor.setContent('<pre>1234</pre>');
	rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('pre')[0].firstChild, 1);
	rng.setEnd(editor.dom.select('pre')[0].firstChild, 3);
	editor.selection.setRng(rng);
	editor.execCommand('mceInsertContent', false, '<pre>abc</pre>');
	equal(getContent(), '<pre>1</pre><pre>abc</pre><pre>4</pre>');
	rng = Utils.normalizeRng(editor.selection.getRng(true));
	ok(rng.collapsed);
	equal(rng.startContainer.nodeName, 'PRE');
	equal(rng.startOffset, 1);
	equal(rng.endContainer.nodeName, 'PRE');
	equal(rng.endOffset, 1);
	equal(rng.startContainer.innerHTML, 'abc');
});

test('mceInsertContent - h1 in text of h1', function() {
	var rng;

	expect(7);

	editor.setContent('<h1>1234</h1>');
	rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('h1')[0].firstChild, 1);
	rng.setEnd(editor.dom.select('h1')[0].firstChild, 3);
	editor.selection.setRng(rng);
	editor.execCommand('mceInsertContent', false, '<h1>abc</h1>');
	equal(getContent(), '<h1>1</h1><h1>abc</h1><h1>4</h1>');
	rng = Utils.normalizeRng(editor.selection.getRng(true));
	ok(rng.collapsed);
	equal(rng.startContainer.nodeName, 'H1');
	equal(rng.startOffset, 1);
	equal(rng.endContainer.nodeName, 'H1');
	equal(rng.endOffset, 1);
	equal(rng.startContainer.innerHTML, 'abc');
});

test('mceInsertContent - li inside li', function() {
	var rng;

	expect(7);

	editor.setContent('<ul><li>1234</li></ul>');
	rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('li')[0].firstChild, 1);
	rng.setEnd(editor.dom.select('li')[0].firstChild, 3);
	editor.selection.setRng(rng);
	editor.execCommand('mceInsertContent', false, '<li>abc</li>');
	equal(getContent(), '<ul><li>1</li><li>abc</li><li>4</li></ul>');
	rng = Utils.normalizeRng(editor.selection.getRng(true));
	ok(rng.collapsed);
	equal(rng.startContainer.nodeName, 'LI');
	equal(rng.startOffset, 1);
	equal(rng.endContainer.nodeName, 'LI');
	equal(rng.endOffset, 1);
	equal(rng.startContainer.innerHTML, 'abc');
});

test('mceInsertContent - p inside empty editor', function() {
	var rng;

	expect(7);

	editor.setContent('');
	editor.execCommand('mceInsertContent', false, '<p>abc</p>');
	equal(getContent(), '<p>abc</p>');
	rng = Utils.normalizeRng(editor.selection.getRng(true));
	ok(rng.collapsed);
	equal(rng.startContainer.nodeName, 'P');
	equal(rng.startOffset, 1);
	equal(rng.endContainer.nodeName, 'P');
	equal(rng.endOffset, 1);
	equal(rng.startContainer.innerHTML, 'abc');
});

test('mceInsertContent - text inside empty p', function() {
	var rng;

	expect(7);

	editor.getBody().innerHTML = '<p></p>';
	Utils.setSelection('p', 0);
	editor.execCommand('mceInsertContent', false, 'abc');
	equal(editor.getBody().innerHTML.toLowerCase().replace(/^<br>/, ''), '<p>abc</p>'); // Opera inserts a BR at the beginning of contents if the P is empty
	rng = Utils.normalizeRng(editor.selection.getRng(true));
	ok(rng.collapsed);
	equal(rng.startContainer.nodeName, 'P');
	equal(rng.startOffset, 1);
	equal(rng.endContainer.nodeName, 'P');
	equal(rng.endOffset, 1);
	equal(rng.startContainer.innerHTML, 'abc');
});

test('mceInsertContent - text inside empty p with br caret node', function() {
	var rng;

	expect(7);

	editor.getBody().innerHTML = '<p><br></p>';
	rng = editor.dom.createRng();
	rng.setStart(editor.getBody().firstChild, 0);
	rng.setEnd(editor.getBody().firstChild, 0);
	editor.selection.setRng(rng);
	editor.execCommand('mceInsertContent', false, 'abc');
	equal(editor.getBody().innerHTML.toLowerCase(), '<p>abc</p>');
	rng = Utils.normalizeRng(editor.selection.getRng(true));
	ok(rng.collapsed);
	equal(rng.startContainer.nodeName, 'P');
	equal(rng.startOffset, 1);
	equal(rng.endContainer.nodeName, 'P');
	equal(rng.endOffset, 1);
	equal(rng.startContainer.innerHTML, 'abc');
});

test('mceInsertContent - image inside p', function() {
	var rng;

	expect(6);

	editor.setContent('<p>1</p>');
	rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('p')[0].firstChild, 1);
	editor.selection.setRng(rng);
	editor.execCommand('mceInsertContent', false, '<img src="about:blank" />');
	equal(editor.getContent(), '<p><img src="about:blank" /></p>');
	rng = Utils.normalizeRng(editor.selection.getRng(true));
	ok(rng.collapsed);
	equal(rng.startContainer.nodeName, 'P');
	equal(rng.startOffset, 1);
	equal(rng.endContainer.nodeName, 'P');
	equal(rng.endOffset, 1);
});

test('mceInsertContent - legacy content', function() {
	var rng;

	expect(1);

	// Convert legacy content
	editor.setContent('<p>1</p>');
	rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('p')[0].firstChild, 1);
	editor.selection.setRng(rng);
	editor.execCommand('mceInsertContent', false, '<strike>strike</strike><font size="7">font</font>');
	equal(editor.getContent(), '<p><span style="text-decoration: line-through;">strike</span><span style="font-size: 300%;">font</span></p>');
});

test('mceInsertContent - hr', function() {
	var rng;

	expect(7);

	editor.setContent('<p>123</p>');
	rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 1);
	rng.setEnd(editor.dom.select('p')[0].firstChild, 2);
	editor.selection.setRng(rng);
	editor.execCommand('mceInsertContent', false, '<hr />');
	equal(editor.getContent(), '<p>1</p><hr /><p>3</p>');
	rng = Utils.normalizeRng(editor.selection.getRng(true));
	ok(rng.collapsed);
	equal(rng.startContainer, editor.getBody().lastChild);
	equal(rng.startContainer.nodeName, 'P');
	equal(rng.startOffset, 0);
	equal(rng.endContainer.nodeName, 'P');
	equal(rng.endOffset, 0);
});

test('mceInsertContent - forced root block', function() {
	expect(1);

	// Forced root block
	editor.getBody().innerHTML = '';
	editor.execCommand('mceInsertContent', false, 'test<b>123</b><!-- a -->');
	// Opera adds an extra paragraph since it adds a BR at the end of the contents pass though this for now since it's an minority browser
	equal(editor.getContent().replace(/<p>\u00a0<\/p>/g, ''), '<p>test<strong>123</strong></p><!-- a -->');
});

test('mceInsertContent - mixed inline content inside td', function() {
	expect(1);

	// Forced root block
	editor.getBody().innerHTML = '<table><tr><td>X</td></tr></table>';
	Utils.setSelection('td', 0, 'td', 0);
	editor.execCommand('mceInsertContent', false, 'test<b>123</b><!-- a -->');
	equal(editor.getContent(), '<table><tbody><tr><td>test<strong>123</strong><!-- a -->X</td></tr></tbody></table>');
});

test('mceInsertContent - invalid insertion with spans on page', function(){
	var startingContent = '<p>123 testing <em>span later in document</em></p>',
		insertedContent = '<ul><li>u</li><li>l</li></ul>';
	editor.setContent(startingContent);
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('p')[0].firstChild, 0);
	editor.selection.setRng(rng);
	editor.execCommand('mceInsertContent', false, insertedContent);

	equal(editor.getContent(), insertedContent + startingContent);
});

test('mceInsertContent - text with space before at start of block', function() {
	editor.getBody().innerHTML = '<p>a</p>';
	Utils.setSelection('p', 0);
	editor.execCommand('mceInsertContent', false, ' b');
	equal(editor.getContent(), '<p>\u00a0ba</p>');
});

test('mceInsertContent - text with space after at end of block', function() {
	editor.getBody().innerHTML = '<p>a</p>';
	Utils.setSelection('p', 1);
	editor.execCommand('mceInsertContent', false, 'b ');
	equal(editor.getContent(), '<p>ab\u00a0</p>');
});

test('mceInsertContent - text with space before/after at middle of block', function() {
	editor.getBody().innerHTML = '<p>ac</p>';
	Utils.setSelection('p', 1);
	editor.execCommand('mceInsertContent', false, ' b ');
	equal(editor.getContent(), '<p>a b c</p>');
});

test('mceInsertContent - inline element with space before/after at middle of block', function() {
	editor.getBody().innerHTML = '<p>ac</p>';
	Utils.setSelection('p', 1);
	editor.execCommand('mceInsertContent', false, ' <em>b</em> ');
	equal(editor.getContent(), '<p>a <em>b</em> c</p>');
});

test('mceInsertContent - block element with space before/after at middle of block', function() {
	editor.getBody().innerHTML = '<p>ac</p>';
	Utils.setSelection('p', 1);
	editor.execCommand('mceInsertContent', false, ' <p>b</p> ');
	equal(editor.getContent(), '<p>a</p><p>b</p><p>c</p>');
});

test('mceInsertContent - strong in strong', function() {
	editor.getBody().innerHTML = '<strong>ac</strong>';
	Utils.setSelection('strong', 1);
	editor.execCommand('mceInsertContent', false, {content: '<strong>b</strong>', merge: true});
	equal(editor.getContent(), '<p><strong>abc</strong></p>');
});

test('mceInsertContent - span in span same style color', function() {
	editor.getBody().innerHTML = '<span style="color:#ff0000">ac</strong>';
	Utils.setSelection('span', 1);
	editor.execCommand('mceInsertContent', false, {content: '<span style="color:#ff0000">b</span>', merge: true});
	equal(editor.getContent(), '<p><span style="color: #ff0000;">abc</span></p>');
});

test('mceInsertContent - span in span different style color', function() {
	editor.getBody().innerHTML = '<span style="color:#ff0000">ac</strong>';
	Utils.setSelection('span', 1);
	editor.execCommand('mceInsertContent', false, {content: '<span style="color:#00ff00">b</span>', merge: true});
	equal(editor.getContent(), '<p><span style="color: #ff0000;">a<span style="color: #00ff00;">b</span>c</span></p>');
});

test('mceInsertContent - select with option element', function() {
	editor.getBody().innerHTML = '<p>1</p>';
	Utils.setSelection('p', 1);
	editor.execCommand('mceInsertContent', false, '2<select><option selected="selected">3</option></select>');
	equal(editor.getContent(), '<p>12<select><option selected="selected">3</option></select></p>');
});

test('mceInsertContent - insert P in span style element #7090', function() {
	editor.setContent('<p><span style="color: red">1</span></p><p>3</p>');
	Utils.setSelection('span', 1);
	editor.execCommand('mceInsertContent', false, '<p>2</p>');
	equal(editor.getContent(), '<p><span style="color: red;">1</span></p><p>2</p><p>3</p>');
});

test('mceInsertContent - insert char at char surrounded by spaces', function() {
	editor.setContent('<p>a b c</p>');
	Utils.setSelection('p', 2, 'p', 3);
	editor.execCommand('mceInsertContent', false, 'X');
	equal(tinymce.util.JSON.serialize(editor.getContent()), '"<p>a X c</p>"');
});

test('InsertHorizontalRule', function() {
	var rng;

	expect(7);

	editor.setContent('<p>123</p>');
	rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 1);
	rng.setEnd(editor.dom.select('p')[0].firstChild, 2);
	editor.selection.setRng(rng);
	editor.execCommand('InsertHorizontalRule');
	equal(editor.getContent(), '<p>1</p><hr /><p>3</p>');
	rng = Utils.normalizeRng(editor.selection.getRng(true));
	ok(rng.collapsed);
	equal(rng.startContainer, editor.getBody().lastChild);
	equal(rng.startContainer.nodeName, 'P');
	equal(rng.startOffset, 0);
	equal(rng.endContainer.nodeName, 'P');
	equal(rng.endOffset, 0);
});

test('Justify - multiple block elements selected - queryCommandState', function() {
	editor.setContent('<div style="text-align: left;"><div id="a" style="text-align: right;">one</div><div id="b" style="text-align: right;">two</div></div>');
	Utils.setSelection('#a', 0, '#b', 3);
	equal(editor.queryCommandState('JustifyLeft'), false);
	ok(editor.queryCommandState('JustifyRight'));
});

test('Formatting commands (xhtmlTextStyles)', function() {
	editor.focus();
	editor.setContent('test 123');
	editor.execCommand('SelectAll');
	editor.execCommand('Bold');
	equal(editor.getContent(), "<p><strong>test 123</strong></p>");

	editor.setContent('test 123');
	editor.execCommand('SelectAll');
	editor.execCommand('Italic');
	equal(editor.getContent(), "<p><em>test 123</em></p>");

	editor.setContent('test 123');
	editor.execCommand('SelectAll');
	editor.execCommand('Underline');
	equal(editor.getContent(), '<p><span style="text-decoration: underline;">test 123</span></p>');

	editor.setContent('test 123');
	editor.execCommand('SelectAll');
	editor.execCommand('Strikethrough');
	equal(editor.getContent(), '<p><span style="text-decoration: line-through;">test 123</span></p>');

	editor.setContent('test 123');
	editor.execCommand('SelectAll');
	editor.execCommand('FontName', false, 'Arial');
	equal(editor.getContent(), '<p><span style="font-family: ' + Utils.fontFace('Arial') + ';">test 123</span></p>');

	editor.setContent('test 123');
	editor.execCommand('SelectAll');
	editor.execCommand('FontSize', false, '7');
	equal(editor.getContent(), '<p><span style="font-size: xx-large;">test 123</span></p>');

	editor.setContent('test 123');
	editor.execCommand('SelectAll');
	editor.execCommand('ForeColor', false, '#FF0000');
	equal(editor.getContent(), '<p><span style="color: #ff0000;">test 123</span></p>');

	editor.setContent('test 123');
	editor.execCommand('SelectAll');
	editor.execCommand('HiliteColor', false, '#FF0000');
	equal(editor.getContent(), '<p><span style="background-color: #ff0000;">test 123</span></p>');

	editor.setContent('<p><span style="text-decoration: underline;">test 123</span></p>');
	equal(editor.getContent(), '<p><span style="text-decoration: underline;">test 123</span></p>');

	editor.setContent('<p><span style="text-decoration: line-through;">test 123</span></p>');
	equal(editor.getContent(), '<p><span style="text-decoration: line-through;">test 123</span></p>');

	editor.setContent('<p><span style="font-family: Arial;">test 123</span></p>');
	equal(editor.getContent(), '<p><span style="font-family: Arial;">test 123</span></p>');

	editor.setContent('<p><span style="font-size: xx-large;">test 123</span></p>');
	equal(editor.getContent(), '<p><span style="font-size: xx-large;">test 123</span></p>');

	editor.setContent('<p><strike>test 123</strike></p>');
	equal(editor.getContent(), '<p><span style="text-decoration: line-through;">test 123</span></p>');

	editor.setContent('<p><font face="Arial">test 123</font></p>');
	equal(editor.getContent(), '<p><span style="font-family: ' + Utils.fontFace('Arial') + ';">test 123</span></p>');

	editor.setContent('<p><font size="7">test 123</font></p>');
	equal(editor.getContent(), '<p><span style="font-size: 300%;">test 123</span></p>');

	editor.setContent('<p><font face="Arial" size="7">test 123</font></p>');
	equal(editor.getContent(), '<p><span style="font-size: 300%; font-family: ' + Utils.fontFace('Arial') + ';">test 123</span></p>');

	editor.setContent('<font style="background-color: #ff0000" color="#ff0000">test</font><font face="Arial">test</font>');
	equal(editor.getContent(), '<p><span style="color: #ff0000; background-color: #ff0000;">test</span><span style="font-family: ' + Utils.fontFace('Arial') + ';">test</span></p>');

	editor.setContent('<p><font face="Arial" style="color: #ff0000">test 123</font></p>');
	equal(editor.getContent(), '<p><span style="color: #ff0000; font-family: ' + Utils.fontFace('Arial') + ';">test 123</span></p>');
});

test('Formatting commands (alignInline)', function() {
	expect(7);

	editor.setContent('<p>test 123</p>');
	editor.execCommand('SelectAll');
	editor.execCommand('JustifyLeft');
	equal(editor.getContent(), '<p style="text-align: left;">test 123</p>');

	editor.setContent('<p>test 123</p>');
	editor.execCommand('SelectAll');
	editor.execCommand('JustifyCenter');
	equal(editor.getContent(), '<p style="text-align: center;">test 123</p>');

	editor.setContent('<p>test 123</p>');
	editor.execCommand('SelectAll');
	editor.execCommand('JustifyRight');
	equal(editor.getContent(), '<p style="text-align: right;">test 123</p>');

	editor.setContent('<p>test 123</p>');
	editor.execCommand('SelectAll');
	editor.execCommand('JustifyFull');
	equal(editor.getContent(), '<p style="text-align: justify;">test 123</p>');

	editor.setContent('<img src="tinymce/ui/img/raster.gif" />');
	editor.selection.select(editor.dom.select('img')[0]);
	editor.execCommand('JustifyLeft');
	equal(editor.getContent(), '<p><img style="float: left;" src="tinymce/ui/img/raster.gif" /></p>');

	editor.setContent('<img src="tinymce/ui/img/raster.gif" />');
	editor.selection.select(editor.dom.select('img')[0]);
	editor.execCommand('JustifyCenter');
	equal(editor.getContent(), '<p><img style="margin-right: auto; margin-left: auto; display: block;" src="tinymce/ui/img/raster.gif" /></p>');

	editor.setContent('<img src="tinymce/ui/img/raster.gif" />');
	editor.selection.select(editor.dom.select('img')[0]);
	editor.execCommand('JustifyRight');
	equal(editor.getContent(), '<p><img style="float: right;" src="tinymce/ui/img/raster.gif" /></p>');
});

test('mceBlockQuote', function() {
	expect(2);

	editor.focus();
	editor.setContent('<p>test 123</p>');
	editor.execCommand('SelectAll');
	editor.execCommand('mceBlockQuote');
	equal(editor.getContent().replace(/\s+/g, ''), '<blockquote><p>test123</p></blockquote>');

	editor.setContent('<p>test 123</p><p>test 123</p>');
	editor.execCommand('SelectAll');
	editor.execCommand('mceBlockQuote');
	equal(editor.getContent().replace(/\s+/g, ''), '<blockquote><p>test123</p><p>test123</p></blockquote>');
});

test('FormatBlock', function() {
	expect(9);

	editor.setContent('<p>test 123</p>');
	editor.execCommand('SelectAll');
	editor.execCommand('FormatBlock', false, 'h1');
	equal(editor.getContent(), '<h1>test 123</h1>');

	editor.execCommand('SelectAll');
	editor.execCommand('FormatBlock', false, 'h2');
	equal(editor.getContent(), '<h2>test 123</h2>');

	editor.execCommand('SelectAll');
	editor.execCommand('FormatBlock', false, 'h3');
	equal(editor.getContent(), '<h3>test 123</h3>');

	editor.execCommand('SelectAll');
	editor.execCommand('FormatBlock', false, 'h4');
	equal(editor.getContent(), '<h4>test 123</h4>');

	editor.execCommand('SelectAll');
	editor.execCommand('FormatBlock', false, 'h5');
	equal(editor.getContent(), '<h5>test 123</h5>');

	editor.execCommand('SelectAll');
	editor.execCommand('FormatBlock', false, 'h6');
	equal(editor.getContent(), '<h6>test 123</h6>');

	editor.execCommand('SelectAll');

	try {
		editor.execCommand('FormatBlock', false, 'div');
	} catch (ex) {
		//t.log('Failed: ' + ex.message);
	}

	equal(editor.getContent(), '<div>test 123</div>');

	editor.execCommand('SelectAll');
	editor.execCommand('FormatBlock', false, 'address');
	equal(editor.getContent(), '<address>test 123</address>');

	editor.execCommand('SelectAll');
	editor.execCommand('FormatBlock', false, 'pre');
	equal(editor.getContent(), '<pre>test 123</pre>');
});

test('mceInsertLink (relative)', function() {
	expect(1);

	editor.setContent('test 123');
	editor.execCommand('SelectAll');
	editor.execCommand('mceInsertLink', false, 'test');
	equal(editor.getContent(), '<p><a href="test">test 123</a></p>');
});

test('mceInsertLink (link absolute)', function() {
	expect(1);

	editor.setContent('<p>test 123</p>');
	editor.execCommand('SelectAll');
	editor.execCommand('mceInsertLink', false, 'http://www.site.com');
	equal(editor.getContent(), '<p><a href="http://www.site.com">test 123</a></p>');
});

test('mceInsertLink (link encoded)', function() {
	expect(1);

	editor.setContent('<p>test 123</p>');
	editor.execCommand('SelectAll');
	editor.execCommand('mceInsertLink', false, '"&<>');
	equal(editor.getContent(), '<p><a href="&quot;&amp;&lt;&gt;">test 123</a></p>');
});

test('mceInsertLink (link encoded and with class)', function() {
	expect(1);

	editor.setContent('<p>test 123</p>');
	editor.execCommand('SelectAll');
	editor.execCommand('mceInsertLink', false, {href : '"&<>', 'class' : 'test'});
	equal(editor.getContent(), '<p><a class="test" href="&quot;&amp;&lt;&gt;">test 123</a></p>');
});

test('mceInsertLink (link with space)', function() {
	expect(1);

	editor.setContent('<p>test 123</p>');
	editor.execCommand('SelectAll');
	editor.execCommand('mceInsertLink', false, {href : 'foo bar'});
	equal(editor.getContent(), '<p><a href="foo%20bar">test 123</a></p>');
});

test('mceInsertLink (link floated img)', function() {
	expect(1);

	editor.setContent('<p><img style="float: right;" src="about:blank" /></p>');
	editor.execCommand('SelectAll');
	editor.execCommand('mceInsertLink', false, 'link');
	equal(editor.getContent(), '<p><a href="link"><img style="float: right;" src="about:blank" /></a></p>');
});

test('mceInsertLink (link adjacent text)', function() {
	var rng;

	expect(1);

	editor.setContent('<p><a href="#">a</a>b</p>');

	rng = editor.dom.createRng();
	rng.setStart(editor.getBody().firstChild.lastChild, 0);
	rng.setEnd(editor.getBody().firstChild.lastChild, 1);
	editor.selection.setRng(rng);

	editor.execCommand('mceInsertLink', false, 'link');
	equal(editor.getContent(), '<p><a href="#">a</a><a href="link">b</a></p>');
});

test('mceInsertLink (link text inside text)', function() {
	expect(1);

	editor.setContent('<p><a href="#"><em>abc</em></a></p>');
	Utils.setSelection('em', 1, 'em', 2);

	editor.execCommand('mceInsertLink', false, 'link');
	equal(editor.getContent(), '<p><a href="link"><em>abc</em></a></p>');
});

test('mceInsertLink (link around existing links)', function() {
	expect(1);

	editor.setContent('<p><a href="#1">1</a><a href="#2">2</a></p>');
	editor.execCommand('SelectAll');

	editor.execCommand('mceInsertLink', false, 'link');
	equal(editor.getContent(), '<p><a href="link">12</a></p>');
});

test('mceInsertLink (link around existing links with different attrs)', function() {
	expect(1);

	editor.setContent('<p><a id="a" href="#1">1</a><a id="b" href="#2">2</a></p>');
	editor.execCommand('SelectAll');

	editor.execCommand('mceInsertLink', false, 'link');
	equal(editor.getContent(), '<p><a href="link">12</a></p>');
});

test('mceInsertLink (link around existing complex contents with links)', function() {
	expect(1);

	editor.setContent('<p><span id="s1"><strong><a id="a" href="#1"><em>1</em></a></strong></span><span id="s2"><em><a id="b" href="#2"><strong>2</strong></a></em></span></p>');
	editor.execCommand('SelectAll');

	editor.execCommand('mceInsertLink', false, 'link');
	equal(editor.getContent(), '<p><a href="link"><span id="s1"><strong><em>1</em></strong></span><span id="s2"><em><strong>2</strong></em></span></a></p>');
});

test('mceInsertLink (link text inside link)', function() {
	expect(1);

	editor.setContent('<p><a href="#">test</a></p>');
	Utils.setSelection('p', 0, 'p', 1);
	editor.execCommand('SelectAll');

	editor.execCommand('mceInsertLink', false, 'link');
	equal(editor.getContent(), '<p><a href="link">test</a></p>');
});

test('mceInsertLink bug #7331', function() {
	editor.setContent('<table><tbody><tr><td>A</td></tr><tr><td>B</td></tr></tbody></table>');
	var rng = editor.dom.createRng();
	rng.setStart(editor.$('td')[1].firstChild, 0);
	rng.setEnd(editor.getBody(), 1);
	editor.selection.setRng(rng);
	editor.execCommand('mceInsertLink', false, {href: 'x'});
	equal(editor.getContent(), '<table><tbody><tr><td>A</td></tr><tr><td><a href=\"x\">B</a></td></tr></tbody></table>');
});

test('unlink', function() {
	editor.setContent('<p><a href="test">test</a> <a href="test">123</a></p>');
	editor.execCommand('SelectAll');
	editor.execCommand('unlink');
	equal(editor.getContent(), '<p>test 123</p>');
});

test('subscript/superscript', function() {
	expect(4);

	editor.setContent('<p>test 123</p>');
	editor.execCommand('SelectAll');
	editor.execCommand('subscript');
	equal(editor.getContent(), '<p><sub>test 123</sub></p>');

	editor.setContent('<p>test 123</p>');
	editor.execCommand('SelectAll');
	editor.execCommand('superscript');
	equal(editor.getContent(), '<p><sup>test 123</sup></p>');

	editor.setContent('<p>test 123</p>');
	editor.execCommand('SelectAll');
	editor.execCommand('subscript');
	editor.execCommand('subscript');
	equal(editor.getContent(), '<p>test 123</p>');

	editor.setContent('<p>test 123</p>');
	editor.execCommand('SelectAll');
	editor.execCommand('superscript');
	editor.execCommand('superscript');
	equal(editor.getContent(), '<p>test 123</p>');
});

test('indent/outdent', function() {
	expect(4);

	editor.setContent('<p>test 123</p>');
	editor.execCommand('SelectAll');
	editor.execCommand('Indent');
	equal(editor.getContent(), '<p style="padding-left: 30px;">test 123</p>');

	editor.setContent('<p>test 123</p>');
	editor.execCommand('SelectAll');
	editor.execCommand('Indent');
	editor.execCommand('Indent');
	equal(editor.getContent(), '<p style="padding-left: 60px;">test 123</p>');

	editor.setContent('<p>test 123</p>');
	editor.execCommand('SelectAll');
	editor.execCommand('Indent');
	editor.execCommand('Indent');
	editor.execCommand('Outdent');
	equal(editor.getContent(), '<p style="padding-left: 30px;">test 123</p>');

	editor.setContent('<p>test 123</p>');
	editor.execCommand('SelectAll');
	editor.execCommand('Outdent');
	equal(editor.getContent(), '<p>test 123</p>');
});

test('RemoveFormat', function() {
	expect(4);

	editor.setContent('<p><em>test</em> <strong>123</strong> <a href="123">123</a> 123</p>');
	editor.execCommand('SelectAll');
	editor.execCommand('RemoveFormat');
	equal(editor.getContent(), '<p>test 123 <a href="123">123</a> 123</p>');

	editor.setContent('<p><em><em>test</em> <strong>123</strong> <a href="123">123</a> 123</em></p>');
	editor.execCommand('SelectAll');
	editor.execCommand('RemoveFormat');
	equal(editor.getContent(), '<p>test 123 <a href="123">123</a> 123</p>');

	editor.setContent('<p><em>test<span id="x">test <strong>123</strong></span><a href="123">123</a> 123</em></p>');
	editor.selection.select(editor.dom.get('x'));
	editor.execCommand('RemoveFormat');
	equal(editor.getContent(), '<p><em>test</em><span id="x">test 123</span><em><a href="123">123</a> 123</em></p>');

	editor.setContent('<p><dfn>dfn tag </dfn> <code>code tag </code> <samp>samp tag</samp> <kbd> kbd tag</kbd> <var> var tag</var> <cite> cite tag</cite> <mark> mark tag</mark> <q> q tag</q></p>');
	editor.execCommand('SelectAll');
	editor.execCommand('RemoveFormat');
	equal(editor.getContent(), '<p>dfn tag code tag samp tag kbd tag var tag cite tag mark tag q tag</p>');
});

test('InsertLineBreak', function() {
	editor.setContent('<p>123</p>');
	Utils.setSelection('p', 2);
	editor.execCommand('InsertLineBreak');
	equal(editor.getContent(), '<p>12<br />3</p>');

	editor.setContent('<p>123</p>');
	Utils.setSelection('p', 0);
	editor.execCommand('InsertLineBreak');
	equal(editor.getContent(), '<p><br />123</p>');

	editor.setContent('<p>123</p>');
	Utils.setSelection('p', 3);
	editor.execCommand('InsertLineBreak');
	equal(Utils.cleanHtml(editor.getBody().innerHTML), (tinymce.isIE && tinymce.Env.ie < 11) ? '<p>123<br></p>' : '<p>123<br><br></p>');
});
