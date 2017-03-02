module("tinymce.Formatter - Apply", {
	setupModule: function() {
		document.getElementById('view').innerHTML = '<textarea id="elm1"></textarea><div id="elm2"></div><textarea id="elm3"></textarea>';
		QUnit.stop();

		tinymce.init({
			selector: "#elm1",
			plugins: "noneditable",
			add_unload_trigger: false,
			skin: false,
			indent: false,
			extended_valid_elements: 'b[id|style|title],i[id|style|title],span[id|class|style|title|contenteditable],font[face|size]',
			forced_root_block: '',
			convert_fonts_to_spans: false,
			disable_nodechange: true,
			entities: 'raw',
			valid_styles: {
				'*': 'color,font-size,font-family,background-color,font-weight,font-style,text-decoration,float,margin,margin-top,margin-right,margin-bottom,margin-left,display,text-align'
			},
			init_instance_callback: function(ed) {
				QUnit.start();
				window.editor = ed;
			}
		});
	}
});

function getContent() {
	return editor.getContent().toLowerCase().replace(/[\r]+/g, '');
}

test('apply inline to a list', function() {
	editor.formatter.register('format', {
		inline: 'b',
		toggle: false
	});
	editor.getBody().innerHTML = '<p>1234</p><ul><li>first element</li><li>second element</li></ul><p>5678</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('p')[1].firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><b>1234</b></p><ul><li><b>first element</b></li><li><b>second element</b></li></ul><p><b>5678</b></p>', 'selection of a list');
});

test('Toggle OFF - Inline element on selected text', function() {
	// Toggle OFF - Inline element on selected text
	editor.formatter.register('format', {
		inline: 'b',
		toggle: false
	});
	editor.getBody().innerHTML = '<p><b>1234</b></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('b')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('b')[0].firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.toggle('format');
	equal(getContent(), '<p><b>1234</b></p>');
});

test('Toggle OFF - Inline element on partially selected text', function() {
	// Toggle OFF - Inline element on partially selected text
	editor.formatter.register('format', {
		inline: 'b',
		toggle: 0
	});
	editor.getBody().innerHTML = '<p>1<b>23</b>4</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('b')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('b')[0].firstChild, 2);
	editor.selection.setRng(rng);
	editor.formatter.toggle('format');
	equal(getContent(), '<p>1<b>23</b>4</p>');
});

test('Toggle OFF - Inline element on partially selected text in start/end elements', function() {
	// Toggle OFF - Inline element on partially selected text in start/end elements
	editor.formatter.register('format', {
		inline: 'b',
		toggle: false
	});
	editor.getBody().innerHTML = '<p>1<b>234</b></p><p><b>123</b>4</p>'; //'<p>1234</p><p>1234</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('b')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('b')[1].firstChild, 3);
	editor.selection.setRng(rng);
	editor.formatter.toggle('format');
	equal(getContent(), '<p>1<b>234</b></p><p><b>123</b>4</p>');
});

test('Toggle OFF - Inline element with data attribute', function() {
	editor.formatter.register('format', {inline: 'b'});
	editor.getBody().innerHTML = '<p><b data-x="1">1</b></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('b')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('b')[0].firstChild, 1);
	editor.selection.setRng(rng);
	editor.formatter.toggle('format');
	equal(getContent(), '<p>1</p>');
});

test('Toggle ON - NO inline element on selected text', function() {
	// Inline element on selected text
	editor.formatter.register('format', {
		inline: 'b',
		toggle: true
	});
	editor.getBody().innerHTML = '<p>1234</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('p')[0].firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><b>1234</b></p>', 'Inline element on selected text');
	editor.formatter.toggle('format');
	equal(getContent(), '<p>1234</p>', 'Toggle ON - NO inline element on selected text');
});

test('Selection spanning from within format to outside format with toggle off', function() {
	editor.formatter.register('format', {
		inline: 'b',
		toggle: false
	});
	editor.getBody().innerHTML = '<p><b>12</b>34</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('b')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('p')[0].lastChild, 2);
	editor.selection.setRng(rng);
	editor.formatter.toggle('format');
	equal(getContent(), '<p><b>1234</b></p>', 'Extend formating if start of selection is already formatted');
});

test('Inline element on partially selected text', function() {
	editor.formatter.register('format', {
		inline: 'b'
	});
	editor.getBody().innerHTML = '<p>1234</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 1);
	rng.setEnd(editor.dom.select('p')[0].firstChild, 3);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p>1<b>23</b>4</p>', 'Inline element on partially selected text');
	editor.formatter.toggle('format');
	equal(getContent(), '<p>1234</p>', 'Toggle ON - NO inline element on partially selected text');
});

test('Inline element on partially selected text in start/end elements', function() {
	// Inline element on partially selected text in start/end elements
	editor.formatter.register('format', {
		inline: 'b'
	});
	editor.getBody().innerHTML = '<p>1234</p><p>1234</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 1);
	rng.setEnd(editor.dom.select('p')[1].firstChild, 3);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p>1<b>234</b></p><p><b>123</b>4</p>');
});

test('Inline element on selected element', function() {
	editor.formatter.register('format', {
		inline: 'b'
	});
	editor.getBody().innerHTML = '<p>1234</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.getBody(), 0);
	rng.setEnd(editor.getBody(), 1);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><b>1234</b></p>', 'Inline element on selected element');
});

test('Inline element on multiple selected elements', function() {
	editor.formatter.register('format', {
		inline: 'b'
	});
	editor.getBody().innerHTML = '<p>1234</p><p>1234</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.getBody(), 0);
	rng.setEnd(editor.getBody(), 2);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><b>1234</b></p><p><b>1234</b></p>', 'Inline element on multiple selected elements');
});

test('Inline element on multiple selected elements with various childnodes', function() {
	editor.formatter.register('format', {
		inline: 'b'
	});
	editor.getBody().innerHTML = '<p><em>1234</em>5678<span>9</span></p><p><em>1234</em>5678<span>9</span></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.getBody(), 0);
	rng.setEnd(editor.getBody(), 2);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><b><em>1234</em>5678<span>9</span></b></p><p><b><em>1234</em>5678<span>9</span></b></p>', 'Inline element on multiple selected elements with various childnodes');
});

test('Inline element with attributes', function() {
	editor.formatter.register('format', {
		inline: 'b',
		attributes: {
			title: 'value1',
			id: 'value2'
		}
	});
	editor.getBody().innerHTML = '<p>1234</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('p')[0].firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><b id="value2" title="value1">1234</b></p>', 'Inline element with attributes');
});

test('Inline element with styles', function() {
	editor.formatter.register('format', {
		inline: 'b',
		styles: {
			color: '#ff0000',
			fontSize: '10px'
		}
	});
	editor.getBody().innerHTML = '<p>1234</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('p')[0].firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><b style=\"color: #ff0000; font-size: 10px;\">1234</b></p>', 'Inline element with styles');
});

test('Inline element with attributes and styles', function() {
	editor.formatter.register('format', {
		inline: 'b',
		attributes: {
			title: 'value1',
			id: 'value2'
		},
		styles: {
			color: '#ff0000',
			fontSize: '10px'
		}
	});
	editor.getBody().innerHTML = '<p>1234</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('p')[0].firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><b id="value2" style="color: #ff0000; font-size: 10px;" title="value1">1234</b></p>', 'Inline element with attributes and styles');
});

