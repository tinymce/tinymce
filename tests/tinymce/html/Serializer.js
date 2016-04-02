module("tinymce.html.Serializer");

test('Basic serialization', function() {
	var serializer = new tinymce.html.Serializer();

	expect(6);

	equal(serializer.serialize(new tinymce.html.DomParser().parse('text<text&')), 'text&lt;text&amp;');
	equal(serializer.serialize(new tinymce.html.DomParser().parse('<B>text</B><IMG src="1.gif">')), '<strong>text</strong><img src="1.gif" />');
	equal(serializer.serialize(new tinymce.html.DomParser().parse('<!-- comment -->')), '<!-- comment -->');
	equal(serializer.serialize(new tinymce.html.DomParser().parse('<![CDATA[cdata]]>')), '<![CDATA[cdata]]>');
	equal(serializer.serialize(new tinymce.html.DomParser().parse('<?xml attr="value" ?>')), '<?xml attr="value" ?>');
	equal(serializer.serialize(new tinymce.html.DomParser().parse('<!DOCTYPE html>')), '<!DOCTYPE html>');
});

test('Sorting of attributes', function() {
	var serializer = new tinymce.html.Serializer();

	expect(1);

	equal(serializer.serialize(new tinymce.html.DomParser().parse('<b class="class" id="id">x</b>')), '<strong id="id" class="class">x</strong>');
});

test('Serialize with validate: true, when parsing with validate:false bug', function() {
	var schema = new tinymce.html.Schema({valid_elements: 'b'});
	var serializer = new tinymce.html.Serializer({}, schema);

	equal(
		serializer.serialize(new tinymce.html.DomParser({validate: false}, schema).parse('<b a="1" b="2">a</b><i a="1" b="2">b</i>')),
		'<b a="1" b="2">a</b><i a="1" b="2">b</i>'
	);
});
