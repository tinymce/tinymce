import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import Writer from 'tinymce/core/api/html/Writer';

describe('browser.tinymce.core.html.WriterTest', () => {
  it('Comment', () => {
    let writer: Writer;

    writer = Writer();
    writer.comment('text');
    assert.equal(writer.getContent(), '<!--text-->');

    writer = Writer();
    writer.comment('');
    assert.equal(writer.getContent(), '<!---->');
  });

  it('CDATA', () => {
    let writer: Writer;

    writer = Writer();
    writer.cdata('text');
    assert.equal(writer.getContent(), '<![CDATA[text]]>');

    writer = Writer();
    writer.cdata('');
    assert.equal(writer.getContent(), '<![CDATA[]]>');
  });

  it('PI', () => {
    let writer: Writer;

    writer = Writer();
    writer.pi('xml', 'someval');
    assert.equal(writer.getContent(), '<?xml someval?>');

    writer = Writer();
    writer.pi('xml');
    assert.equal(writer.getContent(), '<?xml?>');

    writer = Writer();
    writer.pi('xml', 'encoding="UTF-8" < >');
    assert.equal(writer.getContent(), '<?xml encoding="UTF-8" &lt; &gt;?>');
  });

  it('Doctype', () => {
    let writer: Writer;

    writer = Writer();
    writer.doctype(' text');
    assert.equal(writer.getContent(), '<!DOCTYPE text>');

    writer = Writer();
    writer.doctype('');
    assert.equal(writer.getContent(), '<!DOCTYPE>');
  });

  it('Text', () => {
    let writer: Writer;

    writer = Writer();
    writer.text('te<xt');
    assert.equal(writer.getContent(), 'te&lt;xt');

    writer = Writer();
    writer.text('');
    assert.equal(writer.getContent(), '');
  });

  it('Text raw', () => {
    let writer: Writer;

    writer = Writer();
    writer.text('te<xt', true);
    assert.equal(writer.getContent(), 'te<xt');

    writer = Writer();
    writer.text('', true);
    assert.equal(writer.getContent(), '');
  });

  it('Start', () => {
    let writer: Writer;

    writer = Writer();
    writer.start('b');
    assert.equal(writer.getContent(), '<b>');

    writer = Writer();
    writer.start('b', [{ name: 'attr1', value: 'value1' }, { name: 'attr2', value: 'value2' }]);
    assert.equal(writer.getContent(), '<b attr1="value1" attr2="value2">');

    writer = Writer();
    writer.start('b', [{ name: 'attr1', value: 'val<"ue1' }]);
    assert.equal(writer.getContent(), '<b attr1="val&lt;&quot;ue1">');

    writer = Writer();
    writer.start('img', [{ name: 'attr1', value: 'value1' }, { name: 'attr2', value: 'value2' }], true);
    assert.equal(writer.getContent(), '<img attr1="value1" attr2="value2">');

    writer = Writer();
    writer.start('br', null, true);
    assert.equal(writer.getContent(), '<br>');
  });

  it('End', () => {
    const writer = Writer();
    writer.end('b');
    assert.equal(writer.getContent(), '</b>');
  });

  it('Indentation', () => {
    let writer: Writer;

    writer = Writer({ indent: true, indent_before: 'p', indent_after: 'p' });
    writer.start('p');
    writer.start('span');
    writer.text('a');
    writer.end('span');
    writer.end('p');
    writer.start('p');
    writer.text('a');
    writer.end('p');
    assert.equal(writer.getContent(), '<p><span>a</span></p>\n<p>a</p>');

    writer = Writer({ indent: true, indent_before: 'p', indent_after: 'p' });
    writer.start('p');
    writer.text('a');
    writer.end('p');
    assert.equal(writer.getContent(), '<p>a</p>');
  });

  it('Entities', () => {
    let writer: Writer;

    writer = Writer();
    writer.start('p', [{ name: 'title', value: `<>"'&\u00e5\u00e4\u00f6` }]);
    writer.text(`<>"'&\u00e5\u00e4\u00f6`);
    writer.end('p');
    assert.equal(writer.getContent(), `<p title="&lt;&gt;&quot;'&amp;\u00e5\u00e4\u00f6">&lt;&gt;"'&amp;\u00e5\u00e4\u00f6</p>`);

    writer = Writer({ entity_encoding: 'numeric' });
    writer.start('p', [{ name: 'title', value: `<>"'&\u00e5\u00e4\u00f6` }]);
    writer.text(`<>"'&\u00e5\u00e4\u00f6`);
    writer.end('p');
    assert.equal(writer.getContent(), `<p title="&lt;&gt;&quot;'&amp;&#229;&#228;&#246;">&lt;&gt;"'&amp;&#229;&#228;&#246;</p>`);

    writer = Writer({ entity_encoding: 'named' });
    writer.start('p', [{ name: 'title', value: `<>"'&\u00e5\u00e4\u00f6` }]);
    writer.text(`<>"'&\u00e5\u00e4\u00f6`);
    writer.end('p');
    assert.equal(writer.getContent(), `<p title="&lt;&gt;&quot;'&amp;&aring;&auml;&ouml;">&lt;&gt;"'&amp;&aring;&auml;&ouml;</p>`);
  });
});