test('Inline element with wrapable parents', function() {
	editor.formatter.register('format', {
		inline: 'b'
	});
	editor.getBody().innerHTML = '<p>x<em><span>1234</span></em>y</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('span')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('span')[0].firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p>x<b><em><span>1234</span></em></b>y</p>', 'Inline element with wrapable parents');
});

test('Inline element with redundant child', function() {
	editor.formatter.register('format', {
		inline: 'b'
	});
	editor.getBody().innerHTML = '<p><b>1234</b></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0], 0);
	rng.setEnd(editor.dom.select('p')[0], 1);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><b>1234</b></p>', 'Inline element with redundant child');
});

test('Inline element with redundant parent', function() {
	editor.formatter.register('format', {
		inline: 'b'
	});
	editor.getBody().innerHTML = '<p><b>a<em>1234</em>b</b></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('em')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('em')[0].firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><b>a<em>1234</em>b</b></p>', 'Inline element with redundant parent');
});

test('Inline element with redundant child of similar type 1', function() {
	editor.formatter.register('format', [{
		inline: 'b'
	}, {
		inline: 'strong'
	}]);
	editor.getBody().innerHTML = '<p>a<strong>1234</strong>b</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0], 0);
	rng.setEnd(editor.dom.select('p')[0], 3);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><b>a1234b</b></p>', 'Inline element with redundant child of similar type 1');
});

test('Inline element with redundant child of similar type 2', function() {
	editor.formatter.register('format', [{
		inline: 'b'
	}, {
		inline: 'span',
		styles: {
			fontWeight: 'bold'
		}
	}]);
	editor.getBody().innerHTML = '<p><span style="font-weight:bold">1234</span></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0], 0);
	rng.setEnd(editor.dom.select('p')[0], 1);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><b>1234</b></p>', 'Inline element with redundant child of similar type 2');
});

test('Inline element with redundant children of similar types', function() {
	editor.formatter.register('format', [{
		inline: 'b'
	}, {
		inline: 'strong'
	}, {
		inline: 'span',
		styles: {
			fontWeight: 'bold'
		}
	}]);
	editor.getBody().innerHTML = '<p><span style="font-weight:bold">a<strong>1234</strong><b>5678</b>b</span></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0], 0);
	rng.setEnd(editor.dom.select('p')[0], 1);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><b>a12345678b</b></p>', 'Inline element with redundant children of similar types');
});

test('Inline element with redundant parent 1', function() {
	editor.formatter.register('format', [{
		inline: 'b'
	}, {
		inline: 'strong'
	}]);
	editor.getBody().innerHTML = '<p><strong>a<em>1234</em>b</strong></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('em')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('em')[0].firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><strong>a<em>1234</em>b</strong></p>', 'Inline element with redundant parent 1');
});

test('Inline element with redundant parent 2', function() {
	editor.formatter.register('format', [{
		inline: 'b'
	}, {
		inline: 'span',
		styles: {
			fontWeight: 'bold'
		}
	}]);
	editor.getBody().innerHTML = '<p><span style="font-weight:bold">a<em>1234</em>b</span></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('em')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('em')[0].firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><span style="font-weight: bold;">a<em>1234</em>b</span></p>', 'Inline element with redundant parent 2');
});

test('Inline element with redundant parents of similar types', function() {
	editor.formatter.register('format', [{
		inline: 'b'
	}, {
		inline: 'strong'
	}, {
		inline: 'span',
		styles: {
			fontWeight: 'bold'
		}
	}]);
	editor.getBody().innerHTML = '<p><span style="font-weight:bold"><strong><b>a<em>1234</em>b</b></strong></span></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('em')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('em')[0].firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><span style="font-weight: bold;"><strong><b>a<em>1234</em>b</b></strong></span></p>', 'Inline element with redundant parents of similar types');
});

test('Inline element merged with parent and child', function() {
	editor.formatter.register('format', {
		inline: 'b'
	});
	editor.getBody().innerHTML = '<p>a<b>12<b>34</b>56</b>b</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('b')[0].firstChild, 1);
	rng.setEnd(editor.dom.select('b')[0].lastChild, 1);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p>a<b>123456</b>b</p>', 'Inline element merged with parent and child');
});

test('Inline element merged with child 1', function() {
	editor.formatter.register('format', {
		inline: 'span',
		styles: {
			fontWeight: 'bold'
		}
	});
	editor.getBody().innerHTML = '<p>a<span style="font-weight:bold">1234</span>b</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.getBody(), 0);
	rng.setEnd(editor.getBody(), 1);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><span style="font-weight: bold;">a1234b</span></p>', 'Inline element merged with child 1');
});

test('Inline element merged with child 2', function() {
	editor.formatter.register('format', {
		inline: 'span',
		styles: {
			fontWeight: 'bold'
		}
	});
	editor.getBody().innerHTML = '<p>a<span style="font-weight:bold; color:#ff0000">1234</span>b</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.getBody(), 0);
	rng.setEnd(editor.getBody(), 1);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><span style=\"font-weight: bold;\">a<span style=\"color: #ff0000;\">1234</span>b</span></p>', 'Inline element merged with child 2');
});

test('Inline element merged with child 3', function() {
	editor.formatter.register('format', {
		inline: 'span',
		styles: {
			fontWeight: 'bold'
		}
	});
	editor.getBody().innerHTML = '<p>a<span id="id" style="font-weight:bold">1234</span>b</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.getBody(), 0);
	rng.setEnd(editor.getBody(), 1);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><span style=\"font-weight: bold;\">a<span id=\"id\">1234</span>b</span></p>', 'Inline element merged with child 3');
});

test('Inline element merged with child 3', function() {
	editor.formatter.register('format', {
		inline: 'span',
		styles: {
			fontWeight: 'bold'
		},
		merge: true
	});
	editor.getBody().innerHTML = '<p><span style="color:#ff0000">1234</span></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.getBody(), 0);
	rng.setEnd(editor.getBody(), 1);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><span style="color: #ff0000; font-weight: bold;">1234</span></p>', 'Inline element merged with child 3');
});

test('Inline element merged with child 4', function() {
	editor.formatter.register('format', {
		inline: 'span',
		styles: {
			color: '#00ff00'
		}
	});
	editor.getBody().innerHTML = '<p><span style="color:#ff0000">1234</span></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.getBody(), 0);
	rng.setEnd(editor.getBody(), 1);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><span style="color: #00ff00;">1234</span></p>', 'Inline element merged with child 4');
});

test('Inline element with attributes merged with child 1', function() {
	editor.formatter.register('format', {
		inline: 'font',
		attributes: {
			face: 'arial'
		},
		merge: true
	});
	editor.getBody().innerHTML = '<p><font size="7">1234</font></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.getBody(), 0);
	rng.setEnd(editor.getBody(), 1);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><font face="arial" size="7">1234</font></p>', 'Inline element with attributes merged with child 1');
});

test('Inline element with attributes merged with child 2', function() {
	editor.formatter.register('format', {
		inline: 'font',
		attributes: {
			size: '7'
		}
	});
	editor.getBody().innerHTML = '<p>a<font size="7">1234</font>b</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.getBody(), 0);
	rng.setEnd(editor.getBody(), 1);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><font size="7">a1234b</font></p>', 'Inline element with attributes merged with child 2');
});

