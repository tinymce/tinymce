module("tinymce.html.Serializer");

test('Basic serialization', function() {
	var serializer = new tinymce.html.Serializer();

	expect(6);

	equal(serializer.serialize(new tinymce.html.DomParser().parse('text<text&')), 'text&lt;text&amp;');
	equal(serializer.serialize(new tinymce.html.DomParser().parse('<B>text</B><IMG src="1.gif">')), '<strong>text</strong><img src="1.gif" alt="" />');
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
