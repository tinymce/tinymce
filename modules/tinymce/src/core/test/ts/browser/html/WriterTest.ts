import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit } from '@ephox/mcagar';
import Writer from 'tinymce/core/api/html/Writer';

UnitTest.asynctest('browser.tinymce.core.html.WriterTest', function (success, failure) {
  const suite = LegacyUnit.createSuite();

  suite.test('Comment', function () {
    let writer;

    writer = Writer();
    writer.comment('text');
    LegacyUnit.equal(writer.getContent(), '<!--text-->');

    writer = Writer();
    writer.comment('');
    LegacyUnit.equal(writer.getContent(), '<!---->');
  });

  suite.test('CDATA', function () {
    let writer;

    writer = Writer();
    writer.cdata('text');
    LegacyUnit.equal(writer.getContent(), '<![CDATA[text]]>');

    writer = Writer();
    writer.cdata('');
    LegacyUnit.equal(writer.getContent(), '<![CDATA[]]>');
  });

  suite.test('PI', function () {
    let writer;

    writer = Writer();
    writer.pi('xml', 'someval');
    LegacyUnit.equal(writer.getContent(), '<?xml someval?>');

    writer = Writer();
    writer.pi('xml');
    LegacyUnit.equal(writer.getContent(), '<?xml?>');

    writer = Writer();
    writer.pi('xml', 'encoding="UTF-8" < >');
    LegacyUnit.equal(writer.getContent(), '<?xml encoding="UTF-8" &lt; &gt;?>');
  });

  suite.test('Doctype', function () {
    let writer;

    writer = Writer();
    writer.doctype(' text');
    LegacyUnit.equal(writer.getContent(), '<!DOCTYPE text>');

    writer = Writer();
    writer.doctype('');
    LegacyUnit.equal(writer.getContent(), '<!DOCTYPE>');
  });

  suite.test('Text', function () {
    let writer;

    writer = Writer();
    writer.text('te<xt');
    LegacyUnit.equal(writer.getContent(), 'te&lt;xt');

    writer = Writer();
    writer.text('');
    LegacyUnit.equal(writer.getContent(), '');
  });

  suite.test('Text raw', function () {
    let writer;

    writer = Writer();
    writer.text('te<xt', true);
    LegacyUnit.equal(writer.getContent(), 'te<xt');

    writer = Writer();
    writer.text('', true);
    LegacyUnit.equal(writer.getContent(), '');
  });

  suite.test('Start', function () {
    let writer;

    writer = Writer();
    writer.start('b');
    LegacyUnit.equal(writer.getContent(), '<b>');

    writer = Writer();
    writer.start('b', [{ name: 'attr1', value: 'value1' }, { name: 'attr2', value: 'value2' }]);
    LegacyUnit.equal(writer.getContent(), '<b attr1="value1" attr2="value2">');

    writer = Writer();
    writer.start('b', [{ name: 'attr1', value: 'val<"ue1' }]);
    LegacyUnit.equal(writer.getContent(), '<b attr1="val&lt;&quot;ue1">');

    writer = Writer();
    writer.start('img', [{ name: 'attr1', value: 'value1' }, { name: 'attr2', value: 'value2' }], true);
    LegacyUnit.equal(writer.getContent(), '<img attr1="value1" attr2="value2" />');

    writer = Writer();
    writer.start('br', null, true);
    LegacyUnit.equal(writer.getContent(), '<br />');
  });

  suite.test('End', function () {
    const writer = Writer();
    writer.end('b');
    LegacyUnit.equal(writer.getContent(), '</b>');
  });

  suite.test('Indentation', function () {
    let writer;

    writer = Writer({ indent: true, indent_before: 'p', indent_after: 'p' });
    writer.start('p');
    writer.start('span');
    writer.text('a');
    writer.end('span');
    writer.end('p');
    writer.start('p');
    writer.text('a');
    writer.end('p');
    LegacyUnit.equal(writer.getContent(), '<p><span>a</span></p>\n<p>a</p>');

    writer = Writer({ indent: true, indent_before: 'p', indent_after: 'p' });
    writer.start('p');
    writer.text('a');
    writer.end('p');
    LegacyUnit.equal(writer.getContent(), '<p>a</p>');
  });

  suite.test('Entities', function () {
    let writer;

    writer = Writer();
    writer.start('p', [{ name: 'title', value: `<>"'&\u00e5\u00e4\u00f6` }]);
    writer.text(`<>"'&\u00e5\u00e4\u00f6`);
    writer.end('p');
    LegacyUnit.equal(writer.getContent(), `<p title="&lt;&gt;&quot;'&amp;\u00e5\u00e4\u00f6">&lt;&gt;"'&amp;\u00e5\u00e4\u00f6</p>`);

    writer = Writer({ entity_encoding: 'numeric' });
    writer.start('p', [{ name: 'title', value: `<>"'&\u00e5\u00e4\u00f6` }]);
    writer.text(`<>"'&\u00e5\u00e4\u00f6`);
    writer.end('p');
    LegacyUnit.equal(writer.getContent(), `<p title="&lt;&gt;&quot;'&amp;&#229;&#228;&#246;">&lt;&gt;"'&amp;&#229;&#228;&#246;</p>`);

    writer = Writer({ entity_encoding: 'named' });
    writer.start('p', [{ name: 'title', value: `<>"'&\u00e5\u00e4\u00f6` }]);
    writer.text(`<>"'&\u00e5\u00e4\u00f6`);
    writer.end('p');
    LegacyUnit.equal(writer.getContent(), `<p title="&lt;&gt;&quot;'&amp;&aring;&auml;&ouml;">&lt;&gt;"'&amp;&aring;&auml;&ouml;</p>`);
  });

  Pipeline.async({}, suite.toSteps({}), function () {
    success();
  }, failure);
});