test('Inline element merged with left sibling', function() {
	editor.formatter.register('format', {
		inline: 'b'
	});
	editor.getBody().innerHTML = '<p><b>1234</b>5678</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].lastChild, 0);
	rng.setEnd(editor.dom.select('p')[0].lastChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><b>12345678</b></p>', 'Inline element merged with left sibling');
});

test('Inline element merged with right sibling', function() {
	editor.formatter.register('format', {
		inline: 'b'
	});
	editor.getBody().innerHTML = '<p>1234<b>5678</b></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('p')[0].firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><b>12345678</b></p>', 'Inline element merged with right sibling');
});

test('Inline element merged with left and right siblings', function() {
	editor.formatter.register('format', {
		inline: 'b'
	});
	editor.getBody().innerHTML = '<p><b>12</b>34<b>56</b></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].childNodes[1], 0);
	rng.setEnd(editor.dom.select('p')[0].childNodes[1], 2);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><b>123456</b></p>', 'Inline element merged with left and right siblings');
});

test('Inline element merged with data attributed left sibling', function() {
	editor.formatter.register('format', {
		inline: 'b'
	});
	editor.getBody().innerHTML = '<p><b data-x="1">1234</b>5678</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].lastChild, 0);
	rng.setEnd(editor.dom.select('p')[0].lastChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><b data-x="1">12345678</b></p>', 'Inline element merged with left sibling');
});

test('Don\'t merge siblings with whitespace between 1', function() {
	editor.formatter.register('format', {
		inline: 'b'
	});
	editor.getBody().innerHTML = '<p><b>a</b> b</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].lastChild, 1);
	rng.setEnd(editor.dom.select('p')[0].lastChild, 2);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><b>a</b> <b>b</b></p>', 'Don\'t merge siblings with whitespace between 1');
});

test('Don\'t merge siblings with whitespace between 1', function() {
	editor.formatter.register('format', {
		inline: 'b'
	});
	editor.getBody().innerHTML = '<p>a <b>b</b></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('p')[0].firstChild, 1);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><b>a</b> <b>b</b></p>', 'Don\'t merge siblings with whitespace between 2');
});

test('Inline element not merged in exact mode', function() {
	editor.formatter.register('format', {
		inline: 'span',
		styles: {
			color: '#00ff00'
		},
		exact: true
	});
	editor.getBody().innerHTML = '<p><span style="color:#ff0000">1234</span></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.getBody(), 0);
	rng.setEnd(editor.getBody(), 1);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><span style="color: #00ff00;"><span style="color: #ff0000;">1234</span></span></p>', 'Inline element not merged in exact mode');
});

test('Inline element merged in exact mode', function() {
	editor.formatter.register('format', {
		inline: 'span',
		styles: {
			color: '#ff0000'
		},
		exact: true
	});
	editor.getBody().innerHTML = '<p><span style="color:#ff0000">1234</span></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.getBody(), 0);
	rng.setEnd(editor.getBody(), 1);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><span style="color: #ff0000;">1234</span></p>', 'Inline element merged in exact mode');
});

test('Deep left branch', function() {
	editor.formatter.register('format', {
		inline: 'b'
	});
	editor.getBody().innerHTML = '<p><em><i><ins>1234</ins></i></em><em>text1</em><em>text2</em></p><p><em>5678</em></p><p>9012</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('ins')[0].firstChild, 1);
	rng.setEnd(editor.dom.select('p')[2].firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><em><i><ins>1<b>234</b></ins></i></em><b><em>text1</em><em>text2</em></b></p><p><b><em>5678</em></b></p><p><b>9012</b></p>', 'Deep left branch');
});

test('Deep right branch', function() {
	editor.formatter.register('format', {
		inline: 'b'
	});
	editor.getBody().innerHTML = '<p>9012</p><p><em>5678</em></p><p><em><i><ins>1234</ins></i></em><em>text1</em><em>text2</em></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('em')[3].firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><b>9012</b></p><p><b><em>5678</em></b></p><p><b><em><i><ins>1234</ins></i></em><em>text1</em></b><em><b>text</b>2</em></p>', 'Deep right branch');
});

test('Full element text selection on two elements with a table in the middle', function() {
	editor.formatter.register('format', {
		inline: 'b'
	});
	editor.getBody().innerHTML = '<p>1234</p><table><tbody><tr><td>123</td></tr></tbody></table><p>5678</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('p')[1].firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><b>1234</b></p><table><tbody><tr><td><b>123</b></td></tr></tbody></table><p><b>5678</b></p>', 'Full element text selection on two elements with a table in the middle');
});

test('Inline element on selected text with variables', function() {
	editor.formatter.register('format', {
		inline: 'b',
		styles: {
			color: '%color'
		},
		attributes: {
			title: '%title'
		}
	}, {
		color: '#ff0000',
		title: 'title'
	});
	editor.getBody().innerHTML = '<p>1234</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('p')[0].firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.apply('format', {
		color: '#ff0000',
		title: 'title'
	});
	equal(getContent(), '<p><b style="color: #ff0000;" title="title">1234</b></p>', 'Inline element on selected text');
});

test('Remove redundant children', function() {
	editor.formatter.register('format', {
		inline: 'span',
		styles: {
			fontFamily: 'arial'
		}
	});
	editor.getBody().innerHTML = '<p><span style="font-family: sans-serif;"><span style="font-family: palatino;">1</span>2<span style="font-family: verdana;">3</span>4</span></p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0], 0);
	rng.setEnd(editor.dom.select('p')[0], 1);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p><span style=\"font-family: ' + Utils.fontFace('arial') + ';\">1234</span></p>', 'Remove redundant children');
});

test('Inline element on selected text with function values', function() {
	editor.formatter.register('format', {
		inline: 'b',
		styles: {
			color: function(vars) {
				return vars.color + '00ff';
			}
		},
		attributes: {
			title: function(vars) {
				return vars.title + '2';
			}
		}
	});
	editor.getBody().innerHTML = '<p>1234</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('p')[0].firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.apply('format', {
		color: '#ff',
		title: 'title'
	});
	equal(getContent(), '<p><b style="color: #ff00ff;" title="title2">1234</b></p>', 'Inline element on selected text with function values');
});

test('Block element on selected text', function() {
	editor.formatter.register('format', {
		block: 'div'
	});
	editor.getBody().innerHTML = '<p>1234</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('p')[0].firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<div>1234</div>', 'Block element on selected text');
});

test('Block element on partially selected text', function() {
	editor.formatter.register('format', {
		block: 'div'
	});
	editor.getBody().innerHTML = '<p>1234</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 1);
	rng.setEnd(editor.dom.select('p')[0].firstChild, 3);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<div>1234</div>', 'Block element on partially selected text');
});

test('Block element on selected element', function() {
	editor.formatter.register('format', {
		block: 'div'
	});
	editor.getBody().innerHTML = '<p>1234</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.getBody(), 0);
	rng.setEnd(editor.getBody(), 1);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<div>1234</div>', 'Block element on selected element');
});

test('Block element on selected elements', function() {
	editor.formatter.register('format', {
		block: 'div'
	});
	editor.getBody().innerHTML = '<p>1234</p><p>5678</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.getBody(), 0);
	rng.setEnd(editor.getBody(), 2);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<div>1234</div><div>5678</div>', 'Block element on selected elements');
});

