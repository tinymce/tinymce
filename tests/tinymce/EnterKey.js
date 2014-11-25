module("tinymce.EnterKey", {
	setupModule: function() {
		QUnit.stop();

		tinymce.init({
			selector: "textarea",
			add_unload_trigger: false,
			disable_nodechange: true,
			indent: false,
			skin: false,
			entities: 'raw',
			schema: 'html5',
			extended_valid_elements: 'div[id|style|contenteditable],span[id|style|contenteditable],#dt,#dd',
			valid_styles: {
				'*': 'color,font-size,font-family,background-color,font-weight,font-style,text-decoration,float,margin,margin-top,margin-right,margin-bottom,margin-left,display,position,top,left'
			},
			init_instance_callback: function(ed) {
				window.editor = ed;
				QUnit.start();
			}
		});
	},

	teardown: function() {
		editor.settings.forced_root_block = 'p';
		editor.settings.forced_root_block_attrs = null;
		editor.settings.end_container_on_empty_block = false;
		editor.settings.br_in_pre = true;
		editor.settings.keep_styles = true;
		delete editor.settings.force_p_newlines;
	}
});

test('Enter at end of H1', function() {
	editor.setContent('<h1>abc</h1>');
	Utils.setSelection('h1', 3);
	Utils.pressEnter();
	equal(editor.getContent(),'<h1>abc</h1><p>\u00a0</p>');
	equal(editor.selection.getRng(true).startContainer.nodeName, 'P');
});

test('Enter in midde of H1', function() {
	editor.setContent('<h1>abcd</h1>');
	Utils.setSelection('h1', 2);
	Utils.pressEnter();
	equal(editor.getContent(),'<h1>ab</h1><h1>cd</h1>');
	equal(editor.selection.getRng(true).startContainer.parentNode.nodeName, 'H1');
});

test('Enter before text after EM', function() {
	editor.setContent('<p><em>a</em>b</p>');
	editor.selection.setCursorLocation(editor.getBody().firstChild, 1);
	Utils.pressEnter();
	equal(editor.getContent(),'<p><em>a</em></p><p>b</p>');
	var rng = editor.selection.getRng(true);
	equal(rng.startContainer.nodeValue, 'b');
});

test('Enter before first IMG in P', function() {
	editor.setContent('<p><img alt="" src="about:blank" /></p>');
	editor.selection.setCursorLocation(editor.getBody().firstChild, 0);
	Utils.pressEnter();
	equal(editor.getContent(),'<p>\u00a0</p><p><img src="about:blank" alt="" /></p>');
});

test('Enter before last IMG in P with text', function() {
	editor.setContent('<p>abc<img alt="" src="about:blank" /></p>');
	editor.selection.setCursorLocation(editor.getBody().firstChild, 1);
	Utils.pressEnter();
	equal(editor.getContent(),'<p>abc</p><p><img src="about:blank" alt="" /></p>');
	var rng = editor.selection.getRng(true);
	equal(rng.startContainer.nodeName, 'P');
	equal(rng.startContainer.childNodes[rng.startOffset].nodeName, 'IMG');
});

test('Enter before last IMG in P with IMG sibling', function() {
	editor.setContent('<p><img src="about:blank" alt="" /><img src="about:blank" alt="" /></p>');
	editor.selection.setCursorLocation(editor.getBody().firstChild, 1);
	Utils.pressEnter();
	equal(editor.getContent(),'<p><img src="about:blank" alt="" /></p><p><img src="about:blank" alt="" /></p>');
	var rng = editor.selection.getRng(true);
	equal(rng.startContainer.nodeName, 'P');
	equal(rng.startContainer.childNodes[rng.startOffset].nodeName, 'IMG');
});

test('Enter after last IMG in P', function() {
	editor.setContent('<p>abc<img alt="" src="about:blank" /></p>');
	editor.selection.setCursorLocation(editor.getBody().firstChild, 2);
	Utils.pressEnter();
	equal(editor.getContent(),'<p>abc<img src="about:blank" alt="" /></p><p>\u00a0</p>');
});

test('Enter before last INPUT in P with text', function() {
	editor.setContent('<p>abc<input type="text" /></p>');
	editor.selection.setCursorLocation(editor.getBody().firstChild, 1);
	Utils.pressEnter();
	equal(editor.getContent(),'<p>abc</p><p><input type="text" /></p>');
	var rng = editor.selection.getRng(true);
	equal(rng.startContainer.nodeName, 'P');
	equal(rng.startContainer.childNodes[rng.startOffset].nodeName, 'INPUT');
});

test('Enter before last INPUT in P with IMG sibling', function() {
	editor.setContent('<p><input type="text" /><input type="text" /></p>');
	editor.selection.setCursorLocation(editor.getBody().firstChild, 1);
	Utils.pressEnter();
	equal(editor.getContent(),'<p><input type="text" /></p><p><input type="text" /></p>');
	var rng = editor.selection.getRng(true);
	equal(rng.startContainer.nodeName, 'P');
	equal(rng.startContainer.childNodes[rng.startOffset].nodeName, 'INPUT');
});

test('Enter after last INPUT in P', function() {
	editor.setContent('<p>abc<input type="text" /></p>');
	editor.selection.setCursorLocation(editor.getBody().firstChild, 2);
	Utils.pressEnter();
	equal(editor.getContent(),'<p>abc<input type="text" /></p><p>\u00a0</p>');
});

test('Enter at end of P', function() {
	editor.setContent('<p>abc</p>');
	Utils.setSelection('p', 3);
	Utils.pressEnter();
	equal(editor.getContent(),'<p>abc</p><p>\u00a0</p>');
	equal(editor.selection.getRng(true).startContainer.nodeName, 'P');
});

test('Enter at end of EM inside P', function() {
	editor.setContent('<p><em>abc</em></p>');
	Utils.setSelection('em', 3);
	Utils.pressEnter();
	equal(Utils.cleanHtml(editor.getBody().innerHTML).replace(/<br([^>]+|)>|&nbsp;/g, ''), '<p><em>abc</em></p><p><em></em></p>');
	equal(editor.selection.getRng(true).startContainer.nodeName, 'EM');
});

