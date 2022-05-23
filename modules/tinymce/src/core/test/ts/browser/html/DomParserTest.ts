import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { assert } from 'chai';

import Env from 'tinymce/core/api/Env';
import { BlobCache } from 'tinymce/core/api/file/BlobCache';
import DomParser from 'tinymce/core/api/html/DomParser';
import AstNode from 'tinymce/core/api/html/Node';
import Schema from 'tinymce/core/api/html/Schema';
import HtmlSerializer from 'tinymce/core/api/html/Serializer';

describe('browser.tinymce.core.html.DomParserTest', () => {
  const schema = Schema({ valid_elements: '*[class|title]' });
  const serializer = HtmlSerializer({}, schema);
  let parser: DomParser;
  let root: AstNode;

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

  it('Parse element', () => {
    parser = DomParser({}, schema);
    root = parser.parse('<B title="title" class="class">test</B>');
    assert.equal(serializer.serialize(root), '<b class="class" title="title">test</b>', 'Inline element');
    assert.equal(root.firstChild.type, 1, 'Element type');
    assert.equal(root.firstChild.name, 'b', 'Element name');
    assert.deepEqual(
      root.firstChild.attributes, [{ name: 'title', value: 'title' },
        { name: 'class', value: 'class' }],
      'Element attributes'
    );
    assert.deepEqual(countNodes(root), { 'body': 1, 'b': 1, '#text': 1 }, 'Element attributes (count)');

    parser = DomParser({}, schema);
    root = parser.parse('  \t\r\n  <SCRIPT>  \t\r\n   a < b > \t\r\n   </S' + 'CRIPT>   \t\r\n  ');
    assert.equal(serializer.serialize(root), '<script>  \t\r\n   a < b > \t\r\n   </s' + 'cript>', 'Retain code inside SCRIPT');
    assert.deepEqual(countNodes(root), { 'body': 1, 'script': 1, '#text': 1 }, 'Retain code inside SCRIPT (count)');
  });

  it('Whitespace', () => {
    parser = DomParser({}, schema);
    root = parser.parse('  \t\r\n  <B>  \t\r\n   test  \t\r\n   </B>   \t\r\n  ');
    assert.equal(serializer.serialize(root), ' <b> test </b> ', 'Redundant whitespace (inline element)');
    assert.deepEqual(countNodes(root), { 'body': 1, 'b': 1, '#text': 3 }, 'Redundant whitespace (inline element) (count)');

    parser = DomParser({}, schema);
    root = parser.parse('  \t\r\n  <P>  \t\r\n   test  \t\r\n   </P>   \t\r\n  ');
    assert.equal(serializer.serialize(root), '<p>test</p>', 'Redundant whitespace (block element)');
    assert.deepEqual(countNodes(root), { 'body': 1, 'p': 1, '#text': 1 }, 'Redundant whitespace (block element) (count)');

    parser = DomParser({}, schema);
    root = parser.parse('  \t\r\n  <SCRIPT>  \t\r\n   test  \t\r\n   </S' + 'CRIPT>   \t\r\n  ');
    assert.equal(
      serializer.serialize(root),
      '<script>  \t\r\n   test  \t\r\n   </s' + 'cript>',
      'Whitespace around and inside SCRIPT'
    );
    assert.deepEqual(countNodes(root), { 'body': 1, 'script': 1, '#text': 1 }, 'Whitespace around and inside SCRIPT (count)');

    parser = DomParser({}, schema);
    root = parser.parse('  \t\r\n  <STYLE>  \t\r\n   test  \t\r\n   </STYLE>   \t\r\n  ');
    assert.equal(serializer.serialize(root), '<style>  \t\r\n   test  \t\r\n   </style>', 'Whitespace around and inside STYLE');
    assert.deepEqual(countNodes(root), { 'body': 1, 'style': 1, '#text': 1 }, 'Whitespace around and inside STYLE (count)');

    parser = DomParser({}, schema);
    root = parser.parse('<ul>\n<li>Item 1\n<ul>\n<li>\n \t Indented \t \n</li>\n</ul>\n</li>\n</ul>\n');
    assert.equal(
      serializer.serialize(root),
      '<ul><li>Item 1<ul><li>Indented</li></ul></li></ul>',
      'Whitespace around and inside blocks (ul/li)'
    );
    assert.deepEqual(countNodes(root), { 'body': 1, 'li': 2, 'ul': 2, '#text': 2 }, 'Whitespace around and inside blocks (ul/li) (count)');

    parser = DomParser({}, Schema({ invalid_elements: 'hr,br' }));
    root = parser.parse(
      '\n<hr />\n<br />\n<div>\n<hr />\n<br />\n<img src="file.gif" data-mce-src="file.gif" />\n<hr />\n<br />\n</div>\n<hr />\n<br />\n'
    );
    assert.equal(
      serializer.serialize(root),
      '<div><img src="file.gif" data-mce-src="file.gif" /></div>',
      'Whitespace where SaxParser will produce multiple whitespace nodes'
    );
    assert.deepEqual(
      countNodes(root),
      { body: 1, div: 1, img: 1 },
      'Whitespace where SaxParser will produce multiple whitespace nodes (count)'
    );
  });

  it('Whitespace before/after invalid element with text in block', () => {
    parser = DomParser({}, Schema({ invalid_elements: 'em' }));
    root = parser.parse('<p>a <em>b</em> c</p>');
    assert.equal(serializer.serialize(root), '<p>a b c</p>');
  });

  it('Whitespace before/after invalid element whitespace element in block', () => {
    parser = DomParser({}, Schema({ invalid_elements: 'span' }));
    root = parser.parse('<p> <span></span> </p>');
    assert.equal(serializer.serialize(root), '<p>\u00a0</p>');
  });

  it('Whitespace preserved in PRE', () => {
    parser = DomParser({}, schema);
    root = parser.parse('  \t\r\n  <PRE>  \t\r\n   test  \t\r\n   </PRE>   \t\r\n  ');
    assert.equal(serializer.serialize(root), '<pre>  \t\r\n   test  \t\r\n   </pre>', 'Whitespace around and inside PRE');
    assert.deepEqual(countNodes(root), { 'body': 1, 'pre': 1, '#text': 1 }, 'Whitespace around and inside PRE (count)');

    parser = DomParser({}, schema);
    root = parser.parse('<PRE>  </PRE>');
    assert.equal(serializer.serialize(root), '<pre>  </pre>', 'Whitespace around and inside PRE');
    assert.deepEqual(countNodes(root), { 'body': 1, 'pre': 1, '#text': 1 }, 'Whitespace around and inside PRE (count)');
  });

  it('Whitespace preserved in SPAN inside PRE', () => {
    parser = DomParser({}, schema);
    root = parser.parse('  \t\r\n  <PRE>  \t\r\n  <span>    test    </span> \t\r\n   </PRE>   \t\r\n  ');
    assert.equal(
      serializer.serialize(root),
      '<pre>  \t\r\n  <span>    test    </span> \t\r\n   </pre>',
      'Whitespace around and inside PRE'
    );
    assert.deepEqual(countNodes(root), { 'body': 1, 'pre': 1, 'span': 1, '#text': 3 }, 'Whitespace around and inside PRE (count)');
  });

  it('Whitespace preserved in code', () => {
    parser = DomParser({}, schema);
    root = parser.parse('<code>  a  </code>');
    assert.equal(serializer.serialize(root), '<code>  a  </code>', 'Whitespace inside code');
    assert.deepEqual(countNodes(root), { 'body': 1, 'code': 1, '#text': 1 }, 'Whitespace inside code (count)');

    parser = DomParser({}, schema);
    root = parser.parse('<code>  </code>');
    assert.equal(serializer.serialize(root), '<code>  </code>', 'Whitespace inside code');
    assert.deepEqual(countNodes(root), { 'body': 1, 'code': 1, '#text': 1 }, 'Whitespace inside code (count)');
  });

  it('Parse invalid contents', () => {
    let parser, root;

    parser = DomParser({}, schema);
    root = parser.parse('<p class="a"><p class="b">123</p></p>');
    assert.equal(serializer.serialize(root), '<p class="b">123</p>', 'P in P, no nodes before/after');
    assert.deepEqual(countNodes(root), { 'body': 1, 'p': 1, '#text': 1 }, 'P in P, no nodes before/after (count)');

    parser = DomParser({}, schema);
    root = parser.parse('<p class="a">a<p class="b">b</p><p class="c">c</p>d</p>');
    assert.equal(
      serializer.serialize(root),
      '<p class="a">a</p><p class="b">b</p><p class="c">c</p><p class="a">d</p>',
      'Two P in P, no nodes before/after'
    );
    assert.deepEqual(countNodes(root), { 'body': 1, 'p': 4, '#text': 4 }, 'Two P in P, no nodes before/after (count)');

    parser = DomParser({}, schema);
    root = parser.parse('<p class="a">abc<p class="b">def</p></p>');
    assert.equal(serializer.serialize(root), '<p class="a">abc</p><p class="b">def</p>', 'P in P with nodes before');
    assert.deepEqual(countNodes(root), { 'body': 1, 'p': 2, '#text': 2 }, 'P in P with nodes before (count)');

    parser = DomParser({}, schema);
    root = parser.parse('<p class="a"><p class="b">abc</p>def</p>');
    assert.equal(serializer.serialize(root), '<p class="b">abc</p><p class="a">def</p>', 'P in P with nodes after');
    assert.deepEqual(countNodes(root), { 'body': 1, 'p': 2, '#text': 2 }, 'P in P with nodes after (count)');

    parser = DomParser({}, schema);
    root = parser.parse('<p class="a"><p class="b">abc</p><br></p>');
    assert.equal(serializer.serialize(root), '<p class="b">abc</p>', 'P in P with BR after');
    assert.deepEqual(countNodes(root), { 'body': 1, 'p': 1, '#text': 1 }, 'P in P with BR after (count)');

    parser = DomParser({}, schema);
    root = parser.parse('<p class="a">a<strong>b<span>c<em>d<p class="b">e</p>f</em>g</span>h</strong>i</p>');
    assert.equal(
      serializer.serialize(root),
      '<p class="a">a<strong>b<span>c<em>d</em></span></strong></p><p class="b">e</p>' +
      '<p class="a"><strong><span><em>f</em>g</span>h</strong>i</p>',
      'P in P wrapped in inline elements'
    );
    assert.deepEqual(
      countNodes(root),
      { 'body': 1, 'p': 3, '#text': 9, 'strong': 2, 'span': 2, 'em': 2 },
      'P in P wrapped in inline elements (count)'
    );

    parser = DomParser({}, schema);
    root = parser.parse('<p class="a">a<p class="b">b<p class="c">c</p>d</p>e</p>');
    assert.equal(
      serializer.serialize(root),
      '<p class="a">a</p><p class="b">b</p><p class="c">c</p><p class="b">d</p><p class="a">e</p>',
      'P in P in P with text before/after'
    );
    assert.deepEqual(countNodes(root), { 'body': 1, 'p': 5, '#text': 5 }, 'P in P in P with text before/after (count)');

    parser = DomParser({}, schema);
    root = parser.parse('<p>a<ul><li>b</li><li>c</li></ul>d</p>');
    assert.equal(serializer.serialize(root), '<p>a</p><ul><li>b</li><li>c</li></ul><p>d</p>', 'UL inside P');
    assert.deepEqual(countNodes(root), { 'body': 1, 'p': 2, 'ul': 1, 'li': 2, '#text': 4 }, 'UL inside P (count)');

    parser = DomParser({}, schema);
    root = parser.parse('<table><tr><td><tr>a</tr></td></tr></table>');
    assert.equal(serializer.serialize(root), '<table><tr><td>a</td></tr></table>', 'TR inside TD');
    assert.deepEqual(countNodes(root), { 'body': 1, 'table': 1, 'tr': 1, 'td': 1, '#text': 1 }, 'TR inside TD (count)');

    parser = DomParser({}, Schema({ valid_elements: 'p,section,div' }));
    root = parser.parse('<div><section><p>a</p></section></div>');
    assert.equal(serializer.serialize(root), '<div><section><p>a</p></section></div>', 'P inside SECTION');
    assert.deepEqual(countNodes(root), { 'body': 1, 'div': 1, 'section': 1, 'p': 1, '#text': 1 }, 'P inside SECTION (count)');
  });

  it('Remove empty nodes', () => {
    parser = DomParser({}, Schema({ valid_elements: '-p,-span[id|style],-strong' }));
    root = parser.parse(
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
    const parser = DomParser({}, schema);
    parser.addNodeFilter('p', (nodes) => {
      Arr.each(nodes, (node) => {
        node.attr('class', 'x');
      });
    });
    const root = parser.parse('<p>a<p>123</p>b</p>');
    assert.equal(serializer.serialize(root), '<p class="x">a</p><p class="x">123</p><p class="x">b</p>', 'P should have class x');
  });

  it('Parse invalid contents with attribute filters', () => {
    const parser = DomParser({}, schema);
    parser.addAttributeFilter('class', (nodes) => {
      Arr.each(nodes, (node) => {
        node.attr('class', 'x');
      });
    });
    const root = parser.parse('<p class="y">a<p class="y">123</p>b</p>');
    assert.equal(serializer.serialize(root), '<p class="x">a</p><p class="x">123</p><p class="x">b</p>', 'P should have class x');
  });

  it('addNodeFilter', () => {
    let result;

    const parser = DomParser({}, schema);
    parser.addNodeFilter('#comment', (nodes, name, args) => {
      result = { nodes, name, args };
    });
    parser.parse('text<!--text1-->text<!--text2-->');

    assert.deepEqual(result.args, {}, 'Parser args');
    assert.equal(result.name, '#comment', 'Parser filter result name');
    assert.equal(result.nodes.length, 2, 'Parser filter result node');
    assert.equal(result.nodes[0].name, '#comment', 'Parser filter result node(0) name');
    assert.equal(result.nodes[0].value, 'text1', 'Parser filter result node(0) value');
    assert.equal(result.nodes[1].name, '#comment', 'Parser filter result node(1) name');
    assert.equal(result.nodes[1].value, 'text2', 'Parser filter result node(1) value');
  });

  it('addNodeFilter multiple names', () => {
    const results = {};

    const parser = DomParser({}, schema);
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
    let result;

    const parser = DomParser({}, schema);
    parser.addNodeFilter('#comment', (nodes, name, args) => {
      result = { nodes, name, args };
    });
    parser.parse('text<!--text1-->text<!--text2-->', { value: 1 });

    assert.deepEqual(result.args, { value: 1 }, 'Parser args');
  });

  it('addAttributeFilter', () => {
    let result;

    const parser = DomParser({});
    parser.addAttributeFilter('src', (nodes, name, args) => {
      result = { nodes, name, args };
    });
    parser.parse('<b>a<img src="1.gif" />b<img src="1.gif" />c</b>');

    assert.deepEqual(result.args, {}, 'Parser args');
    assert.equal(result.name, 'src', 'Parser filter result name');
    assert.equal(result.nodes.length, 2, 'Parser filter result node');
    assert.equal(result.nodes[0].name, 'img', 'Parser filter result node(0) name');
    assert.equal(result.nodes[0].attr('src'), '1.gif', 'Parser filter result node(0) attr');
    assert.equal(result.nodes[1].name, 'img', 'Parser filter result node(1) name');
    assert.equal(result.nodes[1].attr('src'), '1.gif', 'Parser filter result node(1) attr');
  });

  it('addAttributeFilter multiple', () => {
    const results: any = {};

    const parser = DomParser({});
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

  it('Fix orphan LI elements', () => {
    let parser = DomParser({}, schema);
    root = parser.parse('<ul><li>a</li></ul><li>b</li>');
    assert.equal(serializer.serialize(root), '<ul><li>a</li><li>b</li></ul>', 'LI moved to previous sibling UL');

    parser = DomParser({}, schema);
    root = parser.parse('<li>a</li><ul><li>b</li></ul>');
    assert.equal(serializer.serialize(root), '<ul><li>a</li><li>b</li></ul>', 'LI moved to next sibling UL');

    parser = DomParser({}, schema);
    root = parser.parse('<ol><li>a</li></ol><li>b</li>');
    assert.equal(serializer.serialize(root), '<ol><li>a</li><li>b</li></ol>', 'LI moved to previous sibling OL');

    parser = DomParser({}, schema);
    root = parser.parse('<li>a</li><ol><li>b</li></ol>');
    assert.equal(serializer.serialize(root), '<ol><li>a</li><li>b</li></ol>', 'LI moved to next sibling OL');

    parser = DomParser({}, schema);
    root = parser.parse('<li>a</li>');
    assert.equal(serializer.serialize(root), '<ul><li>a</li></ul>', 'LI wrapped in new UL');
  });

  it('Remove empty elements', () => {
    let parser;
    const schema = Schema({ valid_elements: 'span,-a,img' });

    parser = DomParser({}, schema);
    root = parser.parse('<span></span><a href="#"></a>');
    assert.equal(serializer.serialize(root), '<span></span>', 'Remove empty a element');

    parser = DomParser({}, Schema({ valid_elements: 'span,a[name],img' }));
    root = parser.parse('<span></span><a name="anchor"></a>');
    assert.equal(serializer.serialize(root), '<span></span><a name="anchor"></a>', 'Leave a with name attribute');

    parser = DomParser({}, Schema({ valid_elements: 'span,a[href],img[src]' }));
    root = parser.parse('<span></span><a href="#"><img src="about:blank" /></a>');
    assert.equal(
      serializer.serialize(root),
      '<span></span><a href="#"><img src="about:blank" /></a>',
      'Leave elements with img in it'
    );
  });

  it('Self closing list elements', () => {
    const schema = Schema();

    const parser = DomParser({}, schema);
    const root = parser.parse('<ul><li>1<li><b>2</b><li><em><b>3</b></em></ul>');
    assert.equal(
      serializer.serialize(root),
      '<ul><li>1</li><li><strong>2</strong></li><li><em><strong>3</strong></em></li></ul>',
      'Split out LI elements in LI elements.'
    );
  });

  it('Remove redundant br elements', () => {
    const schema = Schema();

    const parser = DomParser({ remove_trailing_brs: true }, schema);
    const root = parser.parse(
      '<p>a<br></p>' +
      '<p>a<br>b<br></p>' +
      '<p>a<br><br></p><p>a<br><span data-mce-type="bookmark"></span><br></p>' +
      '<p>a<span data-mce-type="bookmark"></span><br></p>'
    );
    assert.equal(
      serializer.serialize(root),
      '<p>a</p><p>a<br />b</p><p>a<br /><br /></p><p>a<br /><br /></p><p>a</p>',
      'Remove traling br elements.'
    );
  });

  it('Replace br with nbsp when wrapped in two inline elements and one block', () => {
    const schema = Schema();

    const parser = DomParser({ remove_trailing_brs: true }, schema);
    const root = parser.parse('<p><strong><em><br /></em></strong></p>');
    assert.equal(serializer.serialize(root), '<p><strong><em>\u00a0</em></strong></p>');
  });

  it('Replace br with nbsp when wrapped in an inline element and placed in the root', () => {
    const schema = Schema();

    const parser = DomParser({ remove_trailing_brs: true }, schema);
    const root = parser.parse('<strong><br /></strong>');
    assert.equal(serializer.serialize(root), '<strong>\u00a0</strong>');
  });

  it(`Don't replace br inside root element when there is multiple brs`, () => {
    const schema = Schema();

    const parser = DomParser({ remove_trailing_brs: true }, schema);
    const root = parser.parse('<strong><br /><br /></strong>');
    assert.equal(serializer.serialize(root), '<strong><br /><br /></strong>');
  });

  it(`Don't replace br inside root element when there is siblings`, () => {
    const schema = Schema();

    const parser = DomParser({ remove_trailing_brs: true }, schema);
    const root = parser.parse('<strong><br /></strong><em>x</em>');
    assert.equal(serializer.serialize(root), '<strong><br /></strong><em>x</em>');
  });

  it('Remove br in invalid parent bug', () => {
    const schema = Schema({ valid_elements: 'br' });

    const parser = DomParser({ remove_trailing_brs: true }, schema);
    const root = parser.parse('<br>');
    assert.equal(serializer.serialize(root), '', 'Remove traling br elements.');
  });

  it('Forced root blocks', () => {
    const schema = Schema();

    const parser = DomParser({ forced_root_block: 'p' }, schema);
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

    const parser = DomParser({ forced_root_block: 'p', forced_root_block_attrs: { class: 'class1' }}, schema);
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

    const parser = DomParser({ fix_list_elements: true }, schema);
    const root = parser.parse('<ul><ul><li>a</li></ul></ul><ul><li>a</li><ul><li>b</li></ul></ul>');
    assert.equal(
      serializer.serialize(root),
      '<ul><li style="list-style-type: none"><ul><li>a</li></ul></li></ul><ul><li>a<ul><li>b</li></ul></li></ul>'
    );
  });

  it('Parse contents with html4 anchors and allow_html_in_named_anchor: false', () => {
    const schema = Schema();

    const parser = DomParser({ allow_html_in_named_anchor: false }, schema);
    const root = parser.parse('<a name="x">a</a><a href="x">x</a>');
    assert.equal(serializer.serialize(root), '<a name="x"></a>a<a href="x">x</a>');
  });

  it('Parse contents with html5 anchors and allow_html_in_named_anchor: false', () => {
    const schema = Schema({ schema: 'html5' });

    const parser = DomParser({ allow_html_in_named_anchor: false }, schema);
    const root = parser.parse('<a id="x">a</a><a href="x">x</a>');
    assert.equal(serializer.serialize(root), '<a id="x"></a>a<a href="x">x</a>');
  });

  it('Parse contents with html4 anchors and allow_html_in_named_anchor: true', () => {
    const schema = Schema();

    const parser = DomParser({ allow_html_in_named_anchor: true }, schema);
    const root = parser.parse('<a name="x">a</a><a href="x">x</a>');
    assert.equal(serializer.serialize(root), '<a name="x">a</a><a href="x">x</a>');
  });

  it('Parse contents with html5 anchors and allow_html_in_named_anchor: true', () => {
    const schema = Schema({ schema: 'html5' });

    const parser = DomParser({ allow_html_in_named_anchor: true }, schema);
    const root = parser.parse('<a id="x">a</a><a href="x">x</a>');
    assert.equal(serializer.serialize(root), '<a id="x">a</a><a href="x">x</a>');
  });

  it('Parse contents with html5 self closing datalist options', () => {
    const schema = Schema({ schema: 'html5' });

    const parser = DomParser({}, schema);
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

    const parser = DomParser({}, schema);
    const root = parser.parse('<b>1</b> 2<p>3</p>');
    assert.equal(serializer.serialize(root), '<b>1</b> 2<p>3</p>');
  });

  it('Invalid text blocks within a li', () => {
    const schema = Schema({ schema: 'html5', valid_children: '-li[p]' });

    const parser = DomParser({}, schema);
    const root = parser.parse('<ul><li>1<p>2</p></li><li>a<p>b</p><p>c</p></li></ul>');
    assert.equal(serializer.serialize(root), '<ul><li>12</li><li>ab</li><li>c</li></ul>');
  });

  it('Invalid inline element with space before', () => {
    const schema = Schema();

    const parser = DomParser({}, schema);
    const root = parser.parse('<p><span>1</span> <strong>2</strong></p>');
    assert.equal(serializer.serialize(root), '<p>1 <strong>2</strong></p>');
  });

  it('Valid classes', () => {
    const schema = Schema({ valid_classes: 'classA classB' });

    const parser = DomParser({}, schema);
    const root = parser.parse('<p class="classA classB classC">a</p>');
    assert.equal(serializer.serialize(root), '<p class="classA classB">a</p>');
  });

  it('Valid classes multiple elements', () => {
    const schema = Schema({ valid_classes: { '*': 'classA classB', 'strong': 'classC' }});

    const parser = DomParser({}, schema);
    const root = parser.parse('<p class="classA classB classC"><strong class="classA classB classC classD">a</strong></p>');
    assert.equal(serializer.serialize(root), '<p class="classA classB"><strong class="classA classB classC">a</strong></p>');
  });

  it('Pad empty list blocks', () => {
    const schema = Schema();

    const parser = DomParser({}, schema);
    const root = parser.parse('<ul><li></li></ul><ul><li> </li></ul>');
    assert.equal(serializer.serialize(root), '<ul><li>\u00a0</li></ul><ul><li>\u00a0</li></ul>');
  });

  it('Pad empty with br', () => {
    const schema = Schema();
    const parser = DomParser({ padd_empty_with_br: true }, schema);
    const serializer = HtmlSerializer({ }, schema);
    const root = parser.parse('<p>a</p><p></p>');
    assert.equal(serializer.serialize(root), '<p>a</p><p><br /></p>');
  });

  it('Pad empty and preffer br on insert', () => {
    const schema = Schema();

    const parser = DomParser({}, schema);
    const root = parser.parse('<ul><li></li><li> </li><li><br /></li><li>\u00a0</li><li>a</li></ul>', { insert: true });
    assert.equal(serializer.serialize(root), '<ul><li><br /></li><li><br /></li><li><br /></li><li><br /></li><li>a</li></ul>');
  });

  it('Preserve space in inline span', () => {
    const schema = Schema();

    const parser = DomParser({}, schema);
    const root = parser.parse('a<span> </span>b');
    assert.equal(serializer.serialize(root), 'a b');
  });

  it('Bug #7543 removes whitespace between bogus elements before a block', () => {
    const serializer = HtmlSerializer();

    assert.equal(
      serializer.serialize(DomParser().parse(
        '<div><b data-mce-bogus="1">a</b> <b data-mce-bogus="1">b</b><p>c</p></div>')
      ),
      '<div>a b<p>c</p></div>'
    );
  });

  it('Bug #7582 removes whitespace between bogus elements before a block', () => {
    const serializer = HtmlSerializer();

    assert.equal(
      serializer.serialize(DomParser().parse(
        '<div>1 <span data-mce-bogus="1">2</span><div>3</div></div>')
      ),
      '<div>1 2<div>3</div></div>'
    );
  });

  it('do not replace starting linebreak with space', () => {
    const serializer = HtmlSerializer();

    assert.equal(
      serializer.serialize(DomParser().parse('<p>a<br />\nb</p>')),
      '<p>a<br />b</p>'
    );
  });

  it('parse iframe XSS', () => {
    const serializer = HtmlSerializer();

    assert.equal(
      serializer.serialize(DomParser().parse('<iframe><textarea></iframe><img src="a" onerror="alert(document.domain)" />')),
      '<iframe><textarea></iframe><img src="a" />'
    );
  });

  it('getAttributeFilters/getNodeFilters', () => {
    const parser = DomParser();
    const cb1 = (_nodes, _name, _args) => {};
    const cb2 = (_nodes, _name, _args) => {};

    parser.addAttributeFilter('attr', cb1);
    parser.addNodeFilter('node', cb2);

    const attrFilters = parser.getAttributeFilters();
    const nodeFilters = parser.getNodeFilters();

    assert.deepEqual(attrFilters[attrFilters.length - 1], { name: 'attr', callbacks: [ cb1 ] }, 'Should be expected filter');
    assert.deepEqual(nodeFilters[nodeFilters.length - 1], { name: 'node', callbacks: [ cb2 ] }, 'Should be expected filter');
  });

  it('extract base64 uris to blobcache if blob cache is provided', () => {
    const blobCache = BlobCache();
    const parser = DomParser({ blob_cache: blobCache });
    const base64 = 'R0lGODdhDAAMAIABAMzMzP///ywAAAAADAAMAAACFoQfqYeabNyDMkBQb81Uat85nxguUAEAOw==';
    const base64Uri = `data:image/gif;base64,${base64}`;
    const serializedHtml = serializer.serialize(parser.parse(`<p><img src="${base64Uri}" /></p>`));
    const blobInfo = blobCache.findFirst((bi) => bi.base64() === base64);
    const blobUri = blobInfo.blobUri();

    assert.equal(
      serializedHtml,
      `<p><img src="${blobUri}" /></p>`,
      'Should be html with blob uri'
    );

    blobCache.destroy();
  });

  it('duplicate base64 uris added only once to blobcache if blob cache is provided', () => {
    const blobCache = BlobCache();
    const parser = DomParser({ blob_cache: blobCache });
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
    const parser = DomParser({ blob_cache: blobCache });
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
    const parser = DomParser();
    const html = '<p><img src="data:image/gif;base64,R0lGODdhDAAMAIABAMzMzP///ywAAAAADAAMAAACFoQfqYeabNyDMkBQb81Uat85nxguUAEAOw==" /></p>';
    const serializedHtml = serializer.serialize(parser.parse(html));

    assert.equal(serializedHtml, html, 'Should be html with base64 uri retained');
  });

  it('TINY-7756: Parsing invalid nested children', () => {
    const parser = DomParser();
    const html = '<table><button><a><meta></meta></a></button></table>';
    const serializedHtml = serializer.serialize(parser.parse(html));

    assert.equal(serializedHtml, '<table></table>', 'Should remove all invalid children but keep empty table');
  });

  it('TINY-7756: Parsing invalid nested children with a valid child between', () => {
    const parser = DomParser();
    const html =
      '<table>' +
        '<tbody>' +
          '<tr>' +
            '<td>' +
              '<meta>' +
                '<button>' +
                  '<img/>' +
                  '<button>' +
                    '<a>' +
                      '<meta></meta>' +
                    '</a>' +
                  '</button>' +
                  '<img/>' +
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
                '<img />' +
                '<button>' +
                  '<a></a>' +
                '</button>' +
                '<img />' +
              '</button>' +
            '</td>' +
          '</tr>' +
        '</tbody>' +
      '</table>'
    );
  });

  it('TINY-8639: handling empty text inline elements when root block is empty', () => {
    const html = '<p><strong></strong></p>' +
    '<p><s></s></p>' +
    '<p><span class="test"></span></p>' +
    '<p><span style="color: red;"></span></p>' +
    '<p><span></span></p>';

    // Assert default behaviour when padd_empty_block_inline_children is not specified (should be equivalent to false)
    let parser = DomParser({}, Schema({}));
    let serializedHtml = serializer.serialize(parser.parse(html));

    assert.equal(serializedHtml,
      '<p>\u00a0</p>' +
      '<p>\u00a0</p>' +
      '<p>\u00a0</p>' +
      '<p>\u00a0</p>' +
      '<p>\u00a0</p>'
    );

    parser = DomParser({}, Schema({ padd_empty_block_inline_children: false }));
    serializedHtml = serializer.serialize(parser.parse(html));

    assert.equal(serializedHtml,
      '<p>\u00a0</p>' +
      '<p>\u00a0</p>' +
      '<p>\u00a0</p>' +
      '<p>\u00a0</p>' +
      '<p>\u00a0</p>'
    );

    parser = DomParser({}, Schema({ padd_empty_block_inline_children: true }));
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
    let parser = DomParser({}, Schema({}));
    let serializedHtml = serializer.serialize(parser.parse(html));

    assert.equal(serializedHtml,
      '<p><strong> </strong></p>' +
      '<p><s> </s></p>' +
      // isEmpty node logic considers a span with no style attribute and a single space to be empty (Node.ts -> isEmpty -> isEmptyTextNode)
      '<p>\u00a0</p>' +
      '<p><span style="color: red;"> </span></p>' +
      '<p>\u00a0</p>'
    );

    parser = DomParser({}, Schema({ padd_empty_block_inline_children: false }));
    serializedHtml = serializer.serialize(parser.parse(html));

    assert.equal(serializedHtml,
      '<p><strong> </strong></p>' +
      '<p><s> </s></p>' +
      // isEmpty node logic considers a span with no style attribute and a single space to be empty (Node.ts -> isEmpty -> isEmptyTextNode)
      '<p>\u00a0</p>' +
      '<p><span style="color: red;"> </span></p>' +
      '<p>\u00a0</p>'
    );

    parser = DomParser({}, Schema({ padd_empty_block_inline_children: true }));
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
    let parser = DomParser({}, Schema({}));
    let serializedHtml = serializer.serialize(parser.parse(html));

    assert.equal(serializedHtml,
      '<p><strong>\u00a0</strong></p>' +
      '<p><s>\u00a0</s></p>' +
      '<p><span class="test">\u00a0</span></p>' +
      '<p><span style="color: red;">\u00a0</span></p>' +
      '<p>\u00a0</p>'
    );

    parser = DomParser({}, Schema({ padd_empty_block_inline_children: false }));
    serializedHtml = serializer.serialize(parser.parse(html));

    assert.equal(serializedHtml,
      '<p><strong>\u00a0</strong></p>' +
      '<p><s>\u00a0</s></p>' +
      '<p><span class="test">\u00a0</span></p>' +
      '<p><span style="color: red;">\u00a0</span></p>' +
      '<p>\u00a0</p>'
    );

    parser = DomParser({}, Schema({ padd_empty_block_inline_children: true }));
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
    let parser = DomParser({}, Schema({}));
    let serializedHtml = serializer.serialize(parser.parse(html));

    assert.equal(serializedHtml,
      '<p>abcd</p>' +
      '<p>abcd</p>' +
      '<p>abcd</p>' +
      '<p>abcd</p>' +
      '<p>abcd</p>'
    );

    parser = DomParser({}, Schema({ padd_empty_block_inline_children: false }));
    serializedHtml = serializer.serialize(parser.parse(html));

    assert.equal(serializedHtml,
      '<p>abcd</p>' +
      '<p>abcd</p>' +
      '<p>abcd</p>' +
      '<p>abcd</p>' +
      '<p>abcd</p>'
    );

    parser = DomParser({}, Schema({ padd_empty_block_inline_children: true }));
    serializedHtml = serializer.serialize(parser.parse(html));

    assert.equal(serializedHtml,
      '<p>abcd</p>' +
      '<p>abcd</p>' +
      '<p>abcd</p>' +
      '<p>abcd</p>' +
      '<p>abcd</p>'
    );
  });
});
