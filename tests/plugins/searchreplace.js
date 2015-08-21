module("tinymce.plugins.SearchReplace", {
	setupModule: function() {
		QUnit.stop();

		tinymce.init({
			selector: "textarea",
			plugins: "searchreplace",
			elements: "elm1",
			add_unload_trigger: false,
			skin: false,
			indent: false,
			disable_nodechange: true,
			valid_elements: 'b,i',
			init_instance_callback : function(ed) {
				window.editor = ed;
				window.setTimeout(function() {
					QUnit.start();
				}, 0);
			}
		});
	}
});

test('Find no match', function() {
	editor.getBody().innerHTML = 'a';
	equal(0, editor.plugins.searchreplace.find('x'));
});

test('Find single match', function() {
	editor.getBody().innerHTML = 'a';
	equal(1, editor.plugins.searchreplace.find('a'));
});

test('Find single match in multiple elements', function() {
	editor.getBody().innerHTML = 't<b>e</b><i>xt</i>';
	equal(1, editor.plugins.searchreplace.find('text'));
});

test('Find single match, match case: true', function() {
	editor.getBody().innerHTML = 'a A';
	equal(1, editor.plugins.searchreplace.find('A', true));
});

test('Find single match, whole words: true', function() {
	editor.getBody().innerHTML = 'a Ax';
	equal(1, editor.plugins.searchreplace.find('a', false, true));
});

test('Find multiple matches', function() {
	editor.getBody().innerHTML = 'a b A';
	equal(2, editor.plugins.searchreplace.find('a'));
});

test('Find and replace single match', function() {
	editor.getBody().innerHTML = 'a';
	editor.plugins.searchreplace.find('a');
	ok(!editor.plugins.searchreplace.replace('x'));
	equal("<p>x</p>", editor.getContent());
});

test('Find and replace first in multiple matches', function() {
	editor.getBody().innerHTML = 'a b a';
	editor.plugins.searchreplace.find('a');
	ok(editor.plugins.searchreplace.replace('x'));
	equal("<p>x b a</p>", editor.getContent());
});

test('Find and replace all in multiple matches', function() {
	editor.getBody().innerHTML = 'a b a';
	editor.plugins.searchreplace.find('a');
	ok(!editor.plugins.searchreplace.replace('x', true, true));
	equal("<p>x b x</p>", editor.getContent());
});

test('Find multiple matches, move to next and replace', function() {
	editor.getBody().innerHTML = 'a a';
	equal(2, editor.plugins.searchreplace.find('a'));
	editor.plugins.searchreplace.next();
	ok(!editor.plugins.searchreplace.replace('x'));
	equal("<p>a x</p>", editor.getContent());
});

test('Find and replace fragmented match', function() {
	editor.getBody().innerHTML = '<b>te<i>s</i>t</b><b>te<i>s</i>t</b>';
	editor.plugins.searchreplace.find('test');
	ok(editor.plugins.searchreplace.replace('abc'));
	equal(editor.getContent(), "<p><b>abc</b><b>te<i>s</i>t</b></p>");
});

test('Find and replace all fragmented matches', function() {
	editor.getBody().innerHTML = '<b>te<i>s</i>t</b><b>te<i>s</i>t</b>';
	editor.plugins.searchreplace.find('test');
	ok(!editor.plugins.searchreplace.replace('abc', true, true));
	equal(editor.getContent(), "<p><b>abc</b><b>abc</b></p>");
});

test('Find multiple matches, move to next and replace backwards', function() {
	editor.getBody().innerHTML = 'a a';
	equal(2, editor.plugins.searchreplace.find('a'));
	editor.plugins.searchreplace.next();
	ok(editor.plugins.searchreplace.replace('x', false));
	ok(!editor.plugins.searchreplace.replace('y', false));
	equal("<p>y x</p>", editor.getContent());
});

test('Find multiple matches and unmark them', function() {
	editor.getBody().innerHTML = 'a b a';
	equal(2, editor.plugins.searchreplace.find('a'));
	editor.plugins.searchreplace.done();
	equal('a', editor.selection.getContent());
	equal(0, editor.getBody().getElementsByTagName('span').length);
});

test('Find multiple matches with pre blocks', function() {
	editor.getBody().innerHTML = 'abc<pre>  abc  </pre>abc';
	equal(3, editor.plugins.searchreplace.find('b'));
	equal(Utils.normalizeHtml(editor.getBody().innerHTML), (
		'a<span class="mce-match-marker mce-match-marker-selected" data-mce-bogus="1" data-mce-index="0">b</span>c' +
		'<pre>  a<span class="mce-match-marker" data-mce-bogus="1" data-mce-index="1">b</span>c  </pre>' +
		'a<span class="mce-match-marker" data-mce-bogus="1" data-mce-index="2">b</span>c'
	));
});