test('Enter at middle of EM inside P', function() {
	editor.setContent('<p><em>abcd</em></p>');
	Utils.setSelection('em', 2);
	Utils.pressEnter();
	equal(editor.getContent(),'<p><em>ab</em></p><p><em>cd</em></p>');
	equal(editor.selection.getRng(true).startContainer.parentNode.nodeName, 'EM');
});

test('Enter at beginning EM inside P', function() {
	editor.setContent('<p><em>abc</em></p>');
	Utils.setSelection('em', 0);
	Utils.pressEnter();
	equal(Utils.cleanHtml(editor.getBody().innerHTML).replace(/<br([^>]+|)>|&nbsp;/g, ''), '<p><em></em></p><p><em>abc</em></p>');
	equal(editor.selection.getRng(true).startContainer.nodeValue, 'abc');
});

test('Enter at end of STRONG in EM inside P', function() {
	editor.setContent('<p><em><strong>abc</strong></em></p>');
	Utils.setSelection('strong', 3);
	Utils.pressEnter();
	equal(Utils.cleanHtml(editor.getBody().innerHTML).replace(/<br([^>]+|)>|&nbsp;/g, ''), '<p><em><strong>abc</strong></em></p><p><em><strong></strong></em></p>');
	equal(editor.selection.getRng(true).startContainer.nodeName, 'STRONG');
});

test('Enter at middle of STRONG in EM inside P', function() {
	editor.setContent('<p><em><strong>abcd</strong></em></p>');
	Utils.setSelection('strong', 2);
	Utils.pressEnter();
	equal(editor.getContent(),'<p><em><strong>ab</strong></em></p><p><em><strong>cd</strong></em></p>');
	equal(editor.selection.getRng(true).startContainer.parentNode.nodeName, 'STRONG');
});

test('Enter at beginning STRONG in EM inside P', function() {
	editor.setContent('<p><em><strong>abc</strong></em></p>');
	Utils.setSelection('strong', 0);
	Utils.pressEnter();
	equal(Utils.cleanHtml(editor.getBody().innerHTML).replace(/<br([^>]+|)>|&nbsp;/g, ''), '<p><em><strong></strong></em></p><p><em><strong>abc</strong></em></p>');
	equal(editor.selection.getRng(true).startContainer.nodeValue, 'abc');
});

test('Enter at beginning of P', function() {
	editor.setContent('<p>abc</p>');
	Utils.setSelection('p', 0);
	Utils.pressEnter();
	equal(editor.getContent(),'<p>\u00a0</p><p>abc</p>');
	equal(editor.selection.getRng(true).startContainer.nodeValue, 'abc');
});

test('Enter at middle of P with style, id and class attributes', function() {
	editor.setContent('<p id="a" class="b" style="color:#000">abcd</p>');
	Utils.setSelection('p', 2);
	Utils.pressEnter();
	equal(editor.getContent(),'<p id="a" class="b" style="color: #000;">ab</p><p class="b" style="color: #000;">cd</p>');
	equal(editor.selection.getRng(true).startContainer.parentNode.nodeName, 'P');
});

test('Enter at a range between H1 and P', function() {
	editor.setContent('<h1>abcd</h1><p>efgh</p>');
	Utils.setSelection('h1', 2, 'p', 2);
	Utils.pressEnter();
	equal(editor.getContent(),'<h1>abgh</h1>');
	equal(editor.selection.getNode().nodeName, 'H1');
});

test('Enter at end of H1 in HGROUP', function() {
	editor.setContent('<hgroup><h1>abc</h1></hgroup>');
	Utils.setSelection('h1', 3);
	Utils.pressEnter();
	equal(editor.getContent(),'<hgroup><h1>abc</h1><h1>\u00a0</h1></hgroup>');
	equal(editor.selection.getRng(true).startContainer.nodeName, 'H1');
});

test('Enter inside empty TD', function() {
	editor.getBody().innerHTML = '<table><tr><td></td></tr></table>';
	Utils.setSelection('td', 0);
	Utils.pressEnter();
	equal(Utils.cleanHtml(editor.getBody().innerHTML).replace(/<br([^>]+|)>|&nbsp;/g, ''), '<table><tbody><tr><td><p></p><p></p></td></tr></tbody></table>');
	equal(editor.selection.getNode().nodeName, 'P');
});

test('Shift+Enter inside STRONG inside TD with BR', function() {
	editor.getBody().innerHTML = '<table><tr><td>d <strong>e</strong><br></td></tr></table>';
	Utils.setSelection('strong', 1);
	Utils.pressEnter({shiftKey: true});
	equal(Utils.cleanHtml(editor.getBody().innerHTML), '<table><tbody><tr><td>d <strong>e<br></strong><br></td></tr></tbody></table>');
	equal(editor.selection.getNode().nodeName, 'STRONG');
});

test('Enter inside middle of text node in body', function() {
	editor.getBody().innerHTML = 'abcd';
	Utils.setSelection('body', 2);
	Utils.pressEnter();
	equal(editor.getContent(),'<p>ab</p><p>cd</p>');
	equal(editor.selection.getNode().nodeName, 'P');
});

test('Enter inside at beginning of text node in body', function() {
	editor.getBody().innerHTML = 'abcd';
	Utils.setSelection('body', 0);
	Utils.pressEnter();
	equal(editor.getContent(),'<p>\u00a0</p><p>abcd</p>');
	equal(editor.selection.getNode().nodeName, 'P');
});

test('Enter inside at end of text node in body', function() {
	editor.getBody().innerHTML = 'abcd';
	Utils.setSelection('body', 4);
	Utils.pressEnter();
	equal(editor.getContent(),'<p>abcd</p><p>\u00a0</p>');
	equal(editor.selection.getNode().nodeName, 'P');
});

test('Enter inside empty body', function() {
	editor.getBody().innerHTML = '';
	Utils.setSelection('body', 0);
	Utils.pressEnter();
	equal(editor.getContent(),'<p>\u00a0</p><p>\u00a0</p>');
	equal(editor.selection.getNode().nodeName, 'P');
});

