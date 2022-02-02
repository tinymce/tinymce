import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import SaxParser, { SaxParserSettings } from 'tinymce/core/api/html/SaxParser';
import Schema from 'tinymce/core/api/html/Schema';
import Writer from 'tinymce/core/api/html/Writer';
import Tools from 'tinymce/core/api/util/Tools';

type Counter = SaxParserSettings & { counts: Record<string, number> };

describe('browser.tinymce.core.html.SaxParserTest', () => {
  const writer = Writer();
  const schema = Schema();

  const createCounter = (writer: Writer): Counter => {
    const counts: Record<string, number> = {};

    return {
      counts,

      comment: (text) => {
        if ('comment' in counts) {
          counts.comment++;
        } else {
          counts.comment = 1;
        }

        writer.comment(text);
      },

      cdata: (text) => {
        if ('cdata' in counts) {
          counts.cdata++;
        } else {
          counts.cdata = 1;
        }

        writer.cdata(text);
      },

      text: (text, raw) => {
        if ('text' in counts) {
          counts.text++;
        } else {
          counts.text = 1;
        }

        writer.text(text, raw);
      },

      start: (name, attrs, empty) => {
        if ('start' in counts) {
          counts.start++;
        } else {
          counts.start = 1;
        }

        writer.start(name, attrs, empty);
      },

      end: (name) => {
        if ('end' in counts) {
          counts.end++;
        } else {
          counts.end = 1;
        }

        writer.end(name);
      },

      pi: (name, text) => {
        if ('pi' in counts) {
          counts.pi++;
        } else {
          counts.pi = 1;
        }

        writer.pi(name, text);
      },

      doctype: (text) => {
        if ('doctype:' in counts) {
          counts.doctype++;
        } else {
          counts.doctype = 1;
        }

        writer.doctype(text);
      }
    };
  };

  it('Parse elements', () => {
    let counter: Counter;
    let parser: SaxParser;

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse(
      `<span id=id1 title="title value" class='class1 class2' data-value="value1" ` +
      `MYATTR="val1" myns:myattr="val2" disabled empty=""></span>`
    );
    assert.equal(
      writer.getContent(),
      '<span id="id1" title="title value" class="class1 class2" data-value="value1" myattr="val1" ' +
      'myns:myattr="val2" disabled="disabled" empty=""></span>',
      'Parse attribute formats.'
    );
    assert.deepEqual(counter.counts, { start: 1, end: 1 }, 'Parse attribute formats counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse(`<b href='"&amp;<>'></b>`);
    assert.equal(writer.getContent(), '<b href="&quot;&amp;&lt;&gt;"></b>', 'Parse attributes with <> in them.');
    assert.deepEqual(counter.counts, { start: 1, end: 1 }, 'Parse attributes with <> in them (count).');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<span title=" "class=" "></span>');
    assert.equal(writer.getContent(), '<span title=" " class=" "></span>', 'Parse compressed attributes.');
    assert.deepEqual(counter.counts, { start: 1, end: 1 }, 'Parse compressed attributes (count).');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<span title></span>');
    assert.equal(writer.getContent(), '<span title=""></span>', 'Single empty attribute.');
    assert.deepEqual(counter.counts, { start: 1, end: 1 }, 'Single empty attributes (count).');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<span class="class" title></span>');
    assert.equal(writer.getContent(), '<span class="class" title=""></span>', 'Empty attribute at end.');
    assert.deepEqual(counter.counts, { start: 1, end: 1 }, 'Empty attribute at end (count).');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<span title class="class"></span>');
    assert.equal(writer.getContent(), '<span title="" class="class"></span>', 'Empty attribute at start.');
    assert.deepEqual(counter.counts, { start: 1, end: 1 }, 'Empty attribute at start (count).');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<img src="test">');
    assert.equal(writer.getContent(), '<img src="test" />', 'Parse empty element.');
    assert.deepEqual(counter.counts, { start: 1 }, 'Parse empty element counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<img\nsrc="test"\ntitle="row1\nrow2">');
    assert.equal(writer.getContent(), '<img src="test" title="row1\nrow2" />', 'Parse attributes with linebreak.');
    assert.deepEqual(counter.counts, { start: 1 }, 'Parse attributes with linebreak counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<img     \t  \t   src="test"     \t  \t   title="\t    row1\t     row2">');
    assert.equal(writer.getContent(), '<img src="test" title="\t    row1\t     row2" />', 'Parse attributes with whitespace.');
    assert.deepEqual(counter.counts, { start: 1 }, 'Parse attributes with whitespace counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<myns:mytag>text</myns:mytag>');
    assert.equal(writer.getContent(), '<myns:mytag>text</myns:mytag>', 'Parse element with namespace.');
    assert.deepEqual(counter.counts, { start: 1, text: 1, end: 1 }, 'Parse element with namespace counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<myns-mytag>text</myns-mytag>');
    assert.equal(writer.getContent(), '<myns-mytag>text</myns-mytag>', 'Parse element with dash name.');
    assert.deepEqual(counter.counts, { start: 1, text: 1, end: 1 }, 'Parse element with dash name counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<myns_mytag>text</myns_mytag>');
    assert.equal(writer.getContent(), '<myns_mytag>text</myns_mytag>', 'Parse element with underscore name.');
    assert.deepEqual(counter.counts, { start: 1, text: 1, end: 1 }, 'Parse element with underscore name counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('text1<p>text2<b>text3</p>text4</b>text5');
    assert.equal(writer.getContent(), 'text1<p>text2<b>text3</b></p>text4text5', 'Parse tag soup 1.');
    assert.deepEqual(counter.counts, { text: 5, start: 2, end: 2 }, 'Parse tag soup 1 counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('text1<P>text2<B>text3</p>text4</b>text5');
    assert.equal(writer.getContent(), 'text1<p>text2<b>text3</b></p>text4text5', 'Parse tag soup 2.');
    assert.deepEqual(counter.counts, { text: 5, start: 2, end: 2 }, 'Parse tag soup 2 counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('text1<P>text2<B>tex<t3</p>te>xt4</b>text5');
    assert.equal(writer.getContent(), 'text1<p>text2<b>tex&lt;t3</b></p>te&gt;xt4text5', 'Parse tag soup 3.');
    assert.deepEqual(counter.counts, { text: 5, start: 2, end: 2 }, 'Parse tag soup 3 counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('text1<p>text2<b>text3');
    assert.equal(writer.getContent(), 'text1<p>text2<b>text3</b></p>', 'Parse tag soup 4.');
    assert.deepEqual(counter.counts, { text: 3, start: 2, end: 2 }, 'Parse tag soup 4 counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('text1<script>text2');
    assert.equal(writer.getContent(), 'text1<script>text2</s' + 'cript>', 'Parse tag soup 5.');
    assert.deepEqual(counter.counts, { text: 2, start: 1, end: 1 }, 'Parse tag soup 5 counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('text1<style>text2');
    assert.equal(writer.getContent(), 'text1<style>text2</st' + 'yle>', 'Parse tag soup 6.');
    assert.deepEqual(counter.counts, { text: 2, start: 1, end: 1 }, 'Parse tag soup 6 counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('text1<span title="<test" data-test="test>"></span>');
    assert.equal(
      writer.getContent(),
      'text1<span title="&lt;test" data-test="test&gt;"></span>',
      'Parse element with </> in attributes.'
    );
    assert.deepEqual(counter.counts, { text: 1, start: 1, end: 1 }, 'Parse element with </> in attributes counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('text\n<SC' + `RIPT type=mce-text/javascript>// <![CDATA[\nalert('HELLO WORLD!');\n// ]]></SC` + 'RIPT>');
    assert.equal(
      writer.getContent(),
      'text\n<sc' + `ript type="mce-text/javascript">// <![CDATA[\nalert('HELLO WORLD!');\n// ]]></sc` + 'ript>',
      'Parse cdata script.'
    );
    assert.deepEqual(counter.counts, { text: 2, start: 1, end: 1 }, 'Parse cdata script counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('text1<noscript>te<br>xt2</noscript>text3');
    assert.equal(writer.getContent(), 'text1<noscript>te<br>xt2</noscript>text3', 'Parse noscript elements.');
    assert.deepEqual(counter.counts, { text: 3, start: 1, end: 1 }, 'Parse noscript elements counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<p>a</p><p /><p>b</p>');
    assert.equal(writer.getContent(), '<p>a</p><p></p><p>b</p>', 'Parse invalid closed element.');
    assert.deepEqual(counter.counts, { text: 2, start: 3, end: 3 }, 'Parse invalid closed element counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<br><br /><br/>');
    assert.equal(writer.getContent(), '<br /><br /><br />', 'Parse short ended elements.');
    assert.deepEqual(counter.counts, { start: 3 }, 'Parse short ended elements counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<p ></p>');
    assert.equal(writer.getContent(), '<p></p>', 'Parse start elements with whitespace only attribs part.');
    assert.deepEqual(counter.counts, { start: 1, end: 1 }, 'Parse start elements with whitespace only attribs part (counts).');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<p title="gre>gererg"/>');
    assert.equal(writer.getContent(), '<p title="gre&gt;gererg"></p>', 'Parse elements with quoted > characters.');
    assert.deepEqual(counter.counts, { start: 1, end: 1 }, 'Parse elements with quoted > characters (counts).');
  });

  it('Parse style elements', () => {
    let counter: Counter;
    let parser: SaxParser;

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('text1<em><style>// <b>tag</b></st' + 'yle>text2</em>');
    assert.equal(writer.getContent(), 'text1<em><style>// <b>tag</b></st' + 'yle>text2</em>', 'Parse style element.');
    assert.deepEqual(counter.counts, { start: 2, end: 2, text: 3 }, 'Parse style element counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('text1<em><style id="id">// <b>tag</b></st' + 'yle>text2</em>');
    assert.equal(
      writer.getContent(),
      'text1<em><style id="id">// <b>tag</b></st' + 'yle>text2</em>',
      'Parse style element with attributes.'
    );
    assert.deepEqual(counter.counts, { text: 3, start: 2, end: 2 }, 'Parse style element with attributes counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('text1<em><style></st' + 'yle>text2</span>');
    assert.equal(writer.getContent(), 'text1<em><style></st' + 'yle>text2</em>', 'Parse empty style element.');
    assert.deepEqual(counter.counts, { text: 2, start: 2, end: 2 }, 'Parse empty style element counts.');

    counter = createCounter(writer);
    parser = SaxParser(Tools.extend({ validate: true }, counter), Schema({ invalid_elements: 'style' }));
    writer.reset();
    parser.parse('text1<em><style>text2</st' + 'yle>text3</em>');
    assert.equal(writer.getContent(), 'text1<em>text3</em>', 'Parse invalid style element.');
    assert.deepEqual(counter.counts, { text: 2, start: 1, end: 1 }, 'Parse invalid style element (count).');
  });

  it('Parse script elements', () => {
    let counter: Counter;
    let parser: SaxParser;

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('text1<em><script>// <b>tag</b></s' + 'cript>text2</em>');
    assert.equal(writer.getContent(), 'text1<em><script>// <b>tag</b></s' + 'cript>text2</em>', 'Parse script element.');
    assert.deepEqual(counter.counts, { start: 2, end: 2, text: 3 }, 'Parse script element counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('text1<em><script id="id">// <b>tag</b></s' + 'cript>text2</em>');
    assert.equal(
      writer.getContent(),
      'text1<em><script id="id">// <b>tag</b></s' + 'cript>text2</em>',
      'Parse script element with attributes.'
    );
    assert.deepEqual(counter.counts, { start: 2, end: 2, text: 3 }, 'Parse script element with attributes counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('text1<em><script></s' + 'cript>text2</em>');
    assert.equal(writer.getContent(), 'text1<em><script></s' + 'cript>text2</em>', 'Parse empty script element.');
    assert.deepEqual(counter.counts, { text: 2, start: 2, end: 2 }, 'Parse empty script element counts.');

    counter = createCounter(writer);
    parser = SaxParser(Tools.extend({ validate: true }, counter), Schema({ invalid_elements: 'script' }));
    writer.reset();
    parser.parse('text1<em><s' + 'cript>text2</s' + 'cript>text3</em>');
    assert.equal(writer.getContent(), 'text1<em>text3</em>', 'Parse invalid script element.');
    assert.deepEqual(counter.counts, { text: 2, start: 1, end: 1 }, 'Parse invalid script element (count).');
  });

  it('Parse text', () => {
    let counter: Counter;
    let parser: SaxParser;

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('');
    assert.equal(writer.getContent(), '', 'Parse empty.');
    assert.deepEqual(counter.counts, {}, 'Parse empty counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('text');
    assert.equal(writer.getContent(), 'text', 'Parse single text node.');
    assert.deepEqual(counter.counts, { text: 1 }, 'Parse single text node counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<b>text</b>');
    assert.equal(writer.getContent(), '<b>text</b>', 'Parse wrapped text.');
    assert.deepEqual(counter.counts, { start: 1, text: 1, end: 1 }, 'Parse wrapped text counts');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('text1<b>text2</b>');
    assert.equal(writer.getContent(), 'text1<b>text2</b>', 'Parse text at start.');
    assert.deepEqual(counter.counts, { start: 1, text: 2, end: 1 }, 'Parse text at start counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<b>text1</b>text2');
    assert.equal(writer.getContent(), '<b>text1</b>text2', 'Parse text at end.');
    assert.deepEqual(counter.counts, { start: 1, end: 1, text: 2 }, 'Parse text at end counts.');
  });

  it('Parsing comments', () => {
    let counter: Counter;
    let parser: SaxParser;

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<!-- comment value -->');
    assert.equal(writer.getContent(), '<!-- comment value -->', 'Parse comment with value.');
    assert.deepEqual(counter.counts, { comment: 1 }, 'Parse comment with value count.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<!---->');
    assert.equal(writer.getContent(), '', 'Parse comment without value.');
    assert.deepEqual(counter.counts, {}, 'Parse comment without value count.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<!--<b></b>-->');
    assert.equal(writer.getContent(), '<!--<b></b>-->', 'Parse comment with tag inside.');
    assert.deepEqual(counter.counts, { comment: 1 }, 'Parse comment with tag inside counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<b>a<!-- value -->b</b>');
    assert.equal(writer.getContent(), '<b>a<!-- value -->b</b>', 'Parse comment with tags around it.');
    assert.deepEqual(counter.counts, { comment: 1, text: 2, start: 1, end: 1 }, 'Parse comment with tags around it counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<!-- value --!>');
    assert.equal(writer.getContent(), '<!-- value -->', 'Parse comment with exclamation in end value.');
    assert.deepEqual(counter.counts, { comment: 1 }, 'Parse comment with exclamation in end value counts.');
  });

  it('Parsing cdata', () => {
    let counter: Counter;
    let parser: SaxParser;
    const schemaWithSVGs = Schema({ valid_children: '+svg[#cdata]', custom_elements: 'svg' });

    // Schema with SVG
    counter = createCounter(writer);
    parser = SaxParser(counter, schemaWithSVGs);
    writer.reset();
    parser.parse('<svg><![CDATA[test text]]></svg>');
    assert.equal(writer.getContent(), '<svg><![CDATA[test text]]></svg>', 'Parse cdata with value.');
    assert.deepEqual(counter.counts, { cdata: 1, start: 1, end: 1 }, 'Parse cdata with value counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schemaWithSVGs);
    writer.reset();
    parser.parse('<svg><![CDATA[]]></svg>');
    assert.equal(writer.getContent(), '<svg></svg>', 'Parse cdata without value.');
    assert.deepEqual(counter.counts, { start: 1, end: 1 }, 'Parse cdata without value counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schemaWithSVGs);
    writer.reset();
    parser.parse('<svg><![CDATA[<b>a</b>]]></svg>');
    assert.equal(writer.getContent(), '<svg><![CDATA[<b>a</b>]]></svg>', 'Parse cdata with tag inside.');
    assert.deepEqual(counter.counts, { cdata: 1, start: 1, end: 1 }, 'Parse cdata with tag inside counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schemaWithSVGs);
    writer.reset();
    parser.parse('<b>a<![CDATA[value]]>b</b>');
    assert.equal(writer.getContent(), '<b>a<!--[CDATA[value]]-->b</b>', 'Parse cdata in HTML with tags around it.');
    assert.deepEqual(counter.counts, { comment: 1, start: 1, end: 1, text: 2 }, 'Parse cdata in HTML with tags around it counts.');

    // parser format === xml
    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<![CDATA[test text]]>', 'xml');
    assert.equal(writer.getContent(), '<![CDATA[test text]]>', 'Parse cdata with value.');
    assert.deepEqual(counter.counts, { cdata: 1 }, 'Parse cdata with value counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<b>a<![CDATA[value]]>b</b>', 'xml');
    assert.equal(writer.getContent(), '<b>a<![CDATA[value]]>b</b>', 'Parse cdata in HTML with tags around it.');
    assert.deepEqual(counter.counts, { cdata: 1, start: 1, end: 1, text: 2 }, 'Parse cdata in HTML with tags around it counts.');

    // Preserve CDATA
    counter = createCounter(writer);
    parser = SaxParser({ ...counter, preserve_cdata: true }, schema);
    writer.reset();
    parser.parse('<![CDATA[test text]]>');
    assert.equal(writer.getContent(), '<![CDATA[test text]]>', 'Parse cdata with value and preserve_cdata: true.');
    assert.deepEqual(counter.counts, { cdata: 1 }, 'Parse cdata with value and preserve_cdata: true counts.');
  });

  it('Parsing malformed comments', () => {
    let counter: Counter;
    let parser: SaxParser;

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<!- value -->');
    assert.equal(writer.getContent(), '<!--- value ---->', 'Parse comment with missing hyphen.');
    assert.deepEqual(counter.counts, { comment: 1 }, 'Parse comment with missing hyphen counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<!-- value ->');
    assert.equal(writer.getContent(), '<!-- value ->-->', 'Parse comment with malformed end sequence.');
    assert.deepEqual(counter.counts, { comment: 1 }, 'Parse comment with malformed end sequence counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<!-- value ><div>test</div>');
    assert.equal(writer.getContent(), '<!-- value ><div>test</div>-->', 'Parse comment with missing end sequence.');
    assert.deepEqual(counter.counts, { comment: 1 }, 'Parse comment with missing end sequence counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<! value --!>');
    assert.equal(writer.getContent(), '<!-- value --!-->', 'Parse comment with exclamation and missing hyphens.');
    assert.deepEqual(counter.counts, { comment: 1 }, 'Parse comment with exclamation and missing hyphens counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<!-- first --><p>&nbsp;</p><!-- second');
    assert.equal(writer.getContent(), '<!-- first --><p>\u00a0</p><!-- second-->', 'Parse comment with no end sequence.');
    assert.deepEqual(counter.counts, { start: 1, end: 1, text: 1, comment: 2 }, 'Parse comment with no end sequence counts.');
  });

  it('Parse PI', () => {
    let counter: Counter;
    let parser: SaxParser;

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<?xml version="1.0" encoding="UTF-8" ?>text1', 'html');
    assert.equal(writer.getContent(), '<!--?xml version="1.0" encoding="UTF-8" ?-->text1', 'Parse PI as HTML with attributes.');
    assert.deepEqual(counter.counts, { comment: 1, text: 1 }, 'Parse PI as HTML with attributes counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<?xml version="1.0" encoding="UTF-8" ?>text1', 'xml');
    assert.equal(writer.getContent(), '<?xml version="1.0" encoding="UTF-8" ?>text1', 'Parse PI with attributes.');
    assert.deepEqual(counter.counts, { pi: 1, text: 1 }, 'Parse PI with attributes counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<?xml?>text1', 'xml');
    assert.equal(writer.getContent(), '<?xml?>text1', 'Parse PI with no data.');
    assert.deepEqual(counter.counts, { pi: 1, text: 1 }, 'Parse PI with data counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<?xml somevalue/>text1', 'xml');
    assert.equal(writer.getContent(), '<?xml somevalue?>text1', 'Parse PI with IE style ending.');
    assert.deepEqual(counter.counts, { pi: 1, text: 1 }, 'Parse PI with IE style ending counts.');
  });

  it('Parse doctype', () => {
    let counter: Counter;
    let parser: SaxParser;

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse(
      '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">text1'
    );
    assert.equal(
      writer.getContent(),
      '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">text1',
      'Parse DOCTYPE.'
    );
    assert.deepEqual(counter.counts, { doctype: 1, text: 1 }, 'Parse HTML5 DOCTYPE counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<!DOCTYPE html>text1');
    assert.equal(writer.getContent(), '<!DOCTYPE html>text1', 'Parse HTML5 DOCTYPE.');
    assert.deepEqual(counter.counts, { doctype: 1, text: 1 }, 'Parse HTML5 DOCTYPE counts.');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<!doctype html>text1');
    assert.equal(writer.getContent(), '<!DOCTYPE html>text1', 'Parse lowercase DOCTYPE.');
    assert.deepEqual(counter.counts, { doctype: 1, text: 1 }, 'Parse lowercase DOCTYPE counts.');
  });

  it('Parse (validate)', () => {
    const counter = createCounter(writer);
    counter.validate = true;
    const parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<invalid1>123<invalid2 />456<span title="title" invalid3="value">789</span>012</invalid1>');
    assert.equal(writer.getContent(), '123456<span title="title">789</span>012', 'Parse invalid elements and attributes.');
    assert.deepEqual(counter.counts, { start: 1, end: 1, text: 4 }, 'Parse invalid elements and attributes counts.');
  });

  it('Self closing', () => {
    const counter = createCounter(writer);
    counter.validate = true;
    const parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<ul><li>1<li><b>2</b><li><em><b>3</b></em></ul>');
    assert.equal(
      writer.getContent(),
      '<ul><li>1</li><li><b>2</b></li><li><em><b>3</b></em></li></ul>',
      'Parse list with self closing items.'
    );
  });

  it('Preserve internal elements', () => {
    let counter: Counter;
    let parser: SaxParser;
    let schema: Schema;

    schema = Schema({ valid_elements: 'b' });
    counter = createCounter(writer);
    counter.validate = true;
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<span id="id"><b>text</b></span><span id="id" data-mce-type="something"></span>');
    assert.equal(
      writer.getContent(),
      '<b>text</b><span id="id" data-mce-type="something"></span>',
      'Preserve internal span element without any span schema rule.'
    );

    schema = Schema({ valid_elements: 'b,span[class]' });
    counter = createCounter(writer);
    counter.validate = true;
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<span id="id" class="class"><b>text</b></span><span id="id" data-mce-type="something"></span>');
    assert.equal(
      writer.getContent(),
      '<span class="class"><b>text</b></span><span id="id" data-mce-type="something"></span>',
      'Preserve internal span element with a span schema rule.'
    );
  });

  it('Remove internal elements', () => {
    let counter: Counter;
    let parser: SaxParser;
    let schema: Schema;

    schema = Schema({ valid_elements: 'b' });
    counter = createCounter(writer);
    counter.validate = true;
    counter.remove_internals = true;
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<span id="id"><b>text</b></span><span id="id" data-mce-type="something"></span>');
    assert.equal(writer.getContent(), '<b>text</b>', 'Remove internal span element without any span schema rule.');

    schema = Schema({ valid_elements: 'b,span[class]' });
    counter = createCounter(writer);
    counter.validate = true;
    counter.remove_internals = true;
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<span id="id" class="class"><b>text</b></span><span id="id" data-mce-type="something"></span>');
    assert.equal(
      writer.getContent(),
      '<span class="class"><b>text</b></span>',
      'Remove internal span element with a span schema rule.'
    );

    // Reset
    counter.remove_internals = false;
  });

  it('Parse attr with backslash #5436', () => {
    const counter = createCounter(writer);
    const parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<a title="\\" href="h">x</a>');
    assert.equal(writer.getContent(), '<a title="\\" href="h">x</a>');
  });

  it('Parse no attributes span before strong', () => {
    const counter = createCounter(writer);
    counter.validate = true;
    const parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<p><span>A</span> <strong>B</strong></p>');
    assert.equal(writer.getContent(), '<p>A <strong>B</strong></p>');
  });

  it('Conditional comments (allowed)', () => {
    const counter = createCounter(writer);
    counter.validate = false;
    counter.allow_conditional_comments = true;
    const parser = SaxParser(counter, schema);

    writer.reset();
    parser.parse('<!--[if gte IE 4]>alert(1)<![endif]-->');
    assert.equal(writer.getContent(), '<!--[if gte IE 4]>alert(1)<![endif]-->');
  });

  it('Conditional comments (denied)', () => {
    const counter = createCounter(writer);
    counter.validate = false;
    counter.allow_conditional_comments = false;
    const parser = SaxParser(counter, schema);

    writer.reset();
    parser.parse('<!--[if gte IE 4]>alert(1)<![endif]-->');
    assert.equal(writer.getContent(), '<!-- [if gte IE 4]>alert(1)<![endif]-->');

    writer.reset();
    parser.parse('<!--[if !IE]>alert(1)<![endif]-->');
    assert.equal(writer.getContent(), '<!-- [if !IE]>alert(1)<![endif]-->');

    writer.reset();
    parser.parse('<!--[iF !IE]>alert(1)<![endif]-->');
    assert.equal(writer.getContent(), '<!-- [iF !IE]>alert(1)<![endif]-->');
  });

  it('Parse script urls (allowed)', () => {
    const counter = createCounter(writer);
    counter.validate = false;
    counter.allow_script_urls = true;
    const parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse(
      '<a href="javascript:alert(1)">1</a>' +
      '<a href=" 2 ">2</a>' +
      '<a href="data:text/html;base64,PHN2Zy9vbmxvYWQ9YWxlcnQoMik+">3</a>'
    );
    assert.equal(
      writer.getContent(),
      '<a href="javascript:alert(1)">1</a>' +
      '<a href=" 2 ">2</a>' +
      '<a href="data:text/html;base64,PHN2Zy9vbmxvYWQ9YWxlcnQoMik+">3</a>'
    );
  });

  it('Parse script urls (allowed html data uris)', () => {
    const counter = createCounter(writer);
    counter.validate = false;
    counter.allow_html_data_urls = true;
    const parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse(
      '<a href="javascript:alert(1)">1</a>' +
      '<a href="data:text/html;base64,PHN2Zy9vbmxvYWQ9YWxlcnQoMik+">2</a>' +
      '<a href="data:image/svg+xml;base64,x">3</a>'
    );
    assert.equal(
      writer.getContent(),
      '<a>1</a>' +
      '<a href="data:text/html;base64,PHN2Zy9vbmxvYWQ9YWxlcnQoMik+">2</a>' +
      '<a href="data:image/svg+xml;base64,x">3</a>'
    );
  });

  it('Parse script urls (disallow svg data image uris)', () => {
    const counter = createCounter(writer);
    counter.validate = false;
    counter.allow_html_data_urls = false;
    counter.allow_svg_data_urls = false;
    const parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse(
      '<a href="data:image/svg+xml;base64,x">1</a>' +
      '<img src="data:image/svg+xml;base64,x">'
    );
    assert.equal(
      writer.getContent(),
      '<a>1</a>' +
      '<img />'
    );
  });

  it('Parse script urls (denied)', () => {
    const counter = createCounter(writer);
    counter.validate = false;
    const parser = SaxParser(counter, schema);

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
      '<form action="javascript:alert(12)">12</form>' +
      '<table background="javascript:alert(13)"><tr><tr>13</tr></tr></table>' +
      '<a href="mhtml:14">14</a>' +
      '<a xlink:href="jAvaScript:alert(15)">15</a>' +
      '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">' +
      '<a href="%E3%82%AA%E3%83%BC%E3%83">Invalid url</a>'
    );

    assert.equal(
      writer.getContent(),
      '<a>1</a>' +
      '<a>2</a>' +
      '<a>3</a>' +
      '<a>4</a>' +
      '<a>5</a>' +
      '<a>6</a>' +
      '<a>7</a>' +
      '<a>8</a>' +
      '<a>9</a>' +
      '<object>10</object>' +
      '<button>11</button>' +
      '<form>12</form>' +
      '<table><tr></tr><tr>13</tr></table>' +
      '<a>14</a>' +
      '<a>15</a>' +
      '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />' +
      '<a href="%E3%82%AA%E3%83%BC%E3%83">Invalid url</a>'
    );
  });

  it('Parse svg urls (default)', () => {
    const counter = createCounter(writer);
    counter.validate = false;
    const parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse(
      '<iframe src="data:image/svg+xml;base64,x"></iframe>' +
      '<a href="data:image/svg+xml;base64,x">1</a>' +
      '<object data="data:image/svg+xml;base64,x"></object>' +
      '<img src="data:image/svg+xml;base64,x">' +
      '<video poster="data:image/svg+xml;base64,x"></video>'
    );
    assert.equal(
      writer.getContent(),
      '<iframe></iframe>' +
      '<a>1</a>' +
      '<object></object>' +
      '<img src="data:image/svg+xml;base64,x" />' +
      '<video poster="data:image/svg+xml;base64,x"></video>'
    );
  });

  it('Parse svg urls (allowed)', () => {
    const counter = createCounter(writer);
    counter.validate = false;
    counter.allow_svg_data_urls = true;
    const parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse(
      '<iframe src="data:image/svg+xml;base64,x"></iframe>' +
      '<a href="data:image/svg+xml;base64,x">1</a>' +
      '<object data="data:image/svg+xml;base64,x"></object>' +
      '<img src="data:image/svg+xml;base64,x">' +
      '<video poster="data:image/svg+xml;base64,x"></video>'
    );
    assert.equal(
      writer.getContent(),
      '<iframe src="data:image/svg+xml;base64,x"></iframe>' +
      '<a href="data:image/svg+xml;base64,x">1</a>' +
      '<object data="data:image/svg+xml;base64,x"></object>' +
      '<img src="data:image/svg+xml;base64,x" />' +
      '<video poster="data:image/svg+xml;base64,x"></video>'
    );
  });

  it('Parse svg urls (denied)', () => {
    const counter = createCounter(writer);
    counter.validate = false;
    counter.allow_svg_data_urls = false;
    const parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse(
      '<iframe src="data:image/svg+xml;base64,x"></iframe>' +
      '<a href="data:image/svg+xml;base64,x">1</a>' +
      '<object data="data:image/svg+xml;base64,x"></object>' +
      '<img src="data:image/svg+xml;base64,x">' +
      '<video poster="data:image/svg+xml;base64,x"></video>'
    );
    assert.equal(
      writer.getContent(),
      '<iframe></iframe>' +
      '<a>1</a>' +
      '<object></object>' +
      '<img />' +
      '<video></video>'
    );
  });

  it('Parse away bogus elements', () => {
    const testBogusSaxParse = (inputHtml, outputHtml, counters) => {
      const counter = createCounter(writer);
      counter.validate = true;
      const parser = SaxParser(counter, schema);
      writer.reset();
      parser.parse(inputHtml);
      assert.equal(writer.getContent(), outputHtml);
      assert.deepEqual(counter.counts, counters);
    };

    testBogusSaxParse('a<b data-mce-bogus="1">b</b>c', 'abc', { text: 3 });
    testBogusSaxParse('a<b data-mce-bogus="true">b</b>c', 'abc', { text: 3 });
    testBogusSaxParse('a<b data-mce-bogus="1"></b>c', 'ac', { text: 2 });
    testBogusSaxParse('a<b data-mce-bogus="all">b</b>c', 'ac', { text: 2 });
    testBogusSaxParse('a<b data-mce-bogus="all"><!-- x --><?xml?></b>c', 'ac', { text: 2 });
    testBogusSaxParse('a<b data-mce-bogus="all"><b>b</b></b>c', 'ac', { text: 2 });
    testBogusSaxParse('a<b data-mce-bogus="all"><br>b</b><b>c</b>', 'a<b>c</b>', { start: 1, end: 1, text: 2 });
    testBogusSaxParse('a<b data-mce-bogus="all"><img>b</b><b>c</b>', 'a<b>c</b>', { start: 1, end: 1, text: 2 });
    testBogusSaxParse('a<b data-mce-bogus="all"><b attr="x">b</b></b>c', 'ac', { text: 2 });
    testBogusSaxParse('a<b data-mce-bogus="all"></b>c', 'ac', { text: 2 });
    testBogusSaxParse('a<b data-mce-bogus="all"></b><b>c</b>', 'a<b>c</b>', { start: 1, end: 1, text: 2 });
  });

  it('remove bogus elements even if not part of valid_elements', () => {
    const schema = Schema({ valid_elements: 'p,span,' });
    const writer = Writer();
    const counter = createCounter(writer);
    const parser = SaxParser(counter, schema);
    parser.parse('<p>a <div data-mce-bogus="all">&nbsp;<span contenteditable="false">X</span>&nbsp;</div>b</p>');
    assert.equal(writer.getContent(), '<p>a b</p>');
    assert.deepEqual(counter.counts, { start: 1, end: 1, text: 2 });
  });

  it('findEndTag', () => {
    const testFindEndTag = (html, startIndex, expectedIndex) => {
      assert.equal(SaxParser.findEndTag(schema, html, startIndex), expectedIndex);
    };

    testFindEndTag('<b>', 3, 3);
    testFindEndTag('<img>', 3, 3);
    testFindEndTag('<b></b>', 3, 7);
    testFindEndTag('<b><img></b>', 3, 12);
    testFindEndTag('<tag                                               ', 0, 0);
    testFindEndTag('<b><!-- </b> --></b>', 3, 20);
    testFindEndTag('<span><b><i>a<img>b</i><b>c</b></b></span>', 9, 35);
    testFindEndTag('<!-- Mismatched " --></p><div>Closing " </div>', 0, 25);
    testFindEndTag('<!bogus comment ></p><!-- Good comment for good measure -->', 0, 21);
    testFindEndTag('<!--comment--></p><!-- extra comment -->', 0, 18);
    testFindEndTag('<!-- comments are allowed > symbols and fake </html> --></p><!-- extra comment -->', 0, 60);

  });

  it('parse XSS PI', () => {
    const counter = createCounter(writer);
    counter.validate = false;
    const parser = SaxParser(counter, schema);

    writer.reset();
    parser.parse(
      '<?xml><iframe SRC=&#106&#97&#118&#97&#115&#99&#114&#105&#112&#116&#58&#97&#108&#101&#114&#116&#40&#39&#88&#83&#83&#39&#41>?>',
      'xhtml'
    );

    assert.equal(
      writer.getContent(),
      '<?xml &gt;&lt;iframe SRC=&amp;#106&amp;#97&amp;#118&amp;#97&amp;#115&amp;#99&amp;#114&amp;#105&amp;#112&amp;' +
      '#116&amp;#58&amp;#97&amp;#108&amp;#101&amp;#114&amp;#116&amp;#40&amp;#39&amp;#88&amp;#83&amp;#83&amp;#39&amp;#41&gt;?>'
    );
  });

  it('aria attributes', () => {
    const counter = createCounter(writer);
    const parser = SaxParser(Tools.extend({ validate: true }, counter), schema);
    writer.reset();
    parser.parse('<span aria-label="test" role="myrole" unsupportedattr="2">a</span>');
    assert.equal(
      writer.getContent(),
      '<span aria-label="test" role="myrole">a</span>'
    );
  });

  it('Parse elements with numbers', () => {
    const counter = createCounter(writer);
    const parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<a5>text</a5>');
    assert.equal(writer.getContent(), '<a5>text</a5>', 'Parse element with numbers.');
    assert.deepEqual(counter.counts, { start: 1, text: 1, end: 1 }, 'Parse element with numbers counts.');
  });

  it('Parse internal elements with disallowed attributes', () => {
    const counter = createCounter(writer);
    const parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<b data-mce-type="test" id="x" style="color: red" src="1" data="2" onclick="3"></b>');
    assert.equal(writer.getContent(), '<b data-mce-type="test" id="x" style="color: red"></b>');
    assert.deepEqual(counter.counts, { start: 1, end: 1 });
  });

  it('Parse cdata with comments', () => {
    let counter: Counter;
    let parser: SaxParser;

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<div><![CDATA[<!--x--><!--y--!>-->]]></div>');
    assert.equal(writer.getContent(), '<div><!--[CDATA[<!--x----><!--y-->--&gt;]]&gt;</div>');
    assert.deepEqual(counter.counts, { comment: 2, text: 1, start: 1, end: 1 });

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<div><![CDATA[<!--x--><!--y-->--><!--]]></div>', 'xhtml');
    assert.equal(writer.getContent(), '<div><![CDATA[<!--x--><!--y-->--><!--]]></div>');
    assert.deepEqual(counter.counts, { cdata: 1, start: 1, end: 1 });
  });

  it('Parse special elements', () => {
    const specialHtml = (
      '<b>' +
      '<textarea></b></textarea><title></b></title><script></b></script>' +
      '<iframe><img src="image.png"></iframe>' +
      '<noframes></b></noframes><noscript></b></noscript><style></b></style>' +
      '<xmp></b></xmp>' +
      '<noembed></b></noembed>' +
      '</b>'
    );

    const counter = createCounter(writer);
    const parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse(specialHtml);
    assert.equal(writer.getContent(), specialHtml);
    assert.deepEqual(counter.counts, { start: 10, text: 9, end: 10 });
  });

  it('Parse malformed elements that start with numbers', () => {
    let counter: Counter;
    let parser: SaxParser;

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('a <2 b b b b b b b b b b b b b b b b b b b b b b');
    assert.equal(writer.getContent(), 'a &lt;2 b b b b b b b b b b b b b b b b b b b b b b');

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('a <2b>a</2b> b');
    assert.equal(writer.getContent(), 'a &lt;2b&gt;a&lt;/2b&gt; b');
  });

  it('Parse malformed elements without an end', () => {
    let counter: Counter;
    let parser: SaxParser;

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('<b b b b b b b b b b b b b b b b b b b b b b b');
    assert.equal(
      writer.getContent(),
      '&lt;b b b b b b b b b b b b b b b b b b b b b b b'
    );

    counter = createCounter(writer);
    parser = SaxParser(counter, schema);
    writer.reset();
    parser.parse('a a<b c');
    assert.equal(
      writer.getContent(),
      'a a&lt;b c'
    );
  });

  it('Retain base64 images', () => {
    const counter = createCounter(writer);
    const parser = SaxParser(counter, schema);

    writer.reset();
    parser.parse(
      'a' +
      '<img src="data:image/gif;base64,R0/yw==" />' +
      '<img src="data:image/jpeg;base64,R1/yw==" />' +
      '<div style="background-image: url(\'data:image/png;base64,R2/yw==\')">b</div>' +
      '<!-- <img src="data:image/jpeg;base64,R1/yw==" /> -->' +
      'c'
    );
    assert.equal(writer.getContent(),
      'a' +
      '<img src="data:image/gif;base64,R0/yw==" />' +
      '<img src="data:image/jpeg;base64,R1/yw==" />' +
      '<div style="background-image: url(\'data:image/png;base64,R2/yw==\')">b</div>' +
      '<!-- <img src="data:image/jpeg;base64,R1/yw==" /> -->' +
      'c'
    );
  });

  it('TINY-7589: Handles unmatched apostrophes in HTML comments', () => {
    const counter = createCounter(writer);
    const parser = SaxParser(counter, schema);

    writer.reset();
    const inner =
      '<div>' +
      '<!--  This is the issue: \'  -->' +
      '<div><div><div>The matching apostophe \'</div></div></div>' +
      '<div>Content B</div>' +
      '</div>';
    parser.parse(`${inner}<div data-mce-bogus="all">${inner}</div>`);
    assert.equal(writer.getContent(), inner);
  });

  it('TINY-7756: should prevent dom clobbering overriding document/form properties', () => {
    const counter = createCounter(writer);
    const parser = SaxParser(counter, schema);

    writer.reset();
    parser.parse(
      '<img src="x" name="getElementById" />' +
      '<form>' +
      '<input id="attributes" />' +
      '<output id="style"></output>' +
      '<button name="action"></button>' +
      '<select name="getElementsByName"></select>' +
      '<fieldset name="method"></fieldset>' +
      '<textarea name="click"></textarea>' +
      '</form>'
    );
    assert.equal(writer.getContent(),
      '<img src="x" />' +
      '<form>' +
        '<input />' +
        '<output></output>' +
        '<button></button>' +
        '<select></select>' +
        '<fieldset></fieldset>' +
        '<textarea></textarea>' +
      '</form>'
    );
  });
});
