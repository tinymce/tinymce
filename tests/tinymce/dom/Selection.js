module("tinymce.dom.Selection", {
	setupModule: function() {
		QUnit.stop();

		tinymce.init({
			selector: "textarea",
			add_unload_trigger: false,
			skin: false,
			forced_root_block: '',
			entities: 'raw',
			valid_styles: {
				'*': 'color,font-size,font-family,background-color,font-weight,font-style,text-decoration,float,margin,margin-top,margin-right,margin-bottom,margin-left,display'
			},
			custom_elements: 'custom1,~custom2',
			extended_valid_elements: 'custom1,custom2',
			init_instance_callback: function(ed) {
				window.editor = ed;
				QUnit.start();
			}
		});
	}
});

test('getContent', function() {
	var rng, eventObj;

	// Get selected contents
	editor.setContent('<p>text</p>');
	rng = editor.dom.createRng();
	rng.setStart(editor.getBody(), 0);
	rng.setEnd(editor.getBody(), 1);
	editor.selection.setRng(rng);
	equal(editor.selection.getContent(), '<p>text</p>', 'Get selected contents');

	// Get selected contents (collapsed)
	editor.setContent('<p>text</p>');
	rng = editor.dom.createRng();
	rng.setStart(editor.getBody(), 0);
	rng.setEnd(editor.getBody(), 0);
	editor.selection.setRng(rng);
	equal(editor.selection.getContent(), '', 'Get selected contents (collapsed)');

	// Get selected contents, onGetContent event
	eventObj = {};

	function handler(event) {
		eventObj = event;
	}

	editor.on('GetContent', handler);
	editor.setContent('<p>text</p>');
	rng = editor.dom.createRng();
	rng.setStart(editor.getBody(), 0);
	rng.setEnd(editor.getBody(), 1);
	editor.selection.setRng(rng);
	editor.selection.getContent();
	equal(eventObj.content, '<p>text</p>', 'Get selected contents, onGetContent event');
	editor.off('GetContent', handler);
});

test('setContent', function() {
	var rng, eventObj;

	// Set contents at selection
	editor.setContent('<p>text</p>');
	rng = editor.dom.createRng();
	rng.setStart(editor.getBody(), 0);
	rng.setEnd(editor.getBody(), 1);
	editor.selection.setRng(rng);
	editor.selection.setContent('<div>test</div>');
	equal(editor.getContent(), '<div>test</div>', 'Set contents at selection');

	// Set contents at selection (collapsed)
	editor.setContent('<p>text</p>');
	rng = editor.dom.createRng();
	rng.setStart(editor.getBody(), 0);
	rng.setEnd(editor.getBody(), 0);
	editor.selection.setRng(rng);
	editor.selection.setContent('<div>test</div>');
	equal(editor.getContent(), '<div>test</div>\n<p>text</p>', 'Set contents at selection (collapsed)');

	// Insert in middle of paragraph
	editor.setContent('<p>beforeafter</p>');
	rng = editor.dom.createRng();
	rng.setStart(editor.getBody().firstChild.firstChild, 'before'.length);
	rng.setEnd(editor.getBody().firstChild.firstChild, 'before'.length);
	editor.selection.setRng(rng);
	editor.selection.setContent('<br />');
	equal(editor.getContent(), '<p>before<br />after</p>', 'Set contents at selection (inside paragraph)');

	// Check the caret is left in the correct position.
	rng = editor.selection.getRng(true);
	if (document.createRange) {
		equal(rng.startContainer, editor.getBody().firstChild, 'Selection start container');
		equal(rng.startOffset, 2, 'Selection start offset');
		equal(rng.endContainer, editor.getBody().firstChild, 'Selection end container');
		equal(rng.endOffset, 2, 'Selection end offset');
	} else {
		// TridentSelection resolves indexed text nodes
		equal(rng.startContainer, editor.getBody().firstChild.lastChild, 'Selection start container');
		equal(rng.startOffset, 0, 'Selection start offset');
		equal(rng.endContainer, editor.getBody().firstChild.lastChild, 'Selection end container');
		equal(rng.endOffset, 0, 'Selection end offset');
	}

	editor.setContent('<p>text</p>');
	rng = editor.dom.createRng();
	rng.setStart(editor.getBody(), 0);
	rng.setEnd(editor.getBody(), 0);
	editor.selection.setRng(rng);
	editor.selection.setContent('');
	equal(editor.getContent(), '<p>text</p>', 'Set contents to empty at selection (collapsed)');
	rng = editor.selection.getRng(true);
	if (!document.createRange) {
		// The old IE selection can only be positioned in text nodes
		equal(rng.startContainer, editor.getBody().firstChild.firstChild, 'Selection start container');
		equal(rng.startOffset, 0, 'Selection start offset');
		equal(rng.endContainer, editor.getBody().firstChild.firstChild, 'Selection end container');
		equal(rng.endOffset, 0, 'Selection end offset');
	} else {
		equal(rng.startContainer, editor.getBody(), 'Selection start container');
		equal(rng.startOffset, 0, 'Selection start offset');
		equal(rng.endContainer, editor.getBody(), 'Selection end container');
		equal(rng.endOffset, 0, 'Selection end offset');
	}

	// Set selected contents, onSetContent event
	eventObj = {};

	function handler(event) {
		eventObj = event;
	}

	editor.on('SetContent', handler);
	editor.setContent('<p>text</p>');
	rng = editor.dom.createRng();
	rng.setStart(editor.getBody(), 0);
	rng.setEnd(editor.getBody(), 1);
	editor.selection.setRng(rng);
	editor.selection.setContent('<div>text</div>');
	equal(eventObj.content, '<div>text</div>', 'Set selected contents, onSetContent event');
	editor.off('SetContent', handler);
});