test('Block element on selected elements with attributes', function() {
	editor.formatter.register('format', {
		block: 'div',
		attributes: {
			'title': 'test'
		}
	});
	editor.getBody().innerHTML = '<p>1234</p><p>5678</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.getBody(), 0);
	rng.setEnd(editor.getBody(), 2);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<div title="test">1234</div><div title="test">5678</div>', 'Block element on selected elements with attributes');
});

test('Block element on nested element', function() {
	editor.formatter.register('format', {
		block: 'p'
	});
	editor.getBody().innerHTML = '<div><h1>1234</h1></div>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('h1')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('h1')[0].firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<div><p>1234</p></div>', 'Block element on nested element');
});

test('Block element on selected non wrapped text 1', function() {
	editor.formatter.register('format', {
		block: 'div'
	});
	editor.getBody().innerHTML = '1234';
	var rng = editor.dom.createRng();
	rng.setStart(editor.getBody().firstChild, 0);
	rng.setEnd(editor.getBody().firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<div>1234</div>', 'Block element on selected non wrapped text 1');
});

test('Block element on selected non wrapped text 2', function() {
	editor.formatter.register('format', {
		block: 'div'
	});
	editor.getBody().innerHTML = '1234<br />4567<br />8910';
	var rng = editor.dom.createRng();
	rng.setStart(editor.getBody().firstChild, 0);
	rng.setEnd(editor.getBody().lastChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<div>1234</div><div>4567</div><div>8910</div>', 'Block element on selected non wrapped text 2');
});

test('Block element on selected non wrapped text 3', function() {
	editor.formatter.register('format', {
		block: 'div'
	});
	editor.getBody().innerHTML = '<br />1234<br /><br />4567<br />8910<br />';
	var rng = editor.dom.createRng();
	rng.setStart(editor.getBody(), 0);
	rng.setEnd(editor.getBody(), 7);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<div>1234</div><div>4567</div><div>8910</div>', 'Block element on selected non wrapped text 3');
});

test('Block element wrapper 1', function() {
	editor.formatter.register('format', {
		block: 'blockquote',
		wrapper: 1
	});
	editor.getBody().innerHTML = '<h1>1234</h1><p>5678</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('h1')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('p')[0].firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<blockquote><h1>1234</h1><p>5678</p></blockquote>', 'Block element wrapper 1');
});

test('Block element wrapper 2', function() {
	editor.formatter.register('format', {
		block: 'blockquote',
		wrapper: 1
	});
	editor.getBody().innerHTML = '<h1>1234</h1>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('h1')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('h1')[0].firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<blockquote><h1>1234</h1></blockquote>', 'Block element wrapper 2');
});

test('Block element wrapper 3', function() {
	editor.formatter.register('format', {
		block: 'blockquote',
		wrapper: 1
	});
	editor.getBody().innerHTML = '<br /><h1>1234</h1><br />';
	var rng = editor.dom.createRng();
	rng.setStart(editor.getBody(), 0);
	rng.setEnd(editor.getBody(), 3);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<blockquote><h1>1234</h1></blockquote>', 'Block element wrapper 3');
});

test('Apply format on single element that matches a selector 1', function() {
	editor.formatter.register('format', {
		selector: 'p',
		attributes: {
			title: 'test'
		},
		styles: {
			'color': '#ff0000'
		},
		classes: 'a b c'
	});
	editor.getBody().innerHTML = '<p>1234</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('p')[0].firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p class="a b c" style="color: #ff0000;" title="test">1234</p>', 'Apply format on single element that matches a selector');
});

test('Apply format on single element parent that matches a selector 2', function() {
	editor.formatter.register('format', {
		selector: 'div',
		attributes: {
			title: 'test'
		},
		styles: {
			'color': '#ff0000'
		},
		classes: 'a b c'
	});
	editor.getBody().innerHTML = '<div><p>1234</p><p>test</p><p>1234</p></div>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('div')[0], 1);
	rng.setEnd(editor.dom.select('div')[0], 2);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<div class="a b c" style="color: #ff0000;" title="test"><p>1234</p><p>test</p><p>1234</p></div>', 'Apply format on single element parent that matches a selector');
});

test('Apply format on multiple elements that matches a selector 2', function() {
	editor.formatter.register('format', {
		selector: 'p',
		attributes: {
			title: 'test'
		},
		styles: {
			'color': '#ff0000'
		},
		classes: 'a b c'
	});
	editor.getBody().innerHTML = '<p>1234</p><div>test</div><p>1234</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('p')[1].firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p class="a b c" style="color: #ff0000;" title="test">1234</p><div>test</div><p class="a b c" style="color: #ff0000;" title="test">1234</p>', 'Apply format on multiple elements that matches a selector');
});

test('Apply format on top of existing selector element', function() {
	editor.formatter.register('format', {
		selector: 'p',
		attributes: {
			title: 'test2'
		},
		styles: {
			'color': '#00ff00'
		},
		classes: 'a b c'
	});
	editor.getBody().innerHTML = '<p class=\"c d\" title=\"test\">1234</p>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('p')[0].firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p class="c d a b" style="color: #00ff00;" title="test2">1234</p>', 'Apply format on top of existing selector element');
});

test('Format on single li that matches a selector', function() {
	editor.formatter.register('format', {
		inline: 'span',
		selector: 'li',
		attributes: {
			title: 'test'
		},
		styles: {
			'color': '#ff0000'
		},
		classes: 'a b c'
	});
	editor.getBody().innerHTML = '<div>text</div>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('div')[0], 0);
	rng.setEnd(editor.dom.select('div')[0], 1);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<div><span class="a b c" style="color: #ff0000;" title="test">text</span></div>', 'Apply format on single element that matches a selector');
});

test('Format on single div that matches a selector', function() {
	editor.formatter.register('format', {
		inline: 'span',
		selector: 'div',
		attributes: {
			title: 'test'
		},
		styles: {
			'color': '#ff0000'
		},
		classes: 'a b c'
	});
	editor.getBody().innerHTML = '<div>text</div>';
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('div')[0], 0);
	rng.setEnd(editor.dom.select('div')[0], 1);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<div class="a b c" style="color: #ff0000;" title="test">text</div>', 'Apply format on single element that matches a selector');
});

test('Bold and italics is applied to text that is not highlighted', function() {
	var rng = editor.dom.createRng();
	editor.setContent('<p><span style="font-family: Arial;"><strong>test1 test2</strong> test3 test4 test5 test6</span></p>');
	rng.setStart(editor.dom.select('strong')[0].firstChild, 6);
	rng.setEnd(editor.dom.select('strong')[0].firstChild, 11);
	editor.focus();
	editor.selection.setRng(rng);
	editor.execCommand('Italic');
	equal(editor.getContent(), '<p><span style="font-family: Arial;"><strong>test1 <em>test2</em></strong> test3 test4 test5 test6</span></p>', 'Selected text should be bold.');
});

test('Apply color format to links as well', function() {
	editor.setContent('<p>123<a href="#">abc</a>456</p>');
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('p')[0].lastChild, 3);
	editor.selection.setRng(rng);

	editor.formatter.register('format', {
		inline: 'span',
		styles: {
			color: '#FF0000'
		},
		links: true
	});
	editor.formatter.apply('format');

	equal(
		editor.getContent(),
		'<p><span style="color: #ff0000;">123<a style="color: #ff0000;" href="#">abc</a>456</span></p>',
		'Link should have it\'s own color.'
	);
});

