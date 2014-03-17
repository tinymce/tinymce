module("tinymce.dom.TridentSelection", {
	setupModule: function() {
		if (window.getSelection) {
			return;
		}

		QUnit.stop();
		document.getElementById('view').innerHTML = '<textarea></textarea>';

		tinymce.init({
			selector: "textarea",
			elements: "elm1",
			add_unload_trigger: false,
			disable_nodechange: true,
			skin: false,
			init_instance_callback: function(ed) {
				window.editor = ed;
				QUnit.start();
			}
		});
	}
});

if (!window.getSelection) {
	test("Selection of element containing text", function(){
		expect(5);
		
		editor.setContent('<p>123</p>', {
			format: 'raw'
		});
		
		var rng = editor.dom.createRng();
		rng.setStart(editor.getBody(), 0);
		rng.setEnd(editor.getBody(), 1);
		editor.selection.setRng(rng);
		
		rng = editor.selection.getRng(1);
		equal(rng.startContainer.nodeName, '#text', 'Start container is text node');
		equal(rng.endContainer.nodeName, '#text', 'End container is text node');
		equal(rng.startOffset, 0, 'Start of text node');
		equal(rng.endOffset, 3, 'End of text node');
		equal(editor.dom.getOuterHTML(rng.cloneContents()), '123', 'Contents matches');
	});
	
	test("Single image selection", function(){
		expect(6);
		
		editor.setContent('<p><img src="about:blank" /></p>', {
			format: 'raw'
		});
		
		var rng = editor.dom.createRng();
		rng.setStartBefore(editor.dom.select('img')[0]);
		rng.setEndAfter(editor.dom.select('img')[0]);
		editor.selection.setRng(rng);
		
		rng = editor.selection.getRng(1);
		equal(rng.startContainer.nodeName, 'P', 'Check startContainer');
		equal(rng.endContainer.nodeName, 'P', 'Check endContainer');
		equal(rng.startOffset, 0, 'Check startOffset');
		equal(rng.endOffset, 1, 'Check endOffset');
		equal(Utils.cleanHtml(editor.dom.getOuterHTML(rng.cloneContents()).toLowerCase()), '<img src="about:blank">', 'Check contents');
		ok(editor.selection.getRng().item, 'Check if it\'s a control selection');
	});
	
	test("Multiple image selection", function(){
		expect(6);
		
		editor.setContent('<p><img src="about:blank" /><img src="about:blank" /></p>', {
			format: 'raw'
		});
		
		var rng = editor.dom.createRng();
		rng.setStartBefore(editor.dom.select('img')[0]);
		rng.setEndAfter(editor.dom.select('img')[1]);
		editor.selection.setRng(rng);
		
		rng = editor.selection.getRng(1);
		equal(rng.startContainer.nodeName, 'P');
		equal(rng.endContainer.nodeName, 'P');
		equal(rng.startOffset, 0);
		equal(rng.endOffset, 2);
		equal(editor.dom.getOuterHTML(rng.cloneContents()).toLowerCase(), '<img src="about:blank"><img src="about:blank">');
		ok(editor.selection.getRng().parentElement, 'Is text selection');
	});
	
	test("Text node selection", function(){
		expect(5);
		
		editor.setContent('<p>1234</p>', {
			format: 'raw'
		});
		
		var rng = editor.dom.createRng();
		rng.setStart(editor.getBody().firstChild.firstChild, 1);
		rng.setEnd(editor.getBody().firstChild.firstChild, 3);
		editor.selection.setRng(rng);
		
		rng = editor.selection.getRng(1);
		equal(rng.startContainer.nodeName, '#text');
		equal(rng.endContainer.nodeName, '#text');
		equal(rng.startOffset, 1);
		equal(rng.endOffset, 3);
		equal(editor.dom.getOuterHTML(rng.cloneContents()), '23');
	});
	
	test("Text node selection between two elements", function(){
		expect(5);
		
		editor.setContent('<p>1234</p><p>abcd</p>', {
			format: 'raw'
		});
		
		var rng = editor.dom.createRng();
		rng.setStart(editor.getBody().firstChild.firstChild, 1);
		rng.setEnd(editor.getBody().childNodes[1].firstChild, 3);
		editor.selection.setRng(rng);
		
		rng = editor.selection.getRng(1);
		equal(rng.startContainer.nodeName, '#text');
		equal(rng.endContainer.nodeName, '#text');
		equal(rng.startOffset, 1);
		equal(rng.endOffset, 3);
		equal(editor.dom.getOuterHTML(rng.cloneContents()).replace(/[\r\n]/g, '').toLowerCase(), '<p>234</p><p>abc</p>');
		
		editor.setContent('<p>1</p><p>1234</p><p>abcd</p><p>2</p>', {
			format: 'raw'
		});
	});
	
	test("Mixed selection start at element end at text", function(){
		expect(5);
		
		editor.setContent('<p><img src="about:blank" />text</p>', {
			format: 'raw'
		});
		
		var rng = editor.dom.createRng();
		rng.setStartBefore(editor.dom.select('img')[0]);
		rng.setEnd(editor.getBody().firstChild.lastChild, 3);
		editor.selection.setRng(rng);
		
		rng = editor.selection.getRng(1);
		equal(rng.startContainer.nodeName, 'P');
		equal(rng.endContainer.nodeName, '#text');
		equal(rng.startOffset, 0);
		equal(rng.endOffset, 3);
		equal(editor.dom.getOuterHTML(rng.cloneContents()).toLowerCase(), '<img src="about:blank">tex');
	});
	
	test("Mixed selection start at text end at element", function(){
		expect(5);
		
		editor.setContent('<p>text<img src="about:blank" /></p>', {
			format: 'raw'
		});
		
		var rng = editor.dom.createRng();
		rng.setStart(editor.getBody().firstChild.firstChild, 1);
		rng.setEndAfter(editor.getBody().firstChild.lastChild);
		editor.selection.setRng(rng);
		
		rng = editor.selection.getRng(1);
		
		equal(rng.startContainer.nodeName, '#text');
		equal(rng.startOffset, 1);
		
		equal(rng.endContainer.nodeName, 'P');
		equal(rng.endOffset, 2);
		
		equal(editor.dom.getOuterHTML(rng.cloneContents()).toLowerCase(), 'ext<img src="about:blank">');
	});
	
	test("Caret position before image", function(){
		expect(4);
		
		editor.setContent('<p><img src="about:blank" /><img src="about:blank" /></p>', {
			format: 'raw'
		});
		
		var rng = editor.dom.createRng();
		rng.setStartBefore(editor.dom.select('img')[0]);
		rng.setEndBefore(editor.dom.select('img')[0]);
		editor.selection.setRng(rng);
		
		rng = editor.selection.getRng(1);
		equal(rng.startContainer.nodeName, 'P');
		equal(rng.endContainer.nodeName, 'P');
		equal(rng.startOffset, 0);
		equal(rng.endOffset, 0);
	});
	
	test("Caret position between images", function(){
		expect(4);
		
		editor.setContent('<p><img src="about:blank" /><img src="about:blank" /></p>', {
			format: 'raw'
		});
		
		var rng = editor.dom.createRng();
		rng.setStartAfter(editor.dom.select('img')[0]);
		rng.setEndAfter(editor.dom.select('img')[0]);
		editor.selection.setRng(rng);
		
		rng = editor.selection.getRng(1);
		equal(rng.startContainer.nodeName, 'P');
		equal(rng.endContainer.nodeName, 'P');
		equal(rng.startOffset, 1);
		equal(rng.endOffset, 1);
	});
	
	test("Caret position after image", function(){
		expect(4);
		
		editor.setContent('<p><img src="about:blank" /><img src="about:blank" /></p>', {
			format: 'raw'
		});
		
		var rng = editor.dom.createRng();
		rng.setStartAfter(editor.dom.select('img')[1]);
		rng.setEndAfter(editor.dom.select('img')[1]);
		editor.selection.setRng(rng);
		
		rng = editor.selection.getRng(1);
		equal(rng.startContainer.nodeName, 'P');
		equal(rng.endContainer.nodeName, 'P');
		equal(rng.startOffset, 2);
		equal(rng.endOffset, 2);
	});
	
	test("Selection of empty text element", function(){
		expect(6);
		
		editor.setContent('<div></div>', {
			format: 'raw'
		});
		
		var rng = editor.dom.createRng();
		rng.setStart(editor.getBody(), 0);
		rng.setEnd(editor.getBody(), 1);
		editor.selection.setRng(rng);
		
		rng = editor.selection.getRng(true);
		equal(rng.startContainer.nodeName, 'BODY');
		equal(rng.endContainer.nodeName, 'BODY');
		equal(rng.startOffset, 0);
		equal(rng.endOffset, 1);
		equal(rng.startContainer.childNodes[0].innerHTML, '');
		equal(editor.dom.getOuterHTML(rng.cloneContents()).toLowerCase(), '<div></div>');
	});

	test("Selection of empty text element with caret inside", function(){
		expect(6);
		
		editor.setContent('<div></div>', {
			format: 'raw'
		});
		
		var rng = editor.dom.createRng();
		rng.setStart(editor.getBody().firstChild, 0);
		rng.setEnd(editor.getBody().firstChild, 0);
		editor.selection.setRng(rng);
		
		rng = editor.selection.getRng(true);
		equal(rng.startContainer.nodeName, 'DIV');
		equal(rng.endContainer.nodeName, 'DIV');
		equal(rng.startOffset, 0);
		equal(rng.endOffset, 0);
		equal(rng.startContainer.innerHTML, '');
		equal(editor.dom.getOuterHTML(rng.cloneContents()).toLowerCase(), '');
	});

	/*test("Caret position before table", function() {
		var table, rng;

		editor.focus();
		editor.setContent('<p>Before</p><table id="table" border="1"><tr><td>Cell 1</td><td>Cell 2</td></tr><tr><td>Cell 3</td><td>Cell 4</td></tr></table><p>After</p>');

		table = editor.dom.get('table');
		rng = editor.selection.getRng();
		rng.moveToElementText(table);
		rng.move('character', -1);
		rng.select();

		rng = editor.selection.getRng(1);
		equal(rng.startContainer.nodeName, 'BODY');
		equal(rng.startOffset, 1);
		equal(rng.endContainer.nodeName, 'BODY');
		equal(rng.endOffset, 1);
	});*/

	test("Selection end within empty element", function() {
		var rng;

		editor.focus();
		editor.getBody().innerHTML = '<p>123</p><p></p>';

		rng = editor.execCommand('SelectAll');

		rng = editor.selection.getRng(true);
		equal(rng.startContainer.nodeName, '#text');
		equal(rng.startOffset, 0);
		equal(rng.endContainer.nodeName, 'BODY');
		equal(rng.endOffset, 2);
	});

	test("Selection after paragraph", function() {
		var rng;

		editor.focus();
		editor.getBody().innerHTML = '<p>123</p><p>abcd</p>';

		rng = editor.dom.createRng();
		rng.setStart(editor.getBody().firstChild, 1);
		rng.setEnd(editor.getBody().firstChild, 1);
		editor.selection.setRng(rng);

		rng = editor.selection.getRng(true);
		ok(rng.startContainer == rng.endContainer);
		equal(rng.startContainer.nodeName, '#text');
		equal(rng.startOffset, 3);
		equal(rng.endContainer.nodeName, '#text');
		equal(rng.endOffset, 3);
	});

	test("Selection of text outside of a block element", function() {
		var r;
		
		editor.settings.forced_root_block = '';
		editor.focus();
		editor.getBody().innerHTML = '<ul><li>Item</li></ul>Text';

		r = editor.dom.createRng();
		r.setStart(editor.getBody().lastChild, 2);
		r.setEnd(editor.getBody().lastChild, 2);
		editor.selection.setRng(r);

		r = editor.selection.getRng(true);
		equal(r.startContainer, editor.getBody().lastChild, "Start container is text node.");
		equal(r.endContainer, editor.getBody().lastChild, "End container is text node.");
		equal(r.startOffset, 2);
		equal(r.endOffset, 2);

		equal(editor.selection.getStart(), editor.getBody(), "Selection start is body.");
		deepEqual(editor.selection.getSelectedBlocks(), [], "No blocks selected.");
	});

	test("Resizable element text selection", function() {
		var r;

		editor.getBody().innerHTML = '<div style="width: 100px; height:100px;"><table><tr><td>.</td></tr></table>abc</div>';
		editor.focus();

		r = editor.dom.createRng();
		r.setStart(editor.getBody().firstChild.lastChild, 1);
		r.setEnd(editor.getBody().firstChild.lastChild, 2);
		editor.selection.setRng(r);

		r = editor.selection.getRng(true);
		equal(r.startContainer, editor.getBody().firstChild.lastChild, "Start container is text node.");
		equal(r.endContainer, editor.getBody().firstChild.lastChild, "End container is text node.");
		equal(r.startOffset, 1);
		equal(r.endOffset, 2);
	});

	test("Resizable element before table selection", function() {
		var r;

		editor.getBody().innerHTML = '<div style="width: 100px; height:100px;"><table><tr><td>.</td></tr></table></div>';
		editor.focus();

		r = editor.dom.createRng();
		r.setStart(editor.getBody().firstChild, 0);
		r.setEnd(editor.getBody().firstChild, 0);
		editor.selection.setRng(r);

		r = editor.selection.getRng(true);
		equal(r.startContainer, editor.getBody().firstChild, "Start container is div node.");
		equal(r.endContainer, editor.getBody().firstChild, "End container is div node.");
		equal(r.startOffset, 0);
		equal(r.endOffset, 0);
	});

	test("Fragmented text nodes after element", function() {
		var r;

		editor.getBody().innerHTML = '<b>x</b>';
		editor.getBody().appendChild(editor.getDoc().createTextNode('1'));
		editor.getBody().appendChild(editor.getDoc().createTextNode('23'));
		editor.getBody().appendChild(editor.getDoc().createTextNode('456'));
		editor.getBody().appendChild(editor.getDoc().createTextNode('7890'));
		editor.focus();

		r = editor.dom.createRng();
		r.setStart(editor.getBody().lastChild, 1);
		r.setEnd(editor.getBody().lastChild, 1);
		editor.selection.setRng(r);

		r = editor.selection.getRng(true);
		equal(r.startContainer, editor.getBody().lastChild, "Start container is last text node.");
		equal(r.endContainer, editor.getBody().lastChild, "End container is last text node.");
		equal(r.startOffset, 1);
		equal(r.endOffset, 1);

		r = editor.dom.createRng();
		r.setStart(editor.getBody().childNodes[2], 2);
		r.setEnd(editor.getBody().childNodes[2], 2);
		editor.selection.setRng(r);

		r = editor.selection.getRng(true);
		equal(r.startContainer, editor.getBody().childNodes[2], "Start container is second text node.");
		equal(r.endContainer, editor.getBody().childNodes[2], "End container is second text node.");
		equal(r.startOffset, 2);
		equal(r.endOffset, 2);

		r = editor.dom.createRng();
		r.setStart(editor.getBody().childNodes[3], 0);
		r.setEnd(editor.getBody().childNodes[3], 1);
		editor.selection.setRng(r);

		r = editor.selection.getRng(true);
		equal(r.startContainer, editor.getBody().childNodes[2], "Start container is second text node (lean left).");
		equal(r.endContainer, editor.getBody().childNodes[3], "End container is third text node.");
		equal(r.startOffset, 2);
		equal(r.endOffset, 1);
	});

	test("Fragmented text nodes before element", function() {
		var r;

		editor.getBody().innerHTML = '';
		editor.getBody().appendChild(editor.getDoc().createTextNode('1'));
		editor.getBody().appendChild(editor.getDoc().createTextNode('23'));
		editor.getBody().appendChild(editor.getDoc().createTextNode('456'));
		editor.getBody().appendChild(editor.getDoc().createTextNode('7890'));
		editor.getBody().appendChild(editor.dom.create('b', null, 'x'));
		editor.focus();

		r = editor.dom.createRng();
		r.setStart(editor.getBody().childNodes[3], 1);
		r.setEnd(editor.getBody().childNodes[3], 1);
		editor.selection.setRng(r);

		r = editor.selection.getRng(true);
		equal(r.startContainer, editor.getBody().childNodes[3], "Start container is last text node.");
		equal(r.endContainer, editor.getBody().childNodes[3], "End container is last text node.");
		equal(r.startContainer.nodeValue, '7890');
		equal(r.startOffset, 1);
		equal(r.endOffset, 1);

		r = editor.dom.createRng();
		r.setStart(editor.getBody().childNodes[1], 2);
		r.setEnd(editor.getBody().childNodes[1], 2);
		editor.selection.setRng(r);

		r = editor.selection.getRng(true);
		equal(r.startContainer, editor.getBody().childNodes[2], "Start container is second text node. (lean right)");
		equal(r.endContainer, editor.getBody().childNodes[2], "End container is second text node.");
		equal(r.startContainer.nodeValue, '456');
		equal(r.startOffset, 0);
		equal(r.endOffset, 0);

		r = editor.dom.createRng();
		r.setStart(editor.getBody().childNodes[1], 0);
		r.setEnd(editor.getBody().childNodes[1], 1);
		editor.selection.setRng(r);

		r = editor.selection.getRng(true);
		equal(r.startContainer, editor.getBody().childNodes[1], "Start container is second text node.");
		equal(r.endContainer, editor.getBody().childNodes[1], "End container is third text node.");
		equal(r.startContainer.nodeValue, '23');
		equal(r.endContainer.nodeValue, '23');
		equal(r.startOffset, 0);
		equal(r.endOffset, 1);
	});

	test("Non contentEditable elements", function() {
		var r;

		editor.getBody().innerHTML = '<span contentEditable="false">a</span><span contentEditable="false">a</span><span contentEditable="false">a</span>';
		editor.focus();

		r = editor.dom.createRng();
		r.setStart(editor.getBody(), 0);
		r.setEnd(editor.getBody(), 0);
		editor.selection.setRng(r);

		r = editor.selection.getRng(true);
		equal(r.startContainer, editor.getBody(), "Start container is before first nonEditable.");
		equal(r.endContainer, editor.getBody(), "End container is before  first nonEditable.");
		equal(r.startOffset, 0);
		equal(r.endOffset, 0);

		r = editor.dom.createRng();
		r.setStart(editor.getBody(), 0);
		r.setEnd(editor.getBody(), 1);
		editor.selection.setRng(r);

		r = editor.selection.getRng(true);
		equal(r.startContainer, editor.getBody(), "Start container before first nonEditable.");
		equal(r.endContainer, editor.getBody(), "End container is after first nonEditable.");
		equal(r.startOffset, 0);
		equal(r.endOffset, 1);

		r = editor.dom.createRng();
		r.setStart(editor.getBody(), 0);
		r.setEnd(editor.getBody(), 2);
		editor.selection.setRng(r);

		r = editor.selection.getRng(true);
		equal(r.startContainer, editor.getBody(), "Start container before first nonEditable.");
		equal(r.endContainer, editor.getBody(), "End container is after second nonEditable.");
		equal(r.startOffset, 0);
		equal(r.endOffset, 2);

		r = editor.dom.createRng();
		r.setStart(editor.getBody(), 1);
		r.setEnd(editor.getBody(), 1);
		editor.selection.setRng(r);

		r = editor.selection.getRng(true);
		equal(r.startContainer, editor.getBody(), "Start container is before second nonEditable.");
		equal(r.endContainer, editor.getBody(), "End container is div before second nonEditable.");
		equal(r.startOffset, 1);
		equal(r.endOffset, 1);

		r = editor.dom.createRng();
		r.setStart(editor.getBody(), 2);
		r.setEnd(editor.getBody(), 2);
		editor.selection.setRng(r);

		r = editor.selection.getRng(true);
		equal(r.startContainer, editor.getBody(), "Start container is after last nonEditable.");
		equal(r.endContainer, editor.getBody(), "End container is after last nonEditable.");
		equal(r.startOffset, 2);
		equal(r.endOffset, 2);
	});
} else {
	test("Skipped ie_selection tests as not running in IE.", function() {
		ok(true, "Dummy assert");
	});
}