test('Enter inside empty li in beginning of ol', function() {
	editor.getBody().innerHTML = (tinymce.isIE && tinymce.Env.ie < 11) ? '<ol><li></li><li>a</li></ol>': '<ol><li><br></li><li>a</li></ol>';
	Utils.setSelection('li', 0);
	Utils.pressEnter();
	equal(editor.getContent(),'<p>\u00a0</p><ol><li>a</li></ol>');
	equal(editor.selection.getNode().nodeName, 'P');
});

test('Enter inside empty li at the end of ol', function() {
	editor.getBody().innerHTML = (tinymce.isIE && tinymce.Env.ie < 11) ? '<ol><li>a</li><li></li></ol>': '<ol><li>a</li><li><br></li></ol>';
	Utils.setSelection('li:last', 0);
	Utils.pressEnter();
	equal(editor.getContent(),'<ol><li>a</li></ol><p>\u00a0</p>');
	equal(editor.selection.getNode().nodeName, 'P');
});

test('Shift+Enter inside empty li in the middle of ol', function() {
	editor.getBody().innerHTML = (tinymce.isIE && tinymce.Env.ie < 11) ? '<ol><li>a</li><li></li><li>b</li></ol>':  '<ol><li>a</li><li><br></li><li>b</li></ol>';
	Utils.setSelection('li:nth-child(2)', 0);
	Utils.pressEnter({shiftKey: true});
	equal(editor.getContent(),'<ol><li>a</li></ol><p>\u00a0</p><ol><li>b</li></ol>');
	equal(editor.selection.getNode().nodeName, 'P');
});

test('Shift+Enter inside empty li in beginning of ol', function() {
	editor.getBody().innerHTML = (tinymce.isIE && tinymce.Env.ie < 11) ? '<ol><li></li><li>a</li></ol>': '<ol><li><br></li><li>a</li></ol>';
	Utils.setSelection('li', 0);
	Utils.pressEnter({shiftKey: true});
	equal(editor.getContent(),'<p>\u00a0</p><ol><li>a</li></ol>');
	equal(editor.selection.getNode().nodeName, 'P');
});

test('Shift+Enter inside empty li at the end of ol', function() {
	editor.getBody().innerHTML = (tinymce.isIE && tinymce.Env.ie < 11) ? '<ol><li>a</li><li></li></ol>': '<ol><li>a</li><li><br></li></ol>';
	Utils.setSelection('li:last', 0);
	Utils.pressEnter({shiftKey: true});
	equal(editor.getContent(),'<ol><li>a</li></ol><p>\u00a0</p>');
	equal(editor.selection.getNode().nodeName, 'P');
});

test('Enter inside empty li in the middle of ol with forced_root_block: false', function() {
	editor.settings.forced_root_block = false;
	editor.getBody().innerHTML = (tinymce.isIE && tinymce.Env.ie < 11) ? '<ol><li>a</li><li></li><li>b</li></ol>':  '<ol><li>a</li><li><br></li><li>b</li></ol>';
	Utils.setSelection('li:nth-child(2)', 0);
	Utils.pressEnter();
	equal(editor.getContent(),'<ol><li>a</li></ol><br /><ol><li>b</li></ol>');
	equal(editor.selection.getNode().nodeName, 'BODY');
});

test('Enter inside empty li in beginning of ol with forced_root_block: false', function() {
	editor.settings.forced_root_block = false;
	editor.getBody().innerHTML = (tinymce.isIE && tinymce.Env.ie < 11) ? '<ol><li></li><li>a</li></ol>': '<ol><li><br></li><li>a</li></ol>';
	Utils.setSelection('li', 0);
	Utils.pressEnter();
	equal(editor.getContent(),'<br /><ol><li>a</li></ol>');
	equal(editor.selection.getNode().nodeName, 'BODY');
});

test('Enter inside empty li at the end of ol with forced_root_block: false', function() {
	editor.settings.forced_root_block = false;
	editor.getBody().innerHTML = (tinymce.isIE && tinymce.Env.ie < 11) ? '<ol><li>a</li><li></li></ol>': '<ol><li>a</li><li><br></li></ol>';
	Utils.setSelection('li:last', 0);
	Utils.pressEnter();
	equal(Utils.cleanHtml(editor.getBody().innerHTML), '<ol><li>a</li></ol><br>');
	equal(editor.selection.getNode().nodeName, 'BODY');
});

test('Enter inside empty li in the middle of ol', function() {
	editor.getBody().innerHTML = (tinymce.isIE && tinymce.Env.ie < 11) ? '<ol><li>a</li><li></li><li>b</li></ol>':  '<ol><li>a</li><li><br></li><li>b</li></ol>';
	Utils.setSelection('li:nth-child(2)', 0);
	Utils.pressEnter();
	equal(editor.getContent(),'<ol><li>a</li></ol><p>\u00a0</p><ol><li>b</li></ol>');
	equal(editor.selection.getNode().nodeName, 'P');
});

// Nested lists in LI elements

test('Enter inside empty LI in beginning of OL in LI', function() {
	editor.getBody().innerHTML = Utils.trimBrsOnIE(
		'<ol>' +
			'<li>a' +
				'<ol>' +
					'<li><br></li>' +
					'<li>a</li>' +
				'</ol>' +
			'</li>' +
		'</ol>'
	);

	Utils.setSelection('li li', 0);
	editor.focus();
	Utils.pressEnter();

	equal(editor.getContent(),
		'<ol>' +
			'<li>a</li>' +
			'<li>' +
				'<ol>' +
					'<li>a</li>' +
				'</ol>' +
			'</li>' +
		'</ol>'
	);

	equal(editor.selection.getNode().nodeName, 'LI');
});