test('getStart/getEnd', function() {
	var rng;

	// Selected contents
	editor.setContent('<p id="a">text</p><p id="b">text</p>');
	rng = editor.dom.createRng();
	rng.setStart(editor.getBody().firstChild.firstChild, 0);
	rng.setEnd(editor.getBody().lastChild.firstChild, 0);
	editor.selection.setRng(rng);
	equal(editor.selection.getStart().id, 'a', 'Selected contents (getStart)');
	equal(editor.selection.getEnd().id, 'b', 'Selected contents (getEnd)');

	// Selected contents (collapsed)
	editor.setContent('<p id="a">text</p>\n<p id="b">text</p>');
	rng = editor.dom.createRng();
	rng.setStart(editor.getBody().firstChild.firstChild, 0);
	rng.setEnd(editor.getBody().firstChild.firstChild, 0);
	editor.selection.setRng(rng);
	equal(editor.selection.getStart().id, 'a', 'Selected contents (getStart, collapsed)');
	equal(editor.selection.getEnd().id, 'a', 'Selected contents (getEnd, collapsed)');
});

test('getBookmark/setBookmark (persistent)', function() {
	var rng, bookmark;

	// Get persistent bookmark simple text selection
	editor.setContent('text');
	rng = editor.dom.createRng();
	rng.setStart(editor.getBody().firstChild, 1);
	rng.setEnd(editor.getBody().firstChild, 3);
	editor.selection.setRng(rng);
	bookmark = editor.selection.getBookmark();
	equal(editor.getContent(), 'text', 'Editor contents (text)');
	editor.selection.moveToBookmark(bookmark);
	equal(editor.selection.getContent(), 'ex', 'Selected contents (text)');

	// Get persistent bookmark multiple elements text selection
	editor.setContent('<p>text</p>\n<p>text</p>');
	rng = editor.dom.createRng();
	rng.setStart(editor.getBody().firstChild.firstChild, 1);
	rng.setEnd(editor.getBody().lastChild.firstChild, 3);
	editor.selection.setRng(rng);
	bookmark = editor.selection.getBookmark();
	equal(editor.getContent(), '<p>text</p>\n<p>text</p>', 'Editor contents (elements)');
	editor.selection.moveToBookmark(bookmark);
	equal(editor.selection.getContent(), '<p>ext</p>\n<p>tex</p>', 'Selected contents (elements)');
});

test('getBookmark/setBookmark (simple)', function() {
	var rng, bookmark;

	// Get persistent bookmark simple text selection
	editor.setContent('text');
	rng = editor.dom.createRng();
	rng.setStart(editor.getBody().firstChild, 1);
	rng.setEnd(editor.getBody().firstChild, 3);
	editor.selection.setRng(rng);
	bookmark = editor.selection.getBookmark(1);
	equal(editor.getContent(), 'text', 'Editor contents (text)');
	editor.selection.moveToBookmark(bookmark);
	equal(editor.selection.getContent(), 'ex', 'Selected contents (text)');

	// Get persistent bookmark multiple elements text selection
	editor.setContent('<p>text</p>\n<p>text</p>');
	rng = editor.dom.createRng();
	rng.setStart(editor.getBody().firstChild.firstChild, 1);
	rng.setEnd(editor.getBody().lastChild.firstChild, 3);
	editor.selection.setRng(rng);
	bookmark = editor.selection.getBookmark(1);
	equal(editor.getContent(), '<p>text</p>\n<p>text</p>', 'Editor contents (elements)');
	editor.selection.moveToBookmark(bookmark);
	equal(editor.selection.getContent(), '<p>ext</p>\n<p>tex</p>', 'Selected contents (elements)');
});

test('getBookmark/setBookmark (nonintrusive) - simple text selection', function() {
	var rng, bookmark;

	expect(2);

	editor.setContent('text');
	rng = editor.dom.createRng();
	rng.setStart(editor.getBody().firstChild, 1);
	rng.setEnd(editor.getBody().firstChild, 3);
	editor.selection.setRng(rng);
	bookmark = editor.selection.getBookmark(2);
	equal(editor.getContent(), 'text', 'Editor contents (text)');
	editor.selection.moveToBookmark(bookmark);
	equal(editor.selection.getContent(), 'ex', 'Selected contents (text)');
});

test('getBookmark/setBookmark (nonintrusive) - Get non intrusive bookmark simple element selection', function() {
	var rng, bookmark;

	expect(1);

	// Get non intrusive bookmark simple element selection
	editor.setContent('<p>text<em>a<strong>b</strong>c</em></p>');
	rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('em')[0], 1);
	rng.setEnd(editor.dom.select('em')[0], 2);
	editor.selection.setRng(rng);
	bookmark = editor.selection.getBookmark(2);
	editor.selection.moveToBookmark(bookmark);
	equal(editor.selection.getContent(), '<strong>b</strong>', 'Selected contents (element)');
});

