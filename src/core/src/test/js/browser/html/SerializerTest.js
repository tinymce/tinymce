asynctest(
  'browser.tinymce.core.html.SerializerTest',
  [
    'ephox.mcagar.api.LegacyUnit',
    'ephox.agar.api.Pipeline',
    'tinymce.core.html.DomParser',
    'tinymce.core.html.Serializer',
    'tinymce.core.html.Schema'
  ],
  function (LegacyUnit, Pipeline, DomParser, Serializer, Schema) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    suite.test('Basic serialization', function () {
      var serializer = new Serializer();

      LegacyUnit.equal(serializer.serialize(new DomParser().parse('text<text&')), 'text&lt;text&amp;');
      LegacyUnit.equal(
        serializer.serialize(new DomParser().parse('<B>text</B><IMG src="1.gif">')),
        '<strong>text</strong><img src="1.gif" />'
      );
      LegacyUnit.equal(serializer.serialize(new DomParser().parse('<!-- comment -->')), '<!-- comment -->');
      LegacyUnit.equal(serializer.serialize(new DomParser().parse('<![CDATA[cdata]]>')), '<![CDATA[cdata]]>');
      LegacyUnit.equal(serializer.serialize(new DomParser().parse('<?xml attr="value" ?>')), '<?xml attr="value" ?>');
      LegacyUnit.equal(serializer.serialize(new DomParser().parse('<!DOCTYPE html>')), '<!DOCTYPE html>');
    });

    suite.test('Sorting of attributes', function () {
      var serializer = new Serializer();

      LegacyUnit.equal(
        serializer.serialize(new DomParser().parse('<b class="class" id="id">x</b>')),
        '<strong id="id" class="class">x</strong>'
      );
    });

    suite.test('Serialize with validate: true, when parsing with validate:false bug', function () {
      var schema = new Schema({ valid_elements: 'b' });
      var serializer = new Serializer({}, schema);

      LegacyUnit.equal(
        serializer.serialize(new DomParser({ validate: false }, schema).parse('<b a="1" b="2">a</b><i a="1" b="2">b</i>')),
        '<b a="1" b="2">a</b><i a="1" b="2">b</i>'
      );
    });

    Pipeline.async({}, suite.toSteps({}), function () {
      success();
    }, failure);
  }
);