test('Color on link element', function() {
	editor.setContent('<p><span style="font-size: 10px;">123<a href="#">abc</a>456</span></p>');
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('span')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('span')[0].lastChild, 3);
	editor.selection.setRng(rng);

	editor.formatter.register('format', {
		inline: 'span',
		styles: {
			color: '#FF0000'
		},
		links: true
	});
	editor.formatter.apply('format');

	equal(
		editor.getContent(),
		'<p><span style="color: #ff0000; font-size: 10px;">123<a style="color: #ff0000;" href="#">abc</a>456</span></p>',
		'Link should have it\'s own color.'
	);
});

test("Applying formats in lists", function() {
	editor.setContent('<ul><li>text<ul><li>nested</li></ul></li></ul>');
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('li')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('li')[0].firstChild, 1);
	editor.selection.setRng(rng);
	editor.formatter.apply("h1");
	equal(editor.getContent(), '<ul><li><h1>text</h1><ul><li>nested</li></ul></li></ul>', "heading should not automatically apply to sublists");
});

test("Applying formats on a list including child nodes", function(){
	editor.formatter.register('format', {inline: 'strong'});
	editor.setContent('<ol><li>a</li><li>b<ul><li>c</li><li>d<br /><ol><li>e</li><li>f</li></ol></li></ul></li><li>g</li></ol>');
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('li')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('li')[6].firstChild, 1);
	editor.selection.setRng(rng);
	editor.formatter.apply("format");
	equal(editor.getContent(), '<ol><li><strong>a</strong></li><li><strong>b</strong><ul><li><strong>c</strong></li><li><strong>d</strong><br /><ol><li><strong>e</strong></li><li><strong>f</strong></li></ol></li></ul></li><li><strong>g</strong></li></ol>', "should be applied to all sublists");
});

test('Block format on li element', function() {
	editor.setContent('<ul><li>text<ul><li>nested</li></ul></li></ul>');
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('li')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('li')[1].firstChild, 1);
	editor.selection.setRng(rng);
	editor.formatter.apply("h1");
	equal(editor.getContent(), '<ul><li><h1>text</h1><ul><li><h1>nested</h1></li></ul></li></ul>', "heading should automatically apply to sublists, when selection spans the sublist");
});

test('Block on li element 2', function() {
	editor.setContent('<ul><li>before<ul><li>nested</li></ul>after</li></ul>');
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('li')[0].lastChild, 1);
	rng.setEnd(editor.dom.select('li')[0].lastChild, 2);
	editor.selection.setRng(rng);
	editor.formatter.apply("h1");
	equal(editor.getContent(), '<ul><li>before<ul><li>nested</li></ul><h1>after</h1></li></ul>', "heading should automatically apply to sublists, when selection spans the sublist");
});

test('Block on li element 3', function() {
	editor.setContent('<ul><li>before<ul><li>nested</li></ul>after</li></ul>');
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('li')[1].firstChild, 0);
	rng.setEnd(editor.dom.select('li')[0].lastChild, 1);
	editor.selection.setRng(rng);
	editor.formatter.apply("h1");
	equal(editor.getContent(), '<ul><li>before<ul><li><h1>nested</h1></li></ul><h1>after</h1></li></ul>', "heading should automatically apply to sublists, when selection spans the sublist");
});

test('Block on li element 4', function() {
	editor.setContent('<ul><li>before<ul><li>nested</li></ul>after</li></ul>');
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('li')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('li')[0].lastChild, 1);
	editor.selection.setRng(rng);
	editor.formatter.apply("h1");
	equal(editor.getContent(), '<ul><li><h1>before</h1><ul><li><h1>nested</h1></li></ul><h1>after</h1></li></ul>', "heading should apply correctly when selection is after a sublist");
});

test('Underline colors 1', function() {
	editor.formatter.register('format', {
		inline: 'span',
		styles: {
			'color': '#ff0000'
		}
	});
	editor.setContent('<p><span style="font-family: \'arial black\'; text-decoration: underline;">test</span></p>');
	editor.execCommand('SelectAll');
	editor.formatter.apply('format');
	equal(editor.getContent(), '<p><span style="color: #ff0000; font-family: \'arial black\'; text-decoration: underline;">test</span></p>', 'Coloring an underlined text should result in a colored underline');
});

test('Underline colors 2', function() {
	editor.formatter.register('format', {
		inline: "span",
		exact: true,
		styles: {
			'textDecoration': 'underline'
		}
	});
	editor.setContent('<p><span style="font-family: \'arial black\'; color: rgb(255, 0, 0);">test</span></p>');
	editor.execCommand('SelectAll');
	editor.formatter.apply('format');
	equal(editor.getContent(), '<p><span style="text-decoration: underline;"><span style="color: #ff0000; font-family: \'arial black\'; text-decoration: underline;">test</span></span></p>', 'Underlining colored text should result in a colored underline');
});

test('Underline colors 3', function() {
	editor.formatter.register('format', {
		inline: "span",
		exact: true,
		styles: {
			'textDecoration': 'underline'
		}
	});
	editor.setContent('<p><span style="font-family: \'arial black\'; text-decoration: underline;"><em><strong>This is some <span style="color: rgb(255, 0, 0);">example</span></strong></em> text</span></p>');
	editor.execCommand('SelectAll');
	editor.formatter.apply('format');
	equal(editor.getContent(), '<p><span style="text-decoration: underline;"><span style="font-family: \'arial black\';"><em><strong>This is some <span style="color: #ff0000; text-decoration: underline;">example</span></strong></em> text</span></span></p>', 'Underlining colored and underlined text should result in a colored underline');
});

test('Underline colors 4', function() {
	editor.formatter.register('format', {
		inline: 'span',
		styles: {
			'color': '#ff0000'
		}
	});
	editor.setContent('<p style="font-size: 22pt;"><span style=\"text-decoration: underline;\"><span style=\"color: yellow; text-decoration: underline;\">yellowredyellow</span></span></p>');
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('span')[1].firstChild, 6);
	rng.setEnd(editor.dom.select('span')[1].firstChild, 9);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(getContent(), '<p style="font-size: 22pt;"><span style="text-decoration: underline;"><span style="color: yellow;' +
		' text-decoration: underline;">yellow<span style="color: #ff0000; text-decoration: underline;">red</span>yellow</span></span></p>',
		'Coloring an colored underdlined text should result in newly colored underline'
	);
});

