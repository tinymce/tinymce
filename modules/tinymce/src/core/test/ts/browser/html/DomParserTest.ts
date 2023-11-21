import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun, Obj } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { assert } from 'chai';

import Env from 'tinymce/core/api/Env';
import { BlobCache, BlobInfo } from 'tinymce/core/api/file/BlobCache';
import DomParser, { DomParserSettings, ParserArgs, ParserFilterCallback } from 'tinymce/core/api/html/DomParser';
import AstNode, { Attributes } from 'tinymce/core/api/html/Node';
import Schema, { SchemaElement, SchemaSettings } from 'tinymce/core/api/html/Schema';
import HtmlSerializer from 'tinymce/core/api/html/Serializer';

interface ParseTestResult {
  readonly nodes: AstNode[];
  readonly name: string;
  readonly args: ParserArgs;
}

describe('browser.tinymce.core.html.DomParserTest', () => {
  const browser = PlatformDetection.detect().browser;
  const schema = Schema({ valid_elements: '*[class|title]' });
  const serializer = HtmlSerializer({}, schema);

  const countNodes = (node: AstNode, counter: Record<string, number> = {}) => {
    if (node.name in counter) {
      counter[node.name]++;
    } else {
      counter[node.name] = 1;
    }

    for (let sibling = node.firstChild; sibling; sibling = sibling.next) {
      countNodes(sibling, counter);
    }

    return counter;
  };

  schema.addValidChildren('+body[style]');

  Arr.each([{
    name: 'sanitization enabled (default)',
    isSanitizeEnabled: true,
    settings: { }
  },
  {
    name: 'TINY-9635: sanitization disabled',
    isSanitizeEnabled: false,
    settings: { sanitize: false }
  }], (scenario) => {
    context(scenario.name, () => {
      it('Parse element', () => {
        const parser = DomParser(scenario.settings, schema);
        const root = parser.parse('<B title="title" class="class">test</B>');
        assert.equal(serializer.serialize(root), '<b class="class" title="title">test</b>', 'Inline element');
        assert.equal(root.firstChild?.type, 1, 'Element type');
        assert.equal(root.firstChild?.name, 'b', 'Element name');
        assert.deepEqual(
          root.firstChild?.attributes, [
            { name: 'title', value: 'title' },
            { name: 'class', value: 'class' },
          ] as unknown as Attributes,
          'Element attributes'
        );
        assert.deepEqual(countNodes(root), { 'body': 1, 'b': 1, '#text': 1 }, 'Element attributes (count)');
      });

      it('Retains code inside a script', () => {
        const parser = DomParser(scenario.settings, schema);
        const root = parser.parse('  \t\r\n  <SCRIPT>  \t\r\n   a < b > \t\r\n   </S' + 'CRIPT>   \t\r\n  ');
        assert.equal(serializer.serialize(root), '<script>  \t\n   a < b > \t\n   </s' + 'cript>', 'Retain code inside SCRIPT');
        assert.deepEqual(countNodes(root), { 'body': 1, 'script': 1, '#text': 1 }, 'Retain code inside SCRIPT (count)');
      });

      it('Whitespace', () => {
        let parser = DomParser(scenario.settings, schema);
        let root = parser.parse('  \t\r\n  <B>  \t\r\n   test  \t\r\n   </B>   \t\r\n  ');
        assert.equal(serializer.serialize(root), ' <b> test </b> ', 'Redundant whitespace (inline element)');
        assert.deepEqual(countNodes(root), { 'body': 1, 'b': 1, '#text': 3 }, 'Redundant whitespace (inline element) (count)');

        parser = DomParser(scenario.settings, schema);
        root = parser.parse('  \t\r\n  <P>  \t\r\n   test  \t\r\n   </P>   \t\r\n  ');
        assert.equal(serializer.serialize(root), '<p>test</p>', 'Redundant whitespace (block element)');
        assert.deepEqual(countNodes(root), { 'body': 1, 'p': 1, '#text': 1 }, 'Redundant whitespace (block element) (count)');

        parser = DomParser(scenario.settings, schema);
        root = parser.parse('  \t\r\n  <SCRIPT>  \t\r\n   test  \t\r\n   </S' + 'CRIPT>   \t\r\n  ');
        assert.equal(
          serializer.serialize(root),
          '<script>  \t\n   test  \t\n   </s' + 'cript>',
          'Whitespace around and inside SCRIPT'
        );
        assert.deepEqual(countNodes(root), { 'body': 1, 'script': 1, '#text': 1 }, 'Whitespace around and inside SCRIPT (count)');

        parser = DomParser(scenario.settings, schema);
        root = parser.parse('  \t\r\n  <STYLE>  \t\r\n   test  \t\r\n   </STYLE>   \t\r\n  ');
        assert.equal(serializer.serialize(root), '<style>  \t\n   test  \t\n   </style>', 'Whitespace around and inside STYLE');
        assert.deepEqual(countNodes(root), { 'body': 1, 'style': 1, '#text': 1 }, 'Whitespace around and inside STYLE (count)');

        parser = DomParser(scenario.settings, schema);
        root = parser.parse('<ul>\n<li>Item 1\n<ul>\n<li>\n \t Indented \t \n</li>\n</ul>\n</li>\n</ul>\n');
        assert.equal(
          serializer.serialize(root),
          '<ul><li>Item 1<ul><li>Indented</li></ul></li></ul>',
          'Whitespace around and inside blocks (ul/li)'
        );
        assert.deepEqual(countNodes(root), { 'body': 1, 'li': 2, 'ul': 2, '#text': 2 }, 'Whitespace around and inside blocks (ul/li) (count)');

        parser = DomParser(scenario.settings, Schema({ invalid_elements: 'hr,br' }));
        root = parser.parse(
          '\n<hr />\n<br />\n<div>\n<hr />\n<br />\n<img src="file.gif" data-mce-src="file.gif" />\n<hr />\n<br />\n</div>\n<hr />\n<br />\n'
        );
        assert.equal(
          serializer.serialize(root),
          '<div><img src="file.gif" data-mce-src="file.gif"></div>',
          'Whitespace where the parser will produce multiple whitespace nodes'
        );
        assert.deepEqual(
          countNodes(root),
          { body: 1, div: 1, img: 1 },
          'Whitespace where the parser will produce multiple whitespace nodes (count)'
        );
      });

      it('Whitespace before/after invalid element with text in block', () => {
        const parser = DomParser(scenario.settings, Schema({ invalid_elements: 'em' }));
        const root = parser.parse('<p>a <em>b</em> c</p>');
        assert.equal(serializer.serialize(root), '<p>a b c</p>');
      });

      it('Whitespace before/after invalid element whitespace element in block', () => {
        const parser = DomParser(scenario.settings, Schema({ invalid_elements: 'span' }));
        const root = parser.parse('<p> <span></span> </p>');
        assert.equal(serializer.serialize(root), '<p>\u00a0</p>');
      });

      it('Whitespace preserved in PRE', () => {
        let parser = DomParser(scenario.settings, schema);
        let root = parser.parse('  \t\r\n  <PRE>  \t\r\n   test  \t\r\n   </PRE>   \t\r\n  ');
        assert.equal(serializer.serialize(root), '<pre>  \t\n   test  \t\n   </pre>', 'Whitespace around and inside PRE');
        assert.deepEqual(countNodes(root), { 'body': 1, 'pre': 1, '#text': 1 }, 'Whitespace around and inside PRE (count)');

        parser = DomParser(scenario.settings, schema);
        root = parser.parse('<PRE>  </PRE>');
        assert.equal(serializer.serialize(root), '<pre>  </pre>', 'Whitespace around and inside PRE');
        assert.deepEqual(countNodes(root), { 'body': 1, 'pre': 1, '#text': 1 }, 'Whitespace around and inside PRE (count)');
      });

      it('Whitespace preserved in SPAN inside PRE', () => {
        const parser = DomParser(scenario.settings, schema);
        const root = parser.parse('  \t\r\n  <PRE>  \t\r\n  <span>    test    </span> \t\r\n   </PRE>   \t\r\n  ');
        assert.equal(
          serializer.serialize(root),
          '<pre>  \t\n  <span>    test    </span> \t\n   </pre>',
          'Whitespace around and inside PRE'
        );
        assert.deepEqual(countNodes(root), { 'body': 1, 'pre': 1, 'span': 1, '#text': 3 }, 'Whitespace around and inside PRE (count)');
      });

      it('Whitespace preserved in code', () => {
        let parser = DomParser(scenario.settings, schema);
        let root = parser.parse('<code>  a  </code>');
        assert.equal(serializer.serialize(root), '<code>  a  </code>', 'Whitespace inside code');
        assert.deepEqual(countNodes(root), { 'body': 1, 'code': 1, '#text': 1 }, 'Whitespace inside code (count)');

        parser = DomParser(scenario.settings, schema);
        root = parser.parse('<code>  </code>');
        assert.equal(serializer.serialize(root), '<code>  </code>', 'Whitespace inside code');
        assert.deepEqual(countNodes(root), { 'body': 1, 'code': 1, '#text': 1 }, 'Whitespace inside code (count)');
      });

      it('Parse invalid contents', () => {
        let parser = DomParser(scenario.settings, schema);
        let root = parser.parse('<p class="a"><p class="b">123</p></p>');
        assert.equal(serializer.serialize(root), '<p class="a"></p><p class="b">123</p><p></p>', 'P in P, splits outer P');
        assert.deepEqual(countNodes(root), { 'body': 1, 'p': 3, '#text': 1 }, 'P in P, splits outer P (count)');

        parser = DomParser(scenario.settings, schema);
        root = parser.parse('<p class="a">a<p class="b">b</p><p class="c">c</p>d</p>');
        assert.equal(
          serializer.serialize(root),
          '<p class="a">a</p><p class="b">b</p><p class="c">c</p>d<p></p>',
          'Two P in P, splits outer P'
        );
        assert.deepEqual(countNodes(root), { 'body': 1, 'p': 4, '#text': 4 }, 'Two P in P, splits outer P (count)');

        parser = DomParser(scenario.settings, schema);
        root = parser.parse('<p class="a">abc<p class="b">def</p></p>');
        assert.equal(serializer.serialize(root), '<p class="a">abc</p><p class="b">def</p><p></p>', 'P in P with nodes before');
        assert.deepEqual(countNodes(root), { 'body': 1, 'p': 3, '#text': 2 }, 'P in P with nodes before (count)');

        parser = DomParser(scenario.settings, schema);
        root = parser.parse('<p class="a"><p class="b">abc</p>def</p>');
        assert.equal(serializer.serialize(root), '<p class="a"></p><p class="b">abc</p>def<p></p>', 'P in P with nodes after');
        assert.deepEqual(countNodes(root), { 'body': 1, 'p': 3, '#text': 2 }, 'P in P with nodes after (count)');

        parser = DomParser(scenario.settings, schema);
        root = parser.parse('<p class="a"><p class="b">abc</p><br></p>');
        assert.equal(serializer.serialize(root), '<p class="a"></p><p class="b">abc</p><br><p></p>', 'P in P with BR after');
        assert.deepEqual(countNodes(root), { 'body': 1, 'p': 3, 'br': 1, '#text': 1 }, 'P in P with BR after (count)');

        parser = DomParser(scenario.settings, schema);
        root = parser.parse('<p class="a">a<strong>b<span>c<em>d<p class="b">e</p>f</em>g</span>h</strong>i</p>');
        assert.equal(
          serializer.serialize(root),
          '<p class="a">a<strong>b<span>c<em>d</em></span></strong></p>' +
          '<p class="b"><strong><em>e</em></strong></p>' +
          '<strong><em>f</em>gh</strong>i<p></p>',
          'P in P wrapped in inline elements'
        );
        assert.deepEqual(
          countNodes(root),
          { 'body': 1, 'p': 3, '#text': 8, 'strong': 3, 'span': 1, 'em': 3 },
          'P in P wrapped in inline elements (count)'
        );

        parser = DomParser(scenario.settings, schema);
        root = parser.parse('<p class="a">a<p class="b">b<p class="c">c</p>d</p>e</p>');
        assert.equal(
          serializer.serialize(root),
          '<p class="a">a</p><p class="b">b</p><p class="c">c</p>d<p></p>e<p></p>',
          'P in P in P with text before/after'
        );
        assert.deepEqual(countNodes(root), { 'body': 1, 'p': 5, '#text': 5 }, 'P in P in P with text before/after (count)');

        parser = DomParser(scenario.settings, schema);
        root = parser.parse('<p>a<ul><li>b</li><li>c</li></ul>d</p>');
        assert.equal(serializer.serialize(root), '<p>a</p><ul><li>b</li><li>c</li></ul>d<p></p>', 'UL inside P');
        assert.deepEqual(countNodes(root), { 'body': 1, 'p': 2, 'ul': 1, 'li': 2, '#text': 4 }, 'UL inside P (count)');

        parser = DomParser(scenario.settings, schema);
        root = parser.parse('<table><tr><td><tr>a</tr></td></tr></table>');
        assert.equal(serializer.serialize(root), 'a<table><tbody><tr><td></td></tr><tr></tr></tbody></table>', 'TR inside TD');
        assert.deepEqual(countNodes(root), { 'body': 1, 'table': 1, 'tbody': 1, 'tr': 2, 'td': 1, '#text': 1 }, 'TR inside TD (count)');

        parser = DomParser(scenario.settings, Schema({ valid_elements: 'p,section,div' }));
        root = parser.parse('<div><section><p>a</p></section></div>');
        assert.equal(serializer.serialize(root), '<div><section><p>a</p></section></div>', 'P inside SECTION');
        assert.deepEqual(countNodes(root), { 'body': 1, 'div': 1, 'section': 1, 'p': 1, '#text': 1 }, 'P inside SECTION (count)');
      });

      it('Remove empty nodes', () => {
        const parser = DomParser(scenario.settings, Schema({ valid_elements: '-p,-span[id|style],-strong' }));
        let root = parser.parse(
          '<p>a<span></span><span> </span><span id="x">b</span><span id="y"></span></p><p></p><p><span></span></p><p> </p>'
        );
        assert.equal(serializer.serialize(root), '<p>a <span id="x">b</span><span id="y"></span></p>');

        root = parser.parse('<p>a&nbsp;<span style="text-decoration: underline"> </span>&nbsp;b</p>');
        assert.equal(serializer.serialize(root), '<p>a\u00a0<span style="text-decoration: underline"> </span>\u00a0b</p>');

        root = parser.parse('<p>a&nbsp;<strong> </strong>&nbsp;b</p>');
        assert.equal(serializer.serialize(root), '<p>a\u00a0<strong> </strong>\u00a0b</p>');

        root = parser.parse('<p>a&nbsp;<span style="text-decoration: underline"></span>&nbsp;b</p>');
        assert.equal(serializer.serialize(root), '<p>a\u00a0\u00a0b</p>');

        root = parser.parse('<p>a&nbsp;<span> </span>&nbsp;b</p>');
        assert.equal(serializer.serialize(root), '<p>a\u00a0 \u00a0b</p>');
      });

      it('Parse invalid contents with node filters', () => {
        const parser = DomParser(scenario.settings, schema);
        parser.addNodeFilter('p', (nodes) => {
          Arr.each(nodes, (node) => {
            node.attr('class', 'x');
          });
        });
        const root = parser.parse('<p>a<p>123</p>b</p>');
        assert.equal(serializer.serialize(root), '<p class="x">a</p><p class="x">123</p>b<p class="x"></p>', 'P should have class x');
      });

      it('Parse invalid contents with attribute filters', () => {
        const parser = DomParser(scenario.settings, schema);
        parser.addAttributeFilter('class', (nodes) => {
          Arr.each(nodes, (node) => {
            node.attr('class', 'x');
          });
        });
        const root = parser.parse('<p class="y">a<p class="y">123</p>b</p>');
        assert.equal(serializer.serialize(root), '<p class="x">a</p><p class="x">123</p>b<p></p>', 'P should have class x');
      });

      it('addNodeFilter', () => {
        let result: ParseTestResult | undefined;

        const parser = DomParser(scenario.settings, schema);
        parser.addNodeFilter('#comment', (nodes, name, args) => {
          result = { nodes, name, args };
        });
        parser.parse('text<!--text1-->text<!--text2-->');

        assert.deepEqual(result?.args, {}, 'Parser args');
        assert.equal(result?.name, '#comment', 'Parser filter result name');
        assert.equal(result?.nodes.length, 2, 'Parser filter result node');
        assert.equal(result?.nodes[0].name, '#comment', 'Parser filter result node(0) name');
        assert.equal(result?.nodes[0].value, 'text1', 'Parser filter result node(0) value');
        assert.equal(result?.nodes[1].name, '#comment', 'Parser filter result node(1) name');
        assert.equal(result?.nodes[1].value, 'text2', 'Parser filter result node(1) value');
      });

      it('addNodeFilter multiple names', () => {
        const results: Record<string, ParseTestResult> = {};

        const parser = DomParser(scenario.settings, schema);
        parser.addNodeFilter('#comment,#text', (nodes, name, args) => {
          results[name] = { nodes, name, args };
        });
        parser.parse('text1<!--text1-->text2<!--text2-->');

        assert.deepEqual(results['#comment'].args, {}, 'Parser args');
        assert.equal(results['#comment'].name, '#comment', 'Parser filter result name');
        assert.equal(results['#comment'].nodes.length, 2, 'Parser filter result node');
        assert.equal(results['#comment'].nodes[0].name, '#comment', 'Parser filter result node(0) name');
        assert.equal(results['#comment'].nodes[0].value, 'text1', 'Parser filter result node(0) value');
        assert.equal(results['#comment'].nodes[1].name, '#comment', 'Parser filter result node(1) name');
        assert.equal(results['#comment'].nodes[1].value, 'text2', 'Parser filter result node(1) value');
        assert.deepEqual(results['#text'].args, {}, 'Parser args');
        assert.equal(results['#text'].name, '#text', 'Parser filter result name');
        assert.equal(results['#text'].nodes.length, 2, 'Parser filter result node');
        assert.equal(results['#text'].nodes[0].name, '#text', 'Parser filter result node(0) name');
        assert.equal(results['#text'].nodes[0].value, 'text1', 'Parser filter result node(0) value');
        assert.equal(results['#text'].nodes[1].name, '#text', 'Parser filter result node(1) name');
        assert.equal(results['#text'].nodes[1].value, 'text2', 'Parser filter result node(1) value');
      });

      it('addNodeFilter with parser args', () => {
        let result: ParseTestResult | undefined;

        const parser = DomParser(scenario.settings, schema);
        parser.addNodeFilter('#comment', (nodes, name, args) => {
          result = { nodes, name, args };
        });
        parser.parse('text<!--text1-->text<!--text2-->', { value: 1 });

        assert.deepEqual(result?.args, { value: 1 }, 'Parser args');
      });

      it('TINY-7847: removeNodeFilter', () => {
        const parser = DomParser(scenario.settings);
        const numFilters = parser.getNodeFilters().length;
        let called = false;

        const filter = (_nodes: AstNode[]) => {
          called = true;
        };
        parser.addNodeFilter('th,td', filter);
        parser.addNodeFilter('th,td', Fun.noop);

        assert.lengthOf(parser.getNodeFilters(), numFilters + 2, 'Before removing filters');
        parser.removeNodeFilter('th', filter);
        assert.lengthOf(parser.getNodeFilters(), numFilters + 2, 'After removing the first th node filter');
        assert.lengthOf(parser.getNodeFilters()[numFilters].callbacks, 1, 'th node callbacks');
        parser.removeNodeFilter('th', Fun.noop);
        assert.lengthOf(parser.getNodeFilters(), numFilters + 1, 'After removing the second th node filter');
        parser.removeNodeFilter('th,td');
        assert.lengthOf(parser.getNodeFilters(), numFilters, 'After removing all th and td node filters');

        // Ensure that after being removed the filters aren't called
        parser.parse('<table><tr><th></th><td></td></tr></table>');
        assert.isFalse(called);
      });

      it('addAttributeFilter', () => {
        let result: ParseTestResult | undefined;

        const parser = DomParser(scenario.settings);
        parser.addAttributeFilter('src', (nodes, name, args) => {
          result = { nodes, name, args };
        });
        parser.parse('<b>a<img src="1.gif" />b<img src="1.gif" />c</b>');

        assert.deepEqual(result?.args, {}, 'Parser args');
        assert.equal(result?.name, 'src', 'Parser filter result name');
        assert.equal(result?.nodes.length, 2, 'Parser filter result node');
        assert.equal(result?.nodes[0].name, 'img', 'Parser filter result node(0) name');
        assert.equal(result?.nodes[0].attr('src'), '1.gif', 'Parser filter result node(0) attr');
        assert.equal(result?.nodes[1].name, 'img', 'Parser filter result node(1) name');
        assert.equal(result?.nodes[1].attr('src'), '1.gif', 'Parser filter result node(1) attr');
      });

      it('addAttributeFilter multiple', () => {
        const results: any = {};

        const parser = DomParser(scenario.settings);
        parser.addAttributeFilter('src,href', (nodes, name, args) => {
          results[name] = { nodes, name, args };
        });
        parser.parse('<b><a href="1.gif">a</a><img src="1.gif" />b<img src="1.gif" /><a href="2.gif">c</a></b>');

        assert.deepEqual(results.src.args, {}, 'Parser args');
        assert.equal(results.src.name, 'src', 'Parser filter result name');
        assert.equal(results.src.nodes.length, 2, 'Parser filter result node');
        assert.equal(results.src.nodes[0].name, 'img', 'Parser filter result node(0) name');
        assert.equal(results.src.nodes[0].attr('src'), '1.gif', 'Parser filter result node(0) attr');
        assert.equal(results.src.nodes[1].name, 'img', 'Parser filter result node(1) name');
        assert.equal(results.src.nodes[1].attr('src'), '1.gif', 'Parser filter result node(1) attr');
        assert.deepEqual(results.href.args, {}, 'Parser args');
        assert.equal(results.href.name, 'href', 'Parser filter result name');
        assert.equal(results.href.nodes.length, 2, 'Parser filter result node');
        assert.equal(results.href.nodes[0].name, 'a', 'Parser filter result node(0) name');
        assert.equal(results.href.nodes[0].attr('href'), '1.gif', 'Parser filter result node(0) attr');
        assert.equal(results.href.nodes[1].name, 'a', 'Parser filter result node(1) name');
        assert.equal(results.href.nodes[1].attr('href'), '2.gif', 'Parser filter result node(1) attr');
      });

      it('TINY-8888: mutating addNodeFilter -> addAttributeFilter', () => {
        const parser = DomParser(scenario.settings);
        parser.addNodeFilter('img', (nodes) => {
          Arr.each(nodes, (node) => node.attr('src', null));
        });
        parser.addAttributeFilter('src', () => {
          assert.fail('second src filter should not run, because src was removed');
        });
        parser.parse('<b>a<img src="1.gif" />b</b>');
      });

      it('TINY-8888: mutating addNodeFilter -> addNodeFilter', () => {
        const parser = DomParser(scenario.settings);
        parser.addNodeFilter('img', (nodes) => {
          Arr.each(nodes, (node) => node.remove());
        });
        parser.addNodeFilter('img', () => {
          assert.fail('second img filter should not run, because img was removed');
        });
        parser.parse('<b>a<img src="1.gif" />b</b>');
      });

      it('TINY-8888: mutating addAttributeFilter -> addAttributeFilter', () => {
        const parser = DomParser(scenario.settings);
        parser.addAttributeFilter('src', (nodes) => {
          Arr.each(nodes, (node) => node.attr('src', null));
        });
        parser.addAttributeFilter('src', () => {
          assert.fail('second src filter should not run, because src was removed');
        });
        parser.parse('<b>a<img src="1.gif" />b</b>');
      });

      it('TINY-8888: mutating addAttributeFilter only removes matching nodes', () => {
        const parser = DomParser(scenario.settings);
        parser.addAttributeFilter('src', (nodes) => {
          nodes[0].attr('src', null);
        });
        let ranIdFilter = false;
        parser.addAttributeFilter('src', (nodes) => {
          ranIdFilter = true;
          assert.lengthOf(nodes, 1);
          assert.equal(nodes[0].attr('src'), '2.gif');
        });
        parser.parse('<b>a<img src="1.gif" />b<img src="2.gif" />c</b>');
        assert.isTrue(ranIdFilter, 'second filter should run, because only one src attribute was removed');
      });

      it('TINY-7847: removeAttributeFilter', () => {
        const parser = DomParser(scenario.settings);
        const numFilters = parser.getAttributeFilters().length;
        let called = false;

        const filter = (_nodes: AstNode[]) => {
          called = true;
        };
        parser.addAttributeFilter('controls,poster', filter);
        parser.addAttributeFilter('controls,poster', Fun.noop);

        assert.lengthOf(parser.getAttributeFilters(), numFilters + 2, 'Before removing filters');
        parser.removeAttributeFilter('controls', filter);
        assert.lengthOf(parser.getAttributeFilters(), numFilters + 2, 'After removing the first controls attribute filter');
        assert.lengthOf(parser.getAttributeFilters()[numFilters].callbacks, 1, 'controls attribute node callbacks');
        parser.removeAttributeFilter('controls', Fun.noop);
        assert.lengthOf(parser.getAttributeFilters(), numFilters + 1, 'After removing the second controls attribute filter');
        parser.removeAttributeFilter('controls,poster');
        assert.lengthOf(parser.getAttributeFilters(), numFilters, 'After removing all controls and poster attribute filter');

        // Ensure that after being removed the filters aren't called
        parser.parse('<video controls poster="about:blank"></video>');
        assert.isFalse(called);
      });

      it('Fix orphan LI elements', () => {
        let parser = DomParser(scenario.settings, schema);
        let root = parser.parse('<ul><li>a</li></ul><li>b</li>');
        assert.equal(serializer.serialize(root), '<ul><li>a</li><li>b</li></ul>', 'LI moved to previous sibling UL');

        parser = DomParser(scenario.settings, schema);
        root = parser.parse('<li>a</li><ul><li>b</li></ul>');
        assert.equal(serializer.serialize(root), '<ul><li>a</li><li>b</li></ul>', 'LI moved to next sibling UL');

        parser = DomParser(scenario.settings, schema);
        root = parser.parse('<ol><li>a</li></ol><li>b</li>');
        assert.equal(serializer.serialize(root), '<ol><li>a</li><li>b</li></ol>', 'LI moved to previous sibling OL');

        parser = DomParser(scenario.settings, schema);
        root = parser.parse('<li>a</li><ol><li>b</li></ol>');
        assert.equal(serializer.serialize(root), '<ol><li>a</li><li>b</li></ol>', 'LI moved to next sibling OL');

        parser = DomParser(scenario.settings, schema);
        root = parser.parse('<li>a</li>');
        assert.equal(serializer.serialize(root), '<ul><li>a</li></ul>', 'LI wrapped in new UL');
      });

      it('Remove empty elements', () => {
        const schema = Schema({ valid_elements: 'span,-a,img' });

        let parser = DomParser(scenario.settings, schema);
        let root = parser.parse('<span></span><a href="#"></a>');
        assert.equal(serializer.serialize(root), '<span></span>', 'Remove empty a element');

        parser = DomParser(scenario.settings, Schema({ valid_elements: 'span,a[name],img' }));
        root = parser.parse('<span></span><a name="anchor"></a>');
        assert.equal(serializer.serialize(root), '<span></span><a name="anchor"></a>', 'Leave a with name attribute');

        parser = DomParser(scenario.settings, Schema({ valid_elements: 'span,a[href],img[src]' }));
        root = parser.parse('<span></span><a href="#"><img src="about:blank" /></a>');
        assert.equal(
          serializer.serialize(root),
          '<span></span><a href="#"><img src="about:blank"></a>',
          'Leave elements with img in it'
        );
      });

      it('Self closing list elements', () => {
        const schema = Schema();

        const parser = DomParser(scenario.settings, schema);
        const root = parser.parse('<ul><li>1<li><b>2</b><li><em><b>3</b></em></ul>');
        assert.equal(
          serializer.serialize(root),
          '<ul><li>1</li><li><strong>2</strong></li><li><em><strong>3</strong></em></li></ul>',
          'Split out LI elements in LI elements.'
        );
      });

      it('Remove redundant br elements', () => {
        const schema = Schema();

        const parser = DomParser({ remove_trailing_brs: true, ...scenario.settings }, schema);
        const root = parser.parse(
          '<p>a<br></p>' +
          '<p>a<br>b<br></p>' +
          '<p>a<br><br></p><p>a<br><span data-mce-type="bookmark"></span><br></p>' +
          '<p>a<span data-mce-type="bookmark"></span><br></p>'
        );
        assert.equal(
          serializer.serialize(root),
          '<p>a</p><p>a<br>b</p><p>a<br><br></p><p>a<br><br></p><p>a</p>',
          'Remove traling br elements.'
        );
      });

      it('Replace br with nbsp when wrapped in two inline elements and one block', () => {
        const schema = Schema();

        const parser = DomParser({ remove_trailing_brs: true, ...scenario.settings }, schema);
        const root = parser.parse('<p><strong><em><br /></em></strong></p>');
        assert.equal(serializer.serialize(root), '<p><strong><em>\u00a0</em></strong></p>');
      });

      it('Replace br with nbsp when wrapped in an inline element and placed in the root', () => {
        const schema = Schema();

        const parser = DomParser({ remove_trailing_brs: true, ...scenario.settings }, schema);
        const root = parser.parse('<strong><br /></strong>');
        assert.equal(serializer.serialize(root), '<strong>\u00a0</strong>');
      });

      it(`Don't replace br inside root element when there is multiple brs`, () => {
        const schema = Schema();

        const parser = DomParser({ remove_trailing_brs: true, ...scenario.settings }, schema);
        const root = parser.parse('<strong><br /><br /></strong>');
        assert.equal(serializer.serialize(root), '<strong><br><br></strong>');
      });

      it(`Don't replace br inside root element when there is siblings`, () => {
        const schema = Schema();

        const parser = DomParser({ remove_trailing_brs: true, ...scenario.settings }, schema);
        const root = parser.parse('<strong><br /></strong><em>x</em>');
        assert.equal(serializer.serialize(root), '<strong><br></strong><em>x</em>');
      });

      it('Remove br in invalid parent bug', () => {
        const schema = Schema({ valid_elements: 'br' });

        const parser = DomParser({ remove_trailing_brs: true, ...scenario.settings }, schema);
        const root = parser.parse('<br>');
        assert.equal(serializer.serialize(root), '', 'Remove traling br elements.');
      });

      it('Forced root blocks', () => {
        const schema = Schema();

        const parser = DomParser({ forced_root_block: 'p', ...scenario.settings }, schema);
        const root = parser.parse(
          '<!-- a -->' +
          'b' +
          '<b>c</b>' +
          '<p>d</p>' +
          '<p>e</p>' +
          'f' +
          '<b>g</b>' +
          'h'
        );
        assert.equal(
          serializer.serialize(root),
          '<!-- a --><p>b<strong>c</strong></p><p>d</p><p>e</p><p>f<strong>g</strong>h</p>',
          'Mixed text nodes, inline elements and blocks.'
        );
      });

      it('Forced root blocks attrs', () => {
        const schema = Schema();

        const parser = DomParser({ forced_root_block: 'p', forced_root_block_attrs: { class: 'class1' }, ...scenario.settings }, schema);
        const root = parser.parse(
          '<!-- a -->' +
          'b' +
          '<b>c</b>' +
          '<p>d</p>' +
          '<p>e</p>' +
          'f' +
          '<b>g</b>' +
          'h'
        );
        assert.equal(serializer.serialize(root), '<!-- a -->' +
          '<p class="class1">b<strong>c</strong></p>' +
          '<p>d</p>' +
          '<p>e</p>' +
          '<p class="class1">f<strong>g</strong>h</p>',
        'Mixed text nodes, inline elements and blocks.');
      });

      it('Parse html4 lists into html5 lists', () => {
        const schema = Schema();

        const parser = DomParser({ fix_list_elements: true, ...scenario.settings }, schema);
        const root = parser.parse('<ul><ul><li>a</li></ul></ul><ul><li>a</li><ul><li>b</li></ul></ul>');
        assert.equal(
          serializer.serialize(root),
          '<ul><li style="list-style-type: none"><ul><li>a</li></ul></li></ul><ul><li>a<ul><li>b</li></ul></li></ul>'
        );
      });

      it('Parse contents with html4 anchors and allow_html_in_named_anchor: false', () => {
        const schema = Schema();

        const parser = DomParser({ allow_html_in_named_anchor: false, ...scenario.settings }, schema);
        const root = parser.parse('<a name="x">a</a><a href="x">x</a>');
        assert.equal(serializer.serialize(root), '<a name="x"></a>a<a href="x">x</a>');
      });

      it('Parse contents with html5 anchors and allow_html_in_named_anchor: false', () => {
        const schema = Schema({ schema: 'html5' });

        const parser = DomParser({ allow_html_in_named_anchor: false, ...scenario.settings }, schema);
        const root = parser.parse('<a id="x">a</a><a href="x">x</a>');
        assert.equal(serializer.serialize(root), '<a id="x"></a>a<a href="x">x</a>');
      });

      it('Parse contents with html4 anchors and allow_html_in_named_anchor: true', () => {
        const schema = Schema();

        const parser = DomParser({ allow_html_in_named_anchor: true, ...scenario.settings }, schema);
        const root = parser.parse('<a name="x">a</a><a href="x">x</a>');
        assert.equal(serializer.serialize(root), '<a name="x">a</a><a href="x">x</a>');
      });

      it('Parse contents with html5 anchors and allow_html_in_named_anchor: true', () => {
        const schema = Schema({ schema: 'html5' });

        const parser = DomParser({ allow_html_in_named_anchor: true, ...scenario.settings }, schema);
        const root = parser.parse('<a id="x">a</a><a href="x">x</a>');
        assert.equal(serializer.serialize(root), '<a id="x">a</a><a href="x">x</a>');
      });

      it('Parse contents with html5 self closing datalist options', () => {
        const schema = Schema({ schema: 'html5' });

        const parser = DomParser(scenario.settings, schema);
        const root = parser.parse(
          '<datalist><option label="a1" value="b1"><option label="a2" value="b2"><option label="a3" value="b3"></datalist>'
        );
        assert.equal(
          serializer.serialize(root),
          '<datalist><option label="a1" value="b1"></option><option label="a2" value="b2"></option>' +
          '<option label="a3" value="b3"></option></datalist>'
        );
      });

      it('Parse inline contents before block bug #5424', () => {
        const schema = Schema({ schema: 'html5' });

        const parser = DomParser(scenario.settings, schema);
        const root = parser.parse('<strong>1</strong> 2<p>3</p>');
        assert.equal(serializer.serialize(root), '<strong>1</strong> 2<p>3</p>');
      });

      it('Invalid text blocks within a li', () => {
        const schema = Schema({ schema: 'html5', valid_children: '-li[p]' });

        const parser = DomParser(scenario.settings, schema);
        const root = parser.parse('<ul><li>1<p>2</p></li><li>a<p>b</p><p>c</p></li></ul>');
        assert.equal(serializer.serialize(root), '<ul><li>12</li><li>ab</li><li>c</li></ul>');
      });

      it('Invalid inline element with space before', () => {
        const schema = Schema();

        const parser = DomParser(scenario.settings, schema);
        const root = parser.parse('<p><span>1</span> <strong>2</strong></p>');
        assert.equal(serializer.serialize(root), '<p>1 <strong>2</strong></p>');
      });

      it('Valid classes', () => {
        const schema = Schema({ valid_classes: 'classA classB' });

        const parser = DomParser(scenario.settings, schema);
        const root = parser.parse('<p class="classA classB classC">a</p>');
        assert.equal(serializer.serialize(root), '<p class="classA classB">a</p>');
      });

      it('Valid classes multiple elements', () => {
        const schema = Schema({ valid_classes: { '*': 'classA classB', 'strong': 'classC' }});

        const parser = DomParser(scenario.settings, schema);
        const root = parser.parse('<p class="classA classB classC"><strong class="classA classB classC classD">a</strong></p>');
        assert.equal(serializer.serialize(root), '<p class="classA classB"><strong class="classA classB classC">a</strong></p>');
      });

      it('Pad empty list blocks', () => {
        const schema = Schema();

        const parser = DomParser(scenario.settings, schema);
        const root = parser.parse('<ul><li></li></ul><ul><li> </li></ul>');
        assert.equal(serializer.serialize(root), '<ul><li>\u00a0</li></ul><ul><li>\u00a0</li></ul>');
      });

      it('TINY-9861: Pad empty with br', () => {
        const schema = Schema();
        const serializer = HtmlSerializer({ }, schema);

        const parser1 = DomParser({ pad_empty_with_br: true }, schema);
        const root1 = parser1.parse('<p>a</p><p></p>');
        assert.equal(serializer.serialize(root1), '<p>a</p><p><br></p>');

        const parser2 = DomParser({ pad_empty_with_br: false }, schema);
        const root2 = parser2.parse('<p>a</p><p></p>');
        assert.equal(serializer.serialize(root2), '<p>a</p><p>\u00A0</p>');
      });

      it('Pad empty and prefer br on insert', () => {
        const schema = Schema();

        const parser = DomParser(scenario.settings, schema);
        const root = parser.parse('<ul><li></li><li> </li><li><br /></li><li>\u00a0</li><li>a</li></ul>', { insert: true });
        assert.equal(serializer.serialize(root), '<ul><li><br data-mce-bogus="1"></li><li><br data-mce-bogus="1"></li><li><br></li><li><br data-mce-bogus="1"></li><li>a</li></ul>');
      });

      it('Preserve space in inline span', () => {
        const schema = Schema();

        const parser = DomParser(scenario.settings, schema);
        const root = parser.parse('a<span> </span>b');
        assert.equal(serializer.serialize(root), 'a b');
      });

      it('Bug #7543 removes whitespace between bogus elements before a block', () => {
        const serializer = HtmlSerializer();

        assert.equal(
          serializer.serialize(DomParser(scenario.settings).parse(
            '<div><b data-mce-bogus="1">a</b> <b data-mce-bogus="1">b</b><p>c</p></div>')
          ),
          '<div>a b<p>c</p></div>'
        );
      });

      it('Bug #7582 removes whitespace between bogus elements before a block', () => {
        const serializer = HtmlSerializer();

        assert.equal(
          serializer.serialize(DomParser(scenario.settings).parse(
            '<div>1 <span data-mce-bogus="1">2</span><div>3</div></div>')
          ),
          '<div>1 2<div>3</div></div>'
        );
      });

      it('do not replace starting linebreak with space', () => {
        const serializer = HtmlSerializer();

        assert.equal(
          serializer.serialize(DomParser(scenario.settings).parse('<p>a<br />\nb</p>')),
          '<p>a<br>b</p>'
        );
      });

      it('Preserve internal elements', () => {
        const html = '<span id="id" class="class"><b>text</b></span><span id="test" data-mce-type="something"></span>';

        const parser1 = DomParser(scenario.settings, Schema({ valid_elements: 'b' }));
        const serializerHtml1 = serializer.serialize(parser1.parse(html));
        assert.equal(
          serializerHtml1,
          '<b>text</b><span id="test" data-mce-type="something"></span>',
          'Preserve internal span element without any span schema rule.'
        );

        const parser2 = DomParser(scenario.settings, Schema({ valid_elements: 'b,span[class]' }));
        const serializerHtml2 = serializer.serialize(parser2.parse(html));
        assert.equal(
          serializerHtml2,
          '<span class="class"><b>text</b></span><span id="test" data-mce-type="something"></span>',
          'Preserve internal span element with a span schema rule.'
        );

        const serializedHtml3 = serializer.serialize(parser1.parse('<b data-mce-type="test" id="x" style="color: red" src="1" data="2" onclick="3"></b>'));
        assert.equal(
          serializedHtml3,
          '<b data-mce-type="test" id="x" style="color: red"></b>',
          'Removes disallowed elements'
        );
      });

      // TINY-9624: Safari encodes the iframe innerHTML is `&lt;textarea&gt;`. On Chrome and Firefox, the innerHTML is `<textarea>`, causing
      // the mXSS cleaner in DOMPurify to run and remove the iframe.
      it('parse iframe XSS', () => {
        const serializer = HtmlSerializer();

        assert.equal(
          serializer.serialize(DomParser(scenario.settings).parse('<iframe><textarea></iframe><img src="a" onerror="alert(document.domain)" />')),
          browser.isSafari() || !scenario.isSanitizeEnabled ? '<iframe><textarea></iframe><img src="a">' : '<img src="a">'
        );
      });

      it('Conditional comments (allowed)', () => {
        const parser = DomParser({ allow_conditional_comments: true, validate: false, ...scenario.settings }, schema);
        const html = '<!--[if gte IE 4]>alert(1)<![endif]-->';
        const serializedHtml = serializer.serialize(parser.parse(html));
        assert.equal(serializedHtml, '<!--[if gte IE 4]>alert(1)<![endif]-->');
      });

      it('Conditional comments (denied)', () => {
        const parser = DomParser({ allow_conditional_comments: false, validate: false, ...scenario.settings }, schema);

        let serializedHtml = serializer.serialize(parser.parse('<!--[if gte IE 4]>alert(1)<![endif]-->'));
        assert.equal(serializedHtml, '<!-- [if gte IE 4]>alert(1)<![endif]-->');

        serializedHtml = serializer.serialize(parser.parse('<!--[if !IE]>alert(1)<![endif]-->'));
        assert.equal(serializedHtml, '<!-- [if !IE]>alert(1)<![endif]-->');

        serializedHtml = serializer.serialize(parser.parse('<!--[iF !IE]>alert(1)<![endif]-->'));
        assert.equal(serializedHtml, '<!-- [iF !IE]>alert(1)<![endif]-->');
      });

      it('allow_script_urls should allow any URIs', () => {
        const parser = DomParser({ allow_script_urls: true, ...scenario.settings });
        const html = '<a href="javascript:alert(1)">1</a>' +
          '<a href="data:text/html;base64,PHN2Zy9vbmxvYWQ9YWxlcnQoMik+">3</a>';
        const serializedHtml = serializer.serialize(parser.parse(html));

        assert.equal(serializedHtml,
          '<a href="javascript:alert(1)">1</a>' +
          '<a href="data:text/html;base64,PHN2Zy9vbmxvYWQ9YWxlcnQoMik+">3</a>'
        );
      });

      it('allow_html_data_urls should allow any data URIs, but not script URIs', () => {
        const parser = DomParser({ allow_html_data_urls: true, ...scenario.settings });
        const html = '<a href="javascript:alert(1)">1</a>' +
          '<a href="data:text/html;base64,PHN2Zy9vbmxvYWQ9YWxlcnQoMik+">2</a>' +
          '<a href="data:image/svg+xml;base64,x">3</a>';
        const serializedHtml = serializer.serialize(parser.parse(html));

        assert.equal(serializedHtml,
          '<a>1</a>' +
          '<a href="data:text/html;base64,PHN2Zy9vbmxvYWQ9YWxlcnQoMik+">2</a>' +
          '<a href="data:image/svg+xml;base64,x">3</a>'
        );
      });

      it('Parse script urls (disallow svg data image uris)', () => {
        const parser = DomParser({ allow_svg_data_urls: false, allow_html_data_urls: false, validate: false, ...scenario.settings }, schema);
        const html = '<a href="data:image/svg+xml;base64,x">1</a>' +
          '<img src="data:image/svg+xml;base64,x">';
        const serializedHtml = serializer.serialize(parser.parse(html));

        assert.equal(
          serializedHtml,
          '<a>1</a>' +
          '<img>'
        );
      });

      it('Parse script urls (denied)', () => {
        const parser = DomParser({ allow_script_urls: false, validate: false, ...scenario.settings }, schema);
        const html = '<a href="jAvaScript:alert(1)">1</a>' +
          '<a href="vbscript:alert(2)">2</a>' +
          '<a href="javascript:alert(3)">3</a>' +
          '<a href="\njavascript:alert(4)">4</a>' +
          '<a href="java\nscript:alert(5)">5</a>' +
          '<a href="java\tscript:alert(6)">6</a>' +
          '<a href="%6aavascript:alert(7)">7</a>' +
          '<a href="data:text/html;base64,PHN2Zy9vbmxvYWQ9YWxlcnQoMik+">8</a>' +
          '<a href=" dAt%61: tExt/html  ; bAse64 , PHN2Zy9vbmxvYWQ9YWxlcnQoMik+">9</a>' +
          '<object data="data:text/html;base64,PHN2Zy9vbmxvYWQ9YWxlcnQoMik+">10</object>' +
          '<button formaction="javascript:alert(11)">11</button>' +
          '<form action="javascript:alert(12)">12</form>' +
          '<table background="javascript:alert(13)"><tbody><tr><td>13</td></tr></tbody></table>' +
          '<a href="mhtml:14">14</a>' +
          '<a xlink:href="jAvaScript:alert(15)">15</a>' +
          '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">' +
          '<a href="%E3%82%AA%E3%83%BC%E3%83">Invalid url</a>';
        const serializedHtml = serializer.serialize(parser.parse(html));

        assert.equal(
          serializedHtml,
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
          '<table><tbody><tr><td>13</td></tr></tbody></table>' +
          '<a>14</a>' +
          '<a>15</a>' +
          '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">' +
          '<a href="%E3%82%AA%E3%83%BC%E3%83">Invalid url</a>'
        );
      });

      it('Parse svg urls (default)', () => {
        const parser = DomParser(scenario.settings);
        const serializedHtml = serializer.serialize(parser.parse(
          '<iframe src="data:image/svg+xml;base64,x"></iframe>' +
          '<a href="data:image/svg+xml;base64,x">1</a>' +
          '<object data="data:image/svg+xml;base64,x"></object>' +
          '<img src="data:image/svg+xml;base64,x">' +
          '<video poster="data:image/svg+xml;base64,x"></video>'
        ));
        assert.equal(serializedHtml,
          '<iframe></iframe>' +
          '<a>1</a>' +
          '<object></object>' +
          '<img src="data:image/svg+xml;base64,x">' +
          // parser allows svg data urls in <img> and <video> by default but DOMPurify sanitization removes it for <video>
          (scenario.isSanitizeEnabled ? '<video></video>' : '<video poster="data:image/svg+xml;base64,x"></video>')
        );
      });

      it('Parse svg urls (allowed)', () => {
        const parser = DomParser({ allow_svg_data_urls: true, ...scenario.settings });
        const serializedHtml = serializer.serialize(parser.parse(
          '<iframe src="data:image/svg+xml;base64,x"></iframe>' +
          '<a href="data:image/svg+xml;base64,x">1</a>' +
          '<object data="data:image/svg+xml;base64,x"></object>' +
          '<img src="data:image/svg+xml;base64,x">' +
          '<video poster="data:image/svg+xml;base64,x"></video>'
        ));
        assert.equal(serializedHtml,
          '<iframe src="data:image/svg+xml;base64,x"></iframe>' +
          '<a href="data:image/svg+xml;base64,x">1</a>' +
          '<object data="data:image/svg+xml;base64,x"></object>' +
          '<img src="data:image/svg+xml;base64,x">' +
          '<video poster="data:image/svg+xml;base64,x"></video>'
        );
      });

      it('Parse svg urls (denied)', () => {
        const parser = DomParser({ allow_svg_data_urls: false, ...scenario.settings });
        const serializedHtml = serializer.serialize(parser.parse(
          '<iframe src="data:image/svg+xml;base64,x"></iframe>' +
          '<a href="data:image/svg+xml;base64,x">1</a>' +
          '<object data="data:image/svg+xml;base64,x"></object>' +
          '<img src="data:image/svg+xml;base64,x">' +
          '<video poster="data:image/svg+xml;base64,x"></video>'
        ));
        assert.equal(serializedHtml,
          '<iframe></iframe>' +
          '<a>1</a>' +
          '<object></object>' +
          '<img>' +
          '<video></video>'
        );
      });

      it('getAttributeFilters/getNodeFilters', () => {
        const parser = DomParser(scenario.settings);
        const cb1: ParserFilterCallback = (_nodes, _name, _args) => {};
        const cb2: ParserFilterCallback = (_nodes, _name, _args) => {};

        parser.addAttributeFilter('attr', cb1);
        parser.addNodeFilter('node', cb2);

        const attrFilters = parser.getAttributeFilters();
        const nodeFilters = parser.getNodeFilters();

        assert.deepEqual(attrFilters[attrFilters.length - 1], { name: 'attr', callbacks: [ cb1 ] }, 'Should be expected filter');
        assert.deepEqual(nodeFilters[nodeFilters.length - 1], { name: 'node', callbacks: [ cb2 ] }, 'Should be expected filter');
      });

      it('extract base64 uris to blobcache if blob cache is provided', () => {
        const blobCache = BlobCache();
        const parser = DomParser({ blob_cache: blobCache, ...scenario.settings });
        const base64 = 'R0lGODdhDAAMAIABAMzMzP///ywAAAAADAAMAAACFoQfqYeabNyDMkBQb81Uat85nxguUAEAOw==';
        const base64Uri = `data:image/gif;base64,${base64}`;
        const serializedHtml = serializer.serialize(parser.parse(`<p><img src="${base64Uri}" /></p>`));
        const blobInfo = blobCache.findFirst((bi) => bi.base64() === base64) as BlobInfo;
        const blobUri = blobInfo.blobUri();

        assert.equal(
          serializedHtml,
          `<p><img src="${blobUri}"></p>`,
          'Should be html with blob uri'
        );

        blobCache.destroy();
      });

      it('duplicate base64 uris added only once to blobcache if blob cache is provided', () => {
        const blobCache = BlobCache();
        const parser = DomParser({ blob_cache: blobCache, ...scenario.settings });
        const base64 = 'R0lGODdhDAAMAIABAMzMzP///ywAAAAADAAMAAACFoQfqYeabNyDMkBQb81Uat85nxguUAEAOw==';
        const gifBase64Uri = `data:image/gif;base64,${base64}`;
        const pngBase64Uri = `data:image/png;base64,${base64}`;
        const images = `<img src="${gifBase64Uri}" /><img src="${pngBase64Uri}" />`;
        const serializedHtml = serializer.serialize(parser.parse(`<p>${images}</p><p>${images}</p>`));
        let count = 0;
        blobCache.findFirst((bi) => {
          if (bi.base64() === base64) {
            count++;
          }
          return false;
        });

        assert.equal(count, 2, 'Only one image per mime type should be in the blob cache');
        assert.notInclude(serializedHtml, base64, 'HTML shouldn\'t include a base64 data URI');
        blobCache.destroy();
      });

      it('do not extract base64 uris for transparent or placeholder images used by for example the page break plugin', () => {
        const blobCache = BlobCache();
        const placeholderImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mNk+P//PwMRgHFUIX0VAgAE3B3t0SaZ0AAAAABJRU5ErkJggg==';
        const parser = DomParser({ blob_cache: blobCache, ...scenario.settings });
        const html = `<p><img src="${Env.transparentSrc}" /><img src="${placeholderImg}" data-mce-placeholder="1"></p>`;
        const root = parser.parse(html);

        assert.equal(
          root.getAll('img')[0].attr('src'),
          Env.transparentSrc,
          'Should be the unchanged transparent image source'
        );
        assert.equal(
          root.getAll('img')[1].attr('src'),
          placeholderImg,
          'Should be the unchanged placeholder image source'
        );

        blobCache.destroy();
      });

      it('do not extract base64 uris if blob cache is not provided', () => {
        const parser = DomParser(scenario.settings);
        const html = '<p><img src="data:image/gif;base64,R0lGODdhDAAMAIABAMzMzP///ywAAAAADAAMAAACFoQfqYeabNyDMkBQb81Uat85nxguUAEAOw=="></p>';
        const serializedHtml = serializer.serialize(parser.parse(html));

        assert.equal(serializedHtml, html, 'Should be html with base64 uri retained');
      });

      it('Parse away bogus elements', () => {
        const testBogusParsing = (inputHtml: string, outputHtml: string) => {
          const parser = DomParser(scenario.settings, schema);
          const serializedHtml = serializer.serialize(parser.parse(inputHtml));
          assert.equal(serializedHtml, outputHtml);
        };

        testBogusParsing('a<b data-mce-bogus="1">b</b>c', 'abc');
        testBogusParsing('a<b data-mce-bogus="true">b</b>c', 'abc');
        testBogusParsing('a<b data-mce-bogus="1"></b>c', 'ac');
        testBogusParsing('a<b data-mce-bogus="all">b</b>c', 'ac');
        testBogusParsing('a<b data-mce-bogus="all"><!-- x --><?xml?></b>c', 'ac');
        testBogusParsing('a<b data-mce-bogus="all"><b>b</b></b>c', 'ac');
        testBogusParsing('a<b data-mce-bogus="all"><br>b</b><b>c</b>', 'a<b>c</b>');
        testBogusParsing('a<b data-mce-bogus="all"><img>b</b><b>c</b>', 'a<b>c</b>');
        testBogusParsing('a<b data-mce-bogus="all"><b attr="x">b</b></b>c', 'ac');
        testBogusParsing('a<b data-mce-bogus="all"></b>c', 'ac');
        testBogusParsing('a<b data-mce-bogus="all"></b><b>c</b>', 'a<b>c</b>');
      });

      it('remove bogus elements even if not part of valid_elements', () => {
        const parser = DomParser(scenario.settings, Schema({ valid_elements: 'p,span,' }));
        const html = '<p>a <span data-mce-bogus="all">&nbsp;<span contenteditable="false">X</span>&nbsp;</span>b</p>';
        const serializedHtml = serializer.serialize(parser.parse(html));

        assert.equal(serializedHtml, '<p>a b</p>');
      });

      it('Parse cdata with comments', () => {
        const parser = DomParser(scenario.settings, schema);

        const serializedHtml = serializer.serialize(parser.parse('<div><![CDATA[<!--x--><!--y--!>-->]]></div>', { format: 'html' }));
        assert.equal(serializedHtml, '<div><!--[CDATA[<!--x----><!--y-->--&gt;]]&gt;</div>');

        const serializedXHtml = serializer.serialize(parser.parse('<div><![CDATA[<!--x--><!--y-->--><!--]]></div>', { format: 'xhtml' }));
        assert.equal(serializedXHtml, '<div><![CDATA[<!--x--><!--y-->--><!--]]></div>');
      });

      it('TINY-7756: Parsing invalid nested children', () => {
        const schema = Schema({ valid_children: '-td[button|a|div]' });
        const parser = DomParser(scenario.settings, schema);
        const html = '<table><tr><td><button><a><meta /></a></button></td></tr></table>';
        const serializedHtml = serializer.serialize(parser.parse(html));

        assert.equal(serializedHtml, '<table><tbody><tr><td></td></tr></tbody></table>', 'Should remove all invalid children but keep empty table');
      });

      it('TINY-7756: Parsing invalid nested children with a valid child between', () => {
        const parser = DomParser(scenario.settings);
        const html =
          '<table>' +
            '<tbody>' +
              '<tr>' +
                '<td>' +
                  '<meta>' +
                    '<button>' +
                      '<img />' +
                      '<button>' +
                        '<a>' +
                          '<meta />' +
                        '</a>' +
                      '</button>' +
                      '<img />' +
                    '</button>' +
                  '</meta>' +
                '</td>' +
              '</tr>' +
            '</tbody>' +
          '</table>';
        const serializedHtml = serializer.serialize(parser.parse(html));

        assert.equal(
          serializedHtml,
          '<table>' +
            '<tbody>' +
              '<tr>' +
                '<td>' +
                  '<button>' +
                    '<img>' +
                  '</button>' +
                  '<button>' +
                    '<a></a>' +
                  '</button>' +
                  '<img>' +
                '</td>' +
              '</tr>' +
            '</tbody>' +
          '</table>'
        );
      });

      it('TINY-8205: Fixes up invalid children even when top-level element does not fit the context', () => {
        const parser = DomParser(scenario.settings);
        const html = '<p>Hello world! <button>This is a button with a meta tag in it<meta /></button></p>';
        const serializedHtml = serializer.serialize(parser.parse(html, { context: 'p' }));

        assert.equal(serializedHtml, '<p>Hello world! <button>This is a button with a meta tag in it</button></p>');
      });

      it('TINY-7756: should prevent dom clobbering overriding document/form properties', () => {
        const parser = DomParser(scenario.settings, Schema({ valid_elements: '*[id|src|name|class]' }));
        const html = '<img src="x" name="getElementById" />' +
          '<input id="attributes" />' +
          '<output id="style"></output>' +
          '<button name="action"></button>' +
          '<select name="getElementsByName"></select>' +
          '<fieldset name="method"></fieldset>' +
          '<textarea name="click"></textarea>';
        const serializedHtml = serializer.serialize(parser.parse(html));

        assert.equal(serializedHtml,
          // dom clobbering prevention handled by DOMPurify sanitization
          scenario.isSanitizeEnabled
            ?
            ('<img src="x">' +
            '<input>' +
            '<output></output>' +
            '<button></button>' +
            '<select></select>' +
            '<fieldset></fieldset>' +
            '<textarea></textarea>')
            :
            ('<img src="x" name="getElementById">' +
            '<input id="attributes">' +
            '<output id="style"></output>' +
            '<button name="action"></button>' +
            '<select name="getElementsByName"></select>' +
            '<fieldset name="method"></fieldset>' +
            '<textarea name="click"></textarea>')
        );
      });

      it('TINY-8639: handling empty text inline elements when root block is empty', () => {
        const html = '<p><strong></strong></p>' +
        '<p><s></s></p>' +
        '<p><span class="test"></span></p>' +
        '<p><span style="color: red;"></span></p>' +
        '<p><span></span></p>';

        // Assert default behaviour when padd_empty_block_inline_children is not specified (should be equivalent to false)
        let parser = DomParser(scenario.settings, Schema({}));
        let serializedHtml = serializer.serialize(parser.parse(html));

        assert.equal(serializedHtml,
          '<p>\u00a0</p>' +
          '<p>\u00a0</p>' +
          '<p>\u00a0</p>' +
          '<p>\u00a0</p>' +
          '<p>\u00a0</p>'
        );

        parser = DomParser(scenario.settings, Schema({ padd_empty_block_inline_children: false }));
        serializedHtml = serializer.serialize(parser.parse(html));

        assert.equal(serializedHtml,
          '<p>\u00a0</p>' +
          '<p>\u00a0</p>' +
          '<p>\u00a0</p>' +
          '<p>\u00a0</p>' +
          '<p>\u00a0</p>'
        );

        parser = DomParser(scenario.settings, Schema({ padd_empty_block_inline_children: true }));
        serializedHtml = serializer.serialize(parser.parse(html));

        assert.equal(serializedHtml,
          '<p><strong>\u00a0</strong></p>' +
          '<p><s>\u00a0</s></p>' +
          '<p><span class="test">\u00a0</span></p>' +
          '<p><span style="color: red;">\u00a0</span></p>' +
          '<p>\u00a0</p>'
        );
      });

      it('TINY-8639: handling single space text inline elements when root block is otherwise empty', () => {
        const html = '<p><strong> </strong></p>' +
        '<p><s> </s></p>' +
        '<p><span class="test"> </span></p>' +
        '<p><span style="color: red;"> </span></p>' +
        '<p><span> </span></p>';

        // Assert default behaviour when padd_empty_block_inline_children is not specified (should be equivalent to false)
        let parser = DomParser(scenario.settings, Schema({}));
        let serializedHtml = serializer.serialize(parser.parse(html));

        assert.equal(serializedHtml,
          '<p><strong> </strong></p>' +
          '<p><s> </s></p>' +
          // isEmpty node logic considers a span with no style attribute and a single space to be empty (Node.ts -> isEmpty -> isEmptyTextNode)
          '<p> </p>' +
          '<p><span style="color: red;"> </span></p>' +
          '<p>\u00a0</p>'
        );

        parser = DomParser(scenario.settings, Schema({ padd_empty_block_inline_children: false }));
        serializedHtml = serializer.serialize(parser.parse(html));

        assert.equal(serializedHtml,
          '<p><strong> </strong></p>' +
          '<p><s> </s></p>' +
          // isEmpty node logic considers a span with no style attribute and a single space to be empty (Node.ts -> isEmpty -> isEmptyTextNode)
          '<p> </p>' +
          '<p><span style="color: red;"> </span></p>' +
          '<p>\u00a0</p>'
        );

        parser = DomParser(scenario.settings, Schema({ padd_empty_block_inline_children: true }));
        serializedHtml = serializer.serialize(parser.parse(html));

        assert.equal(serializedHtml,
          '<p><strong> </strong></p>' +
          '<p><s> </s></p>' +
          '<p><span class="test">\u00a0</span></p>' +
          '<p><span style="color: red;"> </span></p>' +
          '<p>\u00a0</p>'
        );
      });

      it('TINY-8639: handling single nbsp text inline elements when root block is otherwise empty', () => {
        const html = '<p><strong>&nbsp;</strong></p>' +
        '<p><s>&nbsp;</s></p>' +
        '<p><span class="test">&nbsp;</span></p>' +
        '<p><span style="color: red;">&nbsp;</span></p>' +
        '<p><span>&nbsp;</span></p>';

        // Assert default behaviour when padd_empty_block_inline_children is not specified (should be equivalent to false)
        let parser = DomParser(scenario.settings, Schema({}));
        let serializedHtml = serializer.serialize(parser.parse(html));

        assert.equal(serializedHtml,
          '<p><strong>\u00a0</strong></p>' +
          '<p><s>\u00a0</s></p>' +
          '<p><span class="test">\u00a0</span></p>' +
          '<p><span style="color: red;">\u00a0</span></p>' +
          '<p>\u00a0</p>'
        );

        parser = DomParser(scenario.settings, Schema({ padd_empty_block_inline_children: false }));
        serializedHtml = serializer.serialize(parser.parse(html));

        assert.equal(serializedHtml,
          '<p><strong>\u00a0</strong></p>' +
          '<p><s>\u00a0</s></p>' +
          '<p><span class="test">\u00a0</span></p>' +
          '<p><span style="color: red;">\u00a0</span></p>' +
          '<p>\u00a0</p>'
        );

        parser = DomParser(scenario.settings, Schema({ padd_empty_block_inline_children: true }));
        serializedHtml = serializer.serialize(parser.parse(html));

        assert.equal(serializedHtml,
          '<p><strong>\u00a0</strong></p>' +
          '<p><s>\u00a0</s></p>' +
          '<p><span class="test">\u00a0</span></p>' +
          '<p><span style="color: red;">\u00a0</span></p>' +
          '<p>\u00a0</p>'
        );
      });

      it('TINY-8639: should always remove empty inline element if it is not in an empty block', () => {
        const html = '<p>ab<strong></strong>cd</p>' +
        '<p>ab<s></s>cd</p>' +
        '<p>ab<span class="test"></span>cd</p>' +
        '<p>ab<span style="color: red;"></span>cd</p>' +
        '<p>ab<span></span>cd</p>';

        // Assert default behaviour when padd_empty_block_inline_children is not specified (should be equivalent to false)
        let parser = DomParser(scenario.settings, Schema({}));
        let serializedHtml = serializer.serialize(parser.parse(html));

        assert.equal(serializedHtml,
          '<p>abcd</p>' +
          '<p>abcd</p>' +
          '<p>abcd</p>' +
          '<p>abcd</p>' +
          '<p>abcd</p>'
        );

        parser = DomParser(scenario.settings, Schema({ padd_empty_block_inline_children: false }));
        serializedHtml = serializer.serialize(parser.parse(html));

        assert.equal(serializedHtml,
          '<p>abcd</p>' +
          '<p>abcd</p>' +
          '<p>abcd</p>' +
          '<p>abcd</p>' +
          '<p>abcd</p>'
        );

        parser = DomParser(scenario.settings, Schema({ padd_empty_block_inline_children: true }));
        serializedHtml = serializer.serialize(parser.parse(html));

        assert.equal(serializedHtml,
          '<p>abcd</p>' +
          '<p>abcd</p>' +
          '<p>abcd</p>' +
          '<p>abcd</p>' +
          '<p>abcd</p>'
        );
      });

      it('TINY-8780: Invalid special elements are removed entirely instead of being unwrapped', () => {
        const parser = DomParser({ forced_root_block: 'p', ...scenario.settings }, Schema({ invalid_elements: 'script,style,iframe,textarea,div' }));
        const html = '<script>var x = 1;</script>' +
          '<style>.red-text { color: red; }</style>' +
          '<iframe src="about:blank">content</iframe>' +
          '<textarea>content</textarea>' +
          '<p>paragraph</p>' +
          '<div>div</div>';

        const serializedHtml = serializer.serialize(parser.parse(html));
        assert.equal(serializedHtml, '<p>paragraph</p><p>div</p>');
      });

      context('validate: false', () => {
        it('invalid elements and attributes should not be removed', () => {
          const parser = DomParser({ validate: false, ...scenario.settings }, Schema({ valid_elements: 'span[id]' }));
          const html = '<p>Hello world! <strong>This is bold</strong> and <span style="text-decoration: underline">this is underlined content</span>.</p>';
          const serializedHtml = serializer.serialize(parser.parse(html));

          assert.equal(serializedHtml, html);
        });

        it('empty elements should not be removed', () => {
          const customSchema = Schema({ valid_elements: 'span[style],strong' });
          (customSchema.getElementRule('span') as SchemaElement).removeEmptyAttrs = true;
          (customSchema.getElementRule('strong') as SchemaElement).removeEmpty = true;
          const parser = DomParser({ validate: false, ...scenario.settings }, customSchema);
          const html = '<p>Hello world! This should keep empty <strong></strong>elements <span></span>.</p>';
          const serializedHtml = serializer.serialize(parser.parse(html));

          assert.equal(serializedHtml, html);
        });

        it('empty elements should not be padded', () => {
          const customSchema = Schema({ valid_elements: 'span' });
          (customSchema.getElementRule('span') as SchemaElement).paddEmpty = true;
          const parser = DomParser({ validate: false, ...scenario.settings }, customSchema);
          const html = '<p>Hello world! <span></span></p>';
          const serializedHtml = serializer.serialize(parser.parse(html));

          assert.equal(serializedHtml, html);
        });

        it('bogus elements should be removed', () => {
          const parser = DomParser({ validate: false, ...scenario.settings }, schema);
          const html = '<p>Hello world! <span data-mce-bogus="1">This is inside a bogus element.</span></p><div data-mce-bogus="all"><strong>This is bogus content</strong></div>';
          const serializedHtml = serializer.serialize(parser.parse(html));

          assert.equal(serializedHtml, '<p>Hello world! This is inside a bogus element.</p>');
        });

        it('redundant whitespace should still be removed', () => {
          const parser = DomParser({ validate: false, ...scenario.settings }, schema);
          let root = parser.parse('  \t\r\n  <P>  \t\r\n   test  \t\r\n   </P>   \t\r\n  ');
          assert.equal(serializer.serialize(root), '<p>test</p>', 'Redundant whitespace (block element)');
          assert.deepEqual(countNodes(root), { 'body': 1, 'p': 1, '#text': 1 }, 'Redundant whitespace (block element) (count)');

          root = parser.parse('  \t\r\n  <PRE>  \t\r\n   test  \t\r\n   </PRE>   \t\r\n  ');
          assert.equal(serializer.serialize(root), '<pre>  \t\n   test  \t\n   </pre>', 'Whitespace around and inside PRE');
          assert.deepEqual(countNodes(root), { 'body': 1, 'pre': 1, '#text': 1 }, 'Whitespace around and inside PRE (count)');
        });

        it('unsafe content should still be removed', () => {
          const parser = DomParser({ validate: false, ...scenario.settings }, schema);
          const html = '<p>Hello world!<a href="javascript:alert(1)">XSS</a></p>';
          const serializedHtml = serializer.serialize(parser.parse(html));

          assert.equal(serializedHtml, '<p>Hello world!<a>XSS</a></p>');
        });

        it('data and aria attributes should always be retained', () => {
          const parser = DomParser(scenario.settings);
          const html = '<p><a href="http://www.google.com/fake1" data-custom="custom" aria-invalid="true">Hello world!</a></p>';
          const serializedHtml = serializer.serialize(parser.parse(html));

          assert.equal(serializedHtml, html);
        });

        context('Transparent elements', () => {
          const getTransparentElements = (schema: Schema) => Arr.unique(Arr.map(Obj.keys(schema.getTransparentElements()), (s) => s.toLowerCase()));

          const testTransparentElementsParsing = (testCase: { input: string; expected: string; domParserSettings?: DomParserSettings }) => {
            const parser = DomParser({ ...scenario.settings, ...testCase.domParserSettings });
            const serializedHtml = serializer.serialize(parser.parse(testCase.input));

            assert.equal(serializedHtml, testCase.expected);
          };

          it('TINY-9172: inline transparents should not get data-mce-block attribute', () => {
            const parser = DomParser(scenario.settings);
            const innerHtml = Arr.map(getTransparentElements(parser.schema), (name) => `<${name}>text</${name}>`).join('');
            const html = `<p>${innerHtml}</p>`;
            const serializedHtml = serializer.serialize(parser.parse(html));

            assert.equal(serializedHtml, html);
          });

          it('TINY-9172: root level transparents should not get data-mce-block attribute', () => {
            const parser = DomParser(scenario.settings);
            const html = Arr.map(getTransparentElements(parser.schema), (name) => `<${name}>text</${name}>`).join('');
            const expectedHtml = Arr.map(getTransparentElements(parser.schema), (name) => `<${name}>text</${name}>`).join('');
            const serializedHtml = serializer.serialize(parser.parse(html));

            assert.equal(serializedHtml, expectedHtml);
          });

          it('TINY-9172: transparents wrapping blocks should get data-mce-block attribute', () => {
            const parser = DomParser(scenario.settings);
            const innerHtml = Arr.map(getTransparentElements(parser.schema), (name) => `<${name}><p>text</p></${name}>`).join('');
            const html = `<div>${innerHtml}</div>`;
            const expectedInnerHtml = Arr.map(getTransparentElements(parser.schema), (name) => `<${name} data-mce-block="true"><p>text</p></${name}>`).join('');
            const expectedHtml = `<div>${expectedInnerHtml}</div>`;
            const serializedHtml = serializer.serialize(parser.parse(html));

            assert.equal(serializedHtml, expectedHtml);
          });

          it('TINY-9232: H1 in H1 should unwrap to single H1', () => testTransparentElementsParsing({
            input: '<h1><a href="#"><h1>foo</h1></a></h1>',
            expected: '<h1>foo</h1>'
          }));

          it('TINY-9232: H1 and H2 in H1 should unwrap', () => testTransparentElementsParsing({
            input: '<h1><a href="#"><h1>a</h1><h2>b</h2></a></h1>',
            expected: '<h1>a</h1><h2>b</h2>'
          }));

          it('TINY-9232: H1 and H2 in H1 should unwrap but text should remain links', () => testTransparentElementsParsing({
            input: '<h1><a href="#">a<h1>b</h1>c<h2>d</h2>e</a></h1>',
            expected: '<h1><a href="#">a</a></h1><h1>b</h1><h1><a href="#">c</a></h1><h2>d</h2><h1><a href="#">e</a></h1>'
          }));

          it('TINY-9232: H1 in H1 in DIV should unwrap down to DIV', () => testTransparentElementsParsing({
            input: '<div>a<h1><a href="#"><h1>b</h1></a></h1>c</div>',
            expected: '<div>a<h1>b</h1>c</div>'
          }));

          it('TINY-9232: Nested anchors wrapped in H1 and H2 should all unwrap', () => testTransparentElementsParsing({
            input: '<h1><a href="#1"><h2><a href="#2"><h3>foo</h3></a></h2></a></h1>',
            expected: '<h3>foo</h3>'
          }));

          it('TINY-9232: H1 with content before and after anchor should be retained but the anchor should be unwrapped', () => testTransparentElementsParsing({
            input: '<h1>a<a href="#"><h1>foo</h1></a>b</h1>',
            expected: '<h1>a</h1><h1>foo</h1><h1>b</h1>'
          }));

          it('TINY-9761: Transparent elements should not get paragraphs between them', () => testTransparentElementsParsing({
            input: '<a href="#"><p>foo</p></a>\n<a href="#"><p>bar</p></a> \t<a href="#"><p>baz</p></a>',
            expected: '<a href="#" data-mce-block="true"><p>foo</p></a><a href="#" data-mce-block="true"><p>bar</p></a><a href="#" data-mce-block="true"><p>baz</p></a>',
            domParserSettings: {
              forced_root_block: 'p'
            }
          }));
        });
      });

      context('Sandboxing iframes', () => {
        const serializeIframeHtml = (sandbox: boolean): string => {
          const parser = DomParser({ ...scenario.settings, sandbox_iframes: sandbox });
          return serializer.serialize(parser.parse('<iframe src="about:blank"></iframe>'));
        };

        it('TINY-10348: iframes should be sandboxed when sandbox_iframes: false', () =>
          assert.equal(serializeIframeHtml(false), '<iframe src="about:blank"></iframe>'));

        it('TINY-10348: iframes should be sandboxed when sandbox_iframes: true', () =>
          assert.equal(serializeIframeHtml(true), '<iframe src="about:blank" sandbox=""></iframe>'));
      });

      context('Convert unsafe embeds', () => {
        const serializeEmbedHtml = (embedHtml: string, convert: boolean): string => {
          const parser = DomParser({ ...scenario.settings, convert_unsafe_embeds: convert });
          return serializer.serialize(parser.parse(embedHtml));
        };

        const testConversion = (embedHtml: string, expectedHtml: string) => () => {
          const serializedHtml = serializeEmbedHtml(embedHtml, true);
          assert.equal(serializedHtml, expectedHtml);
        };

        context('convert_unsafe_embeds: false', () => {
          const testNoConversion = (embedHtml: string) => () => {
            const serializedHtml = serializeEmbedHtml(embedHtml, false);
            assert.equal(serializedHtml, embedHtml);
          };

          it('TINY-10349: Object elements should not be converted', testNoConversion('<object data="about:blank"></object>'));
          it('TINY-10349: Object elements with a mime type should not be converted', testNoConversion('<object data="about:blank" type="image/png"></object>'));
          it('TINY-10349: Embed elements should notr be converted', testNoConversion('<embed src="about:blank">'));
          it('TINY-10349: Embed elements with a mime type should not be converted', testNoConversion('<embed src="about:blank" type="image/png">'));
        });

        context('convert_unsafe_embeds: true', () => {
          it('TINY-10349: Object elements without a mime type should be converted to iframe',
            testConversion('<object data="about:blank"></object>', '<iframe src="about:blank"></iframe>'));
          it('TINY-10349: Object elements with an image mime type should be converted to img',
            testConversion('<object data="about:blank" type="image/png"></object>', '<img src="about:blank">'));
          it('TINY-10349: Object elements with a video mime type should be converted to video',
            testConversion('<object data="about:blank" type="video/mp4"></object>', '<video src="about:blank" controls=""></video>'));
          it('TINY-10349: Object elements with an audio mime type should be converted to audio',
            testConversion('<object data="about:blank" type="audio/mpeg"></object>', '<audio src="about:blank" controls=""></audio>'));
          it('TINY-10349: Object elements with other mime type should be converted to iframe',
            testConversion('<object data="about:blank" type="application/pdf"></object>', '<iframe src="about:blank"></iframe>'));

          it('TINY-10349: Embed elements without a mime type should be converted to iframe',
            testConversion('<embed src="about:blank">', '<iframe src="about:blank"></iframe>'));
          it('TINY-10349: Embed elements with an image mime type should be converted to img',
            testConversion('<embed src="about:blank" type="image/png">', '<img src="about:blank">'));
          it('TINY-10349: Embed elements with a video mime type should be converted to video',
            testConversion('<embed src="about:blank" type="video/mp4">', '<video src="about:blank" controls=""></video>'));
          it('TINY-10349: Embed elements with an audio mime type should be converted to audio',
            testConversion('<embed src="about:blank" type="audio/mpeg">', '<audio src="about:blank" controls=""></audio>'));
          it('TINY-10349: Embed elements with other mime type should be converted to iframe',
            testConversion('<embed src="about:blank" type="application/pdf">', '<iframe src="about:blank"></iframe>'));
        });

        context('convert_unsafe_embeds: true, sandbox_iframes: true', () => {
          const testSandboxedConversion = (embedHtml: string, expectedHtml: string) => () => {
            const parser = DomParser({ ...scenario.settings, convert_unsafe_embeds: true, sandbox_iframes: true });
            const serializedHtml = serializer.serialize(parser.parse(embedHtml));
            assert.equal(serializedHtml, expectedHtml);
          };

          it('TINY-10349: Object elements without a mime type should be converted to sandboxed iframe',
            testSandboxedConversion('<object data="about:blank"></object>', '<iframe src="about:blank" sandbox=""></iframe>'));

          it('TINY-10349: Embed elements without a mime type should be converted to sandboxed iframe',
            testSandboxedConversion('<embed src="about:blank">', '<iframe src="about:blank" sandbox=""></iframe>'));
        });

        context('convert_unsafe_embeds: true, attribute preservation', () => {
          it('TINY-10349: Object elements should perserve width and height attributes only',
            testConversion('<object data="about:blank" width="100" height="100" style="color: red;"></object>', '<iframe src="about:blank" width="100" height="100"></iframe>'));
          it('TINY-10349: Object elements with an image mime type should perserve width and height attributes only',
            testConversion('<object data="about:blank" type="image/png" width="100" height="100" style="color: red;"></object>', '<img src="about:blank" width="100" height="100">'));
          it('TINY-10349: Object elements with a video mime type should perserve width and height attributes only',
            testConversion('<object data="about:blank" type="video/mp4" width="100" height="100" style="color: red;"></object>', '<video src="about:blank" width="100" height="100" controls=""></video>'));
          it('TINY-10349: Object elements with an audio mime type should not perserve other attributes only',
            testConversion('<object data="about:blank" type="audio/mpeg" width="100" height="100" style="color: red;"></object>', '<audio src="about:blank" controls=""></audio>'));
          it('TINY-10349: Object elements with other mime type should perserve width and height attributes only',
            testConversion('<object data="about:blank" type="application/pdf" width="100" height="100" style="color: red;"></object>', '<iframe src="about:blank" width="100" height="100"></iframe>'));

          it('TINY-10349: Embed elements should preserve width and heigth attributes only',
            testConversion('<embed src="about:blank" width="100" height="100" style="color: red;">', '<iframe src="about:blank" width="100" height="100"></iframe>'));
          it('TINY-10349: Embed elements with an image mime type should preserve width and height attributes only',
            testConversion('<embed src="about:blank" type="image/png" width="100" height="100" style="color: red;">', '<img src="about:blank" width="100" height="100">'));
          it('TINY-10349: Embed elements with a video mime type should preserve width and height attributes only',
            testConversion('<embed src="about:blank" type="video/mp4" width="100" height="100" style="color: red;">', '<video src="about:blank" width="100" height="100" controls=""></video>'));
          it('TINY-10349: Embed elements with an audio mime type should not preserve other attributes',
            testConversion('<embed src="about:blank" type="audio/mpeg" width="100" height="100" style="color: red;">', '<audio src="about:blank" controls=""></audio>'));
          it('TINY-10349: Embed elements with other mime type should preserve width and height attributes only',
            testConversion('<embed src="about:blank" type="application/pdf" width="100" height="100" style="color: red;">', '<iframe src="about:blank" width="100" height="100"></iframe>'));
        });
      });
    });
  });

  context('TINY-9600: sanitize: false with unsafe input', () => {
    const getNoSanitizeParser = (settings: DomParserSettings, schema: Schema): DomParser =>
      DomParser({ ...settings, sanitize: false }, schema);

    const testDisablingSanitization = (outputs: string[], schemaSettings: SchemaSettings) => {
      Arr.each([
        {
          name: 'script tags',
          input: '<script>alert(1)</script>'
        }, {
          name: 'iframe tags with child nodes',
          input: '<iframe src="https://example.com"><p>Lorem ipsum</p></iframe>'
        }, {
          name: 'iframe tags with srcdoc attribute',
          input: '<iframe srcdoc="Lorem ipsum"></iframe>'
        }, {
          name: 'unsafe href attributes',
          input: '<p><a href="javascript:alert(1)">XSS</a></p>'
        },
        {
          name: 'svg tags',
          input: '<svg><circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow"></circle></svg>'
        }
      ], (testCase, i) => {
        it(testCase.name, () => {
          const schema = Schema(schemaSettings);
          const serializedHtml = HtmlSerializer({}, schema).serialize(
            getNoSanitizeParser({}, schema).parse(testCase.input)
          );
          assert.equal(serializedHtml, outputs[i]);
        });
      });
    };

    context('with default schema', () => {
      testDisablingSanitization([
        '',
        '<iframe src="https://example.com"><p>Lorem ipsum</p></iframe>',
        '<iframe></iframe>',
        '<p><a>XSS</a></p>',
        ''
      ], {});
    });

    context('with valid_elements: \'*[*]\' schema', () => {
      testDisablingSanitization([
        '<script>alert(1)</script>',
        '<iframe src="https://example.com"><p>Lorem ipsum</p></iframe>',
        '<iframe srcdoc="Lorem ipsum"></iframe>',
        '<p><a>XSS</a></p>',
        '<svg><circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow"></circle></svg>'
      ], { valid_elements: '*[*]' });
    });
  });

  context('SVG elements', () => {
    it('TINY-10237: Should not wrap SVGs', () => {
      const schema = Schema();
      schema.addValidElements('svg[*]');
      const input = '<svg></svg>foo';
      const serializedHtml = HtmlSerializer({}, schema).serialize(DomParser({ forced_root_block: 'p' }, schema).parse(input));
      assert.equal(serializedHtml, '<svg></svg><p>foo</p>');
    });

    it('TINY-10237: Should retain SVG elements as is but filter out scripts', () => {
      const schema = Schema();
      schema.addValidElements('svg[*]');
      const input = '<svg><circle><desc><b>foo</b><script>alert(1)</script></desc></circle></svg>foo';
      const serializedHtml = HtmlSerializer({}, schema).serialize(DomParser({ forced_root_block: 'p' }, schema).parse(input));
      assert.equal(serializedHtml, '<svg><circle><desc><b>foo</b></desc></circle></svg><p>foo</p>');
    });

    it('TINY-10237: Should retain SVG elements and keep scripts if sanitize is set to false', () => {
      const schema = Schema();
      schema.addValidElements('svg[*]');
      const input = '<svg><circle><desc>foo<script>alert(1)</script></desc></circle></svg>foo';
      const serializedHtml = HtmlSerializer({}, schema).serialize(DomParser({ forced_root_block: 'p', sanitize: false }, schema).parse(input));
      assert.equal(serializedHtml, '<svg><circle><desc>foo<script>alert(1)</script></desc></circle></svg><p>foo</p>');
    });

    it('TINY-10273: Trim whitespace before or after but not inside SVG elements at root level', () => {
      const schema = Schema();
      schema.addValidElements('svg[*]');
      const input = '  <svg> <circle> </circle> </svg>  <svg> <circle> </circle> </svg>  ';
      const serializedHtml = HtmlSerializer({}, schema).serialize(DomParser({ forced_root_block: 'p' }, schema).parse(input));
      assert.equal(serializedHtml, '<svg> <circle> </circle> </svg><svg> <circle> </circle> </svg>');
    });

    it('TINY-10273: Trim whitespace before or after but not between or inside SVG elements when inside a block element', () => {
      const schema = Schema();
      schema.addValidElements('svg[*]');
      const input = '<div>  <svg> <circle> </circle> </svg>  <svg> <circle> </circle> </svg>  </div>';
      const serializedHtml = HtmlSerializer({}, schema).serialize(DomParser({ forced_root_block: 'p' }, schema).parse(input));
      assert.equal(serializedHtml, '<div><svg> <circle> </circle> </svg> <svg> <circle> </circle> </svg></div>');
    });
  });
});