test('Enter inside empty LI in middle of OL in LI', function() {
	editor.getBody().innerHTML = Utils.trimBrsOnIE(
		'<ol>' +
			'<li>a' +
				'<ol>' +
					'<li>a</li>' +
					'<li><br></li>' +
					'<li>b</li>' +
				'</ol>' +
			'</li>' +
		'</ol>'
	);

	Utils.setSelection('li li:nth-child(2)', 0);
	editor.focus();
	Utils.pressEnter();

	equal(editor.getContent(),
		'<ol>' +
			'<li>a' +
				'<ol>' +
					'<li>a</li>' +
				'</ol>' +
			'</li>' +
			'<li>\u00a0' +
				'<ol>' +
					'<li>b</li>' +
				'</ol>' +
			'</li>' +
		'</ol>'
	);

	// Ignore on IE 7, 8 this is a known bug not worth fixing
	if (!tinymce.Env.ie || tinymce.Env.ie > 8) {
		equal(editor.selection.getNode().nodeName, 'LI');
	}
});

test('Enter inside empty LI in end of OL in LI', function() {
	editor.getBody().innerHTML = Utils.trimBrsOnIE(
		'<ol>' +
			'<li>a' +
				'<ol>' +
					'<li>a</li>' +
					'<li><br></li>' +
				'</ol>' +
			'</li>' +
		'</ol>'
	);

	Utils.setSelection('li li:last', 0);
	editor.focus();
	Utils.pressEnter();

	equal(editor.getContent(),
		'<ol>' +
			'<li>a' +
				'<ol>' +
					'<li>a</li>' +
				'</ol>' +
			'</li>' +
			'<li></li>' +
		'</ol>'
	);

	equal(editor.selection.getNode().nodeName, 'LI');
});

// Nested lists in OL elements

// Ignore on IE 7, 8 this is a known bug not worth fixing
if (!tinymce.Env.ie || tinymce.Env.ie > 8) {
	test('Enter before nested list', function() {
		editor.getBody().innerHTML = Utils.trimBrsOnIE(
			'<ol>' +
				'<li>a' +
					'<ul>' +
						'<li>b</li>' +
						'<li>c</li>' +
					'</ul>' +
				'</li>' +
			'</ol>'
		);

		Utils.setSelection('ol > li', 1);
		editor.focus();
		Utils.pressEnter();

		equal(editor.getContent(),
			'<ol>' +
				'<li>a</li>' +
				'<li>\u00a0' +
					'<ul>' +
						'<li>b</li>' +
						'<li>c</li>' +
					'</ul>' +
				'</li>' +
			'</ol>'
		);

		equal(editor.selection.getNode().nodeName, 'LI');
	});
}

test('Enter inside empty LI in beginning of OL in OL', function() {
	editor.getBody().innerHTML = Utils.trimBrsOnIE(
		'<ol>' +
			'<li>a</li>' +
			'<ol>' +
				'<li><br></li>' +
				'<li>a</li>' +
			'</ol>' +
		'</ol>'
	);

	Utils.setSelection('ol ol li', 0);
	editor.focus();
	Utils.pressEnter();

	equal(editor.getContent(),
		'<ol>' +
			'<li>a</li>' +
			'<li></li>' +
			'<ol>' +
				'<li>a</li>' +
			'</ol>' +
		'</ol>'
	);

	equal(editor.selection.getNode().nodeName, 'LI');
});

test('Enter inside empty LI in middle of OL in OL', function() {
	editor.getBody().innerHTML = Utils.trimBrsOnIE(
		'<ol>' +
			'<li>a</li>' +
			'<ol>' +
				'<li>a</li>' +
				'<li><br></li>' +
				'<li>b</li>' +
			'</ol>' +
		'</ol>'
	);

	Utils.setSelection('ol ol li:nth-child(2)', 0);
	editor.focus();
	Utils.pressEnter();

	equal(editor.getContent(),
		'<ol>' +
			'<li>a</li>' +
			'<ol>' +
				'<li>a</li>' +
			'</ol>' +
			'<li></li>' +
			'<ol>' +
				'<li>b</li>' +
			'</ol>' +
		'</ol>'
	);

	equal(editor.selection.getNode().nodeName, 'LI');
});

test('Enter inside empty LI in end of OL in OL', function() {
	editor.getBody().innerHTML = Utils.trimBrsOnIE(
		'<ol>' +
			'<li>a</li>' +
			'<ol>' +
				'<li>a</li>' +
				'<li><br></li>' +
			'</ol>' +
		'</ol>'
	);

	Utils.setSelection('ol ol li:last', 0);
	editor.focus();
	Utils.pressEnter();

	equal(editor.getContent(),
		'<ol>' +
			'<li>a</li>' +
			'<ol>' +
				'<li>a</li>' +
			'</ol>' +
			'<li></li>' +
		'</ol>'
	);

	equal(editor.selection.getNode().nodeName, 'LI');
});

test('Enter at beginning of first DT inside DL', function() {
	editor.getBody().innerHTML = '<dl><dt>a</dt></dl>';
	Utils.setSelection('dt', 0);
	Utils.pressEnter();
	equal(editor.getContent(),'<dl><dt>\u00a0</dt><dt>a</dt></dl>');
	equal(editor.selection.getNode().nodeName, 'DT');
});

test('Enter at beginning of first DD inside DL', function() {
	editor.getBody().innerHTML = '<dl><dd>a</dd></dl>';
	Utils.setSelection('dd', 0);
	Utils.pressEnter();
	equal(editor.getContent(),'<dl><dd>\u00a0</dd><dd>a</dd></dl>');
	equal(editor.selection.getNode().nodeName, 'DD');
});

test('Enter at beginning of middle DT inside DL', function() {
	editor.getBody().innerHTML = '<dl><dt>a</dt><dt>b</dt><dt>c</dt></dl>';
	Utils.setSelection('dt:nth-child(2)', 0);
	Utils.pressEnter();
	equal(editor.getContent(),'<dl><dt>a</dt><dt>\u00a0</dt><dt>b</dt><dt>c</dt></dl>');
	equal(editor.selection.getNode().nodeName, 'DT');
});

test('Enter at beginning of middle DD inside DL', function() {
	editor.getBody().innerHTML = '<dl><dd>a</dd><dd>b</dd><dd>c</dd></dl>';
	Utils.setSelection('dd:nth-child(2)', 0);
	Utils.pressEnter();
	equal(editor.getContent(),'<dl><dd>a</dd><dd>\u00a0</dd><dd>b</dd><dd>c</dd></dl>');
	equal(editor.selection.getNode().nodeName, 'DD');
});

