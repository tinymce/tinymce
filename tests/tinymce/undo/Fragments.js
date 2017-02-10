ModuleLoader.require(['tinymce/undo/Fragments'], function(Fragments) {
	module('tinymce.undo.Fragments');

	var div = function (html) {
		var div = document.createElement('div');
		div.innerHTML = html;
		return div;
	};

	var html = function (elm) {
		return elm.innerHTML;
	};

	test('read', function() {
		deepEqual(Fragments.read(div('')), []);
		deepEqual(Fragments.read(div('a')), ['a']);
		deepEqual(Fragments.read(div('<!--a-->')), ['<!--a-->']);
		deepEqual(Fragments.read(div('<b>a</b>')), ['<b>a</b>']);
		deepEqual(Fragments.read(div('a<!--b--><b>c</b>')), ['a', '<!--b-->', '<b>c</b>']);
	});

	test('write', function() {
		deepEqual(html(Fragments.write([], div(''))), '');
		deepEqual(html(Fragments.write([], div('a'))), '');
		deepEqual(html(Fragments.write(['a'], div(''))), 'a');
		deepEqual(html(Fragments.write(['a'], div('a'))), 'a');
		deepEqual(html(Fragments.write(['a'], div('b'))), 'a');
		deepEqual(html(Fragments.write(['a', '<b>c</b>'], div('a<b>b</b>'))), 'a<b>c</b>');
		deepEqual(html(Fragments.write(['<b>c</b>', '<b>d</b>'], div('a<b>b</b>'))), '<b>c</b><b>d</b>');
		deepEqual(html(Fragments.write(['<b>c</b>', '<b>d</b>', '<!--e-->'], div('a<b>b</b>'))), '<b>c</b><b>d</b><!--e-->');
	});
});