test('Underline colors 5', function() {
	editor.formatter.register('format', {
		inline: "span",
		exact: true,
		styles: {
			'textDecoration': 'underline'
		}
	});
	editor.setContent('<p><span style="font-family: \'arial black\',\'avant garde\';"><em><strong>This is some <span style="color: rgb(255, 0, 0);">example</span></strong></em> text</span></p><p><span style="font-family: \'arial black\',\'avant garde\';"><em><strong>This is some <span style="color: rgb(255, 0, 0);">example</span></strong></em> text</span></p><p><span style="font-family: \'arial black\', \'avant garde\';"><em><strong>This is some <span style="color: rgb(255, 0, 0);">example</span></strong></em> text</span></p>');
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('strong')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('span')[4].lastChild, 5);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	equal(editor.getContent(), '<p><span style="text-decoration: underline;"><span style="font-family: \'arial black\',\'avant garde\';"><em><strong>This is some <span style="color: #ff0000; text-decoration: underline;">example</span></strong></em> text</span></span></p><p><span style="text-decoration: underline;"><span style="font-family: \'arial black\',\'avant garde\';"><em><strong>This is some <span style="color: #ff0000; text-decoration: underline;">example</span></strong></em> text</span></span></p><p><span style="text-decoration: underline;"><span style="font-family: \'arial black\', \'avant garde\';"><em><strong>This is some <span style="color: #ff0000; text-decoration: underline;">example</span></strong></em> text</span></span></p>', 'Colored elements should be underlined when selection is across multiple paragraphs');
});

test('Underline colors 6', function() {
	editor.formatter.register('format', {
		inline: 'span',
		exact: true,
		styles: {
			'color': '#ff0000'
		}
	});
	editor.setContent('<p><span style="text-decoration: underline;">This is some text.</span></p>');
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('span')[0].firstChild, 8);
	rng.setEnd(editor.dom.select('span')[0].firstChild, 12);
	editor.selection.setRng(rng);
	editor.formatter.apply('format');
	editor.formatter.remove('format');
	equal(editor.getContent(), '<p><span style="text-decoration: underline;">This is some text.</span></p>', 'Children nodes that are underlined should be removed if their parent nodes are underlined');
});

test('Underline colors 7', function() {
	editor.formatter.register('format', {
		inline: 'span',
		exact: true,
		styles: {
			'color': '#ff0000'
		}
	});
	editor.setContent('<p><span style="text-decoration: underline;">This is <span style="color: #ff0000; text-decoration: underline; background-color: #ff0000">some</span> text.</span></p>');
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('span')[1].firstChild, 0);
	rng.setEnd(editor.dom.select('span')[1].firstChild, 4);
	editor.selection.setRng(rng);
	editor.formatter.remove('format');
	equal(editor.getContent(), '<p><span style=\"text-decoration: underline;\">This is <span style=\"background-color: #ff0000;\">some</span> text.</span></p>', 'Children nodes that are underlined should be removed if their parent nodes are underlined');
});

test('Caret format inside single block word', function() {
	editor.setContent('<p>abc</p>');
	editor.formatter.register('format', {
		inline: 'b'
	});
	Utils.setSelection('p', 2, 'p', 2);
	editor.formatter.apply('format');
	equal(editor.getContent(), '<p><b>abc</b></p>');
});

test('Caret format inside non-ascii single block word', function() {
	editor.setContent('<p>noël</p>');
	editor.formatter.register('format', {
		inline: 'b'
	});
	Utils.setSelection('p', 2, 'p', 2);
	editor.formatter.apply('format');
	equal(editor.getContent(), '<p><b>noël</b></p>');
});

test('Caret format inside first block word', function() {
	editor.setContent('<p>abc 123</p>');
	editor.formatter.register('format', {
		inline: 'b'
	});
	Utils.setSelection('p', 2, 'p', 2);
	editor.formatter.apply('format');
	equal(editor.getContent(), '<p><b>abc</b> 123</p>');
});

test('Caret format inside last block word', function() {
	editor.setContent('<p>abc 123</p>');
	editor.formatter.register('format', {
		inline: 'b'
	});
	Utils.setSelection('p', 5, 'p', 5);
	editor.formatter.apply('format');
	equal(editor.getContent(), '<p>abc <b>123</b></p>');
});

test('Caret format inside middle block word', function() {
	editor.setContent('<p>abc 123 456</p>');
	editor.formatter.register('format', {
		inline: 'b'
	});
	Utils.setSelection('p', 5, 'p', 5);
	editor.formatter.apply('format');
	equal(editor.getContent(), '<p>abc <b>123</b> 456</p>');
});

test('Caret format on word separated by non breaking space', function() {
	editor.setContent('<p>one&nbsp;two</p>');
	editor.formatter.register('format', {
		inline: 'b'
	});
	Utils.setSelection('p', 1, 'p', 1);
	editor.formatter.apply('format');
	equal(editor.getContent(), '<p><b>one</b>\u00a0two</p>');
});

test('Caret format inside single inline wrapped word', function() {
	editor.setContent('<p>abc <em>123</em> 456</p>');
	editor.formatter.register('format', {
		inline: 'b'
	});
	Utils.setSelection('em', 1, 'em', 1);
	editor.formatter.apply('format');
	equal(editor.getContent(), '<p>abc <b><em>123</em></b> 456</p>');
});

test('Caret format inside word before similar format', function() {
	editor.setContent('<p>abc 123 <b>456</b></p>');
	editor.formatter.register('format', {
		inline: 'b'
	});
	Utils.setSelection('p', 1, 'p', 1);
	editor.formatter.apply('format');
	equal(editor.getContent(), '<p><b>abc</b> 123 <b>456</b></p>');
});

test('Caret format inside last inline wrapped word', function() {
	editor.setContent('<p>abc <em>abc 123</em> 456</p>');
	editor.formatter.register('format', {
		inline: 'b'
	});
	Utils.setSelection('em', 5, 'em', 5);
	editor.formatter.apply('format');
	equal(editor.getContent(), '<p>abc <em>abc <b>123</b></em> 456</p>');
});

test('Caret format before text', function() {
	editor.setContent('<p>a</p>');
	editor.formatter.register('format', {
		inline: 'b'
	});
	Utils.setSelection('p', 0, 'p', 0);
	editor.formatter.apply('format');
	Utils.type('b');
	equal(editor.getContent(), '<p><b>b</b>a</p>');
});

test('Caret format after text', function() {
	editor.setContent('<p>a</p>');
	editor.formatter.register('format', {
		inline: 'b'
	});
	Utils.setSelection('p', 1, 'p', 1);
	editor.formatter.apply('format');
	Utils.type('b');
	equal(editor.getContent(), '<p>a<b>b</b></p>');
});

test('Caret format and no key press', function() {
	editor.setContent('<p>a</p>');
	editor.formatter.register('format', {
		inline: 'b'
	});
	Utils.setSelection('p', 0, 'p', 0);
	editor.formatter.apply('format');
	equal(editor.getContent(), '<p>a</p>');
});

test('Caret format and arrow left', function() {
	editor.setContent('<p>a</p>');
	editor.formatter.register('format', {
		inline: 'b'
	});
	Utils.setSelection('p', 0, 'p', 0);
	editor.formatter.apply('format');
	Utils.type({
		keyCode: 37
	});
	equal(editor.getContent(), '<p>a</p>');
});

test('Caret format and arrow right', function() {
	editor.setContent('<p>a</p>');
	editor.formatter.register('format', {
		inline: 'b'
	});
	Utils.setSelection('p', 0, 'p', 0);
	editor.formatter.apply('format');
	Utils.type({
		keyCode: 39
	});
	equal(editor.getContent(), '<p>a</p>');
});

test('Caret format and backspace', function() {
	var rng;

	if (tinymce.isOpera) {
		ok(true, "Skip Opera since faking backspace doesn't work.");
		return;
	}

	editor.formatter.register('format', {
		inline: 'b'
	});

	editor.setContent('<p>abc</p>');
	rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 3);
	rng.setEnd(editor.dom.select('p')[0].firstChild, 3);
	editor.selection.setRng(rng);

	editor.formatter.apply('format');
	Utils.type('\b');
	equal(editor.getContent(), '<p>ab</p>');
});