test('getBookmark/setBookmark (nonintrusive) - Get non intrusive bookmark multiple elements text selection', function() {
	var rng, bookmark;

	expect(2);

	// Get non intrusive bookmark multiple elements text selection
	editor.setContent('<p>text</p>\n<p>text</p>');
	rng = editor.dom.createRng();
	rng.setStart(editor.getBody().firstChild.firstChild, 1);
	rng.setEnd(editor.getBody().lastChild.firstChild, 3);
	editor.selection.setRng(rng);
	bookmark = editor.selection.getBookmark(2);
	equal(editor.getContent(), '<p>text</p>\n<p>text</p>', 'Editor contents (elements)');
	editor.selection.moveToBookmark(bookmark);
	equal(editor.selection.getContent(), '<p>ext</p>\n<p>tex</p>', 'Selected contents (elements)');
});

test('getBookmark/setBookmark (nonintrusive)', function() {
	var rng, bookmark;

	expect(2);

	// Get non intrusive bookmark multiple elements text selection fragmented
	editor.setContent('<p>text</p><p>text</p>');
	editor.dom.select('p')[0].appendChild(editor.dom.doc.createTextNode('a'));
	editor.dom.select('p')[0].appendChild(editor.dom.doc.createTextNode('a'));
	editor.dom.select('p')[0].appendChild(editor.dom.doc.createTextNode('a'));
	editor.dom.select('p')[0].appendChild(editor.dom.doc.createTextNode('text'));
	rng = editor.dom.createRng();
	rng.setStart(editor.getBody().firstChild.lastChild, 1);
	rng.setEnd(editor.getBody().lastChild.firstChild, 3);
	editor.selection.setRng(rng);
	bookmark = editor.selection.getBookmark(2);
	equal(editor.getContent(), '<p>textaaatext</p>\n<p>text</p>', 'Editor contents (fragmented, elements)');
	editor.selection.moveToBookmark(bookmark);
	equal(editor.selection.getContent(), '<p>ext</p>\n<p>tex</p>', 'Selected contents (fragmented, elements)');
});

test('getBookmark/setBookmark (nonintrusive) - fragmentext text (normalized)', function() {
	var rng, bookmark;

	expect(2);

	// Get non intrusive bookmark multiple elements text selection fragmented
	editor.setContent('<p>text</p><p>text</p>');
	editor.dom.select('p')[0].appendChild(editor.dom.doc.createTextNode('a'));
	editor.dom.select('p')[0].appendChild(editor.dom.doc.createTextNode('a'));
	editor.dom.select('p')[0].appendChild(editor.dom.doc.createTextNode('a'));
	editor.dom.select('p')[0].appendChild(editor.dom.doc.createTextNode('text'));
	rng = editor.dom.createRng();
	rng.setStart(editor.getBody().firstChild.lastChild, 1);
	rng.setEnd(editor.getBody().lastChild.firstChild, 3);
	editor.selection.setRng(rng);
	bookmark = editor.selection.getBookmark(2, true);
	editor.setContent(editor.getContent());
	equal(editor.getContent(), '<p>textaaatext</p>\n<p>text</p>', 'Editor contents (fragmented, elements)');
	editor.selection.moveToBookmark(bookmark);
	equal(editor.selection.getContent(), '<p>ext</p>\n<p>tex</p>', 'Selected contents (fragmented, elements)');
});

test('getBookmark/setBookmark (nonintrusive) - Get bookmark before image', function() {
	var rng, bookmark;

	expect(4);

	editor.setContent('<p><img src="about:blank" /></p>');
	rng = editor.dom.createRng();
	rng.setStart(editor.getBody().firstChild, 0);
	rng.setEnd(editor.getBody().firstChild, 0);
	editor.selection.setRng(rng);
	bookmark = editor.selection.getBookmark(2, true);
	editor.getBody().innerHTML = editor.getBody().innerHTML;
	editor.selection.moveToBookmark(bookmark);
	rng = editor.selection.getRng(true);
	equal(rng.startContainer, editor.getBody().firstChild);
	equal(rng.startOffset, 0);
	equal(rng.endContainer, editor.getBody().firstChild);
	equal(rng.endOffset, 0);
});

test('getBookmark/setBookmark (nonintrusive) - Get bookmark before/after image', function() {
	var rng, bookmark;

	expect(4);

	editor.setContent('<p><img src="about:blank" /></p>');
	rng = editor.dom.createRng();
	rng.setStart(editor.getBody().firstChild, 0);
	rng.setEnd(editor.getBody().firstChild, 1);
	editor.selection.setRng(rng);
	bookmark = editor.selection.getBookmark(2, true);
	editor.getBody().innerHTML = editor.getBody().innerHTML;
	editor.selection.moveToBookmark(bookmark);
	rng = editor.selection.getRng(true);
	equal(rng.startContainer, editor.getBody().firstChild);
	equal(rng.startOffset, 0);
	equal(rng.endContainer, editor.getBody().firstChild);
	equal(rng.endOffset, 1);
});

