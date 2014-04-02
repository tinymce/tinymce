module("tinymce.plugins.Noneditable", {
	setupModule: function() {
		QUnit.stop();

		tinymce.init({
			selector: "textarea",
			add_unload_trigger: false,
			skin: false,
			indent: false,
			noneditable_regexp: [/\{[^\}]+\}/g],
			plugins: 'noneditable',
			forced_root_block: '',
			convert_fonts_to_spans: false,
			entities: 'raw',
			valid_styles: {
				'*': 'color,font-size,font-family,background-color,font-weight,font-style,text-decoration,float,margin,margin-top,margin-right,margin-bottom,margin-left,display'
			},
			init_instance_callback: function(ed) {
				window.editor = ed;
				QUnit.start();
			}
		});
	}
});

// Ignore on IE 7, 8 this is a known bug not worth fixing
if (!tinymce.Env.ie || tinymce.Env.ie > 8) {
	test('expand to noneditable (start)', function() {
		editor.setContent('<p><span class="mceNonEditable">no</span>yes</p>');

		var rng = editor.dom.createRng();
		rng.setStart(editor.getBody().firstChild.firstChild.firstChild, 1);
		rng.setEnd(editor.getBody().firstChild.lastChild, 1);
		editor.selection.setRng(rng);

		editor.dom.fire(editor.getBody(), 'mouseup');
		rng = Utils.normalizeRng(editor.selection.getRng(true));

		equal(rng.startContainer.nodeName, 'P');
		equal(rng.startOffset, 0);
		equal(rng.endContainer.nodeName, '#text');
		equal(rng.endOffset, 1);
	});

	test('expand to noneditable (end)', function() {
		editor.setContent('<p>yes<span class="mceNonEditable">no</span></p>');

		var rng = editor.dom.createRng();
		rng.setStart(editor.getBody().firstChild.firstChild, 1);
		rng.setEnd(editor.getBody().firstChild.lastChild.firstChild, 1);
		editor.selection.setRng(rng);

		editor.dom.fire(editor.getBody(), 'mouseup');
		rng = Utils.normalizeRng(editor.selection.getRng(true));

		equal(rng.startContainer.nodeName, '#text');
		equal(rng.startOffset, 1);
		equal(rng.endContainer.nodeName, 'P');
		equal(rng.endOffset, 2);
	});

	test('expand to noneditable (start/end)', function() {
		editor.setContent('<p>yes<span class="mceNonEditable">noedit</span>yes</p>');

		var rng = editor.dom.createRng();
		rng.setStart(editor.dom.select('span')[0].firstChild, 1);
		rng.setEnd(editor.dom.select('span')[0].firstChild, 2);
		editor.selection.setRng(rng);

		editor.dom.fire(editor.getBody(), 'mouseup');
		rng = Utils.normalizeRng(editor.selection.getRng(true));

		equal(rng.startContainer.nodeName, 'P');
		equal(rng.startOffset, 1);
		equal(rng.endContainer.nodeName, 'P');
		equal(rng.endOffset, 2);
	});

	test('type after non editable', function() {
		editor.setContent('<p><span class="mceNonEditable">no</span>yes</p>');

		var rng = editor.dom.createRng();
		rng.setStart(editor.dom.select('span')[0].firstChild, 2);
		rng.setEnd(editor.dom.select('span')[0].firstChild, 2);
		editor.selection.setRng(rng);

		editor.dom.fire(editor.getBody(), 'mouseup');
		Utils.type('X');
		rng = Utils.normalizeRng(editor.selection.getRng(true));

		equal(rng.startContainer.getAttribute('data-mce-bogus'), 'true');
		equal(rng.startContainer.nodeName, 'SPAN');
		equal(rng.startOffset, 1);
		equal(rng.endContainer.nodeName, 'SPAN');
		equal(rng.endOffset, 1);
		equal(editor.getContent(), '<p><span class="mceNonEditable">no</span>Xyes</p>');
	});
}