test('Enter at end of last DT inside DL', function() {
	editor.getBody().innerHTML = '<dl><dt>a</dt></dl>';
	Utils.setSelection('dt', 1);
	Utils.pressEnter();
	equal(editor.getContent(),'<dl><dt>a</dt><dt>\u00a0</dt></dl>');
	equal(editor.selection.getNode().nodeName, 'DT');
});

test('Enter at end of last DD inside DL', function() {
	editor.getBody().innerHTML = '<dl><dd>a</dd></dl>';
	Utils.setSelection('dd', 1);
	Utils.pressEnter();
	equal(editor.getContent(),'<dl><dd>a</dd><dd>\u00a0</dd></dl>');
	equal(editor.selection.getNode().nodeName, 'DD');
});

test('Enter at end of last empty DT inside DL', function() {
	editor.getBody().innerHTML = '<dl><dt>a</dt><dt></dt></dl>';
	Utils.setSelection('dt:nth-child(2)', 0);
	Utils.pressEnter();
	equal(editor.getContent(),'<dl><dt>a</dt></dl><p>\u00a0</p>');
	equal(editor.selection.getNode().nodeName, 'P');
});

test('Enter at end of last empty DD inside DL', function() {
	editor.getBody().innerHTML = '<dl><dd>a</dd><dd></dd></dl>';
	Utils.setSelection('dd:nth-child(2)', 0);
	Utils.pressEnter();
	equal(editor.getContent(),'<dl><dd>a</dd></dl><p>\u00a0</p>');
	equal(editor.selection.getNode().nodeName, 'P');
});

test('Enter at beginning of P inside LI', function() {
	editor.getBody().innerHTML = '<ol><li><p>abcd</p></li></ol>';
	Utils.setSelection('p', 0);
	Utils.pressEnter();
	equal(editor.getContent(),'<ol><li></li><li><p>abcd</p></li></ol>');
	equal(editor.selection.getNode().nodeName, 'P');
});

test('Enter inside middle of P inside LI', function() {
	editor.getBody().innerHTML = '<ol><li><p>abcd</p></li></ol>';
	Utils.setSelection('p', 2);
	Utils.pressEnter();
	equal(editor.getContent(),'<ol><li><p>ab</p></li><li><p>cd</p></li></ol>');

	// Ignore on IE 7, 8 this is a known bug not worth fixing
	if (!tinymce.Env.ie || tinymce.Env.ie > 8) {
		equal(editor.selection.getNode().nodeName, 'P');
	}
});

test('Enter at end of P inside LI', function() {
	editor.getBody().innerHTML = '<ol><li><p>abcd</p></li></ol>';
	Utils.setSelection('p', 4);
	Utils.pressEnter();
	equal(editor.getContent(),'<ol><li><p>abcd</p></li><li></li></ol>');
	equal(editor.selection.getNode().nodeName, 'LI');
});


test('Shift+Enter at beginning of P inside LI', function() {
	editor.getBody().innerHTML = '<ol><li><p>abcd</p></li></ol>';
	Utils.setSelection('p', 0);
	Utils.pressEnter({shiftKey: true});
	equal(editor.getContent(),'<ol><li><p><br />abcd</p></li></ol>');
	equal(editor.selection.getNode().nodeName, 'P');
});

test('Shift+Enter inside middle of P inside LI', function() {
	editor.getBody().innerHTML = '<ol><li><p>abcd</p></li></ol>';
	Utils.setSelection('p', 2);
	Utils.pressEnter({shiftKey: true});
	equal(editor.getContent(),'<ol><li><p>ab<br />cd</p></li></ol>');
	equal(editor.selection.getNode().nodeName, 'P');
});

test('Shift+Enter at end of P inside LI', function() {
	editor.getBody().innerHTML = '<ol><li><p>abcd</p></li></ol>';
	Utils.setSelection('p', 4);
	Utils.pressEnter({shiftKey: true});
	equal(editor.getContent(),(tinymce.isIE && tinymce.Env.ie < 11) ? '<ol><li><p>abcd</p></li></ol>': '<ol><li><p>abcd<br /><br /></p></li></ol>');
	equal(editor.selection.getNode().nodeName, 'P');
});


test('Ctrl+Enter at beginning of P inside LI', function() {
	editor.getBody().innerHTML = '<ol><li><p>abcd</p></li></ol>';
	Utils.setSelection('p', 0);
	Utils.pressEnter({ctrlKey: true});
	equal(editor.getContent(),'<ol><li><p>\u00a0</p><p>abcd</p></li></ol>');
	equal(editor.selection.getNode().nodeName, 'P');
});

test('Ctrl+Enter inside middle of P inside LI', function() {
	editor.getBody().innerHTML = '<ol><li><p>abcd</p></li></ol>';
	Utils.setSelection('p', 2);
	Utils.pressEnter({ctrlKey: true});
	equal(editor.getContent(),'<ol><li><p>ab</p><p>cd</p></li></ol>');
	equal(editor.selection.getNode().nodeName, 'P');
});

test('Ctrl+Enter at end of P inside LI', function() {
	editor.getBody().innerHTML = '<ol><li><p>abcd</p></li></ol>';
	Utils.setSelection('p', 4);
	Utils.pressEnter({ctrlKey: true});
	equal(editor.getContent(),'<ol><li><p>abcd</p><p>\u00a0</p></li></ol>');
	equal(editor.selection.getNode().nodeName, 'P');
});


test('Enter in the middle of text in P with forced_root_block set to false', function() {
	editor.settings.forced_root_block = false;
	editor.getBody().innerHTML = '<p>abc</p>';
	Utils.setSelection('p', 2);
	Utils.pressEnter();
	equal(editor.getContent(),'<p>ab<br />c</p>');
});