test('getBookmark/setBookmark (nonintrusive) - Get bookmark after image', function() {
	var rng, bookmark;

	expect(4);

	editor.setContent('<p><img src="about:blank" /></p>');
	rng = editor.dom.createRng();
	rng.setStart(editor.getBody().firstChild, 1);
	rng.setEnd(editor.getBody().firstChild, 1);
	editor.selection.setRng(rng);
	bookmark = editor.selection.getBookmark(2, true);
	editor.getBody().innerHTML = editor.getBody().innerHTML;
	editor.selection.moveToBookmark(bookmark);
	rng = editor.selection.getRng(true);
	equal(rng.startContainer, editor.getBody().firstChild);
	equal(rng.startOffset, 1);
	equal(rng.endContainer, editor.getBody().firstChild);
	equal(rng.endOffset, 1);
});

test('getBookmark/setBookmark (nonintrusive) - Get bookmark before element', function() {
	var rng, bookmark;

	expect(4);

	editor.setContent('abc<b>123</b>');
	rng = editor.dom.createRng();
	rng.setStart(editor.getBody().firstChild, 0);
	rng.setEnd(editor.getBody().firstChild, 2);
	editor.selection.setRng(rng);
	bookmark = editor.selection.getBookmark(2, true);
	editor.getBody().innerHTML = editor.getBody().innerHTML;
	editor.selection.moveToBookmark(bookmark);
	rng = editor.selection.getRng(true);
	equal(rng.startContainer, editor.getBody().firstChild);
	equal(rng.startOffset, 0);
	equal(rng.endContainer, editor.getBody().firstChild);
	equal(rng.endOffset, 2);
});

test('getBookmark/setBookmark (nonintrusive) - Get bookmark after element', function() {
	var rng, bookmark;

	expect(4);

	// Get bookmark after element
	editor.setContent('<b>123</b>abc');
	rng = editor.dom.createRng();
	rng.setStart(editor.getBody().lastChild, 1);
	rng.setEnd(editor.getBody().lastChild, 2);
	editor.selection.setRng(rng);
	bookmark = editor.selection.getBookmark(2, true);
	editor.getBody().innerHTML = editor.getBody().innerHTML;
	editor.selection.moveToBookmark(bookmark);
	rng = editor.selection.getRng(true);
	equal(rng.startContainer, editor.getBody().lastChild);
	equal(rng.startOffset, 1);
	equal(rng.endContainer, editor.getBody().lastChild);
	equal(rng.endOffset, 2);
});

test('getBookmark/setBookmark (nonintrusive) - Get bookmark inside element', function() {
	var rng, bookmark;

	expect(4);

	editor.setContent('abc<b>123</b>abc');
	rng = editor.dom.createRng();
	rng.setStart(editor.getBody().childNodes[1].firstChild, 1);
	rng.setEnd(editor.getBody().childNodes[1].firstChild, 2);
	editor.selection.setRng(rng);
	bookmark = editor.selection.getBookmark(2, true);
	editor.getBody().innerHTML = editor.getBody().innerHTML;
	editor.selection.moveToBookmark(bookmark);
	rng = editor.selection.getRng(true);
	equal(rng.startContainer, editor.getBody().childNodes[1].firstChild);
	equal(rng.startOffset, 1);
	equal(rng.endContainer, editor.getBody().childNodes[1].firstChild);
	equal(rng.endOffset, 2);
});

test('getBookmark/setBookmark (nonintrusive) - Get bookmark inside root text', function() {
	var rng, bookmark;

	expect(4);

	editor.setContent('abc');
	rng = editor.dom.createRng();
	rng.setStart(editor.getBody().firstChild, 1);
	rng.setEnd(editor.getBody().firstChild, 2);
	editor.selection.setRng(rng);
	bookmark = editor.selection.getBookmark(2, true);
	editor.getBody().innerHTML = editor.getBody().innerHTML;
	editor.selection.moveToBookmark(bookmark);
	rng = editor.selection.getRng(true);
	equal(rng.startContainer, editor.getBody().firstChild);
	equal(rng.startOffset, 1);
	equal(rng.endContainer, editor.getBody().firstChild);
	equal(rng.endOffset, 2);
});

test('getBookmark/setBookmark (nonintrusive) - Get bookmark inside complex html', function() {
	var rng, bookmark;

	expect(4);

	editor.setContent('<p>abc</p>123<p>123</p><p>123<b>123</b><table><tr><td>abc</td></tr></table></p>');
	editor.execCommand('SelectAll');
	Utils.setSelection('td', 1, 'td', 2);
	bookmark = editor.selection.getBookmark(2, true);
	editor.getBody().innerHTML = editor.getBody().innerHTML;
	editor.selection.moveToBookmark(bookmark);
	rng = editor.selection.getRng(true);
	equal(rng.startContainer, editor.dom.select('td')[0].firstChild);
	equal(rng.startOffset, 1);
	equal(rng.endContainer, editor.dom.select('td')[0].firstChild);
	equal(rng.endOffset, 2);
});

