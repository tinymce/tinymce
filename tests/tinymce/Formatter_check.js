module("tinymce.Formatter - Check", {
	setupModule: function() {
		document.getElementById('view').innerHTML = '<textarea id="elm1"></textarea><div id="elm2"></div>';
		QUnit.stop();

		tinymce.init({
			selector: "#elm1",
			add_unload_trigger: false,
			extended_valid_elements: 'b,i,span[style|contenteditable]',
			skin: false,
			entities: 'raw',
			valid_styles: {
				'*': 'color,font-size,font-family,background-color,font-weight,font-style,text-decoration,float,margin,margin-top,margin-right,margin-bottom,margin-left,display'
			},
			init_instance_callback: function(ed) {
				window.editor = ed;

				if (window.inlineEditor) {
					QUnit.start();
				}
			}
		});

		tinymce.init({
			selector: "#elm2",
			inline: true,
			add_unload_trigger: false,
			indent: false,
			skin: false,
			convert_fonts_to_spans: false,
			disable_nodechange: true,
			entities: 'raw',
			valid_styles: {
				'*': 'color,font-size,font-family,background-color,font-weight,font-style,text-decoration,float,margin,margin-top,margin-right,margin-bottom,margin-left,display'
			},
			init_instance_callback: function(ed) {
				window.inlineEditor = ed;

				if (window.editor) {
					QUnit.start();
				}
			}
		});
	}
});

test('Selected style element text', function() {
	editor.formatter.register('bold', {inline: 'b'});
	editor.getBody().innerHTML = '<p><b>1234</b></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('b')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('b')[0].firstChild, 4);
	editor.selection.setRng(rng);
	ok(editor.formatter.match('bold'), 'Selected style element text');
});

test('Selected style element with css styles', function() {
	editor.formatter.register('color', {inline: 'span', styles: {color: '#ff0000'}});
	editor.getBody().innerHTML = '<p><span style="color:#ff0000">1234</span></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('span')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('span')[0].firstChild, 4);
	editor.selection.setRng(rng);
	ok(editor.formatter.match('color'), 'Selected style element with css styles');
});

test('Selected style element with attributes', function() {
	editor.formatter.register('fontsize', {inline: 'font', attributes: {size: '7'}});
	editor.getBody().innerHTML = '<p><font size="7">1234</font></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('font')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('font')[0].firstChild, 4);
	editor.selection.setRng(rng);
	ok(editor.formatter.match('fontsize'), 'Selected style element with attributes');
});

test('Selected style element text multiple formats', function() {
	editor.formatter.register('multiple', [
		{inline: 'b'},
		{inline: 'strong'}
	]);
	editor.getBody().innerHTML = '<p><strong>1234</strong></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('strong')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('strong')[0].firstChild, 4);
	editor.selection.setRng(rng);
	ok(editor.formatter.match('multiple'), 'Selected style element text multiple formats');
});

test('Selected complex style element', function() {
	editor.formatter.register('complex', {inline: 'span', styles: {fontWeight: 'bold'}});
	editor.getBody().innerHTML = '<p><span style="color:#ff0000; font-weight:bold">1234</span></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('span')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('span')[0].firstChild, 4);
	editor.selection.setRng(rng);
	ok(editor.formatter.match('complex'), 'Selected complex style element');
});

test('Selected non style element text', function() {
	editor.formatter.register('bold', {inline: 'b'});
	editor.getBody().innerHTML = '<p>1234</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('p')[0].firstChild, 4);
	editor.selection.setRng(rng);
	ok(!editor.formatter.match('bold'), 'Selected non style element text');
});

test('Selected partial style element (start)', function() {
	editor.formatter.register('bold', {inline: 'b'});
	editor.getBody().innerHTML = '<p><b>1234</b>5678</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('b')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('p')[0].lastChild, 4);
	editor.selection.setRng(rng);
	ok(editor.formatter.match('bold'), 'Selected partial style element (start)');
});