test('type between non editable', function() {
	editor.setContent('<p><span class="mceNonEditable">no</span><span class="mceNonEditable">no</span></p>');

	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('span')[0].firstChild, 2);
	rng.setEnd(editor.dom.select('span')[0].firstChild, 2);
	editor.selection.setRng(rng);

	editor.dom.fire(editor.getBody(), 'mouseup');
	Utils.type('X');
	rng = Utils.normalizeRng(editor.selection.getRng(true));

	equal(rng.startContainer.getAttribute('data-mce-bogus'), 'true');
	equal(rng.startContainer.nodeName, 'SPAN');
	equal(rng.startOffset, 1);
	equal(rng.endContainer.nodeName, 'SPAN');
	equal(rng.endOffset, 1);
	equal(editor.getContent(), '<p><span class="mceNonEditable">no</span>X<span class="mceNonEditable">no</span></p>');
});

test('type after last non editable', function() {
	editor.setContent('<p><span class="mceNonEditable">no</span></p>');

	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('span')[0].firstChild, 2);
	rng.setEnd(editor.dom.select('span')[0].firstChild, 2);
	editor.selection.setRng(rng);

	editor.dom.fire(editor.getBody(), 'mouseup');
	Utils.type('X');
	rng = Utils.normalizeRng(editor.selection.getRng(true));

	equal(rng.startContainer.getAttribute('data-mce-bogus'), 'true');
	equal(rng.startContainer.nodeName, 'SPAN');
	equal(rng.startOffset, 1);
	equal(rng.endContainer.nodeName, 'SPAN');
	equal(rng.endOffset, 1);
	equal(editor.getContent(), '<p><span class="mceNonEditable">no</span>X</p>');
});

// Ignore on IE 7, 8 this is a known bug not worth fixing
if (!tinymce.Env.ie || tinymce.Env.ie > 8) {
	test('escape noneditable inline element (left)', function() {
		editor.setContent('<p>no <span class="mceNonEditable">yes</span> no</p><p class="mceNonEditable">no</p>');

		var rng = editor.dom.createRng();
		rng.selectNode(editor.dom.select('span')[0]);
		editor.selection.setRng(rng);

		Utils.type({keyCode: 37});
		rng = Utils.normalizeRng(editor.selection.getRng(true));

		equal(rng.startContainer.nodeName, 'SPAN');
		equal(rng.startContainer.parentNode.nodeName, 'P');
		equal(editor.dom.nodeIndex(rng.startContainer), 1);
		equal(rng.collapsed, true);
	});
}

test('escape noneditable inline element (right)', function() {
	editor.setContent('<p>no <span class="mceNonEditable">yes</span> no</p><p class="mceNonEditable">no</p>');

	var rng = editor.dom.createRng();
	rng.selectNode(editor.dom.select('span')[0]);
	editor.selection.setRng(rng);

	Utils.type({keyCode: 39});
	rng = Utils.normalizeRng(editor.selection.getRng(true));

	equal(rng.startContainer.nodeName, 'SPAN');
	equal(rng.startContainer.parentNode.nodeName, 'P');
	equal(editor.dom.nodeIndex(rng.startContainer), 2);
	equal(rng.collapsed, true);
});

test('escape noneditable block element (left)', function(){
	editor.setContent('<p>yes</p><p class="mceNonEditable">no</p><p>yes</p>');

	var rng = editor.dom.createRng();
	rng.selectNode(editor.dom.select('p')[1]);
	editor.selection.setRng(rng);

	Utils.type({keyCode: 37});
	rng = Utils.normalizeRng(editor.selection.getRng(true));

	equal(rng.startContainer.nodeName, "P");
	equal(editor.dom.nodeIndex(rng.startContainer), 0);
	equal(rng.startOffset, 1);
	equal(rng.collapsed, true);

});

test('escape noneditable block element (right)', function(){
	editor.setContent('<p>yes</p><p class="mceNonEditable">no</p><p>yes</p>');

	var rng = editor.dom.createRng();
	rng.selectNode(editor.dom.select('p')[1]);
	editor.selection.setRng(rng);

	Utils.type({keyCode: 39});
	rng = Utils.normalizeRng(editor.selection.getRng(true));

	equal(rng.startContainer.nodeName, "P");
	equal(editor.dom.nodeIndex(rng.startContainer), 2);
	equal(rng.startOffset, 0);
	equal(rng.collapsed, true);

});

test('noneditable regexp', function() {
	editor.setContent('<p>{test1}{test2}</p>');

	equal(editor.dom.select('span').length, 2);
	equal(editor.getContent(), '<p>{test1}{test2}</p>');
});