test('Caret format on word in li with word in parent li before it', function() {
	editor.setContent('<ul><li>one<ul><li>two</li></ul></li></ul>');
	editor.formatter.register('format', {
		inline: 'b'
	});
	Utils.setSelection('ul li li', 1, 'ul li li', 1);
	editor.formatter.apply('format');
	equal(editor.getContent(), '<ul><li>one<ul><li><b>two</b></li></ul></li></ul>');
});

test('Selector format on whole contents', function() {
	editor.setContent('<p>a</p>');
	editor.formatter.register('format', {
		inline: 'span',
		selector: '*',
		classes: 'test'
	});
	Utils.setSelection('p', 0, 'p', 1);
	editor.formatter.apply('format');
	equal(editor.getContent(), '<p class="test">a</p>');
});

test('format inline on contentEditable: false block', function() {
	editor.formatter.register('format', {
		inline: 'b'
	});
	editor.setContent('<p>abc</p><p contenteditable="false">def</p>');
	Utils.setSelection('p:nth-child(2)', 0, 'p:nth-child(2)', 3);
	editor.formatter.apply('format');
	equal(editor.getContent(), '<p>abc</p><p contenteditable="false">def</p>', 'Text is not bold');
});

test('format block on contentEditable: false block', function() {
	editor.formatter.register('format', {
		block: 'h1'
	});
	editor.setContent('<p>abc</p><p contenteditable="false">def</p>');
	Utils.setSelection('p:nth-child(2)', 0, 'p:nth-child(2)', 3);
	editor.formatter.apply('format');
	equal(editor.getContent(), '<p>abc</p><p contenteditable="false">def</p>', 'P is not h1');
});

test('contentEditable: false on start and contentEditable: true on end', function() {
	editor.formatter.register('format', {
		inline: 'b'
	});
	editor.setContent('<p>abc</p><p contenteditable="false">def</p><p>ghi</p>');
	Utils.setSelection('p:nth-child(2)', 0, 'p:nth-child(3)', 3);
	editor.formatter.apply('format');
	equal(editor.getContent(), '<p>abc</p><p contenteditable="false">def</p><p><b>ghi</b></p>', 'Text in last paragraph is bold');
});

test('contentEditable: true on start and contentEditable: false on end', function() {
	editor.formatter.register('format', {
		inline: 'b'
	});
	editor.setContent('<p>abc</p><p contenteditable="false">def</p>');
	Utils.setSelection('p:nth-child(1)', 0, 'p:nth-child(2)', 3);
	editor.formatter.apply('format');
	equal(editor.getContent(), '<p><b>abc</b></p><p contenteditable="false">def</p>', 'Text in first paragraph is bold');
});

test('contentEditable: true inside contentEditable: false', function() {
	editor.formatter.register('format', {
		inline: 'b'
	});
	editor.setContent('<p>abc</p><p contenteditable="false"><span contenteditable="true">def</span></p>');
	Utils.setSelection('span', 0, 'span', 3);
	editor.formatter.apply('format');
	equal(editor.getContent(), '<p>abc</p><p contenteditable="false"><span contenteditable="true"><b>def</b></span></p>', 'Text is bold');
});

test('Del element wrapping blocks', function() {
	editor.setContent('<p>a</p>');
	Utils.setSelection('p', 0, 'p', 1);
	editor.formatter.register('format', {
		block: 'del',
		wrapper: true
	});
	editor.formatter.apply('format');
	equal(getContent(), '<del><p>a</p></del>');
});

test('Del element replacing block', function() {
	editor.setContent('<p>a</p>');
	Utils.setSelection('p', 0, 'p', 1);
	editor.formatter.register('format', {
		block: 'del'
	});
	editor.formatter.apply('format');
	equal(getContent(), '<del>a</del>');
});

test('Del element as inline', function() {
	editor.setContent('<p>a</p>');
	Utils.setSelection('p', 0, 'p', 1);
	editor.formatter.register('format', {
		inline: 'del'
	});
	editor.formatter.apply('format');
	equal(getContent(), '<p><del>a</del></p>');
});

test('Align specified table element with collapsed: false and selection collapsed', function() {
	editor.setContent('<table><tr><td>a</td></tr></table>');
	Utils.setSelection('td', 0, 'td', 0);
	editor.formatter.register('format', {
		selector: 'table',
		collapsed: false,
		styles: {
			'float': 'right'
		}
	});
	editor.formatter.apply('format', {}, editor.getBody().firstChild);
	equal(getContent(), '<table style="float: right;"><tbody><tr><td>a</td></tr></tbody></table>');
});

test('Align nested table cell to same as parent', function() {
	editor.setContent(
		'<table>' +
			'<tbody>' +
				'<tr>' +
					'<td style="text-align: right;">a' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td><b>b</b></td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</td>' +
				'</tr>' +
			'</tbody>' +
		'</table>'
	);

	Utils.setSelection('b', 0);

	editor.formatter.register('format', {
		selector: 'td',
		styles: {
			'text-align': 'right'
		}
	});

	editor.formatter.apply('format', {}, editor.$('td td')[0]);

	equal(
		getContent(),
		'<table>' +
			'<tbody>' +
				'<tr>' +
					'<td style="text-align: right;">a' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td style="text-align: right;"><b>b</b></td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</td>' +
				'</tr>' +
			'</tbody>' +
		'</table>'
	);
});

test('Apply ID format to around existing bookmark node', function() {
	editor.getBody().innerHTML = '<p>a<span id="b" data-mce-type="bookmark"></span>b</p>';

	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('p')[0].lastChild, 1);
	editor.selection.setRng(rng);

	editor.formatter.register('format', {
		inline: 'span',
		attributes: {
			id: 'id'
		}
	});
	editor.formatter.apply('format');

	equal(Utils.normalizeHtml(editor.getBody().innerHTML), '<p><span id="id">a<span data-mce-type="bookmark" id="b"></span>b</span></p>');
});

test('Bug #5134 - TinyMCE removes formatting tags in the getContent', function() {
	editor.setContent('');
	editor.formatter.register('format', {
		inline: 'strong',
		toggle: false
	});
	editor.formatter.apply('format');
	equal(getContent(), '', 'empty TinyMCE');
	editor.selection.setContent('a');
	equal(getContent(), '<strong>a</strong>', 'bold text inside TinyMCE');
});

test('Bug #5134 - TinyMCE removes formatting tags in the getContent - typing', function() {
	editor.setContent('');
	editor.formatter.register('format', {
		inline: 'strong',
		toggle: false
	});
	editor.formatter.apply('format');
	equal(getContent(), '', 'empty TinyMCE');
	Utils.type('a');
	equal(getContent(), '<strong>a</strong>', 'bold text inside TinyMCE');
});

test('Bug #5453 - TD contents with BR gets wrapped in block format', function() {
	editor.setContent('<table><tr><td>abc<br />123</td></tr></table>');
	Utils.setSelection('td', 1, 'td', 1);
	editor.formatter.register('format', {
		block: 'h1'
	});
	editor.formatter.apply('format');
	equal(getContent(), '<table><tbody><tr><td><h1>abc</h1>123</td></tr></tbody></table>');
});

