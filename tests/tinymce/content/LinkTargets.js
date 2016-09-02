ModuleLoader.require([
	"tinymce/content/LinkTargets",
	"tinymce/util/Arr"
], function(LinkTargets, Arr) {
	module("tinymce.content.LinkTargets", {});

	var createFromHtml = function (html) {
		var elm = document.createElement('div');
		elm.innerHTML = html;
		return elm;
	};

	var targetsIn = function (html) {
		return LinkTargets.find(createFromHtml(html));
	};

	var equalTargets = function (actualTargets, expectedTargets, message) {
		var nonAttachedTargets = Arr.map(actualTargets, function (target) {
			return {
				level: target.level,
				title: target.title,
				type: target.type,
				url: target.url
			};
		});

		deepEqual(nonAttachedTargets, expectedTargets, message);
	};

	test('Non link targets', function() {
		equal(targetsIn('a').length, 0, 'Text has no targets');
		equal(targetsIn('<p>a</p>').length, 0, 'Paragraph has no targets');
		equal(targetsIn('<a href="#1">a</a>').length, 0, 'Link has no targets');
	});

	test('Anchor targets', function() {
		equalTargets(targetsIn('<a id="a"></a>'), [{level: 0, title: '#a', type: 'anchor', url: '#a'}], 'Anchor with id');
		equalTargets(targetsIn('<a name="a"></a>'), [{level: 0, title: '#a', type: 'anchor', url: '#a'}], 'Anchor with name');
		equalTargets(targetsIn('<a name=""></a>'), [], 'Empty anchor name should not produce a target');
		equalTargets(targetsIn('<a id=""></a>'), [], 'Empty anchor id should not produce a target');
	});

	test('Header targets', function() {
		equalTargets(targetsIn('<h1 id="a">a</h1>'), [{level: 1, title: 'a', type: 'header', url: '#a'}], 'Header 1 with id');
		equalTargets(targetsIn('<h2 id="a">a</h2>'), [{level: 2, title: 'a', type: 'header', url: '#a'}], 'Header 2 with id');
		equalTargets(targetsIn('<h3 id="a">a</h3>'), [{level: 3, title: 'a', type: 'header', url: '#a'}], 'Header 3 with id');
		equalTargets(targetsIn('<h4 id="a">a</h4>'), [{level: 4, title: 'a', type: 'header', url: '#a'}], 'Header 4 with id');
		equalTargets(targetsIn('<h5 id="a">a</h5>'), [{level: 5, title: 'a', type: 'header', url: '#a'}], 'Header 5 with id');
		equalTargets(targetsIn('<h6 id="a">a</h6>'), [{level: 6, title: 'a', type: 'header', url: '#a'}], 'Header 6 with id');
		equalTargets(targetsIn('<h1 id="a"></h1>'), [], 'Empty header should not produce a target');
	});

	test('Mixed targets', function() {
		equalTargets(
			targetsIn('<h1 id="a">a</h1><a id="b"></a>'),
			[
				{level: 1, title: 'a', type: 'header', url: '#a'},
				{level: 0, title: '#b', type: 'anchor', url: '#b'}
			],
			'Header 1 with id and anchor with id'
		);
	});

	test('Anchor attach', function() {
		var elm = createFromHtml('<a id="a"></a>');
		var targets = LinkTargets.find(elm);

		targets[0].attach();
		equal(elm.innerHTML, '<a id="a"></a>', 'Should remain the same as before attach');
	});

	test('Header attach on header with id', function() {
		var elm = createFromHtml('<h1 id="a">a</h1>');
		var targets = LinkTargets.find(elm);

		targets[0].attach();
		equal(elm.innerHTML, '<h1 id="a">a</h1>', 'Should remain the same as before attach');
	});

	test('Header attach on header without id', function() {
		var elm = createFromHtml('<h1>a</h1>');
		var targets = LinkTargets.find(elm);

		targets[0].attach();
		equal(elm.innerHTML, '<h1 id="' + elm.firstChild.id + '">a</h1>', 'Should remain the same as before attach');
	});
});