test('select empty TD', function() {
	editor.getBody().innerHTML = '<table><tr><td><br></td></tr></table>';
	editor.selection.select(editor.dom.select('td')[0], true);
	equal(editor.selection.getRng(true).startContainer.nodeName, 'TD');
});

test('select first p', 2, function() {
	editor.setContent('<p>text1</p><p>text2</p>');
	editor.selection.select(editor.dom.select('p')[0]);
	equal(editor.selection.getContent(), '<p>text1</p>', 'Select simple element, content');
	equal(editor.selection.getStart().nodeName, 'P', 'Select simple element, nodeName');
});

test('select table', 2, function() {
	editor.setContent('<table><tbody><tr><td>text1</td></tr></tbody></table>');
	editor.selection.select(editor.dom.select('table')[0]);
	equal(editor.selection.getContent(), '<table>\n<tbody>\n<tr>\n<td>text1</td>\n</tr>\n</tbody>\n</table>', 'Select complex element, content');
	equal(editor.selection.getNode().nodeName, 'TABLE', 'Select complex element, nodeName');
});

test('select table text 1', 2, function() {
	editor.setContent('<table><tbody><tr><td id="a">text1</td><td id="b">text2</td></tr></tbody></table>');
	editor.selection.select(editor.dom.select('table')[0], true);
	equal(editor.selection.getStart().id, 'a', 'Expand to text content 1 (start)');
	equal(editor.selection.getEnd().id, 'b', 'Expand to text content 1 (end)');
});

test('select table text 2', 2, function() {
	editor.setContent('<table><tbody><tr><td id="a"><br /></td><td id="b"><br /></td></tr></tbody></table>');
	editor.selection.select(editor.dom.select('table')[0], true);
	equal(editor.dom.getParent(editor.selection.getStart(), 'td').id, 'a', 'Expand to text content 2 (start)');
	equal(editor.dom.getParent(editor.selection.getEnd(), 'td').id, 'b', 'Expand to text content 2 (end)');
});

test('getNode', function() {
	var rng;

	editor.setContent('<p id="p1"><span id="s1">span1</span> word <span id="s2">span2</span> word <span id="s3">span3</span></p>');
	rng = editor.dom.createRng();
	rng.setStart(editor.dom.get('s1').firstChild, 0);
	rng.setEnd(editor.dom.get('s1').nextSibling, 0);
	editor.selection.setRng(rng);
	deepEqual(editor.selection.getNode(), editor.dom.get('s1'), 'Detect selection ends immediately after node at start of paragraph.');

	rng = editor.dom.createRng();
	rng.setStart(editor.dom.get('s2').previousSibling, editor.dom.get('s2').previousSibling.length);
	rng.setEnd(editor.dom.get('s2').nextSibling, 0);
	editor.selection.setRng(rng);
	deepEqual(editor.selection.getNode(), editor.dom.get('s2'), 'Detect selection immediately surrounds node in middle of paragraph.');

	rng = editor.dom.createRng();
	rng.setStart(editor.dom.get('s3').previousSibling, editor.dom.get('s3').previousSibling.length);
	rng.setEnd(editor.dom.get('s3').lastChild, editor.dom.get('s3').lastChild.length);
	editor.selection.setRng(rng);
	deepEqual(editor.selection.getNode(), editor.dom.get('s3'), 'Detect selection starts immediately before node at end of paragraph.');

	rng = editor.dom.createRng();
	rng.setStart(editor.dom.get('s2').previousSibling, editor.dom.get('s2').previousSibling.length);
	rng.setEnd(editor.dom.get('s3').lastChild, editor.dom.get('s3').lastChild.length);
	editor.selection.setRng(rng);
	deepEqual(editor.selection.getNode(), editor.dom.get('p1'), 'Detect selection wrapping multiple nodes does not collapse.');
});

test('normalize to text node from document', function() {
	var rng;

	if (tinymce.isOpera || tinymce.isIE) {
		ok(true, "Skipped on Opera/IE since Opera doesn't let you to set the range to document and IE will steal focus.");
		return;
	}

	editor.setContent('<p>text</p>');
	rng = editor.dom.createRng();
	rng.setStart(editor.getDoc(), 0);
	rng.setEnd(editor.getDoc(), 0);
	editor.selection.setRng(rng);
	editor.selection.normalize();

	rng = editor.selection.getRng(true);
	equal(rng.startContainer.nodeType, 3, 'startContainer node type');
	equal(rng.startOffset, 0, 'startContainer offset');
	equal(rng.endContainer.nodeType, 3, 'endContainer node type');
	equal(rng.endOffset, 0, 'endOffset offset');
});

test('normalize to br from document', function() {
	var rng;

	if (tinymce.isOpera || tinymce.isIE) {
		ok(true, "Skipped on Opera/IE since Opera doesn't let you to set the range to document and IE will steal focus.");
		return;
	}

	editor.setContent('<p><br /></p>');
	rng = editor.dom.createRng();
	rng.setStart(editor.getDoc(), 0);
	rng.setEnd(editor.getDoc(), 0);
	editor.selection.setRng(rng);
	editor.selection.normalize();

	rng = editor.selection.getRng(true);
	equal(rng.startContainer.nodeName, 'P', 'startContainer node name');
	equal(rng.startContainer.nodeType, 1, 'startContainer node type');
	equal(rng.startOffset, 0, 'startContainer offset');
	equal(rng.endContainer.nodeType, 1, 'endContainer node type');
	equal(rng.endOffset, 0, 'endOffset offset');
});