test('Selected partial style element (end)', function() {
	editor.formatter.register('bold', {inline: 'b'});
	editor.getBody().innerHTML = '<p>1234<b>5678</b></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('b')[0].lastChild, 4);
	editor.selection.setRng(rng);
	ok(!editor.formatter.match('bold'), 'Selected partial style element (end)');
});

test('Selected element text with parent inline element', function() {
	editor.formatter.register('bold', {inline: 'b'});
	editor.getBody().innerHTML = '<p><b><em><span>1234</span></em></b></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('span')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('span')[0].firstChild, 4);
	editor.selection.setRng(rng);
	ok(editor.formatter.match('bold'), 'Selected element text with parent inline element');
});

test('Selected element match with variable', function() {
	editor.formatter.register('complex', {inline: 'span', styles: {color: '%color'}});
	editor.getBody().innerHTML = '<p><span style="color:#ff0000">1234</span></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('span')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('span')[0].firstChild, 4);
	editor.selection.setRng(rng);
	ok(editor.formatter.match('complex', {color: '#ff0000'}), 'Selected element match with variable');
});

test('Selected element match with variable and function', function() {
	editor.formatter.register('complex', {
		inline: 'span',
		styles: {
			color: function(vars) {
				return vars.color + '00';
			}
		}
	});

	editor.getBody().innerHTML = '<p><span style="color:#ff0000">1234</span></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('span')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('span')[0].firstChild, 4);
	editor.selection.setRng(rng);
	ok(editor.formatter.match('complex', {color: '#ff00'}), 'Selected element match with variable and function');
});

test('formatChanged simple format', function() {
	var newState, newArgs;

	editor.formatter.formatChanged('bold', function(state, args) {
		newState = state;
		newArgs = args;
	});

	editor.getBody().innerHTML = '<p>text</p>';
	Utils.setSelection('p', 0, 'p', 4);

	// Check apply
	editor.formatter.apply('bold');
	editor.nodeChanged();
	ok(newState);
	equal(newArgs.format, 'bold');
	equal(newArgs.node, editor.getBody().firstChild.firstChild);
	equal(newArgs.parents.length, 2);

	// Check remove
	editor.formatter.remove('bold');
	editor.nodeChanged();
	ok(!newState);
	equal(newArgs.format, 'bold');
	equal(newArgs.node, editor.getBody().firstChild);
	equal(newArgs.parents.length, 1);
});

test('formatChanged complex format', function() {
	var newState, newArgs;

	editor.formatter.register('complex', {inline: 'span', styles: {color: '%color'}});

	editor.formatter.formatChanged('complex', function(state, args) {
		newState = state;
		newArgs = args;
	}, true);

	editor.getBody().innerHTML = '<p>text</p>';
	Utils.setSelection('p', 0, 'p', 4);

	// Check apply
	editor.formatter.apply('complex', {color: '#FF0000'});
	editor.nodeChanged();
	ok(newState);
	equal(newArgs.format, 'complex');
	equal(newArgs.node, editor.getBody().firstChild.firstChild);
	equal(newArgs.parents.length, 2);

	// Check remove
	editor.formatter.remove('complex', {color: '#FF0000'});
	editor.nodeChanged();
	ok(!newState);
	equal(newArgs.format, 'complex');
	equal(newArgs.node, editor.getBody().firstChild);
	equal(newArgs.parents.length, 1);
});

test('Match format on div block in inline mode', function() {
	inlineEditor.setContent('<p>a</p><p>b</p>');
	inlineEditor.execCommand('SelectAll');
	ok(!inlineEditor.formatter.match('div'), 'Formatter.match on div says true');
});

test('Get preview css text for formats', function() {
	ok(/font-weight\:(bold|700)/.test(editor.formatter.getCssText('bold')), 'Bold not found in preview style');
	ok(/font-weight\:(bold|700)/.test(editor.formatter.getCssText({inline: 'b'})), 'Bold not found in preview style');
});
