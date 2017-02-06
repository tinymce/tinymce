asynctest(
  'browser.tinymce.core.html.WriterTest',
  [
    'ephox.mcagar.api.LegacyUnit',
    'ephox.agar.api.Pipeline',
    'tinymce.core.html.Writer'
  ],
  function (LegacyUnit, Pipeline, Writer) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    suite.test('Comment', function () {
      var writer;

      writer = new Writer();
      writer.comment('text');
      LegacyUnit.equal(writer.getContent(), '<!--text-->');

      writer = new Writer();
      writer.comment('');
      LegacyUnit.equal(writer.getContent(), '<!---->');
    });

    suite.test('CDATA', function () {
      var writer;

      writer = new Writer();
      writer.cdata('text');
      LegacyUnit.equal(writer.getContent(), '<![CDATA[text]]>');

      writer = new Writer();
      writer.cdata('');
      LegacyUnit.equal(writer.getContent(), '<![CDATA[]]>');
    });

    suite.test('PI', function () {
      var writer;

      writer = new Writer();
      writer.pi('xml', 'someval');
      LegacyUnit.equal(writer.getContent(), '<?xml someval?>');

      writer = new Writer();
      writer.pi('xml');
      LegacyUnit.equal(writer.getContent(), '<?xml?>');

      writer = new Writer();
      writer.pi('xml', 'encoding="UTF-8" < >');
      LegacyUnit.equal(writer.getContent(), '<?xml encoding="UTF-8" &lt; &gt;?>');
    });

    suite.test('Doctype', function () {
      var writer;

      writer = new Writer();
      writer.doctype(' text');
      LegacyUnit.equal(writer.getContent(), '<!DOCTYPE text>');

      writer = new Writer();
      writer.doctype('');
      LegacyUnit.equal(writer.getContent(), '<!DOCTYPE>');
    });

    suite.test('Text', function () {
      var writer;

      writer = new Writer();
      writer.text('te<xt');
      LegacyUnit.equal(writer.getContent(), 'te&lt;xt');

      writer = new Writer();
      writer.text('');
      LegacyUnit.equal(writer.getContent(), '');
    });

    suite.test('Text raw', function () {
      var writer;

      writer = new Writer();
      writer.text('te<xt', true);
      LegacyUnit.equal(writer.getContent(), 'te<xt');

      writer = new Writer();
      writer.text('', true);
      LegacyUnit.equal(writer.getContent(), '');
    });

    suite.test('Start', function () {
      var writer;

      writer = new Writer();
      writer.start('b');
      LegacyUnit.equal(writer.getContent(), '<b>');

      writer = new Writer();
      writer.start('b', [{ name: 'attr1', value: 'value1' }, { name: 'attr2', value: 'value2' }]);
      LegacyUnit.equal(writer.getContent(), '<b attr1="value1" attr2="value2">');

      writer = new Writer();
      writer.start('b', [{ name: 'attr1', value: 'val<"ue1' }]);
      LegacyUnit.equal(writer.getContent(), '<b attr1="val&lt;&quot;ue1">');

      writer = new Writer();
      writer.start('img', [{ name: 'attr1', value: 'value1' }, { name: 'attr2', value: 'value2' }], true);
      LegacyUnit.equal(writer.getContent(), '<img attr1="value1" attr2="value2" />');

      writer = new Writer();
      writer.start('br', null, true);
      LegacyUnit.equal(writer.getContent(), '<br />');
    });

    suite.test('End', function () {
      var writer;

      writer = new Writer();
      writer.end('b');
      LegacyUnit.equal(writer.getContent(), '</b>');
    });

    suite.test('Indentation', function () {
      var writer;

      writer = new Writer({ indent: true, indent_before: 'p', indent_after:'p' });
      writer.start('p');
      writer.start('span');
      writer.text('a');
      writer.end('span');
      writer.end('p');
      writer.start('p');
      writer.text('a');
      writer.end('p');
      LegacyUnit.equal(writer.getContent(), '<p><span>a</span></p>\n<p>a</p>');

      writer = new Writer({ indent: true, indent_before: 'p', indent_after:'p' });
      writer.start('p');
      writer.text('a');
      writer.end('p');
      LegacyUnit.equal(writer.getContent(), '<p>a</p>');
    });

    suite.test('Entities', function () {
      var writer;

      writer = new Writer();
      writer.start('p', [{ name: "title", value: '<>"\'&\u00e5\u00e4\u00f6' }]);
      writer.text('<>"\'&\u00e5\u00e4\u00f6');
      writer.end('p');
      LegacyUnit.equal(writer.getContent(), '<p title="&lt;&gt;&quot;\'&amp;\u00e5\u00e4\u00f6">&lt;&gt;"\'&amp;\u00e5\u00e4\u00f6</p>');

      writer = new Writer({ entity_encoding: 'numeric' });
      writer.start('p', [{ name: "title", value: '<>"\'&\u00e5\u00e4\u00f6' }]);
      writer.text('<>"\'&\u00e5\u00e4\u00f6');
      writer.end('p');
      LegacyUnit.equal(writer.getContent(), '<p title="&lt;&gt;&quot;\'&amp;&#229;&#228;&#246;">&lt;&gt;"\'&amp;&#229;&#228;&#246;</p>');

      writer = new Writer({ entity_encoding: 'named' });
      writer.start('p', [{ name: "title", value: '<>"\'&\u00e5\u00e4\u00f6' }]);
      writer.text('<>"\'&\u00e5\u00e4\u00f6');
      writer.end('p');
      LegacyUnit.equal(writer.getContent(), '<p title="&lt;&gt;&quot;\'&amp;&aring;&auml;&ouml;">&lt;&gt;"\'&amp;&aring;&auml;&ouml;</p>');
    });

    Pipeline.async({}, suite.toSteps({}), function () {
      success();
    }, failure);
  }
);