// Only run on browser with W3C DOM Range support
if (tinymce.Env.range) {
	test('normalize with contentEditable:false element', function() {
		var rng;

		editor.setContent('<p>a<b contentEditable="false">b</b>c</p>');
		rng = editor.dom.createRng();
		rng.setStart(editor.getBody().firstChild.lastChild, 0);
		rng.setEnd(editor.getBody().firstChild.lastChild, 0);
		editor.selection.setRng(rng);
		editor.selection.normalize();

		rng = editor.selection.getRng(true);
		equal(rng.collapsed, true);
		equal(rng.startContainer.nodeType, 3);
		equal(rng.startContainer.data, 'c');
	});

	test('normalize with contentEditable:false parent and contentEditable:true child element', function() {
		editor.setContent('<p contentEditable="false">a<em contentEditable="true">b</em></p>');
		Utils.setSelection('em', 0);
		editor.selection.normalize();

		var rng = editor.selection.getRng(true);
		equal(rng.collapsed, true);
		equal(rng.startContainer.nodeType, 3);
		equal(rng.startContainer.data, 'b');
	});

	test('normalize with contentEditable:true parent and contentEditable:false child element', function() {
		editor.setContent('<p contentEditable="true">a<em contentEditable="false">b</em></p>');
		Utils.setSelection('em', 0);
		editor.selection.normalize();

		var rng = editor.selection.getRng(true);
		equal(rng.collapsed, true);
		equal(rng.startContainer.nodeType, 3);
		equal(rng.startContainer.data, 'a');

		// Excluding assert on IE since it's a minor issue
		if (tinymce.ie) {
			equal(rng.startOffset, 1);
		}
	});

	test('normalize to text node from body', function() {
		var rng;

		editor.setContent('<p>text</p>');
		rng = editor.dom.createRng();
		rng.setStart(editor.getBody(), 0);
		rng.setEnd(editor.getBody(), 0);
		editor.selection.setRng(rng);
		editor.selection.normalize();

		rng = editor.selection.getRng(true);
		equal(rng.startContainer.nodeType, 3, 'startContainer node type');
		equal(rng.startOffset, 0, 'startContainer offset');
		equal(rng.endContainer.nodeType, 3, 'endContainer node type');
		equal(rng.endOffset, 0, 'endOffset offset');
	});

	test('normalize to br from body', function() {
		var rng;

		editor.setContent('<p><br /></p>');
		rng = editor.dom.createRng();
		rng.setStart(editor.getBody(), 0);
		rng.setEnd(editor.getBody(), 0);
		editor.selection.setRng(rng);
		editor.selection.normalize();

		rng = editor.selection.getRng(true);
		equal(rng.startContainer.nodeName, 'P', 'startContainer node name');
		equal(rng.startContainer.nodeType, 1, 'startContainer node type');
		equal(rng.startOffset, 0, 'startContainer offset');
		equal(rng.endContainer.nodeType, 1, 'endContainer node type');
		equal(rng.endOffset, 0, 'endOffset offset');
	});

	test('normalize ignore img', function() {
		var rng;

		editor.getBody().innerHTML = '<img src="about:blank " />';
		rng = editor.dom.createRng();
		rng.setStart(editor.getBody(), 0);
		rng.setEnd(editor.getBody(), 1);
		editor.selection.setRng(rng);
		editor.selection.normalize();

		rng = editor.selection.getRng(true);
		equal(rng.startContainer.nodeName, 'BODY', 'startContainer node name');
		equal(rng.startContainer.nodeType, 1, 'startContainer node type');
		equal(rng.startOffset, 0, 'startContainer offset');
		equal(rng.endContainer.nodeName, 'BODY', 'endContainer node name');
		equal(rng.endContainer.nodeType, 1, 'endContainer node type');
		equal(rng.endOffset, 1, 'endOffset offset');
	});

	test('normalize to before/after img', function() {
		var rng;

		editor.getBody().innerHTML = '<p><img src="about:blank " /></p>';
		rng = editor.dom.createRng();
		rng.setStart(editor.getBody(), 0);
		rng.setEnd(editor.getBody(), 1);
		editor.selection.setRng(rng);
		editor.selection.normalize();

		rng = editor.selection.getRng(true);
		equal(rng.startContainer.nodeName, 'P', 'startContainer node name');
		equal(rng.startContainer.nodeType, 1, 'startContainer node type');
		equal(rng.startOffset, 0, 'startContainer offset');
		equal(rng.endContainer.nodeName, 'P', 'endContainer node name');
		equal(rng.endContainer.nodeType, 1, 'endContainer node type');
		equal(rng.endOffset, 1, 'endOffset offset');
	});

	test('normalize to text node inside P', function() {
		var rng;

		editor.getBody().innerHTML = '<p>abc</p>';
		rng = editor.dom.createRng();
		rng.setStart(editor.getBody(), 0);
		rng.setEnd(editor.getBody(), 1);
		editor.selection.setRng(rng);
		editor.selection.normalize();

		rng = editor.selection.getRng(true);
		equal(rng.startContainer.nodeName, '#text', 'startContainer node name');
		equal(rng.startOffset, 0, 'startContainer offset');
		equal(rng.endContainer.nodeName, '#text', 'endContainer node name');
		equal(rng.endOffset, 3, 'endOffset offset');
	});

	test('normalize lean left if at the start of text node', function() {
		var rng;

		editor.getBody().innerHTML = '<p><b>a</b><i>b</i></p>';
		Utils.setSelection('i', 0);
		editor.selection.normalize();

		rng = editor.selection.getRng(true);
		equal(rng.startContainer.nodeName, '#text', 'startContainer node name');
		equal(rng.startContainer.parentNode.nodeName, 'B');
		equal(rng.startOffset, 1, 'startContainer offset');
		equal(rng.endContainer.nodeName, '#text');
		equal(rng.endContainer.parentNode.nodeName, 'B');
		equal(rng.endOffset, 1, 'endOffset offset');
	});

	test('normalize lean start to the right if at end of text node', function() {
		var rng;

		editor.getBody().innerHTML = '<p><b>a</b><i>b</i></p>';
		Utils.setSelection('b', 1, 'i', 1);
		editor.selection.normalize();

		rng = editor.selection.getRng(true);
		equal(rng.startContainer.nodeName, '#text', 'startContainer node name');
		equal(rng.startContainer.parentNode.nodeName, 'I');
		equal(rng.startOffset, 0, 'startContainer offset');
		equal(rng.endContainer.nodeName, '#text');
		equal(rng.endContainer.parentNode.nodeName, 'I');
		equal(rng.endOffset, 1, 'endOffset offset');
	});

	test('normalize lean left but break before br', function() {
		var rng;

		editor.getBody().innerHTML = '<p>a<br><b>b</b></p>';
		Utils.setSelection('b', 0);
		editor.selection.normalize();

		rng = editor.selection.getRng(true);
		equal(rng.startContainer.nodeValue, 'b');
		equal(rng.startOffset, 0);
	});

	test('normalize lean left but break before img', function() {
		var rng;

		editor.getBody().innerHTML = '<p>a<img><b>b</b></p>';
		Utils.setSelection('b', 0);
		editor.selection.normalize();

		rng = editor.selection.getRng(true);
		equal(rng.startContainer.nodeValue, 'b');
		equal(rng.startOffset, 0);
	});

	test('normalize lean left but don\'t walk out the parent block', function() {
		var rng;

		editor.getBody().innerHTML = '<p>a</p><p><b>b</b></p>';
		Utils.setSelection('b', 0);
		editor.selection.normalize();

		rng = editor.selection.getRng(true);
		equal(rng.startContainer.nodeValue, 'b');
		equal(rng.startOffset, 0);
	});

	test('normalize lean left into empty inline elements when caret is before br', function() {
		var rng;

		editor.getBody().innerHTML = '<p><i><b></b></i><br /></p>';
		rng = editor.dom.createRng();
		rng.setStartBefore(editor.getBody().firstChild.lastChild);
		rng.setEndBefore(editor.getBody().firstChild.lastChild);
		editor.selection.setRng(rng);
		editor.selection.normalize();

		rng = editor.selection.getRng(true);
		equal(rng.startContainer.nodeName, 'B');
		equal(rng.startOffset, 0);
	});

	test('normalize don\'t lean left into empty inline elements if there is a br element after caret', function() {
		var rng;

		editor.getBody().innerHTML = '<p><i><b></b></i><br /><br /></p>';
		rng = editor.dom.createRng();
		rng.setStartBefore(editor.getBody().firstChild.lastChild);
		rng.setEndBefore(editor.getBody().firstChild.lastChild);
		editor.selection.setRng(rng);
		editor.selection.normalize();

		rng = editor.selection.getRng(true);
		equal(rng.startContainer.nodeName, 'P');
		equal(rng.startOffset, 2);
	});

	test('normalize don\'t lean left into empty inline elements if there is a br element before caret', function() {
		var rng;

		editor.getBody().innerHTML = '<p><i><b><br /></b></i><br /></p>';
		rng = editor.dom.createRng();
		rng.setStartBefore(editor.getBody().firstChild.lastChild);
		rng.setEndBefore(editor.getBody().firstChild.lastChild);
		editor.selection.setRng(rng);
		editor.selection.normalize();

		rng = editor.selection.getRng(true);
		equal(rng.startContainer.nodeName, 'P');
		equal(rng.startOffset, 1);
	});

	test('normalize don\'t move start/end if it\'s before/after table', function() {
		var rng;

		editor.getBody().innerHTML = '<table><tr><td>X</td></tr></table>';
		rng = editor.dom.createRng();
		rng.setStartBefore(editor.getBody().firstChild);
		rng.setEndAfter(editor.getBody().lastChild);
		editor.selection.setRng(rng);
		editor.selection.normalize();

		rng = editor.selection.getRng(true);
		equal(rng.startContainer.nodeName, 'BODY');
		equal(rng.startOffset, 0);
		equal(rng.endContainer.nodeName, 'BODY');
		equal(rng.endOffset, 1);
	});

	test('normalize after paragraph', function() {
		var rng;

		editor.getBody().innerHTML = '<p>a</p>';
		rng = editor.dom.createRng();
		rng.setStartAfter(editor.getBody().firstChild);
		rng.setEndAfter(editor.getBody().lastChild);
		editor.selection.setRng(rng);
		editor.selection.normalize();

		rng = editor.selection.getRng(true);
		equal(rng.startContainer.nodeName, '#text');
		equal(rng.startOffset, 1);
		equal(rng.endContainer.nodeName, '#text');
		equal(rng.endOffset, 1);
	});

	test('normalize caret after trailing BR', function() {
		var rng;

		editor.setContent('<p>a<br /></p>');
		rng = editor.dom.createRng();
		rng.setStart(editor.getBody().firstChild, 2);
		rng.setEnd(editor.getBody().firstChild, 2);
		editor.selection.setRng(rng);
		editor.selection.normalize();

		rng = editor.selection.getRng(true);
		equal(rng.startContainer.nodeName, '#text', 'startContainer node name');
		equal(rng.startOffset, 1, 'startContainer offset');
		equal(rng.endContainer.nodeName, '#text', 'endContainer node name');
		equal(rng.endOffset, 1, 'endOffset offset');
	});

	test('normalize caret after bogus block BR', function() {
		var rng;

		editor.setContent('<p><br /></p>');
		rng = editor.dom.createRng();
		rng.setStart(editor.getBody().firstChild, 1);
		rng.setEnd(editor.getBody().firstChild, 1);
		editor.selection.setRng(rng);
		editor.selection.normalize();

		rng = editor.selection.getRng(true);
		equal(rng.startContainer.nodeName, 'P', 'startContainer node name');
		equal(rng.startOffset, 0, 'startContainer offset');
		equal(rng.endContainer.nodeName, 'P', 'endContainer node name');
		equal(rng.endOffset, 0, 'endOffset offset');
	});

/*
	test('normalize caret after last BR in block', function() {
		var rng;

		editor.setContent('<p><br /><br /></p>');
		rng = editor.dom.createRng();
		rng.setStart(editor.getBody().firstChild, 2);
		rng.setEnd(editor.getBody().firstChild, 2);
		editor.selection.setRng(rng);
		editor.selection.normalize();

		rng = editor.selection.getRng(true);
		equal(rng.startContainer.nodeName, 'P', 'startContainer node name');
		equal(rng.startOffset, 1, 'startContainer offset');
		equal(rng.endContainer.nodeName, 'P', 'endContainer node name');
		equal(rng.endOffset, 1, 'endOffset offset');
	});
*/

	test('normalize caret after double BR', function() {
		var rng;

		editor.setContent('<p>a<br /><br /></p>');
		rng = editor.dom.createRng();
		rng.setStart(editor.getBody().firstChild, 3);
		rng.setEnd(editor.getBody().firstChild, 3);
		editor.selection.setRng(rng);
		editor.selection.normalize();

		rng = editor.selection.getRng(true);
		equal(rng.startContainer.nodeName, 'P', 'startContainer node name');
		equal(rng.startOffset, 3, 'startContainer offset');
		equal(rng.endContainer.nodeName, 'P', 'endContainer node name');
		equal(rng.endOffset, 3, 'endOffset offset');
	});
}

