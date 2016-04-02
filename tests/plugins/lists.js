ModuleLoader.require([
], function() {
	var inlineEditor2;

	module("tinymce.plugins.Lists", {
		setupModule: function() {
			document.getElementById('view').innerHTML = (
				'<textarea id="elm1"></textarea>' +
				'<div id="elm2"></div>' +
				'<div id="lists">' +
					'<ul><li>before</li></ul>' +
					'<ul id="elm3"><li>x</li></ul>' +
					'<ul><li>after</li></ul>' +
				'</div>'
			);

			QUnit.stop();

			function wait() {
				if (window.editor && window.inlineEditor && inlineEditor2) {
					if (!QUnit.started) {
						QUnit.start();
						QUnit.started = true;
					}
				} else {
					tinymce.util.Delay.setTimeout(wait, 0);
				}
			}

			tinymce.init({
				selector: '#elm1',
				plugins: "lists",
				add_unload_trigger: false,
				skin: false,
				indent: false,
				schema: 'html5',
				entities: 'raw',
				valid_elements: 'li,ol,ul,dl,dt,dd,em,strong,span,#p,div,br',
				valid_styles: {
					'*': 'color,font-size,font-family,background-color,font-weight,font-style,text-decoration,float,margin,margin-top,margin-right,margin-bottom,margin-left,display,position,top,left'
				},
				disable_nodechange: true,
				init_instance_callback: function(ed) {
					window.editor = ed;
					wait();
				}
			});

			tinymce.init({
				selector: '#elm2',
				inline: true,
				add_unload_trigger: false,
				skin: false,
				plugins: "lists",
				disable_nodechange: true,
				init_instance_callback: function(ed) {
					window.inlineEditor = ed;
					wait();
				}
			});

			tinymce.init({
				selector: '#elm3',
				inline: true,
				add_unload_trigger: false,
				skin: false,
				plugins: "lists",
				disable_nodechange: true,
				init_instance_callback: function(ed) {
					inlineEditor2 = ed;
					wait();
				}
			});
		},

		teardown: function() {
			editor.settings.forced_root_block = 'p';
		},

		teardownModule: function() {
			inlineEditor2.remove();
			inlineEditor2 = null;
		}
	});

	function trimBrs(html) {
		return html.toLowerCase().replace(/<br[^>]*>|[\r\n]+/gi, '');
	}

	function execCommand(cmd) {
		if (editor.editorCommands.hasCustomCommand(cmd)) {
			editor.execCommand(cmd);
		}
	}

	test('Apply UL list to single P', function() {
		editor.getBody().innerHTML = trimBrs(
			'<p>a</p>'
		);

		editor.focus();
		Utils.setSelection('p', 0);
		execCommand('InsertUnorderedList');

		equal(editor.getContent(), '<ul><li>a</li></ul>');
		equal(editor.selection.getNode().nodeName, 'LI');
	});

	test('Apply UL list to single empty P', function() {
		editor.getBody().innerHTML = trimBrs(
			'<p><br></p>'
		);

		editor.focus();
		Utils.setSelection('p', 0);
		execCommand('InsertUnorderedList');

		equal(trimBrs(editor.getContent({format: 'raw'})), '<ul><li></li></ul>');
		equal(editor.selection.getNode().nodeName, 'LI');
	});

	test('Apply UL list to multiple Ps', function() {
		editor.getBody().innerHTML = trimBrs(
			'<p>a</p>' +
			'<p>b</p>' +
			'<p>c</p>'
		);

		editor.focus();
		Utils.setSelection('p', 0, 'p:last', 0);
		execCommand('InsertUnorderedList');

		equal(editor.getContent(),
			'<ul>' +
				'<li>a</li>' +
				'<li>b</li>' +
				'<li>c</li>' +
			'</ul>'
		);
		equal(editor.selection.getStart().nodeName, 'LI');
	});

	test('Apply OL list to single P', function() {
		editor.getBody().innerHTML = trimBrs(
			'<p>a</p>'
		);

		editor.focus();
		Utils.setSelection('p', 0);
		execCommand('InsertOrderedList');

		equal(editor.getContent(), '<ol><li>a</li></ol>');
		equal(editor.selection.getNode().nodeName, 'LI');
	});

	test('Apply OL list to single empty P', function() {
		editor.getBody().innerHTML = trimBrs(
			'<p><br></p>'
		);

		editor.focus();
		Utils.setSelection('p', 0);
		execCommand('InsertOrderedList');

		equal(trimBrs(editor.getContent({format: 'raw'})), '<ol><li></li></ol>');
		equal(editor.selection.getNode().nodeName, 'LI');
	});

	test('Apply OL list to multiple Ps', function() {
		editor.getBody().innerHTML = trimBrs(
			'<p>a</p>' +
			'<p>b</p>' +
			'<p>c</p>'
		);

		editor.focus();
		Utils.setSelection('p', 0, 'p:last', 0);
		execCommand('InsertOrderedList');

		equal(editor.getContent(),
			'<ol>' +
				'<li>a</li>' +
				'<li>b</li>' +
				'<li>c</li>' +
			'</ol>'
		);
		equal(editor.selection.getStart().nodeName, 'LI');
	});

	test('Apply OL to UL list', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a</li>' +
				'<li>b</li>' +
				'<li>c</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li', 0, 'li:last', 0);
		execCommand('InsertOrderedList');

		equal(editor.getContent(),
			'<ol>' +
				'<li>a</li>' +
				'<li>b</li>' +
				'<li>c</li>' +
			'</ol>'
		);
		equal(editor.selection.getStart().nodeName, 'LI');
	});

	test('Apply OL to UL list with collapsed selection', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a</li>' +
				'<li>b</li>' +
				'<li>c</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li:nth-child(2)');
		execCommand('InsertOrderedList');

		equal(editor.getContent(),
			'<ol>' +
				'<li>a</li>' +
				'<li>b</li>' +
				'<li>c</li>' +
			'</ol>'
		);
		equal(editor.selection.getStart().nodeName, 'LI');
	});

	test('Apply UL to OL list', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ol>' +
				'<li>a</li>' +
				'<li>b</li>' +
				'<li>c</li>' +
			'</ol>'
		);

		editor.focus();
		Utils.setSelection('li', 0, 'li:last', 0);
		execCommand('InsertUnorderedList');

		equal(editor.getContent(),
			'<ul>' +
				'<li>a</li>' +
				'<li>b</li>' +
				'<li>c</li>' +
			'</ul>'
		);
		equal(editor.selection.getStart().nodeName, 'LI');
	});

	test('Apply UL to OL list collapsed selection', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ol>' +
				'<li>a</li>' +
				'<li>b</li>' +
				'<li>c</li>' +
			'</ol>'
		);

		editor.focus();
		Utils.setSelection('li:nth-child(2)');
		execCommand('InsertUnorderedList');

		equal(editor.getContent(),
			'<ul>' +
				'<li>a</li>' +
				'<li>b</li>' +
				'<li>c</li>' +
			'</ul>'
		);
		equal(editor.selection.getStart().nodeName, 'LI');
	});

	test('Apply UL to P and merge with adjacent lists', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a</li>' +
			'</ul>' +
			'<p>b</p>' +
			'<ul>' +
				'<li>c</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('p', 1);
		execCommand('InsertUnorderedList');

		equal(editor.getContent(),
			'<ul>' +
				'<li>a</li>' +
				'<li>b</li>' +
				'<li>c</li>' +
			'</ul>'
		);
		equal(editor.selection.getStart().nodeName, 'LI');
	});

	test('Apply UL to OL and merge with adjacent lists', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a</li>' +
			'</ul>' +
			'<ol><li>b</li></ol>' +
			'<ul>' +
				'<li>c</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('ol li', 1);
		execCommand('InsertUnorderedList');

		equal(editor.getContent(),
			'<ul>' +
				'<li>a</li>' +
				'<li>b</li>' +
				'<li>c</li>' +
			'</ul>'
		);
		equal(editor.selection.getStart().nodeName, 'LI');
	});

	test('Apply OL to P and merge with adjacent lists', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ol>' +
				'<li>a</li>' +
			'</ol>' +
			'<p>b</p>' +
			'<ol>' +
				'<li>c</li>' +
			'</ol>'
		);

		editor.focus();
		Utils.setSelection('p', 1);
		execCommand('InsertOrderedList');

		equal(editor.getContent(),
			'<ol>' +
				'<li>a</li>' +
				'<li>b</li>' +
				'<li>c</li>' +
			'</ol>'
		);
		equal(editor.selection.getStart().nodeName, 'LI');
	});

	test('Apply OL to UL and merge with adjacent lists', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ol>' +
				'<li>a</li>' +
			'</ol>' +
			'<ul><li>b</li></ul>' +
			'<ol>' +
				'<li>c</li>' +
			'</ol>'
		);

		editor.focus();
		Utils.setSelection('ul li', 1);
		execCommand('InsertOrderedList');

		equal(editor.getContent(),
			'<ol>' +
				'<li>a</li>' +
				'<li>b</li>' +
				'<li>c</li>' +
			'</ol>'
		);
		equal(editor.selection.getStart().nodeName, 'LI');
	});

	test('Apply UL list to single text line', function() {
		editor.settings.forced_root_block = false;

		editor.getBody().innerHTML = (
			'a'
		);

		editor.focus();
		Utils.setSelection('body', 0);
		execCommand('InsertUnorderedList');

		equal(editor.getContent(), '<ul><li>a</li></ul>');
		equal(editor.selection.getNode().nodeName, 'LI');
	});

	test('Apply UL list to single text line with BR', function() {
		editor.settings.forced_root_block = false;

		editor.getBody().innerHTML = (
			'a<br>'
		);

		editor.focus();
		Utils.setSelection('body', 0);
		execCommand('InsertUnorderedList');

		equal(editor.getContent(), '<ul><li>a</li></ul>');
		equal(editor.selection.getNode().nodeName, 'LI');
	});

	test('Apply UL list to multiple lines separated by BR', function() {
		editor.settings.forced_root_block = false;

		editor.getBody().innerHTML = (
			'a<br>' +
			'b<br>' +
			'c'
		);

		editor.focus();
		editor.execCommand('SelectAll');
		execCommand('InsertUnorderedList');

		equal(editor.getContent(),
			'<ul>' +
				'<li>a</li>' +
				'<li>b</li>' +
				'<li>c</li>' +
			'</ul>'
		);
		equal(editor.selection.getStart().nodeName, 'LI');
	});

	test('Apply UL list to multiple lines separated by BR and with trailing BR', function() {
		editor.settings.forced_root_block = false;

		editor.getBody().innerHTML = (
			'a<br>' +
			'b<br>' +
			'c<br>'
		);

		editor.focus();
		editor.execCommand('SelectAll');
		execCommand('InsertUnorderedList');

		equal(editor.getContent(),
			'<ul>' +
				'<li>a</li>' +
				'<li>b</li>' +
				'<li>c</li>' +
			'</ul>'
		);
		equal(editor.selection.getStart().nodeName, 'LI');
	});

	test('Apply UL list to multiple formatted lines separated by BR', function() {
		editor.settings.forced_root_block = false;

		editor.getBody().innerHTML = (
			'<strong>a</strong><br>' +
			'<span>b</span><br>' +
			'<em>c</em>'
		);

		editor.focus();
		Utils.setSelection('strong', 0, 'em', 0);
		execCommand('InsertUnorderedList');

		equal(editor.getContent(),
			'<ul>' +
				'<li><strong>a</strong></li>' +
				'<li><span>b</span></li>' +
				'<li><em>c</em></li>' +
			'</ul>'
		);

		equal(editor.selection.getStart().nodeName, 'STRONG');
		equal(editor.selection.getEnd().nodeName, tinymce.Env.ie && tinymce.Env.ie < 9 ? 'LI' : 'EM'); // Old IE will return the end LI not a big deal
	});

	// Ignore on IE 7, 8 this is a known bug not worth fixing
	if (!tinymce.Env.ie || tinymce.Env.ie > 8) {
		test('Apply UL list to br line and text block line', function() {
			editor.settings.forced_root_block = false;

			editor.setContent(
				'a' +
				'<p>b</p>'
			);

			var rng = editor.dom.createRng();
			rng.setStart(editor.getBody().firstChild, 0);
			rng.setEnd(editor.getBody().lastChild.firstChild, 1);
			editor.selection.setRng(rng);
			execCommand('InsertUnorderedList');

			equal(editor.getContent(),
				'<ul>' +
					'<li>a</li>' +
					'<li>b</li>' +
				'</ul>'
			);

			equal(editor.selection.getStart().nodeName, 'LI');
			equal(editor.selection.getEnd().nodeName, 'LI');
		});
	}

	test('Apply UL list to text block line and br line', function() {
		editor.settings.forced_root_block = false;

		editor.getBody().innerHTML = (
			'<p>a</p>' +
			'b'
		);

		editor.focus();
		var rng = editor.dom.createRng();
		rng.setStart(editor.getBody().firstChild.firstChild, 0);
		rng.setEnd(editor.getBody().lastChild, 1);
		editor.selection.setRng(rng);
		execCommand('InsertUnorderedList');

		equal(editor.getContent(),
			'<ul>' +
				'<li>a</li>' +
				'<li>b</li>' +
			'</ul>'
		);

		equal(editor.selection.getStart().nodeName, 'LI');
		equal(editor.selection.getEnd().nodeName, 'LI');
	});

	test('Apply UL list to all BR lines (SelectAll)', function() {
		editor.settings.forced_root_block = false;

		editor.getBody().innerHTML = (
			'a<br>' +
			'b<br>' +
			'c<br>'
		);

		editor.focus();
		editor.execCommand('SelectAll');
		execCommand('InsertUnorderedList');

		equal(editor.getContent(),
			'<ul>' +
				'<li>a</li>' +
				'<li>b</li>' +
				'<li>c</li>' +
			'</ul>'
		);
	});

	test('Apply UL list to all P lines (SelectAll)', function() {
		editor.getBody().innerHTML = (
			'<p>a</p>' +
			'<p>b</p>' +
			'<p>c</p>'
		);

		editor.focus();
		editor.execCommand('SelectAll');
		execCommand('InsertUnorderedList');

		equal(editor.getContent(),
			'<ul>' +
				'<li>a</li>' +
				'<li>b</li>' +
				'<li>c</li>' +
			'</ul>'
		);
	});

	// Remove

	test('Remove UL at single LI', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li');
		execCommand('InsertUnorderedList');

		equal(editor.getContent(),
			'<p>a</p>'
		);
		equal(editor.selection.getStart().nodeName, 'P');
	});

	test('Remove UL at start LI', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a</li>' +
				'<li>b</li>' +
				'<li>c</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li');
		execCommand('InsertUnorderedList');

		equal(editor.getContent(),
			'<p>a</p>' +
			'<ul>' +
				'<li>b</li>' +
				'<li>c</li>' +
			'</ul>'
		);
		equal(editor.selection.getStart().nodeName, 'P');
	});

	test('Remove UL at start empty LI', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li><br></li>' +
				'<li>b</li>' +
				'<li>c</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li');
		execCommand('InsertUnorderedList');

		equal(editor.getContent(),
			'<p>\u00a0</p>' +
			'<ul>' +
				'<li>b</li>' +
				'<li>c</li>' +
			'</ul>'
		);
		equal(editor.selection.getNode().nodeName, 'P');
	});

	test('Remove UL at middle LI', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a</li>' +
				'<li>b</li>' +
				'<li>c</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li:nth-child(2)', 1);
		execCommand('InsertUnorderedList');

		equal(editor.getContent(),
			'<ul>' +
				'<li>a</li>' +
			'</ul>' +
			'<p>b</p>' +
			'<ul>' +
				'<li>c</li>' +
			'</ul>'
		);
		equal(editor.selection.getStart().nodeName, 'P');
	});

	test('Remove UL at middle empty LI', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a</li>' +
				'<li><br></li>' +
				'<li>c</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li:nth-child(2)', 0);
		execCommand('InsertUnorderedList');

		equal(editor.getContent(),
			'<ul>' +
				'<li>a</li>' +
			'</ul>' +
			'<p>\u00a0</p>' +
			'<ul>' +
				'<li>c</li>' +
			'</ul>'
		);
		equal(editor.selection.getNode().nodeName, 'P');
	});

	test('Remove UL at end LI', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a</li>' +
				'<li>b</li>' +
				'<li>c</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li:last', 1);
		execCommand('InsertUnorderedList');

		equal(editor.getContent(),
			'<ul>' +
				'<li>a</li>' +
				'<li>b</li>' +
			'</ul>' +
			'<p>c</p>'
		);
		equal(editor.selection.getStart().nodeName, 'P');
	});

	test('Remove UL at end empty LI', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a</li>' +
				'<li>b</li>' +
				'<li><br></li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li:last', 0);
		execCommand('InsertUnorderedList');

		equal(editor.getContent(),
			'<ul>' +
				'<li>a</li>' +
				'<li>b</li>' +
			'</ul>' +
			'<p>\u00a0</p>'
		);
		equal(editor.selection.getNode().nodeName, 'P');
	});

	test('Remove UL at middle LI inside parent OL', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ol>' +
				'<li>a</li>' +
				'<ul>' +
					'<li>b</li>' +
					'<li>c</li>' +
					'<li>d</li>' +
				'</ul>' +
				'<li>e</li>' +
			'</ol>'
		);

		editor.focus();
		Utils.setSelection('ul li:nth-child(2)', 1);
		execCommand('InsertUnorderedList');

		equal(editor.getContent(),
			'<ol>' +
				'<li>a</li>' +
				'<ul>' +
					'<li>b</li>' +
				'</ul>' +
			'</ol>' +
			'<p>c</p>' +
			'<ol>' +
				'<ul>' +
					'<li>d</li>' +
				'</ul>' +
				'<li>e</li>' +
			'</ol>'
		);
		equal(editor.selection.getStart().nodeName, 'P');
	});

	test('Remove UL at middle LI inside parent OL (html5)', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ol>' +
				'<li>a' +
					'<ul>' +
						'<li>b</li>' +
						'<li>c</li>' +
						'<li>d</li>' +
					'</ul>' +
				'</li>' +
				'<li>e</li>' +
			'</ol>'
		);

		editor.focus();
		Utils.setSelection('ul li:nth-child(2)', 1);
		execCommand('InsertUnorderedList');

		equal(editor.getContent(),
			'<ol>' +
				'<li>a' +
					'<ul>' +
						'<li>b</li>' +
					'</ul>' +
				'</li>' +
			'</ol>' +
			'<p>c</p>' +
			'<ol>' +
				'<li>' +
					'<ul>' +
						'<li>d</li>' +
					'</ul>' +
				'</li>' +
				'<li>e</li>' +
			'</ol>'
		);
		equal(editor.selection.getStart().nodeName, 'P');
	});

	test('Remove UL with single LI in BR mode', function() {
		editor.settings.forced_root_block = false;

		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li', 1);
		execCommand('InsertUnorderedList');

		equal(editor.getContent(),
			'a'
		);
		equal(editor.selection.getStart().nodeName, 'BODY');
	});

	test('Remove UL with multiple LI in BR mode', function() {
		editor.settings.forced_root_block = false;

		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a</li>' +
				'<li>b</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li:first', 1, 'li:last', 1);
		execCommand('InsertUnorderedList');

		equal(editor.getContent(),
			'a<br />' +
			'b'
		);
		equal(editor.selection.getStart().nodeName, 'BODY');
	});

	test('Remove empty UL between two textblocks', function() {
		editor.getBody().innerHTML = trimBrs(
			'<div>a</div>' +
			'<ul>' +
				'<li></li>' +
			'</ul>' +
			'<div>b</div>'
		);

		editor.focus();
		Utils.setSelection('li:first', 0);
		execCommand('InsertUnorderedList');

		equal(editor.getContent(),
			'<div>a</div>' +
			'<p>\u00a0</p>' +
			'<div>b</div>'
		);
		equal(editor.selection.getNode().nodeName, 'P');
	});

	test('Remove indented list with single item', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a' +
					'<ul>' +
						'<li>b</li>' +
					'</ul>' +
				'</li>' +
				'<li>c</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li li', 0, 'li li', 1);
		execCommand('InsertUnorderedList');

		equal(editor.getContent(),
			'<ul>' +
				'<li>a</li>' +
			'</ul>' +
			'<p>b</p>' +
			'<ul>' +
				'<li>c</li>' +
			'</ul>'
		);
		equal(editor.selection.getNode().nodeName, 'P');
	});

	test('Remove indented list with multiple items', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a' +
					'<ul>' +
						'<li>b</li>' +
						'<li>c</li>' +
					'</ul>' +
				'</li>' +
				'<li>d</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li li:first', 0, 'li li:last', 1);
		execCommand('InsertUnorderedList');

		equal(editor.getContent(),
			'<ul>' +
				'<li>a</li>' +
			'</ul>' +
			'<p>b</p>' +
			'<p>c</p>' +
			'<ul>' +
				'<li>d</li>' +
			'</ul>'
		);
		equal(editor.selection.getStart().firstChild.data, 'b');
		equal(editor.selection.getEnd().firstChild.data, 'c');
	});

	// Ignore on IE 7, 8 this is a known bug not worth fixing
	if (!tinymce.Env.ie || tinymce.Env.ie > 8) {
		test('Remove empty UL between two textblocks in BR mode', function() {
			editor.settings.forced_root_block = false;

			editor.getBody().innerHTML = trimBrs(
				'<div>a</div>' +
				'<ul>' +
					'<li></li>' +
				'</ul>' +
				'<div>b</div>'
			);

			editor.focus();
			Utils.setSelection('li:first', 0);
			execCommand('InsertUnorderedList');

			equal(editor.getContent(),
				'<div>a</div>' +
				'<br />' +
				'<div>b</div>'
			);
			equal(editor.selection.getStart().nodeName, 'BR');
		});
	}

	// Outdent

	test('Outdent inside LI in beginning of OL in LI', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ol>' +
				'<li>a' +
					'<ol>' +
						'<li>b</li>' +
						'<li>c</li>' +
					'</ol>' +
				'</li>' +
			'</ol>'
		);

		editor.focus();
		Utils.setSelection('li li', 1);
		execCommand('Outdent');

		equal(editor.getContent(),
			'<ol>' +
				'<li>a</li>' +
				'<li>b' +
					'<ol>' +
						'<li>c</li>' +
					'</ol>' +
				'</li>' +
			'</ol>'
		);

		equal(editor.selection.getNode().nodeName, 'LI');
	});

	test('Outdent inside LI in middle of OL in LI', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ol>' +
				'<li>a' +
					'<ol>' +
						'<li>b</li>' +
						'<li>c</li>' +
						'<li>d</li>' +
					'</ol>' +
				'</li>' +
			'</ol>'
		);

		editor.focus();
		Utils.setSelection('li li:nth-child(2)', 1);
		execCommand('Outdent');

		equal(editor.getContent(),
			'<ol>' +
				'<li>a' +
					'<ol>' +
						'<li>b</li>' +
					'</ol>' +
				'</li>' +
				'<li>c' +
					'<ol>' +
						'<li>d</li>' +
					'</ol>' +
				'</li>' +
			'</ol>'
		);

		equal(editor.selection.getNode().nodeName, 'LI');
	});

	test('Outdent inside LI in end of OL in LI', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ol>' +
				'<li>a' +
					'<ol>' +
						'<li>b</li>' +
						'<li>c</li>' +
					'</ol>' +
				'</li>' +
			'</ol>'
		);

		editor.focus();
		Utils.setSelection('li li:last', 1);
		execCommand('Outdent');

		equal(editor.getContent(),
			'<ol>' +
				'<li>a' +
					'<ol>' +
						'<li>b</li>' +
					'</ol>' +
				'</li>' +
				'<li>c</li>' +
			'</ol>'
		);

		equal(editor.selection.getNode().nodeName, 'LI');
	});

	// Nested lists in OL elements

	test('Outdent inside LI in beginning of OL in OL', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ol>' +
				'<li>a</li>' +
				'<ol>' +
					'<li>b</li>' +
					'<li>c</li>' +
				'</ol>' +
			'</ol>'
		);

		editor.focus();
		Utils.setSelection('ol ol li', 1);
		execCommand('Outdent');

		equal(editor.getContent(),
			'<ol>' +
				'<li>a</li>' +
				'<li>b</li>' +
				'<ol>' +
					'<li>c</li>' +
				'</ol>' +
			'</ol>'
		);

		equal(editor.selection.getNode().nodeName, 'LI');
	});

	test('Outdent inside LI in middle of OL in OL', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ol>' +
				'<li>a</li>' +
				'<ol>' +
					'<li>b</li>' +
					'<li>c</li>' +
					'<li>d</li>' +
				'</ol>' +
			'</ol>'
		);

		editor.focus();
		Utils.setSelection('ol ol li:nth-child(2)', 1);
		execCommand('Outdent');

		equal(editor.getContent(),
			'<ol>' +
				'<li>a</li>' +
				'<ol>' +
					'<li>b</li>' +
				'</ol>' +
				'<li>c</li>' +
				'<ol>' +
					'<li>d</li>' +
				'</ol>' +
			'</ol>'
		);

		equal(editor.selection.getNode().nodeName, 'LI');
	});

	test('Outdent inside first/last LI in inner OL', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ol>' +
				'<li>1' +
				'<ol>' +
					'<li>2</li>' +
					'<li>3</li>' +
				'</ol>' +
				'</li>' +
				'<li>4</li>' +
			'</ol>'
		);

		editor.focus();
		Utils.setSelection('ol ol li:nth-child(1)', 0, 'ol ol li:nth-child(2)', 1);
		execCommand('Outdent');

		equal(editor.getContent(),
			'<ol>' +
				'<li>1</li>' +
				'<li>2</li>' +
				'<li>3</li>' +
				'<li>4</li>' +
			'</ol>'
		);

		equal(editor.selection.getRng(true).startContainer.nodeValue, '2');
		equal(editor.selection.getRng(true).endContainer.nodeValue, '3');
	});

	test('Outdent inside first LI in inner OL where OL is single child of parent LI', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ol>' +
				'<li>a</li>' +
				'<li>' +
					'<ol>' +
						'<li>b</li>' +
						'<li>c</li>' +
					'</ol>' +
				'</li>' +
			'</ol>'
		);

		editor.focus();
		Utils.setSelection('ol ol li:first', 0);
		execCommand('Outdent');

		equal(editor.getContent(),
			'<ol>' +
				'<li>a</li>' +
				'<li>b' +
					'<ol>' +
						'<li>c</li>' +
					'</ol>' +
				'</li>' +
			'</ol>'
		);

		equal(editor.selection.getNode().nodeName, 'LI');
	});

	test('Outdent inside LI in end of OL in OL', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ol>' +
				'<li>a</li>' +
				'<ol>' +
					'<li>b</li>' +
					'<li>c</li>' +
				'</ol>' +
			'</ol>'
		);

		editor.focus();
		Utils.setSelection('ol ol li:last', 1);
		execCommand('Outdent');

		equal(editor.getContent(),
			'<ol>' +
				'<li>a</li>' +
				'<ol>' +
					'<li>b</li>' +
				'</ol>' +
				'<li>c</li>' +
			'</ol>'
		);

		equal(editor.selection.getNode().nodeName, 'LI');
	});

	test('Outdent inside only child LI in OL in OL', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ol>' +
				'<li>a' +
					'<ol>' +
						'<li>b</li>' +
					'</ol>' +
				'</li>' +
			'</ol>'
		);

		editor.focus();
		Utils.setSelection('ol ol li', 0);
		execCommand('Outdent');

		equal(editor.getContent(),
			'<ol>' +
				'<li>a</li>' +
				'<li>b</li>' +
			'</ol>'
		);

		equal(editor.selection.getNode().nodeName, 'LI');
	});

	test('Outdent multiple LI in OL and nested OL', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ol>' +
				'<li>a' +
					'<ol>' +
						'<li>b</li>' +
					'</ol>' +
				'</li>' +
			'</ol>'
		);

		editor.focus();
		Utils.setSelection('li', 0, 'li li', 1);
		execCommand('Outdent');

		equal(editor.getContent(),
			'<p>a</p>' +
			'<ol>' +
				'<li>b</li>' +
			'</ol>'
		);
	});

	// Indent

	test('Indent single LI in OL', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ol>' +
				'<li>a</li>' +
			'</ol>'
		);

		editor.focus();
		Utils.setSelection('li', 0);
		execCommand('Indent');

		equal(editor.getContent(),
			'<ol>' +
				'<li>a</li>' +
			'</ol>'
		);

		equal(editor.selection.getNode().nodeName, 'LI');
	});

	test('Indent middle LI in OL', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ol>' +
				'<li>a</li>' +
				'<li>b</li>' +
				'<li>c</li>' +
			'</ol>'
		);

		editor.focus();
		Utils.setSelection('li:nth-child(2)', 0);
		execCommand('Indent');

		equal(editor.getContent(),
			'<ol>' +
				'<li>a' +
					'<ol>' +
						'<li>b</li>' +
					'</ol>' +
				'</li>' +
				'<li>c</li>' +
			'</ol>'
		);

		equal(editor.selection.getNode().nodeName, 'LI');
	});

	test('Indent last LI in OL', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ol>' +
				'<li>a</li>' +
				'<li>b</li>' +
			'</ol>'
		);

		editor.focus();
		Utils.setSelection('li:last', 0);
		execCommand('Indent');

		equal(editor.getContent(),
			'<ol>' +
				'<li>a' +
					'<ol>' +
						'<li>b</li>' +
					'</ol>' +
				'</li>' +
			'</ol>'
		);

		equal(editor.selection.getNode().nodeName, 'LI');
	});

	test('Indent last LI to same level as middle LI', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ol>' +
				'<li>a' +
					'<ol>' +
						'<li>b</li>' +
					'</ol>' +
				'</li>' +
				'<li>c</li>' +
			'</ol>'
		);

		editor.focus();
		Utils.setSelection('li:last', 1);
		execCommand('Indent');

		equal(editor.getContent(),
			'<ol>' +
				'<li>a' +
					'<ol>' +
						'<li>b</li>' +
						'<li>c</li>' +
					'</ol>' +
				'</li>' +
			'</ol>'
		);

		equal(editor.selection.getNode().nodeName, 'LI');
	});

	test('Indent first LI and nested LI OL', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ol>' +
				'<li>a' +
					'<ol>' +
						'<li>b</li>' +
					'</ol>' +
				'</li>' +
			'</ol>'
		);

		editor.focus();
		Utils.setSelection('li', 0, 'li li', 0);
		execCommand('Indent');

		equal(editor.getContent(),
			'<ol>' +
				'<li>a' +
					'<ol>' +
						'<li>b</li>' +
					'</ol>' +
				'</li>' +
			'</ol>'
		);

		equal(editor.selection.getNode().nodeName, 'LI');
	});

	test('Indent second LI to same level as nested LI', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a</li>' +
				'<li>b' +
					'<ul>' +
						'<li>c</li>' +
					'</ul>' +
				'</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li:nth-child(2)', 0);
		execCommand('Indent');

		equal(editor.getContent(),
			'<ul>' +
				'<li>a' +
					'<ul>' +
						'<li>b</li>' +
						'<li>c</li>' +
					'</ul>' +
				'</li>' +
			'</ul>'
		);

		equal(editor.selection.getNode().nodeName, 'LI');
	});

	test('Indent second LI to same level as nested LI 2', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a' +
					'<ul>' +
						'<li>b</li>' +
					'</ul>' +
				'</li>' +
				'<li>cd' +
					'<ul>' +
						'<li>e</li>' +
					'</ul>' +
				'</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li:nth-child(2)', 1);
		execCommand('Indent');

		equal(editor.getContent(),
			'<ul>' +
				'<li>a' +
					'<ul>' +
						'<li>b</li>' +
						'<li>cd</li>' +
						'<li>e</li>' +
					'</ul>' +
				'</li>' +
			'</ul>'
		);

		equal(editor.selection.getNode().nodeName, 'LI');
	});

	test('Indent second and third LI', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a</li>' +
				'<li>b</li>' +
				'<li>c</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li:nth-child(2)', 0, 'li:last', 0);
		execCommand('Indent');

		equal(editor.getContent(),
			'<ul>' +
				'<li>a' +
					'<ul>' +
						'<li>b</li>' +
						'<li>c</li>' +
					'</ul>' +
				'</li>' +
			'</ul>'
		);
	});

	test('Indent second second li with next sibling to nested li', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a</li>' +
				'<li>b' +
					'<ul>' +
						'<li>c</li>' +
					'</ul>' +
				'</li>' +
				'<li>d</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('ul > li:nth-child(2)', 1);
		execCommand('Indent');

		equal(editor.getContent(),
			'<ul>' +
				'<li>a' +
					'<ul>' +
						'<li>b</li>' +
						'<li>c</li>' +
					'</ul>' +
				'</li>' +
				'<li>d</li>' +
			'</ul>'
		);
	});

	// Backspace

	test('Backspace at beginning of single LI in UL', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li', 0);
		editor.plugins.lists.backspaceDelete();

		equal(editor.getContent(),
			'<p>a</p>'
		);

		equal(editor.selection.getNode().nodeName, 'P');
	});

	test('Backspace at beginning of first LI in UL', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a</li>' +
				'<li>b</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li', 0);
		editor.plugins.lists.backspaceDelete();

		equal(editor.getContent(),
			'<p>a</p>' +
			'<ul>' +
				'<li>b</li>' +
			'</ul>'
		);

		equal(editor.selection.getNode().nodeName, 'P');
	});

	test('Backspace at beginning of middle LI in UL', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a</li>' +
				'<li>b</li>' +
				'<li>c</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li:nth-child(2)', 0);
		editor.plugins.lists.backspaceDelete();

		equal(editor.getContent(),
			'<ul>' +
				'<li>ab</li>' +
				'<li>c</li>' +
			'</ul>'
		);

		equal(editor.selection.getNode().nodeName, 'LI');
	});

	test('Backspace at beginning of start LI in UL inside UL', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a' +
					'<ul>' +
						'<li>b</li>' +
						'<li>c</li>' +
					'</ul>' +
				'</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li li', 0);
		editor.plugins.lists.backspaceDelete();

		equal(editor.getContent(),
			'<ul>' +
				'<li>ab' +
					'<ul>' +
						'<li>c</li>' +
					'</ul>' +
				'</li>' +
			'</ul>'
		);

		equal(editor.selection.getNode().nodeName, 'LI');
	});

	test('Backspace at beginning of middle LI in UL inside UL', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a' +
					'<ul>' +
						'<li>b</li>' +
						'<li>c</li>' +
						'<li>d</li>' +
					'</ul>' +
				'</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li li:nth-child(2)', 0);
		editor.plugins.lists.backspaceDelete();

		equal(editor.getContent(),
			'<ul>' +
				'<li>a' +
					'<ul>' +
						'<li>bc</li>' +
						'<li>d</li>' +
					'</ul>' +
				'</li>' +
			'</ul>'
		);

		equal(editor.selection.getNode().nodeName, 'LI');
	});

	test('Backspace at beginning of single LI in UL', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li', 0);
		editor.plugins.lists.backspaceDelete();

		equal(editor.getContent(),
			'<p>a</p>'
		);

		equal(editor.selection.getNode().nodeName, 'P');
	});

	test('Backspace at beginning of first LI in UL', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a</li>' +
				'<li>b</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li', 0);
		editor.plugins.lists.backspaceDelete();

		equal(editor.getContent(),
			'<p>a</p>' +
			'<ul>' +
				'<li>b</li>' +
			'</ul>'
		);

		equal(editor.selection.getNode().nodeName, 'P');
	});

	test('Backspace at beginning of middle LI in UL', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a</li>' +
				'<li>b</li>' +
				'<li>c</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li:nth-child(2)', 0);
		editor.plugins.lists.backspaceDelete();

		equal(editor.getContent(),
			'<ul>' +
				'<li>ab</li>' +
				'<li>c</li>' +
			'</ul>'
		);

		equal(editor.selection.getNode().nodeName, 'LI');
	});

	test('Backspace at beginning of start LI in UL inside UL', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a' +
					'<ul>' +
						'<li>b</li>' +
						'<li>c</li>' +
					'</ul>' +
				'</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li li', 0);
		editor.plugins.lists.backspaceDelete();

		equal(editor.getContent(),
			'<ul>' +
				'<li>ab' +
					'<ul>' +
						'<li>c</li>' +
					'</ul>' +
				'</li>' +
			'</ul>'
		);

		equal(editor.selection.getNode().nodeName, 'LI');
	});

	test('Backspace at beginning of middle LI in UL inside UL', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a' +
					'<ul>' +
						'<li>b</li>' +
						'<li>c</li>' +
						'<li>d</li>' +
					'</ul>' +
				'</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li li:nth-child(2)', 0);
		editor.plugins.lists.backspaceDelete();

		equal(editor.getContent(),
			'<ul>' +
				'<li>a' +
					'<ul>' +
						'<li>bc</li>' +
						'<li>d</li>' +
					'</ul>' +
				'</li>' +
			'</ul>'
		);

		equal(editor.selection.getNode().nodeName, 'LI');
	});

	test('Backspace at beginning of LI with empty LI above in UL', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a</li>' +
				'<li></li>' +
				'<li>b</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li:nth-child(3)', 0);
		editor.plugins.lists.backspaceDelete();

		equal(editor.getContent(),
			'<ul>' +
				'<li>a</li>' +
				'<li>b</li>' +
			'</ul>'
		);

		equal(editor.selection.getNode().innerHTML, 'b');
	});

	test('Backspace at beginning of LI with BR padded empty LI above in UL', function() {
		editor.getBody().innerHTML = (
			'<ul>' +
				'<li>a</li>' +
				'<li><br></li>' +
				'<li>b</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li:nth-child(3)', 0);
		editor.plugins.lists.backspaceDelete();

		equal(editor.getContent(),
			'<ul>' +
				'<li>a</li>' +
				'<li>b</li>' +
			'</ul>'
		);

		equal(editor.selection.getNode().innerHTML, 'b');
	});

	test('Backspace at empty LI (IE)', function() {
		editor.getBody().innerHTML = (
			'<ul>' +
				'<li>a</li>' +
				'<li></li>' +
				'<li>b</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li:nth-child(2)', 0);
		editor.plugins.lists.backspaceDelete();

		equal(editor.getContent(),
			'<ul>' +
				'<li>a</li>' +
				'<li>b</li>' +
			'</ul>'
		);

		equal(editor.selection.getNode().innerHTML, 'a');
	});

	test('Backspace at beginning of LI with empty LI with STRING and BR above in UL', function() {
		editor.getBody().innerHTML = (
			'<ul>' +
				'<li>a</li>' +
				'<li><strong><br></strong></li>' +
				'<li>b</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li:nth-child(3)', 0);
		editor.plugins.lists.backspaceDelete();

		equal(editor.getContent(),
			'<ul>' +
				'<li>a</li>' +
				'<li>b</li>' +
			'</ul>'
		);

		equal(editor.selection.getNode().innerHTML, 'b');
	});

	test('Backspace at beginning of LI on body UL', function() {
		inlineEditor2.focus();
		inlineEditor2.selection.setCursorLocation(inlineEditor2.getBody().firstChild.firstChild, 0);
		inlineEditor2.plugins.lists.backspaceDelete();
		equal(tinymce.$('#lists ul').length, 3);
		equal(tinymce.$('#lists li').length, 3);
	});

	test('Backspace at nested LI with adjacent BR', function() {
		editor.getBody().innerHTML = (
			'<ul>' +
				'<li>1' +
					'<ul>' +
						'<li>' +
							'<br>' +
							'<ul>' +
								'<li>2</li>' +
							'</ul>' +
						'</li>' +
					'</ul>' +
				'</li>' +
				'<li>3</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('ul ul ul li', 0);
		editor.plugins.lists.backspaceDelete();

		equal(editor.getContent(), '<ul><li>1<ul><li>2</li></ul></li><li>3</li></ul>');
		equal(editor.selection.getNode().nodeName, 'LI');
	});

	// Delete

	test('Delete at end of single LI in UL', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li', 1);
		editor.plugins.lists.backspaceDelete(true);

		equal(editor.getContent(),
			'<ul>' +
				'<li>a</li>' +
			'</ul>'
		);

		equal(editor.selection.getNode().nodeName, 'LI');
	});

	test('Delete at end of first LI in UL', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a</li>' +
				'<li>b</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li', 1);
		editor.plugins.lists.backspaceDelete(true);

		equal(editor.getContent(),
			'<ul>' +
				'<li>ab</li>' +
			'</ul>'
		);

		equal(editor.selection.getNode().nodeName, 'LI');
	});

	test('Delete at end of middle LI in UL', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a</li>' +
				'<li>b</li>' +
				'<li>c</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li:nth-child(2)', 1);
		editor.plugins.lists.backspaceDelete(true);

		equal(editor.getContent(),
			'<ul>' +
				'<li>a</li>' +
				'<li>bc</li>' +
			'</ul>'
		);

		equal(editor.selection.getNode().nodeName, 'LI');
	});

	test('Delete at end of start LI in UL inside UL', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a' +
					'<ul>' +
						'<li>b</li>' +
						'<li>c</li>' +
					'</ul>' +
				'</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li li', 1);
		editor.plugins.lists.backspaceDelete(true);

		equal(editor.getContent(),
			'<ul>' +
				'<li>a' +
					'<ul>' +
						'<li>bc</li>' +
					'</ul>' +
				'</li>' +
			'</ul>'
		);

		equal(editor.selection.getNode().nodeName, 'LI');
	});

	test('Delete at end of middle LI in UL inside UL', function() {
		editor.getBody().innerHTML = trimBrs(
			'<ul>' +
				'<li>a' +
					'<ul>' +
						'<li>b</li>' +
						'<li>c</li>' +
						'<li>d</li>' +
					'</ul>' +
				'</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li li:nth-child(2)', 1);
		editor.plugins.lists.backspaceDelete(true);

		equal(editor.getContent(),
			'<ul>' +
				'<li>a' +
					'<ul>' +
						'<li>b</li>' +
						'<li>cd</li>' +
					'</ul>' +
				'</li>' +
			'</ul>'
		);

		equal(editor.selection.getNode().nodeName, 'LI');
	});

	test('Delete at end of LI before empty LI', function() {
		editor.getBody().innerHTML = (
			'<ul>' +
				'<li>a</li>' +
				'<li></li>' +
				'<li>b</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li', 1);
		editor.plugins.lists.backspaceDelete(true);

		equal(editor.getContent(),
			'<ul>' +
				'<li>a</li>' +
				'<li>b</li>' +
			'</ul>'
		);

		equal(editor.selection.getNode().innerHTML, 'a');
	});

	test('Delete at end of LI before BR padded empty LI', function() {
		editor.getBody().innerHTML = (
			'<ul>' +
				'<li>a</li>' +
				'<li><br></li>' +
				'<li>b</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li', 1);
		editor.plugins.lists.backspaceDelete(true);

		equal(editor.getContent(),
			'<ul>' +
				'<li>a</li>' +
				'<li>b</li>' +
			'</ul>'
		);

		equal(editor.selection.getNode().innerHTML, 'a');
	});

	test('Delete at end of LI before empty LI with STRONG', function() {
		editor.getBody().innerHTML = (
			'<ul>' +
				'<li>a</li>' +
				'<li><strong><br></strong></li>' +
				'<li>b</li>' +
			'</ul>'
		);

		editor.focus();
		Utils.setSelection('li', 1);
		editor.plugins.lists.backspaceDelete(true);

		equal(editor.getContent(),
			'<ul>' +
				'<li>a</li>' +
				'<li>b</li>' +
			'</ul>'
		);

		equal(editor.selection.getNode().innerHTML, 'a');
	});

	test('Delete at end of LI on body UL', function() {
		inlineEditor2.focus();
		inlineEditor2.selection.setCursorLocation(inlineEditor2.getBody().firstChild.firstChild, 1);
		inlineEditor2.plugins.lists.backspaceDelete(true);
		equal(tinymce.$('#lists ul').length, 3);
		equal(tinymce.$('#lists li').length, 3);
	});

	test('Delete at nested LI with adjacent BR', function() {
		editor.getBody().innerHTML = (
			'<ul>' +
				'<li>1' +
					'<ul>' +
						'<li>' +
							'<br>' +
							'<ul>' +
								'<li>2</li>' +
							'</ul>' +
						'</li>' +
					'</ul>' +
				'</li>' +
				'<li>3</li>' +
			'</ul>'
		);

		editor.focus();
		editor.selection.setCursorLocation(editor.$('ul ul li')[0], 0);
		editor.plugins.lists.backspaceDelete(true);

		equal(editor.getContent(), '<ul><li>1<ul><li>2</li></ul></li><li>3</li></ul>');
		equal(editor.selection.getNode().nodeName, 'LI');
	});

	test('Delete at BR before text in LI', function() {
		editor.getBody().innerHTML = (
			'<ul>' +
				'<li>1</li>' +
				'<li>2<br></li>' +
				'<li>3</li>' +
			'</ul>'
		);

		editor.focus();
		editor.selection.setCursorLocation(editor.$('li')[1], 1);
		editor.plugins.lists.backspaceDelete(false);

		equal(editor.getContent(), '<ul><li>1</li><li>2</li><li>3</li></ul>');
		equal(editor.selection.getNode().nodeName, 'LI');
	});

	test('Remove UL in inline body element contained in LI', function() {
		inlineEditor.setContent('<ul><li>a</li></ul>');
		inlineEditor.selection.setCursorLocation();
		inlineEditor.execCommand('InsertUnorderedList');
		equal(inlineEditor.getContent(), '<p>a</p>');
	});

	test('Backspace in LI in UL in inline body element contained within LI', function() {
		inlineEditor.setContent('<ul><li>a</li></ul>');
		inlineEditor.focus();
		inlineEditor.selection.select(inlineEditor.getBody(), true);
		inlineEditor.selection.collapse(true);
		inlineEditor.plugins.lists.backspaceDelete();
		equal(inlineEditor.getContent(), '<p>a</p>');
	});

	test('Apply DL list to multiple Ps', function() {
		editor.getBody().innerHTML = trimBrs(
			'<p>a</p>' +
			'<p>b</p>' +
			'<p>c</p>'
		);

		editor.focus();
		Utils.setSelection('p', 0, 'p:last', 0);
		execCommand('InsertDefinitionList');

		equal(editor.getContent(),
			'<dl>' +
				'<dt>a</dt>' +
				'<dt>b</dt>' +
				'<dt>c</dt>' +
			'</dl>'
		);
		equal(editor.selection.getStart().nodeName, 'DT');
	});

	test('Apply OL list to single P', function() {
		editor.getBody().innerHTML = trimBrs(
			'<p>a</p>'
		);

		editor.focus();
		Utils.setSelection('p', 0);
		execCommand('InsertDefinitionList');

		equal(editor.getContent(), '<dl><dt>a</dt></dl>');
		equal(editor.selection.getNode().nodeName, 'DT');
	});

	test('Apply DL to P and merge with adjacent lists', function() {
		editor.getBody().innerHTML = trimBrs(
			'<dl>' +
				'<dt>a</dt>' +
			'</dl>' +
			'<p>b</p>' +
			'<dl>' +
				'<dt>c</dt>' +
			'</dl>'
		);

		editor.focus();
		Utils.setSelection('p', 1);
		execCommand('InsertDefinitionList');

		equal(editor.getContent(),
			'<dl>' +
				'<dt>a</dt>' +
				'<dt>b</dt>' +
				'<dt>c</dt>' +
			'</dl>'
		);
		equal(editor.selection.getStart().nodeName, 'DT');
	});

	test('Indent single DT in DL', function() {
		editor.getBody().innerHTML = trimBrs(
			'<dl>' +
				'<dt>a</dt>' +
			'</dl>'
		);

		editor.focus();
		Utils.setSelection('dt', 0);
		execCommand('Indent');

		equal(editor.getContent(),
			'<dl>' +
				'<dd>a</dd>' +
			'</dl>'
		);

		equal(editor.selection.getNode().nodeName, 'DD');
	});

	test('Outdent single DD in DL', function() {
		editor.getBody().innerHTML = trimBrs(
			'<dl>' +
				'<dd>a</dd>' +
			'</dl>'
		);

		editor.focus();
		Utils.setSelection('dd', 1);
		execCommand('Outdent');

		equal(editor.getContent(),
			'<dl>' +
				'<dt>a</dt>' +
			'</dl>'
		);

		equal(editor.selection.getNode().nodeName, 'DT');
	});

	test('Apply UL list to single P', function() {
		editor.getBody().innerHTML = trimBrs(
			'<p>a</p>'
		);

		editor.focus();
		Utils.setSelection('p', 0);
		execCommand('InsertUnorderedList');

		equal(editor.getContent(), '<ul><li>a</li></ul>');
		equal(editor.selection.getNode().nodeName, 'LI');
	});
});