test('Enter at the end of text in P with forced_root_block set to false', function() {
	editor.settings.forced_root_block = false;
	editor.getBody().innerHTML = '<p>abc</p>';
	Utils.setSelection('p', 3);
	Utils.pressEnter();
	equal(Utils.cleanHtml(editor.getBody().innerHTML), (tinymce.isIE && tinymce.Env.ie < 11) ? '<p>abc<br></p>': '<p>abc<br><br></p>');
});

test('Enter at the middle of text in BODY with forced_root_block set to false', function() {
	editor.settings.forced_root_block = false;
	editor.getBody().innerHTML = 'abcd';
	Utils.setSelection('body', 2);
	editor.focus();
	Utils.pressEnter();
	equal(Utils.cleanHtml(editor.getBody().innerHTML), 'ab<br>cd');
});

test('Enter at the beginning of text in BODY with forced_root_block set to false', function() {
	editor.settings.forced_root_block = false;
	editor.getBody().innerHTML = 'abcd';
	Utils.setSelection('body', 0);
	editor.focus();
	Utils.pressEnter();
	equal(Utils.cleanHtml(editor.getBody().innerHTML), '<br>abcd');
});

test('Enter at the end of text in BODY with forced_root_block set to false', function() {
	editor.settings.forced_root_block = false;
	editor.getBody().innerHTML = 'abcd';
	Utils.setSelection('body', 4);
	editor.focus();
	Utils.pressEnter();
	equal(Utils.cleanHtml(editor.getBody().innerHTML), (tinymce.isIE && tinymce.Env.ie < 11) ? 'abcd<br>': 'abcd<br><br>');
});

test('Enter in empty P at the end of a blockquote and end_container_on_empty_block: true', function() {
	editor.settings.end_container_on_empty_block = true;
	editor.getBody().innerHTML = (tinymce.isIE && tinymce.Env.ie < 11) ? '<blockquote><p>abc</p><p></p></blockquote>': '<blockquote><p>abc</p><p><br></p></blockquote>';
	Utils.setSelection('p:last', 0);
	Utils.pressEnter();
	equal(editor.getContent(),'<blockquote><p>abc</p></blockquote><p>\u00a0</p>');
});

test('Enter in empty P at the beginning of a blockquote and end_container_on_empty_block: true', function() {
	editor.settings.end_container_on_empty_block = true;
	editor.getBody().innerHTML = (tinymce.isIE && tinymce.Env.ie < 11) ? '<blockquote><p></p><p>abc</p></blockquote>': '<blockquote><p><br></p><p>abc</p></blockquote>';
	Utils.setSelection('p', 0);
	Utils.pressEnter();
	equal(editor.getContent(),'<p>\u00a0</p><blockquote><p>abc</p></blockquote>');
});

test('Enter in empty P at in the middle of a blockquote and end_container_on_empty_block: true', function() {
	editor.settings.end_container_on_empty_block = true;
	editor.getBody().innerHTML = (tinymce.isIE && tinymce.Env.ie < 11) ? '<blockquote><p>abc</p><p></p><p>123</p></blockquote>': '<blockquote><p>abc</p><p><br></p><p>123</p></blockquote>';
	Utils.setSelection('p:nth-child(2)', 0);
	Utils.pressEnter();
	equal(editor.getContent(),'<blockquote><p>abc</p></blockquote><p>\u00a0</p><blockquote><p>123</p></blockquote>');
});

test('Enter inside empty P with empty P siblings', function() {
	// Tests that a workaround for an IE bug is working correctly
	editor.getBody().innerHTML = '<p></p><p></p><p>X</p>';
	Utils.setSelection('p', 0);
	Utils.pressEnter();
	equal(editor.getContent(),'<p>\u00a0</p><p>\u00a0</p><p>\u00a0</p><p>X</p>');
});

test('Enter at end of H1 with forced_root_block_attrs', function() {
	editor.settings.forced_root_block_attrs = {"class": "class1"};
	editor.getBody().innerHTML = '<h1>a</h1>';
	Utils.setSelection('h1', 1);
	Utils.pressEnter();
	equal(editor.getContent(),'<h1>a</h1><p class="class1">\u00a0</p>');
});

test('Shift+Enter at beginning of P', function() {
	editor.getBody().innerHTML = '<p>abc</p>';
	Utils.setSelection('p', 0);
	Utils.pressEnter({shiftKey: true});
	equal(editor.getContent(),'<p><br />abc</p>');
});

test('Shift+Enter in the middle of P', function() {
	editor.getBody().innerHTML = '<p>abcd</p>';
	Utils.setSelection('p', 2);
	Utils.pressEnter({shiftKey: true});
	equal(editor.getContent(),'<p>ab<br />cd</p>');
});

test('Shift+Enter at the end of P', function() {
	editor.getBody().innerHTML = '<p>abcd</p>';
	Utils.setSelection('p', 4);
	Utils.pressEnter({shiftKey: true});
	equal(editor.getContent(),(tinymce.isIE && tinymce.Env.ie < 11) ? '<p>abcd</p>': '<p>abcd<br /><br /></p>');
});

test('Shift+Enter in the middle of B with a BR after it', function() {
	editor.getBody().innerHTML = '<p><b>abcd</b><br></p>';
	Utils.setSelection('b', 2);
	Utils.pressEnter({shiftKey: true});
	equal(editor.getContent(),'<p><b>ab<br />cd</b></p>');
});

test('Shift+Enter at the end of B with a BR after it', function() {
	editor.getBody().innerHTML = '<p><b>abcd</b><br></p>';
	Utils.setSelection('b', 4);
	Utils.pressEnter({shiftKey: true});
	equal(editor.getContent(),'<p><b>abcd<br /></b></p>');
});

test('Enter in beginning of PRE', function() {
	editor.getBody().innerHTML = '<pre>abc</pre>';
	Utils.setSelection('pre', 0);
	Utils.pressEnter();
	equal(editor.getContent(),'<pre><br />abc</pre>');
});

test('Enter in the middle of PRE', function() {
	editor.getBody().innerHTML = '<pre>abcd</pre>';
	Utils.setSelection('pre', 2);
	Utils.pressEnter();
	equal(editor.getContent(),'<pre>ab<br />cd</pre>');
});