test('Bug #6471 - Merge left/right style properties', function() {
	editor.formatter.register('format', {
		inline: 'span',
		styles: {
			fontWeight: 'bold'
		}
	});
	editor.setContent('<p>abc</p>');
	Utils.setSelection('p', 2, 'p', 3);
	editor.formatter.apply('format');
	Utils.setSelection('p', 1, 'p', 2);
	editor.formatter.apply('format');
	Utils.setSelection('p', 0, 'p', 1);
	editor.formatter.apply('format');
	equal(editor.getContent(), '<p><span style="font-weight: bold;">abc</span></p>');
});

asyncTest('Bug #6518 - Apply div blocks to inline editor paragraph', function() {
	tinymce.init({
		selector: "#elm2",
		inline: true,
		add_unload_trigger: false,
		skin: false,
		indent: false,
		convert_fonts_to_spans: false,
		disable_nodechange: true,
		entities: 'raw',
		valid_styles: {
			'*': 'color,font-size,font-family,background-color,font-weight,font-style,text-decoration,float,margin,margin-top,margin-right,margin-bottom,margin-left,display,text-align'
		},
		init_instance_callback: function(ed) {
            QUnit.start();

			ed.setContent('<p>a</p><p>b</p>');
			ed.selection.select(ed.getBody().firstChild, true);
			ed.selection.collapse(true);
			ed.formatter.register('format', {
				block: 'div'
			});
			ed.formatter.apply('format');
			equal(ed.getContent(), '<div>a</div><p>b</p>');
		}
	});
});

asyncTest('Bug #7412 - valid_styles affects the Bold and Italic buttons, although it shouldn\'t', function() {
    tinymce.init({
        selector: "#elm3",
        add_unload_trigger: false,
        valid_styles: {
            span: 'color,background-color,font-size,text-decoration,padding-left'
        },
        init_instance_callback: function(ed) {
            QUnit.start();

            ed.getBody().innerHTML = '<p>1 <span style="text-decoration: underline;">1234</span> 1</p>';
            var rng = ed.dom.createRng();
            rng.setStart(ed.dom.select('span')[0], 0);
            rng.setEnd(ed.dom.select('span')[0], 1);
            ed.selection.setRng(rng);
            ed.formatter.toggle('bold');
            equal(ed.getContent(), '<p>1 <strong><span style="text-decoration: underline;">1234</span></strong> 1</p>');
        }
    });
});

test('Format selection from with end at beginning of block', function(){
	editor.setContent("<div id='a'>one</div><div id='b'>two</div>");
	editor.focus();
	Utils.setSelection('#a', 0, '#b', 0);
	editor.execCommand('formatBlock', false, 'h1');
	equal(getContent(), '<h1 id="a">one</h1><div id="b">two</div>');
});

test('Format selection over fragments', function(){
	editor.setContent("<p><strong>a</strong>bc<em>d</em></p>");
	Utils.setSelection('strong', 1, 'em', 0);
	editor.formatter.apply('underline');
	equal(getContent(), '<p><strong>a</strong><span style="text-decoration: underline;">bc</span><em>d</em></p>');
});

test("Wrapper with fontSize should retain priority within a branch of nested inline format wrappers", function() {
	editor.setContent("<p>abc</p>");
	Utils.setSelection('p', 0, 'p', 3);

	editor.formatter.apply('fontsize', {value: '18px'});
	editor.formatter.apply('bold');
	editor.formatter.apply('underline');
	editor.formatter.apply('forecolor', {value: '#ff0000'});

    equal(getContent(), '<p><span style="color: #ff0000; font-size: 18px; text-decoration: underline;"><strong>abc</strong></span></p>');
});

test("Child wrapper having the same format as the immediate parent, shouldn't be removed if it also has other formats merged", function() {
	editor.getBody().innerHTML = '<p><span style="font-family: verdana;">a <span style="color: #ff0000;">b</span>c</span></p>';
	Utils.setSelection('span span', 0, 'span span', 1);
	editor.formatter.apply('fontname', {value: "verdana"});
	equal(getContent(), '<p><span style="font-family: verdana;">a <span style="color: #ff0000;">b</span>c</span></p>');
});

test("When format with backgroundColor is applied, all the nested childNodes having fontSize should receive backgroundColor as well", function() {
	editor.getBody().innerHTML = '<p>a <span style="font-size: 36pt;">b</span> c</p>';
	editor.selection.select(editor.dom.select('p')[0]);

	editor.formatter.apply('hilitecolor', {value: "#ff0000"});
	equal(getContent(), '<p><span style="background-color: #ff0000;">a <span style="font-size: 36pt; background-color: #ff0000;">b</span> c</span></p>');

	editor.formatter.remove('hilitecolor', {value: "#ff0000"});
	equal(getContent(), '<p>a <span style="font-size: 36pt;">b</span> c</p>');
});

test("TINY-782: Can't apply sub/sup to word on own line with large font", function() {
	editor.getBody().innerHTML = '<p><span style="font-size: 18px;">abc</p>';
	Utils.setSelection('span', 0, 'span', 3);
	editor.formatter.apply('superscript');
	equal(getContent(), '<p><span style="font-size: 18px;"><sup>abc</sup></span></p>');
});

test("TINY-671: Background color on nested font size bug", function() {
	editor.getBody().innerHTML = '<p><strong><span style="font-size: 18px;">abc</span></strong></p>';
	Utils.setSelection('span', 0, 'span', 3);
	editor.formatter.apply('hilitecolor', {value: '#ff0000'});
	equal(getContent(), '<p><span style="font-size: 18px; background-color: #ff0000;"><strong>abc</strong></span></p>');
});

test("TINY-865: Font size removed when changing background color", function() {
	editor.getBody().innerHTML = '<p><span style="background-color: #ffff00;"><span style="font-size: 8pt;">a</span> <span style="font-size: 36pt;">b</span> <span style="font-size: 8pt;">c</span></span></p>';
	Utils.setSelection('span span:nth-child(2)', 0, 'span span:nth-child(2)', 1);
	editor.formatter.apply('hilitecolor', {value: '#ff0000'});
    equal(getContent(), '<p><span style="background-color: #ffff00;"><span style="font-size: 8pt;">a</span> <span style="font-size: 36pt; background-color: #ff0000;">b</span> <span style="font-size: 8pt;">c</span></span></p>');
});

test("TINY-935: Text color, then size, then change color wraps span doesn't change color", function() {
    editor.getBody().innerHTML = '<p><span style="color: #00ff00; font-size: 14pt;">text</span></p>';
    Utils.setSelection('span', 0, 'span', 4);
    editor.formatter.apply('forecolor', {value: '#ff0000'});
    equal(getContent(), '<p><span style="color: #ff0000; font-size: 14pt;">text</span></p>');
});

test("GH-3519: Font family selection does not work after changing font size", function() {
    editor.getBody().innerHTML = '<p><span style="font-size: 14pt; font-family: \'comic sans ms\', sans-serif;">text</span></p>';
    Utils.setSelection('span', 0, 'span', 4);
    editor.formatter.apply('fontname', {value: "verdana"});
    equal(getContent(), '<p><span style="font-size: 14pt; font-family: verdana;">text</span></p>');
});
