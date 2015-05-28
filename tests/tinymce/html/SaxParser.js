(function() {
	module("tinymce.html.SaxParser");

	var writer = new tinymce.html.Writer(), schema = new tinymce.html.Schema();

	function createCounter(writer) {
		var counts = {};

		return {
			counts : counts,

			comment: function(text) {
				if ("comment" in counts) {
					counts.comment++;
				} else {
					counts.comment = 1;
				}

				writer.comment(text);
			},

			cdata: function(text) {
				if ("cdata" in counts) {
					counts.cdata++;
				} else {
					counts.cdata = 1;
				}

				writer.cdata(text);
			},

			text: function(text, raw) {
				if ("text" in counts) {
					counts.text++;
				} else {
					counts.text = 1;
				}

				writer.text(text, raw);
			},

			start: function(name, attrs, empty) {
				if ("start" in counts) {
					counts.start++;
				} else {
					counts.start = 1;
				}

				writer.start(name, attrs, empty);
			},

			end: function(name) {
				if ("end" in counts) {
					counts.end++;
				} else {
					counts.end = 1;
				}

				writer.end(name);
			},

			pi: function(name, text) {
				if ("pi" in counts) {
					counts.pi++;
				} else {
					counts.pi = 1;
				}

				writer.pi(name, text);
			},

			doctype: function(text) {
				if ("doctype:" in counts) {
					counts.doctype++;
				} else {
					counts.doctype = 1;
				}

				writer.doctype(text);
			}
		};
	}

	test('Parse elements', function() {
		var counter, parser;

		expect(48);

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<span id=id1 title="title value" class=\'class1 class2\' data-value="value1" MYATTR="val1" myns:myattr="val2" disabled empty=""></span>');
		equal(writer.getContent(), '<span id="id1" title="title value" class="class1 class2" data-value="value1" myattr="val1" myns:myattr="val2" disabled="disabled" empty=""></span>', 'Parse attribute formats.');
		deepEqual(counter.counts, {start:1, end:1}, 'Parse attribute formats counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<b href=\'"&amp;<>\'></b>');
		equal(writer.getContent(), '<b href="&quot;&amp;&lt;&gt;"></b>', 'Parse attributes with <> in them.');
		deepEqual(counter.counts, {start:1, end:1}, 'Parse attributes with <> in them (count).');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<span title=" "class=" "></span>');
		equal(writer.getContent(), '<span title=" " class=" "></span>', 'Parse compressed attributes.');
		deepEqual(counter.counts, {start:1, end:1}, 'Parse compressed attributes (count).');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<span title></span>');
		equal(writer.getContent(), '<span title=""></span>', 'Single empty attribute.');
		deepEqual(counter.counts, {start:1, end:1}, 'Single empty attributes (count).');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<span class="class" title></span>');
		equal(writer.getContent(), '<span class="class" title=""></span>', 'Empty attribute at end.');
		deepEqual(counter.counts, {start:1, end:1}, 'Empty attribute at end (count).');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<span title class="class"></span>');
		equal(writer.getContent(), '<span title="" class="class"></span>', 'Empty attribute at start.');
		deepEqual(counter.counts, {start:1, end:1}, 'Empty attribute at start (count).');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<img src="test">');
		equal(writer.getContent(), '<img src="test" />', 'Parse empty element.');
		deepEqual(counter.counts, {start:1}, 'Parse empty element counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<img\nsrc="test"\ntitle="row1\nrow2">');
		equal(writer.getContent(), '<img src="test" title="row1\nrow2" />', 'Parse attributes with linebreak.');
		deepEqual(counter.counts, {start: 1}, 'Parse attributes with linebreak counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<img     \t  \t   src="test"     \t  \t   title="\t    row1\t     row2">');
		equal(writer.getContent(), '<img src="test" title="\t    row1\t     row2" />', 'Parse attributes with whitespace.');
		deepEqual(counter.counts, {start: 1}, 'Parse attributes with whitespace counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<myns:mytag>text</myns:mytag>');
		equal(writer.getContent(), '<myns:mytag>text</myns:mytag>', 'Parse element with namespace.');
		deepEqual(counter.counts, {start:1, text:1, end: 1}, 'Parse element with namespace counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<myns-mytag>text</myns-mytag>');
		equal(writer.getContent(), '<myns-mytag>text</myns-mytag>', 'Parse element with dash name.');
		deepEqual(counter.counts, {start:1, text:1, end:1}, 'Parse element with dash name counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<myns_mytag>text</myns_mytag>');
		equal(writer.getContent(), '<myns_mytag>text</myns_mytag>', 'Parse element with underscore name.');
		deepEqual(counter.counts, {start:1, text:1, end:1}, 'Parse element with underscore name counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('text1<p>text2<b>text3</p>text4</b>text5');
		equal(writer.getContent(), 'text1<p>text2<b>text3</b></p>text4text5', 'Parse tag soup 1.');
		deepEqual(counter.counts, {text:5, start: 2, end: 2}, 'Parse tag soup 1 counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('text1<P>text2<B>text3</p>text4</b>text5');
		equal(writer.getContent(), 'text1<p>text2<b>text3</b></p>text4text5', 'Parse tag soup 2.');
		deepEqual(counter.counts, {text: 5, start: 2, end: 2}, 'Parse tag soup 2 counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('text1<P>text2<B>tex<t3</p>te>xt4</b>text5');
		equal(writer.getContent(), 'text1<p>text2<b>tex&lt;t3</b></p>te&gt;xt4text5', 'Parse tag soup 3.');
		deepEqual(counter.counts, {text: 5, start: 2, end: 2}, 'Parse tag soup 3 counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('text1<p>text2<b>text3');
		equal(writer.getContent(), 'text1<p>text2<b>text3</b></p>', 'Parse tag soup 4.');
		deepEqual(counter.counts, {text: 3, start: 2, end: 2}, 'Parse tag soup 4 counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('text1<script>text2');
		equal(writer.getContent(), 'text1<script>text2</s' + 'cript>', 'Parse tag soup 5.');
		deepEqual(counter.counts, {text: 2, start: 1, end: 1}, 'Parse tag soup 5 counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('text1<style>text2');
		equal(writer.getContent(), 'text1<style>text2</st' + 'yle>', 'Parse tag soup 6.');
		deepEqual(counter.counts, {text: 2, start: 1, end: 1}, 'Parse tag soup 6 counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('text1<span title="<test" data-test="test>"></span>');
		equal(writer.getContent(), 'text1<span title="&lt;test" data-test="test&gt;"></span>', 'Parse element with </> in attributes.');
		deepEqual(counter.counts, {text: 1, start: 1, end: 1}, 'Parse element with </> in attributes counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse("text\n<SC"+"RIPT type=mce-text/javascript>// <![CDATA[\nalert('HELLO WORLD!');\n// ]]></SC"+"RIPT>");
		equal(writer.getContent(), "text\n<sc"+"ript type=\"mce-text/javascript\">// <![CDATA[\nalert('HELLO WORLD!');\n// ]]></sc"+"ript>", 'Parse cdata script.');
		deepEqual(counter.counts, {text: 2, start: 1, end: 1}, 'Parse cdata script counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('text1<noscript>te<br>xt2</noscript>text3');
		equal(writer.getContent(), 'text1<noscript>te<br>xt2</noscript>text3', 'Parse noscript elements.');
		deepEqual(counter.counts, {text: 3, start: 1, end: 1}, 'Parse noscript elements counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<p>a</p><p /><p>b</p>');
		equal(writer.getContent(), '<p>a</p><p></p><p>b</p>', 'Parse invalid closed element.');
		deepEqual(counter.counts, {text: 2, start: 3, end: 3}, 'Parse invalid closed element counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<br><br /><br/>');
		equal(writer.getContent(), '<br /><br /><br />', 'Parse short ended elements.');
		deepEqual(counter.counts, {start: 3}, 'Parse short ended elements counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<p ></p>');
		equal(writer.getContent(), '<p></p>', 'Parse start elements with whitespace only attribs part.');
		deepEqual(counter.counts, {start: 1, end: 1}, 'Parse start elements with whitespace only attribs part (counts).');
	});

	test('Parse style elements', function() {
		var counter, parser;

		expect(8);

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('text1<em><style>// <b>tag</b></st' + 'yle>text2</em>');
		equal(writer.getContent(), 'text1<em><style>// <b>tag</b></st' + 'yle>text2</em>', 'Parse style element.');
		deepEqual(counter.counts, {start: 2, end: 2, text: 3}, 'Parse style element counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('text1<em><style id="id">// <b>tag</b></st' + 'yle>text2</em>');
		equal(writer.getContent(), 'text1<em><style id="id">// <b>tag</b></st' + 'yle>text2</em>', 'Parse style element with attributes.');
		deepEqual(counter.counts, {text:3, start:2, end:2}, 'Parse style element with attributes counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('text1<em><style></st' + 'yle>text2</span>');
		equal(writer.getContent(), 'text1<em><style></st' + 'yle>text2</em>', 'Parse empty style element.');
		deepEqual(counter.counts, {text:2, start:2, end:2}, 'Parse empty style element counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(tinymce.extend({validate : true}, counter), new tinymce.html.Schema({invalid_elements: 'style'}));
		writer.reset();
		parser.parse('text1<em><style>text2</st' + 'yle>text3</em>');
		equal(writer.getContent(), 'text1<em>text3</em>', 'Parse invalid style element.');
		deepEqual(counter.counts, {text:2, start:1, end:1}, 'Parse invalid style element (count).');
	});

	test('Parse script elements', function() {
		var counter, parser;

		expect(8);

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('text1<em><script>// <b>tag</b></s' + 'cript>text2</em>');
		equal(writer.getContent(), 'text1<em><script>// <b>tag</b></s' + 'cript>text2</em>', 'Parse script element.');
		deepEqual(counter.counts, {start:2, end:2, text:3}, 'Parse script element counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('text1<em><script id="id">// <b>tag</b></s' + 'cript>text2</em>');
		equal(writer.getContent(), 'text1<em><script id="id">// <b>tag</b></s' + 'cript>text2</em>', 'Parse script element with attributes.');
		deepEqual(counter.counts, {start:2, end:2, text:3}, 'Parse script element with attributes counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('text1<em><script></s' + 'cript>text2</em>');
		equal(writer.getContent(), 'text1<em><script></s' + 'cript>text2</em>', 'Parse empty script element.');
		deepEqual(counter.counts, {text: 2, start:2, end: 2}, 'Parse empty script element counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(tinymce.extend({validate : true}, counter), new tinymce.html.Schema({invalid_elements: 'script'}));
		writer.reset();
		parser.parse('text1<em><s' + 'cript>text2</s' + 'cript>text3</em>');
		equal(writer.getContent(), 'text1<em>text3</em>', 'Parse invalid script element.');
		deepEqual(counter.counts, {text:2, start:1, end:1}, 'Parse invalid script element (count).');
	});

	test('Parse text', function() {
		var counter, parser;

		expect(10);

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('');
		equal(writer.getContent(), '', 'Parse empty.');
		deepEqual(counter.counts, {}, 'Parse empty counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('text');
		equal(writer.getContent(), 'text', 'Parse single text node.');
		deepEqual(counter.counts, {text: 1}, 'Parse single text node counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<b>text</b>');
		equal(writer.getContent(), '<b>text</b>', 'Parse wrapped text.');
		deepEqual(counter.counts, {start:1, text:1, end:1}, 'Parse wrapped text counts');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('text1<b>text2</b>');
		equal(writer.getContent(), 'text1<b>text2</b>', 'Parse text at start.');
		deepEqual(counter.counts, {start:1, text:2, end:1}, 'Parse text at start counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<b>text1</b>text2');
		equal(writer.getContent(), '<b>text1</b>text2', 'Parse text at end.');
		deepEqual(counter.counts, {start:1, end:1, text:2}, 'Parse text at end counts.');
	});

	test('Parsing comments', function() {
		var counter, parser;

		expect(8);

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<!-- comment value -->');
		equal(writer.getContent(), '<!-- comment value -->', 'Parse comment with value.');
		deepEqual(counter.counts, {comment:1}, 'Parse comment with value count.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<!---->');
		equal(writer.getContent(), '', 'Parse comment without value.');
		deepEqual(counter.counts, {}, 'Parse comment without value count.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<!--<b></b>-->');
		equal(writer.getContent(), '<!--<b></b>-->', 'Parse comment with tag inside.');
		deepEqual(counter.counts, {comment:1}, 'Parse comment with tag inside counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<b>a<!-- value -->b</b>');
		equal(writer.getContent(), '<b>a<!-- value -->b</b>', 'Parse comment with tags around it.');
		deepEqual(counter.counts, {comment:1, text:2, start:1, end:1}, 'Parse comment with tags around it counts.');
	});

	test('Parsing cdata', function() {
		var counter, parser;

		expect(8);

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<![CDATA[test text]]>');
		equal(writer.getContent(), '<![CDATA[test text]]>', 'Parse cdata with value.');
		deepEqual(counter.counts, {cdata:1}, 'Parse cdata with value counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<![CDATA[]]>');
		equal(writer.getContent(), '', 'Parse cdata without value.');
		deepEqual(counter.counts, {}, 'Parse cdata without value counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<![CDATA[<b>a</b>]]>');
		equal(writer.getContent(), '<![CDATA[<b>a</b>]]>', 'Parse cdata with tag inside.');
		deepEqual(counter.counts, {cdata:1}, 'Parse cdata with tag inside counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<b>a<![CDATA[value]]>b</b>');
		equal(writer.getContent(), '<b>a<![CDATA[value]]>b</b>', 'Parse cdata with tags around it.');
		deepEqual(counter.counts, {cdata:1, start:1, end:1, text:2}, 'Parse cdata with tags around it counts.');
	});

	test('Parse PI', function() {
		var counter, parser;

		expect(6);

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<?xml version="1.0" encoding="UTF-8" ?>text1');
		equal(writer.getContent(), '<?xml version="1.0" encoding="UTF-8" ?>text1', 'Parse PI with attributes.');
		deepEqual(counter.counts, {pi:1, text:1}, 'Parse PI with attributes counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<?xml?>text1');
		equal(writer.getContent(), '<?xml?>text1', 'Parse PI with no data.');
		deepEqual(counter.counts, {pi:1, text:1}, 'Parse PI with data counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<?xml somevalue/>text1');
		equal(writer.getContent(), '<?xml somevalue?>text1', 'Parse PI with IE style ending.');
		deepEqual(counter.counts, {pi:1, text:1}, 'Parse PI with IE style ending counts.');
	});

	test('Parse doctype', function() {
		var counter, parser;

		expect(4);

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">text1');
		equal(writer.getContent(), '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">text1', 'Parse DOCTYPE.');
		deepEqual(counter.counts, {doctype:1, text:1}, 'Parse HTML5 DOCTYPE counts.');

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<!DOCTYPE html>text1');
		equal(writer.getContent(), '<!DOCTYPE html>text1', 'Parse HTML5 DOCTYPE.');
		deepEqual(counter.counts, {doctype:1, text:1}, 'Parse HTML5 DOCTYPE counts.');
	});

	test('Parse (validate)', function() {
		var counter, parser;

		expect(2);

		counter = createCounter(writer);
		counter.validate = true;
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<invalid1>123<invalid2 />456<span title="title" invalid3="value">789</span>012</invalid1>');
		equal(writer.getContent(), '123456<span title="title">789</span>012', 'Parse invalid elements and attributes.');
		deepEqual(counter.counts, {start:1, end:1, text:4}, 'Parse invalid elements and attributes counts.');
	});

	test('Self closing', function() {
		var counter, parser;

		expect(1);

		counter = createCounter(writer);
		counter.validate = true;
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<ul><li>1<li><b>2</b><li><em><b>3</b></em></ul>');
		equal(writer.getContent(), '<ul><li>1</li><li><b>2</b></li><li><em><b>3</b></em></li></ul>', 'Parse list with self closing items.');
	});

	test('Preserve internal elements', function() {
		var counter, parser, schema;

		expect(2);

		schema = new tinymce.html.Schema({valid_elements : 'b'});
		counter = createCounter(writer);
		counter.validate = true;
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<span id="id"><b>text</b></span><span id="id" data-mce-type="something"></span>');
		equal(writer.getContent(), '<b>text</b><span id="id" data-mce-type="something"></span>', 'Preserve internal span element without any span schema rule.');

		schema = new tinymce.html.Schema({valid_elements : 'b,span[class]'});
		counter = createCounter(writer);
		counter.validate = true;
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<span id="id" class="class"><b>text</b></span><span id="id" data-mce-type="something"></span>');
		equal(writer.getContent(), '<span class="class"><b>text</b></span><span id="id" data-mce-type="something"></span>', 'Preserve internal span element with a span schema rule.');
	});

	test('Remove internal elements', function() {
		var counter, parser, schema;

		expect(2);

		schema = new tinymce.html.Schema({valid_elements : 'b'});
		counter = createCounter(writer);
		counter.validate = true;
		counter.remove_internals = true;
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<span id="id"><b>text</b></span><span id="id" data-mce-type="something"></span>');
		equal(writer.getContent(), '<b>text</b>', 'Remove internal span element without any span schema rule.');

		schema = new tinymce.html.Schema({valid_elements : 'b,span[class]'});
		counter = createCounter(writer);
		counter.validate = true;
		counter.remove_internals = true;
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<span id="id" class="class"><b>text</b></span><span id="id" data-mce-type="something"></span>');
		equal(writer.getContent(), '<span class="class"><b>text</b></span>', 'Remove internal span element with a span schema rule.');

		// Reset
		counter.remove_internals = false;
	});

	test('Parse attr with backslash #5436', function() {
		var counter, parser;

		counter = createCounter(writer);
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<a title="\\" href="h">x</a>');
		equal(writer.getContent(), '<a title="\\" href="h">x</a>');
	});

	test('Parse no attributes span before strong', function() {
		var counter, parser;

		counter = createCounter(writer);
		counter.validate = true;
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse('<p><span>A</span> <strong>B</strong></p>');
		equal(writer.getContent(), '<p>A <strong>B</strong></p>');
	});

	test('Conditional comments (allowed)', function() {
		var counter, parser;

		counter = createCounter(writer);
		counter.validate = false;
		counter.allow_conditional_comments = true;
		parser = new tinymce.html.SaxParser(counter, schema);

		writer.reset();
		parser.parse('<!--[if gte IE 4]>alert(1)<![endif]-->');
		equal(writer.getContent(), '<!--[if gte IE 4]>alert(1)<![endif]-->');
	});

	test('Conditional comments (denied)', function() {
		var counter, parser;

		counter = createCounter(writer);
		counter.validate = false;
		counter.allow_conditional_comments = false;
		parser = new tinymce.html.SaxParser(counter, schema);

		writer.reset();
		parser.parse('<!--[if gte IE 4]>alert(1)<![endif]-->');
		equal(writer.getContent(), '<!-- [if gte IE 4]>alert(1)<![endif]-->');

		writer.reset();
		parser.parse('<!--[if !IE]>alert(1)<![endif]-->');
		equal(writer.getContent(), '<!-- [if !IE]>alert(1)<![endif]-->');
	});

	test('Parse script urls (allowed)', function() {
		var counter, parser;

		counter = createCounter(writer);
		counter.validate = false;
		counter.allow_script_urls = true;
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse(
			'<a href="javascript:alert(1)">1</a>' +
			'<a href=" 2 ">2</a>' +
			'<a href="data:text/html;base64,PHN2Zy9vbmxvYWQ9YWxlcnQoMik+">3</a>'
		);
		equal(
			writer.getContent(),
			'<a href="javascript:alert(1)">1</a><a href=" 2 ">2</a>' +
			'<a href="data:text/html;base64,PHN2Zy9vbmxvYWQ9YWxlcnQoMik+">3</a>'
		);
	});

	test('Parse script urls (allowed html data uris)', function() {
		var counter, parser;

		counter = createCounter(writer);
		counter.validate = false;
		counter.allow_html_data_urls = true;
		parser = new tinymce.html.SaxParser(counter, schema);
		writer.reset();
		parser.parse(
			'<a href="javascript:alert(1)">1</a>' +
			'<a href="data:text/html;base64,PHN2Zy9vbmxvYWQ9YWxlcnQoMik+">2</a>'
		);
		equal(
			writer.getContent(),
			'<a>1</a>' +
			'<a href="data:text/html;base64,PHN2Zy9vbmxvYWQ9YWxlcnQoMik+">2</a>'
		);
	});

	test('Parse script urls (denied)', function() {
		var counter, parser;

		counter = createCounter(writer);
		counter.validate = false;
		parser = new tinymce.html.SaxParser(counter, schema);

		writer.reset();
		parser.parse(
			'<a href="jAvaScript:alert(1)">1</a>' +
			'<a href="vbscript:alert(2)">2</a>' +
			'<a href="java\u0000script:alert(3)">3</a>' +
			'<a href="\njavascript:alert(4)">4</a>' +
			'<a href="java\nscript:alert(5)">5</a>' +
			'<a href="java\tscript:alert(6)">6</a>' +
			'<a href="%6aavascript:alert(7)">7</a>' +
			'<a href="data:text/html;base64,PHN2Zy9vbmxvYWQ9YWxlcnQoMik+">8</a>' +
			'<a href=" dAt%61: tExt/html  ; bAse64 , PHN2Zy9vbmxvYWQ9YWxlcnQoMik+">9</a>' +
			'<object data="data:text/html;base64,PHN2Zy9vbmxvYWQ9YWxlcnQoMik+">10</object>' +
			'<button formaction="javascript:alert(11)">11</button>' +
			'<table background="javascript:alert(12)"><tr><tr>12</tr></tr></table>' +
			'<a href="mhtml:13">13</a>' +
			'<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">' +
			'<a href="%E3%82%AA%E3%83%BC%E3%83">Invalid url</a>'
		);

		equal(
			writer.getContent(),
			'<a>1</a><a>2</a><a>3</a><a>4</a><a>5</a><a>6</a><a>7</a><a>8</a><a>9</a>' +
			'<object>10</object><button>11</button><table><tr></tr><tr>12</tr></table><a>13</a>' +
			'<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />' +
			'<a href="%E3%82%AA%E3%83%BC%E3%83">Invalid url</a>'
		);
	});

	test('Parse away bogus elements', function() {
		function testBogusSaxParse(inputHtml, outputHtml, counters) {
			var counter, parser;

			counter = createCounter(writer);
			counter.validate = true;
			parser = new tinymce.html.SaxParser(counter, schema);
			writer.reset();
			parser.parse(inputHtml);
			equal(writer.getContent(), outputHtml);
			deepEqual(counter.counts, counters);
		}

		testBogusSaxParse('a<b data-mce-bogus="1">b</b>c', 'abc', {text: 3});
		testBogusSaxParse('a<b data-mce-bogus="true">b</b>c', 'abc', {text: 3});
		testBogusSaxParse('a<b data-mce-bogus="1"></b>c', 'ac', {text: 2});
		testBogusSaxParse('a<b data-mce-bogus="all">b</b>c', 'ac', {text: 2});
		testBogusSaxParse('a<b data-mce-bogus="all"><!-- x --><?xml?></b>c', 'ac', {text: 2});
		testBogusSaxParse('a<b data-mce-bogus="all"><b>b</b></b>c', 'ac', {text: 2});
		testBogusSaxParse('a<b data-mce-bogus="all"><br>b</b><b>c</b>', 'a<b>c</b>', {start: 1, end: 1, text: 2});
		testBogusSaxParse('a<b data-mce-bogus="all"><img>b</b><b>c</b>', 'a<b>c</b>', {start: 1, end: 1, text: 2});
		testBogusSaxParse('a<b data-mce-bogus="all"><b attr="x">b</b></b>c', 'ac', {text: 2});
		testBogusSaxParse('a<b data-mce-bogus="all"></b>c', 'ac', {text: 2});
		testBogusSaxParse('a<b data-mce-bogus="all"></b><b>c</b>', 'a<b>c</b>', {start: 1, end: 1, text:2});
	});

	test('findEndTag', function() {
		function testFindEndTag(html, startIndex, expectedIndex) {
			equal(tinymce.html.SaxParser.findEndTag(schema, html, startIndex), expectedIndex);
		}

		testFindEndTag('<b>', 3, 3);
		testFindEndTag('<img>', 3, 3);
		testFindEndTag('<b></b>', 3, 7);
		testFindEndTag('<b><img></b>', 3, 12);
		testFindEndTag('<b><!-- </b> --></b>', 3, 20);
		testFindEndTag('<span><b><i>a<img>b</i><b>c</b></b></span>', 9, 35);
	});

	test('parse XSS PI', function() {
		var counter, parser;

		counter = createCounter(writer);
		counter.validate = false;
		parser = new tinymce.html.SaxParser(counter, schema);

		writer.reset();
		parser.parse('<?xml><iframe SRC=&#106&#97&#118&#97&#115&#99&#114&#105&#112&#116&#58&#97&#108&#101&#114&#116&#40&#39&#88&#83&#83&#39&#41>?>');

		equal(
			writer.getContent(),
			'<?xml &gt;&lt;iframe SRC=&amp;#106&amp;#97&amp;#118&amp;#97&amp;#115&amp;#99&amp;#114&amp;#105&amp;#112&amp;' +
			'#116&amp;#58&amp;#97&amp;#108&amp;#101&amp;#114&amp;#116&amp;#40&amp;#39&amp;#88&amp;#83&amp;#83&amp;#39&amp;#41&gt;?>'
		);
	});
})();