test('custom elements', function() {
	var rng;

	editor.setContent('<custom1>test</custom1><custom2>test</custom2>');

	rng = editor.dom.createRng();
	rng.setStart(editor.getBody(), 0);
	rng.setEnd(editor.getBody(), 2);
	editor.selection.setRng(rng);

	equal(editor.selection.getContent(), '<custom1>test</custom1><custom2>test</custom2>');
});

test('selectorChanged', function() {
	var newState, newArgs;

	editor.selection.selectorChanged('a[href]', function(state, args) {
		newState = state;
		newArgs = args;
	});

	editor.getBody().innerHTML = '<p><a href="#">text</a></p>';
	Utils.setSelection('a', 0, 'a', 4);
	editor.nodeChanged();

	ok(newState);
	equal(newArgs.selector, 'a[href]');
	equal(newArgs.node, editor.getBody().firstChild.firstChild);
	equal(newArgs.parents.length, 2);

	editor.getBody().innerHTML = '<p>text</p>';
	Utils.setSelection('p', 0, 'p', 4);
	editor.nodeChanged();
	equal(newArgs.selector, 'a[href]');
	equal(newArgs.node, editor.getBody().firstChild);
	equal(newArgs.parents.length, 1);
});

test('setRng', function() {
	var rng = editor.dom.createRng();

	editor.setContent('<p>x</p>');
	rng.setStart(editor.$('p')[0].firstChild, 0);
	rng.setEnd(editor.$('p')[0].firstChild, 1);

	editor.selection.setRng(rng);
	editor.selection.setRng(null);

	rng = editor.selection.getRng(true);
	equal(rng.startContainer.nodeName, '#text');
	equal(rng.startOffset, 0);
	equal(rng.endContainer.nodeName, '#text');
	equal(rng.endOffset, 1);
});