test('Enter at the end of PRE', function() {
	editor.getBody().innerHTML = '<pre>abcd</pre>';
	Utils.setSelection('pre', 4);
	Utils.pressEnter();
	equal(editor.getContent(),(tinymce.isIE && tinymce.Env.ie < 11) ? '<pre>abcd</pre>': '<pre>abcd<br /><br /></pre>');
});

test('Enter in beginning of PRE and br_in_pre: false', function() {
	editor.settings.br_in_pre = false;
	editor.getBody().innerHTML = '<pre>abc</pre>';
	Utils.setSelection('pre', 0);
	Utils.pressEnter();
	equal(editor.getContent(),'<pre>\u00a0</pre><pre>abc</pre>');
});

test('Enter in the middle of PRE and br_in_pre: false', function() {
	editor.settings.br_in_pre = false;
	editor.getBody().innerHTML = '<pre>abcd</pre>';
	Utils.setSelection('pre', 2);
	Utils.pressEnter();
	equal(editor.getContent(),'<pre>ab</pre><pre>cd</pre>');
});

test('Enter at the end of PRE and br_in_pre: false', function() {
	editor.settings.br_in_pre = false;
	editor.getBody().innerHTML = '<pre>abcd</pre>';
	Utils.setSelection('pre', 4);
	Utils.pressEnter();
	equal(editor.getContent(),'<pre>abcd</pre><p>\u00a0</p>');
});

test('Shift+Enter in beginning of PRE', function() {
	editor.getBody().innerHTML = '<pre>abc</pre>';
	Utils.setSelection('pre', 0);
	Utils.pressEnter({shiftKey: true});
	equal(editor.getContent(),'<pre>\u00a0</pre><pre>abc</pre>');
});

test('Shift+Enter in the middle of PRE', function() {
	editor.getBody().innerHTML = '<pre>abcd</pre>';
	Utils.setSelection('pre', 2);
	Utils.pressEnter({shiftKey: true});
	equal(editor.getContent(),'<pre>ab</pre><pre>cd</pre>');
});

test('Shift+Enter at the end of PRE', function() {
	editor.getBody().innerHTML = '<pre>abcd</pre>';
	Utils.setSelection('pre', 4);
	Utils.pressEnter({shiftKey: true});
	equal(editor.getContent(),'<pre>abcd</pre><p>\u00a0</p>');
});

test('Shift+Enter in beginning of P with forced_root_block set to false', function() {
	editor.settings.forced_root_block = false;
	editor.getBody().innerHTML = '<p>abc</p>';
	Utils.setSelection('p', 0);
	Utils.pressEnter({shiftKey: true});
	equal(editor.getContent(),'<p>\u00a0</p><p>abc</p>');
});

test('Shift+Enter in middle of P with forced_root_block set to false', function() {
	editor.settings.forced_root_block = false;
	editor.getBody().innerHTML = '<p>abcd</p>';
	Utils.setSelection('p', 2);
	Utils.pressEnter({shiftKey: true});
	equal(editor.getContent(),'<p>ab</p><p>cd</p>');
});

test('Shift+Enter at the end of P with forced_root_block set to false', function() {
	editor.settings.forced_root_block = false;
	editor.getBody().innerHTML = '<p>abc</p>';
	Utils.setSelection('p', 3);
	Utils.pressEnter({shiftKey: true});
	equal(editor.getContent(),'<p>abc</p><p>\u00a0</p>');
});

test('Shift+Enter in body with forced_root_block set to false', function() {
	editor.settings.forced_root_block = false;
	editor.getBody().innerHTML = 'abcd';
	var rng = editor.dom.createRng();
	rng.setStart(editor.getBody().firstChild, 2);
	rng.setEnd(editor.getBody().firstChild, 2);
	editor.selection.setRng(rng);
	Utils.pressEnter({shiftKey: true});
	equal(editor.getContent(),'<p>ab</p><p>cd</p>');
});

test('Enter at the end of DIV layer', function() {
	editor.settings.br_in_pre = false;
	editor.setContent('<div style="position: absolute; top: 1px; left: 2px;">abcd</div>');
	Utils.setSelection('div', 4);
	Utils.pressEnter();
	equal(editor.getContent(),'<div style="position: absolute; top: 1px; left: 2px;"><p>abcd</p><p>\u00a0</p></div>');
});

test('Enter in div inside contentEditable:false div', function() {
	editor.getBody().innerHTML = '<div data-mce-contenteditable="false"><div>abcd</div></div>';
	Utils.setSelection('div div', 2);
	Utils.pressEnter();
	equal(Utils.cleanHtml(editor.getBody().innerHTML), '<div data-mce-contenteditable="false"><div>abcd</div></div>');
});

test('Enter in div with contentEditable:true inside contentEditable:false div', function() {
	editor.getBody().innerHTML = '<div data-mce-contenteditable="false"><div data-mce-contenteditable="true">abcd</div></div>';
	Utils.setSelection('div div', 2);
	Utils.pressEnter();
	equal(Utils.cleanHtml(editor.getBody().innerHTML), '<div data-mce-contenteditable="false"><div data-mce-contenteditable="true"><p>ab</p><p>cd</p></div></div>');
});

test('Enter in span with contentEditable:true inside contentEditable:false div', function() {
	editor.getBody().innerHTML = '<div data-mce-contenteditable="false"><span data-mce-contenteditable="true">abcd</span></div>';
	Utils.setSelection('span', 2);
	Utils.pressEnter();
	equal(Utils.cleanHtml(editor.getBody().innerHTML), '<div data-mce-contenteditable="false"><span data-mce-contenteditable="true">abcd</span></div>');
});

test('Shift+Enter in span with contentEditable:true inside contentEditable:false div', function() {
	editor.getBody().innerHTML = '<div data-mce-contenteditable="false"><span data-mce-contenteditable="true">abcd</span></div>';
	Utils.setSelection('span', 2);
	Utils.pressEnter({shiftKey: true});
	equal(Utils.cleanHtml(editor.getBody().innerHTML), '<div data-mce-contenteditable="false"><span data-mce-contenteditable="true">ab<br>cd</span></div>');
});

