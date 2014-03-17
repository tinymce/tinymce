(function() {
	module("tinymce.html.DomParser");

	var schema = new tinymce.html.Schema({valid_elements: '*[class|title]'});
	var serializer = new tinymce.html.Serializer({}, schema);
	var parser, root;

	function countNodes(node, counter) {
		var sibling;

		if (!counter) {
			counter = {};
		}

		if (node.name in counter) {
			counter[node.name]++;
		} else {
			counter[node.name] = 1;
		}

		for (sibling = node.firstChild; sibling; sibling = sibling.next) {
			countNodes(sibling, counter);
		}

		return counter;
	}

	schema.addValidChildren('+body[style]');

	test('Parse element', function() {
		var parser, root;

		expect(7);

		parser = new tinymce.html.DomParser({}, schema);
		root = parser.parse('<B title="title" class="class">test</B>');
		equal(serializer.serialize(root), '<b class="class" title="title">test</b>', 'Inline element');
		equal(root.firstChild.type, 1, 'Element type');
		equal(root.firstChild.name, 'b', 'Element name');
		deepEqual(root.firstChild.attributes, [{name: 'title', value: 'title'}, {name: 'class', value: 'class'}], 'Element attributes');
		deepEqual(countNodes(root), {body:1, b:1, '#text':1}, 'Element attributes (count)');

		parser = new tinymce.html.DomParser({}, schema);
		root = parser.parse('  \t\r\n  <SCRIPT>  \t\r\n   a < b > \t\r\n   </S' + 'CRIPT>   \t\r\n  ');
		equal(serializer.serialize(root), '<script>  \t\r\n   a < b > \t\r\n   </s' + 'cript>', 'Retain code inside SCRIPT');
		deepEqual(countNodes(root), {body:1, script:1, '#text':1}, 'Retain code inside SCRIPT (count)');
	});

	test('Whitespace', function() {
		expect(12);

		parser = new tinymce.html.DomParser({}, schema);
		root = parser.parse('  \t\r\n  <B>  \t\r\n   test  \t\r\n   </B>   \t\r\n  ');
		equal(serializer.serialize(root), ' <b> test </b> ', 'Redundant whitespace (inline element)');
		deepEqual(countNodes(root), {body:1, b:1, '#text':3}, 'Redundant whitespace (inline element) (count)');

		parser = new tinymce.html.DomParser({}, schema);
		root = parser.parse('  \t\r\n  <P>  \t\r\n   test  \t\r\n   </P>   \t\r\n  ');
		equal(serializer.serialize(root), '<p>test</p>', 'Redundant whitespace (block element)');
		deepEqual(countNodes(root), {body:1, p:1, '#text':1}, 'Redundant whitespace (block element) (count)');

		parser = new tinymce.html.DomParser({}, schema);
		root = parser.parse('  \t\r\n  <SCRIPT>  \t\r\n   test  \t\r\n   </S' + 'CRIPT>   \t\r\n  ');
		equal(serializer.serialize(root), '<script>  \t\r\n   test  \t\r\n   </s' + 'cript>', 'Whitespace around and inside SCRIPT');
		deepEqual(countNodes(root), {body:1, script:1, '#text':1}, 'Whitespace around and inside SCRIPT (count)');

		parser = new tinymce.html.DomParser({}, schema);
		root = parser.parse('  \t\r\n  <STYLE>  \t\r\n   test  \t\r\n   </STYLE>   \t\r\n  ');
		equal(serializer.serialize(root), '<style>  \t\r\n   test  \t\r\n   </style>', 'Whitespace around and inside STYLE');
		deepEqual(countNodes(root), {body:1, style:1, '#text':1}, 'Whitespace around and inside STYLE (count)');

		parser = new tinymce.html.DomParser({}, schema);
		root = parser.parse('<ul>\n<li>Item 1\n<ul>\n<li>\n \t Indented \t \n</li>\n</ul>\n</li>\n</ul>\n');
		equal(serializer.serialize(root), '<ul><li>Item 1<ul><li>Indented</li></ul></li></ul>', 'Whitespace around and inside blocks (ul/li)');
		deepEqual(countNodes(root), {body:1, li:2, ul:2, '#text':2}, 'Whitespace around and inside blocks (ul/li) (count)');

		parser = new tinymce.html.DomParser({}, new tinymce.html.Schema({invalid_elements : 'hr,br'}));
		root = parser.parse('\n<hr />\n<br />\n<div>\n<hr />\n<br />\n<img src="file.gif" data-mce-src="file.gif" />\n<hr />\n<br />\n</div>\n<hr />\n<br />\n');
		equal(serializer.serialize(root), '<div><img src="file.gif" data-mce-src="file.gif" alt="" /></div>', 'Whitespace where SaxParser will produce multiple whitespace nodes');
		deepEqual(countNodes(root), {body:1, div:1, img:1}, 'Whitespace where SaxParser will produce multiple whitespace nodes (count)');
	});

	test('Whitespace before/after invalid element with text in block', function() {
		parser = new tinymce.html.DomParser({}, new tinymce.html.Schema({invalid_elements : 'em'}));
		root = parser.parse('<p>a <em>b</em> c</p>');
		equal(serializer.serialize(root), '<p>a b c</p>');
	});

	test('Whitespace before/after invalid element whitespace element in block', function() {
		parser = new tinymce.html.DomParser({}, new tinymce.html.Schema({invalid_elements : 'span'}));
		root = parser.parse('<p> <span></span> </p>');
		equal(serializer.serialize(root), '<p>\u00a0</p>');
	});

	test('Whitespace preserved in PRE', function() {
		parser = new tinymce.html.DomParser({}, schema);
		root = parser.parse('  \t\r\n  <PRE>  \t\r\n   test  \t\r\n   </PRE>   \t\r\n  ');
		equal(serializer.serialize(root), '<pre>  \t\r\n   test  \t\r\n   </pre>', 'Whitespace around and inside PRE');
		deepEqual(countNodes(root), {body:1, pre:1, '#text':1}, 'Whitespace around and inside PRE (count)');
	});

	test('Whitespace preserved in SPAN inside PRE', function() {
		parser = new tinymce.html.DomParser({}, schema);
		root = parser.parse('  \t\r\n  <PRE>  \t\r\n  <span>    test    </span> \t\r\n   </PRE>   \t\r\n  ');
		equal(serializer.serialize(root), '<pre>  \t\r\n  <span>    test    </span> \t\r\n   </pre>', 'Whitespace around and inside PRE');
		deepEqual(countNodes(root), {body:1, pre:1, span:1, '#text':3}, 'Whitespace around and inside PRE (count)');
	});

	test('Parse invalid contents', function() {
		var parser, root;

		expect(20);

		parser = new tinymce.html.DomParser({}, schema);
		root = parser.parse('<p class="a"><p class="b">123</p></p>');
		equal(serializer.serialize(root), '<p class="b">123</p>', 'P in P, no nodes before/after');
		deepEqual(countNodes(root), {body:1, p:1, '#text':1}, 'P in P, no nodes before/after (count)');

		parser = new tinymce.html.DomParser({}, schema);
		root = parser.parse('<p class="a">a<p class="b">b</p><p class="c">c</p>d</p>');
		equal(serializer.serialize(root), '<p class="a">a</p><p class="b">b</p><p class="c">c</p><p class="a">d</p>', 'Two P in P, no nodes before/after');
		deepEqual(countNodes(root), {body: 1, p:4, '#text': 4}, 'Two P in P, no nodes before/after (count)');

		parser = new tinymce.html.DomParser({}, schema);
		root = parser.parse('<p class="a">abc<p class="b">def</p></p>');
		equal(serializer.serialize(root), '<p class="a">abc</p><p class="b">def</p>', 'P in P with nodes before');
		deepEqual(countNodes(root), {body: 1, p:2, '#text': 2}, 'P in P with nodes before (count)');

		parser = new tinymce.html.DomParser({}, schema);
		root = parser.parse('<p class="a"><p class="b">abc</p>def</p>');
		equal(serializer.serialize(root), '<p class="b">abc</p><p class="a">def</p>', 'P in P with nodes after');
		deepEqual(countNodes(root), {body: 1, p:2, '#text': 2}, 'P in P with nodes after (count)');

		parser = new tinymce.html.DomParser({}, schema);
		root = parser.parse('<p class="a"><p class="b">abc</p><br></p>');
		equal(serializer.serialize(root), '<p class="b">abc</p>', 'P in P with BR after');
		deepEqual(countNodes(root), {body: 1, p:1, '#text': 1}, 'P in P with BR after (count)');

		parser = new tinymce.html.DomParser({}, schema);
		root = parser.parse('<p class="a">a<strong>b<span>c<em>d<p class="b">e</p>f</em>g</span>h</strong>i</p>');
		equal(serializer.serialize(root), '<p class="a">a<strong>b<span>c<em>d</em></span></strong></p><p class="b">e</p><p class="a"><strong><span><em>f</em>g</span>h</strong>i</p>', 'P in P wrapped in inline elements');
		deepEqual(countNodes(root), {"body":1, "p":3, "#text":9, "strong":2, "span":2, "em": 2}, 'P in P wrapped in inline elements (count)');

		parser = new tinymce.html.DomParser({}, schema);
		root = parser.parse('<p class="a">a<p class="b">b<p class="c">c</p>d</p>e</p>');
		equal(serializer.serialize(root), '<p class="a">a</p><p class="b">b</p><p class="c">c</p><p class="b">d</p><p class="a">e</p>', 'P in P in P with text before/after');
		deepEqual(countNodes(root), {body: 1, p:5, '#text': 5}, 'P in P in P with text before/after (count)');

		parser = new tinymce.html.DomParser({}, schema);
		root = parser.parse('<p>a<ul><li>b</li><li>c</li></ul>d</p>');
		equal(serializer.serialize(root), '<p>a</p><ul><li>b</li><li>c</li></ul><p>d</p>', 'UL inside P');
		deepEqual(countNodes(root), {body: 1, p:2, ul:1, li:2, '#text': 4}, 'UL inside P (count)');

		parser = new tinymce.html.DomParser({}, schema);
		root = parser.parse('<table><tr><td><tr>a</tr></td></tr></table>');
		equal(serializer.serialize(root), '<table><tr><td>a</td></tr></table>', 'TR inside TD');
		deepEqual(countNodes(root), {body: 1, table:1, tr:1, td:1, '#text': 1}, 'TR inside TD (count)');

		parser = new tinymce.html.DomParser({}, new tinymce.html.Schema({valid_elements: 'p,section,div'}));
		root = parser.parse('<div><section><p>a</p></section></div>');
		equal(serializer.serialize(root), '<div><section><p>a</p></section></div>', 'P inside SECTION');
		deepEqual(countNodes(root), {"body":1, "div":1, "section":1, "p":1, "#text":1}, 'P inside SECTION (count)');
	});

	test('addNodeFilter', function() {
		var parser, result;

		expect(7);

		parser = new tinymce.html.DomParser({}, schema);
		parser.addNodeFilter('#comment', function(nodes, name, args) {
			result = {nodes : nodes, name : name, args : args};
		});
		parser.parse('text<!--text1-->text<!--text2-->');

		deepEqual(result.args, {}, 'Parser args');
		equal(result.name, '#comment', 'Parser filter result name');
		equal(result.nodes.length, 2, 'Parser filter result node');
		equal(result.nodes[0].name, '#comment', 'Parser filter result node(0) name');
		equal(result.nodes[0].value, 'text1', 'Parser filter result node(0) value');
		equal(result.nodes[1].name, '#comment', 'Parser filter result node(1) name');
		equal(result.nodes[1].value, 'text2', 'Parser filter result node(1) value');
	});

	test('addNodeFilter multiple names', function() {
		var parser, results = {};

		expect(14);

		parser = new tinymce.html.DomParser({}, schema);
		parser.addNodeFilter('#comment,#text', function(nodes, name, args) {
			results[name] = {nodes : nodes, name : name, args : args};
		});
		parser.parse('text1<!--text1-->text2<!--text2-->');

		deepEqual(results['#comment'].args, {}, 'Parser args');
		equal(results['#comment'].name, '#comment', 'Parser filter result name');
		equal(results['#comment'].nodes.length, 2, 'Parser filter result node');
		equal(results['#comment'].nodes[0].name, '#comment', 'Parser filter result node(0) name');
		equal(results['#comment'].nodes[0].value, 'text1', 'Parser filter result node(0) value');
		equal(results['#comment'].nodes[1].name, '#comment', 'Parser filter result node(1) name');
		equal(results['#comment'].nodes[1].value, 'text2', 'Parser filter result node(1) value');
		deepEqual(results['#text'].args, {}, 'Parser args');
		equal(results['#text'].name, '#text', 'Parser filter result name');
		equal(results['#text'].nodes.length, 2, 'Parser filter result node');
		equal(results['#text'].nodes[0].name, '#text', 'Parser filter result node(0) name');
		equal(results['#text'].nodes[0].value, 'text1', 'Parser filter result node(0) value');
		equal(results['#text'].nodes[1].name, '#text', 'Parser filter result node(1) name');
		equal(results['#text'].nodes[1].value, 'text2', 'Parser filter result node(1) value');
	});

	test('addNodeFilter with parser args', function() {
		var parser, result;

		expect(1);

		parser = new tinymce.html.DomParser({}, schema);
		parser.addNodeFilter('#comment', function(nodes, name, args) {
			result = {nodes : nodes, name : name, args : args};
		});
		parser.parse('text<!--text1-->text<!--text2-->', {value: 1});

		deepEqual(result.args, {value: 1}, 'Parser args');
	});

	test('addAttributeFilter', function() {
		var parser, result;

		expect(7);

		parser = new tinymce.html.DomParser({});
		parser.addAttributeFilter('src', function(nodes, name, args) {
			result = {nodes : nodes, name : name, args : args};
		});
		parser.parse('<b>a<img src="1.gif" />b<img src="1.gif" />c</b>');

		deepEqual(result.args, {}, 'Parser args');
		equal(result.name, 'src', 'Parser filter result name');
		equal(result.nodes.length, 2, 'Parser filter result node');
		equal(result.nodes[0].name, 'img', 'Parser filter result node(0) name');
		equal(result.nodes[0].attr('src'), '1.gif', 'Parser filter result node(0) attr');
		equal(result.nodes[1].name, 'img', 'Parser filter result node(1) name');
		equal(result.nodes[1].attr('src'), '1.gif', 'Parser filter result node(1) attr');
	});

	test('addAttributeFilter multiple', function() {
		var parser, results = {};

		expect(14);

		parser = new tinymce.html.DomParser({});
		parser.addAttributeFilter('src,href', function(nodes, name, args) {
			results[name] = {nodes : nodes, name : name, args : args};
		});
		parser.parse('<b><a href="1.gif">a</a><img src="1.gif" />b<img src="1.gif" /><a href="2.gif">c</a></b>');

		deepEqual(results.src.args, {}, 'Parser args');
		equal(results.src.name, 'src', 'Parser filter result name');
		equal(results.src.nodes.length, 2, 'Parser filter result node');
		equal(results.src.nodes[0].name, 'img', 'Parser filter result node(0) name');
		equal(results.src.nodes[0].attr('src'), '1.gif', 'Parser filter result node(0) attr');
		equal(results.src.nodes[1].name, 'img', 'Parser filter result node(1) name');
		equal(results.src.nodes[1].attr('src'), '1.gif', 'Parser filter result node(1) attr');
		deepEqual(results.href.args, {}, 'Parser args');
		equal(results.href.name, 'href', 'Parser filter result name');
		equal(results.href.nodes.length, 2, 'Parser filter result node');
		equal(results.href.nodes[0].name, 'a', 'Parser filter result node(0) name');
		equal(results.href.nodes[0].attr('href'), '1.gif', 'Parser filter result node(0) attr');
		equal(results.href.nodes[1].name, 'a', 'Parser filter result node(1) name');
		equal(results.href.nodes[1].attr('href'), '2.gif', 'Parser filter result node(1) attr');
	});

	test('Fix orphan LI elements', function() {
		var parser;

		expect(3);

		parser = new tinymce.html.DomParser({}, schema);
		root = parser.parse('<ul><li>a</li></ul><li>b</li>');
		equal(serializer.serialize(root), '<ul><li>a</li><li>b</li></ul>', 'LI moved to previous sibling UL');

		parser = new tinymce.html.DomParser({}, schema);
		root = parser.parse('<li>a</li><ul><li>b</li></ul>');
		equal(serializer.serialize(root), '<ul><li>a</li><li>b</li></ul>', 'LI moved to next sibling UL');

		parser = new tinymce.html.DomParser({}, schema);
		root = parser.parse('<li>a</li>');
		equal(serializer.serialize(root), '<ul><li>a</li></ul>', 'LI wrapped in new UL');
	});

	test('Remove empty elements', function() {
		var parser, schema = new tinymce.html.Schema({valid_elements: 'span,-a,img'});

		expect(3);

		parser = new tinymce.html.DomParser({}, schema);
		root = parser.parse('<span></span><a href="#"></a>');
		equal(serializer.serialize(root), '<span></span>', 'Remove empty a element');

		parser = new tinymce.html.DomParser({}, new tinymce.html.Schema({valid_elements: 'span,a[name],img'}));
		root = parser.parse('<span></span><a name="anchor"></a>');
		equal(serializer.serialize(root), '<span></span><a name="anchor"></a>', 'Leave a with name attribute');
		
		parser = new tinymce.html.DomParser({}, new tinymce.html.Schema({valid_elements: 'span,a[href],img[src]'}));
		root = parser.parse('<span></span><a href="#"><img src="about:blank" /></a>');
		equal(serializer.serialize(root), '<span></span><a href="#"><img src="about:blank" /></a>', 'Leave elements with img in it');
	});

	test('Self closing list elements', function() {
		var parser, root, schema = new tinymce.html.Schema();

		expect(1);

		parser = new tinymce.html.DomParser({}, schema);
		root = parser.parse('<ul><li>1<li><b>2</b><li><em><b>3</b></em></ul>');
		equal(serializer.serialize(root), '<ul><li>1</li><li><strong>2</strong></li><li><em><strong>3</strong></em></li></ul>', 'Split out LI elements in LI elements.');
	});

	test('Remove redundant br elements', function() {
		var parser, root, schema = new tinymce.html.Schema();

		expect(1);

		parser = new tinymce.html.DomParser({remove_trailing_brs : true}, schema);
		root = parser.parse(
			'<p>a<br></p>' +
			'<p>a<br>b<br></p>' +
			'<p>a<br><br></p><p>a<br><span data-mce-type="bookmark"></span><br></p>' +
			'<p>a<span data-mce-type="bookmark"></span><br></p>'
		);
		equal(serializer.serialize(root), '<p>a</p><p>a<br />b</p><p>a<br /><br /></p><p>a<br /><br /></p><p>a</p>', 'Remove traling br elements.');
	});

	test('Replace br with nbsp when wrapped in two inline elements and one block', function() {
		var parser, root, schema = new tinymce.html.Schema();

		parser = new tinymce.html.DomParser({remove_trailing_brs : true}, schema);
		root = parser.parse('<p><strong><em><br /></em></strong></p>');
		equal(serializer.serialize(root), '<p><strong><em>\u00a0</em></strong></p>');
	});

	test('Replace br with nbsp when wrapped in an inline element and placed in the root', function() {
		var parser, root, schema = new tinymce.html.Schema();

		parser = new tinymce.html.DomParser({remove_trailing_brs : true}, schema);
		root = parser.parse('<strong><br /></strong>');
		equal(serializer.serialize(root), '<strong>\u00a0</strong>');
	});

	test('Don\'t replace br inside root element when there is multiple brs', function() {
		var parser, root, schema = new tinymce.html.Schema();

		parser = new tinymce.html.DomParser({remove_trailing_brs : true}, schema);
		root = parser.parse('<strong><br /><br /></strong>');
		equal(serializer.serialize(root), '<strong><br /><br /></strong>');
	});

	test('Don\'t replace br inside root element when there is siblings', function() {
		var parser, root, schema = new tinymce.html.Schema();

		parser = new tinymce.html.DomParser({remove_trailing_brs : true}, schema);
		root = parser.parse('<strong><br /></strong><em>x</em>');
		equal(serializer.serialize(root), '<strong><br /></strong><em>x</em>');
	});

	test('Remove br in invalid parent bug', function() {
		var parser, root, schema = new tinymce.html.Schema({valid_elements: 'br'});

		expect(1);

		parser = new tinymce.html.DomParser({remove_trailing_brs : true}, schema);
		root = parser.parse('<br>');
		equal(serializer.serialize(root), '', 'Remove traling br elements.');
	});

	test('Forced root blocks', function() {
		var parser, root, schema = new tinymce.html.Schema();

		expect(1);

		parser = new tinymce.html.DomParser({forced_root_block : 'p'}, schema);
		root = parser.parse(
			'<!-- a -->' +
			'b' +
			'<b>c</b>' +
			'<p>d</p>' +
			'<p>e</p>' +
			'f' +
			'<b>g</b>' +
			'h'
		);
		equal(serializer.serialize(root), '<!-- a --><p>b<strong>c</strong></p><p>d</p><p>e</p><p>f<strong>g</strong>h</p>', 'Mixed text nodes, inline elements and blocks.');
	});

	test('Forced root blocks attrs', function() {
		var parser, root, schema = new tinymce.html.Schema();

		expect(1);

		parser = new tinymce.html.DomParser({forced_root_block: 'p', forced_root_block_attrs: {"class": "class1"}}, schema);
		root = parser.parse(
			'<!-- a -->' +
			'b' +
			'<b>c</b>' +
			'<p>d</p>' +
			'<p>e</p>' +
			'f' +
			'<b>g</b>' +
			'h'
		);
		equal(serializer.serialize(root), '<!-- a -->' +
			'<p class="class1">b<strong>c</strong></p>' +
			'<p>d</p>' +
			'<p>e</p>' +
			'<p class="class1">f<strong>g</strong>h</p>',
		'Mixed text nodes, inline elements and blocks.');
	});

	test('Parse contents with html4 anchors and allow_html_in_named_anchor: false', function() {
		var parser, root, schema = new tinymce.html.Schema();

		parser = new tinymce.html.DomParser({allow_html_in_named_anchor : false}, schema);
		root = parser.parse('<a name="x">a</a><a href="x">x</a>');
		equal(serializer.serialize(root), '<a name="x"></a>a<a href="x">x</a>');
	});

	test('Parse contents with html5 anchors and allow_html_in_named_anchor: false', function() {
		var parser, root, schema = new tinymce.html.Schema({schema: "html5"});

		parser = new tinymce.html.DomParser({allow_html_in_named_anchor : false}, schema);
		root = parser.parse('<a id="x">a</a><a href="x">x</a>');
		equal(serializer.serialize(root), '<a id="x"></a>a<a href="x">x</a>');
	});

	test('Parse contents with html4 anchors and allow_html_in_named_anchor: true', function() {
		var parser, root, schema = new tinymce.html.Schema();

		parser = new tinymce.html.DomParser({allow_html_in_named_anchor : true}, schema);
		root = parser.parse('<a name="x">a</a><a href="x">x</a>');
		equal(serializer.serialize(root), '<a name="x">a</a><a href="x">x</a>');
	});

	test('Parse contents with html5 anchors and allow_html_in_named_anchor: true', function() {
		var parser, root, schema = new tinymce.html.Schema({schema: "html5"});

		parser = new tinymce.html.DomParser({allow_html_in_named_anchor : true}, schema);
		root = parser.parse('<a id="x">a</a><a href="x">x</a>');
		equal(serializer.serialize(root), '<a id="x">a</a><a href="x">x</a>');
	});

	test('Parse contents with html5 self closing datalist options', function() {
		var parser, root, schema = new tinymce.html.Schema({schema: "html5"});

		parser = new tinymce.html.DomParser({}, schema);
		root = parser.parse('<datalist><option label="a1" value="b1"><option label="a2" value="b2"><option label="a3" value="b3"></datalist>');
		equal(serializer.serialize(root), '<datalist><option label="a1" value="b1"></option><option label="a2" value="b2"></option><option label="a3" value="b3"></option></datalist>');
	});

	test('Parse inline contents before block bug #5424', function() {
		var parser, root, schema = new tinymce.html.Schema({schema: "html5"});

		parser = new tinymce.html.DomParser({}, schema);
		root = parser.parse('<b>1</b> 2<p>3</p>');
		equal(serializer.serialize(root), '<b>1</b> 2<p>3</p>');
	});

	test('Invalid text blocks within a li', function() {
		var parser, root, schema = new tinymce.html.Schema({schema: "html5", valid_children: '-li[p]'});

		parser = new tinymce.html.DomParser({}, schema);
		root = parser.parse('<ul><li>1<p>2</p></li><li>a<p>b</p><p>c</p></li></ul>');
		equal(serializer.serialize(root), '<ul><li>12</li><li>ab</li><li>c</li></ul>');
	});

	test('Invalid inline element with space before', function() {
		var parser, root, schema = new tinymce.html.Schema();

		parser = new tinymce.html.DomParser({}, schema);
		root = parser.parse('<p><span>1</span> <strong>2</strong></p>');
		equal(serializer.serialize(root), '<p>1 <strong>2</strong></p>');
	});
})();