test('Enter in span with contentEditable:true inside contentEditable:false div and forced_root_block: false', function() {
	editor.settings.forced_root_block = false;
	editor.getBody().innerHTML = '<div data-mce-contenteditable="false"><span data-mce-contenteditable="true">abcd</span></div>';
	Utils.setSelection('span', 2);
	Utils.pressEnter();
	equal(Utils.cleanHtml(editor.getBody().innerHTML), '<div data-mce-contenteditable="false"><span data-mce-contenteditable="true">ab<br>cd</span></div>');
});

test('Enter in em within contentEditable:true div inside contentEditable:false div', function() {
	editor.getBody().innerHTML = '<div data-mce-contenteditable="false"><div data-mce-contenteditable="true"><em>abcd</em></div></div>';
	Utils.setSelection('em', 2);
	Utils.pressEnter();
	equal(Utils.cleanHtml(editor.getBody().innerHTML), '<div data-mce-contenteditable="false"><div data-mce-contenteditable="true"><p><em>ab</em></p><p><em>cd</em></p></div></div>');
});

test('Enter at end of text in a span inside a P and keep_styles: false', function() {
	editor.settings.keep_styles = false;
	editor.getBody().innerHTML = '<p><em><span style="font-size: 13px;">X</span></em></p>';
	Utils.setSelection('span', 1);
	Utils.pressEnter();
	equal(editor.getContent(),'<p><em><span style="font-size: 13px;">X</span></em></p><p>\u00a0</p>');
});

test('Shift+enter in LI when forced_root_block: false', function() {
	editor.settings.forced_root_block = false;
	editor.getBody().innerHTML = '<ul><li>text</li></ul>';
	Utils.setSelection('li', 2);
	Utils.pressEnter({shiftKey: true});
	equal(editor.getContent(),'<ul><li>te<br />xt</li></ul>');
});

test('Enter when forced_root_block: false and force_p_newlines: true', function() {
	editor.settings.forced_root_block = false;
	editor.settings.force_p_newlines = true;
	editor.getBody().innerHTML = 'text';
	Utils.setSelection('body', 2);
	Utils.pressEnter();
	equal(editor.getContent(),'<p>te</p><p>xt</p>');
});

test('Enter at end of br line', function() {
	editor.settings.forced_root_block = false;
	editor.settings.force_p_newlines = true;
	editor.getBody().innerHTML = '<p>a<br>b</p>';
	Utils.setSelection('p', 1);
	Utils.pressEnter();
	equal(editor.getContent(), '<p>a</p><p><br />b</p>');

	var rng = editor.selection.getRng(true);
	equal(rng.startContainer.nodeName, 'P');
	equal(rng.startContainer.childNodes[rng.startOffset].nodeName, 'BR');
});

// Ignore on IE 7, 8 this is a known bug not worth fixing
if (!tinymce.Env.ie || tinymce.Env.ie > 8) {
	test('Enter before BR between DIVs', function() {
		editor.getBody().innerHTML = '<div>a<span>b</span>c</div><br /><div>d</div>';
		var rng = editor.dom.createRng();
		rng.setStartBefore(editor.dom.select('br')[0]);
		rng.setEndBefore(editor.dom.select('br')[0]);
		editor.selection.setRng(rng);
		Utils.pressEnter();
		equal(editor.getContent(),'<div>a<span>b</span>c</div><p>\u00a0</p><p>\u00a0</p><div>d</div>');
	});
}

// Only test these on modern browsers
if (window.getSelection) {
	test('Enter behind table element', function() {
		var rng = editor.dom.createRng();

		editor.getBody().innerHTML = '<table><tbody><td>x</td></tbody></table>';
		rng.setStartAfter(editor.getBody().lastChild);
		rng.setEndAfter(editor.getBody().lastChild);
		editor.selection.setRng(rng);

		Utils.pressEnter();
		equal(editor.getContent(),'<table><tbody><tr><td>x</td></tr></tbody></table><p>\u00a0</p>');
	});

	test('Enter before table element', function() {
		var rng = editor.dom.createRng();

		editor.getBody().innerHTML = '<table><tbody><td>x</td></tbody></table>';
		rng.setStartBefore(editor.getBody().lastChild);
		rng.setEndBefore(editor.getBody().lastChild);
		editor.selection.setRng(rng);

		Utils.pressEnter();
		equal(editor.getContent(),'<p>\u00a0</p><table><tbody><tr><td>x</td></tr></tbody></table>');
	});

	test('Enter behind table followed by a p', function() {
		var rng = editor.dom.createRng();

		editor.getBody().innerHTML = '<table><tbody><td>x</td></tbody></table><p>x</p>';
		rng.setStartAfter(editor.getBody().firstChild);
		rng.setEndAfter(editor.getBody().firstChild);
		editor.selection.setRng(rng);

		Utils.pressEnter();
		equal(editor.getContent(),'<table><tbody><tr><td>x</td></tr></tbody></table><p>\u00a0</p><p>x</p>');
	});

	test('Enter before table element preceded by a p', function() {
		var rng = editor.dom.createRng();

		editor.getBody().innerHTML = '<p>x</p><table><tbody><td>x</td></tbody></table>';
		rng.setStartBefore(editor.getBody().lastChild);
		rng.setStartBefore(editor.getBody().lastChild);
		editor.selection.setRng(rng);

		Utils.pressEnter();
		equal(editor.getContent(),'<p>x</p><p>\u00a0</p><table><tbody><tr><td>x</td></tr></tbody></table>');
	});

	test('Enter twice before table element', function(){
		var rng = editor.dom.createRng();

		editor.getBody().innerHTML = '<table><tbody><tr><td>x</td></tr></tbody></table>';
		rng.setStartBefore(editor.getBody().lastChild);
		rng.setEndBefore(editor.getBody().lastChild);
		editor.selection.setRng(rng);

		Utils.pressEnter();
		Utils.pressEnter();
		equal(editor.getContent(),'<p>\u00a0</p><p>\u00a0</p><table><tbody><tr><td>x</td></tr></tbody></table>');
	});
}
