import { Assert, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';

import type { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import * as SugarFragment from 'ephox/sugar/api/node/SugarFragment';
import * as SugarNode from 'ephox/sugar/api/node/SugarNode';
import * as Attribute from 'ephox/sugar/api/properties/Attribute';
import * as TextContent from 'ephox/sugar/api/properties/TextContent';
import * as Traverse from 'ephox/sugar/api/search/Traverse';

describe('SugarFragment.fromHtml', () => {
  it('TINY-13461: should return fragment', () => {
    const html = '<div>content</div>';
    const fragment = SugarFragment.fromHtml(html);
    Assert.eq('Should be fragment', SugarNode.isDocumentFragment(fragment), true);
  });

  it('TINY-13461: should create fragment from single element', () => {
    const html = '<div>content</div>';
    const fragment = SugarFragment.fromHtml(html);
    const children = Traverse.children(fragment);

    Assert.eq('Should have 1 child', children.length, 1);
    Assert.eq('Should be div', SugarNode.name(children[0]), 'div');
    Assert.eq('Content should match', TextContent.get(children[0]), 'content');
  });

  it('TINY-13461: should create fragment from multiple sibling elements', () => {
    const html = '<td>Cell 1</td><td>Cell 2</td><td>Cell 3</td>';
    const fragment = SugarFragment.fromHtml(html);
    const children = Traverse.children(fragment);

    Assert.eq('Should have 3 children', children.length, 3);
    Arr.each(children, (child, i) => {
      Assert.eq('Should be td', SugarNode.name(child), 'td');
      Assert.eq('Content should match', TextContent.get(child), `Cell ${i + 1}`);
    });
  });

  it('TINY-13461: should create fragment from nested elements', () => {
    const html = '<div><p>Paragraph 1</p><p>Paragraph 2</p></div>';
    const fragment = SugarFragment.fromHtml(html);
    const children = Traverse.children(fragment);

    Assert.eq('Should have 1 root child', children.length, 1);
    Assert.eq('Should be div', SugarNode.name(children[0]), 'div');

    const nestedChildren = Traverse.children(children[0]);
    Assert.eq('Should have 2 nested children', nestedChildren.length, 2);
    Assert.eq('First nested should be p', SugarNode.name(nestedChildren[0]), 'p');
    Assert.eq('Second nested should be p', SugarNode.name(nestedChildren[1]), 'p');
  });

  it('TINY-13461: should create fragment from text and elements mixed', () => {
    const html = 'Text before<span>span content</span>Text after';
    const fragment = SugarFragment.fromHtml(html);
    const children = Traverse.children(fragment);

    Assert.eq('Should have 3 children', children.length, 3);
    Assert.eq('First should be text', SugarNode.isText(children[0]), true);
    Assert.eq('Second should be span', SugarNode.name(children[1]), 'span');
    Assert.eq('Third should be text', SugarNode.isText(children[2]), true);
  });

  it('TINY-13461: should create fragment from empty string', () => {
    const html = '';
    const fragment = SugarFragment.fromHtml(html);
    const children = Traverse.children(fragment);

    Assert.eq('Should have no children', children.length, 0);
  });

  it('TINY-13461: should create fragment with attributes preserved', () => {
    const html = '<div class="test" id="myid" data-custom="value">content</div>';
    const fragment = SugarFragment.fromHtml(html);
    const children = Traverse.children(fragment);

    Assert.eq('Should have 1 child', children.length, 1);
    Assert.eq('Should have class', Attribute.get(children[0] as SugarElement<Element>, 'class'), 'test');
    Assert.eq('Should have id', Attribute.get(children[0] as SugarElement<Element>, 'id'), 'myid');
    Assert.eq('Should have data attr', Attribute.get(children[0] as SugarElement<Element>, 'data-custom'), 'value');
  });

  it('TINY-13461: should handle rwo without table structure', () => {
    const html = '<tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr>';
    const fragment = SugarFragment.fromHtml(html);
    const children = Traverse.children(fragment);

    Assert.eq('Should have 2 rows', children.length, 2);
    Arr.each(children, (row) => {
      Assert.eq('Should be tr', SugarNode.name(row), 'tr');
      const cells = Traverse.children(row);
      Assert.eq('Should have 2 cells', cells.length, 2);
    });
  });

  it('TINY-13461: should handle self-closing tags', () => {
    const html = '<img src="test.jpg" alt="test"><br><input type="text">';
    const fragment = SugarFragment.fromHtml(html);
    const children = Traverse.children(fragment);

    Assert.eq('Should have 3 children', children.length, 3);
    Assert.eq('First should be img', SugarNode.name(children[0]), 'img');
    Assert.eq('Second should be br', SugarNode.name(children[1]), 'br');
    Assert.eq('Third should be input', SugarNode.name(children[2]), 'input');
  });

  it('TINY-13461: should handle whitespace-only content', () => {
    const html = '   \n\t   ';
    const fragment = SugarFragment.fromHtml(html);
    const children = Traverse.children(fragment);

    Assert.eq('Should have text node', children.length > 0, true);
  });

  it('TINY-13461: should create fragment with custom scope document', () => {
    const customDoc = document.implementation.createHTMLDocument('test');
    const html = '<div>scoped content</div>';
    const fragment = SugarFragment.fromHtml(html, customDoc);
    const children = Traverse.children(fragment);

    Assert.eq('Should have 1 child', children.length, 1);
    Assert.eq('Should belong to custom document', children[0].dom.ownerDocument, customDoc);
  });

  it('TINY-13461: should handle malformed HTML', () => {
    const html = '<div><p>unclosed';
    const fragment = SugarFragment.fromHtml(html);
    const children = Traverse.children(fragment);
    Assert.eq('Should still create fragment', children.length > 0, true);

    const firstChild = children[0];
    Assert.eq('First child should be div', SugarNode.name(firstChild), 'div');

    const nestedChildren = Traverse.children(firstChild);
    Assert.eq('Div should have 1 child', nestedChildren.length, 1);
    Assert.eq('Nested child should be p', SugarNode.name(nestedChildren[0]), 'p');
    Assert.eq('Paragraph content should match', TextContent.get(nestedChildren[0]), 'unclosed');
  });

  it('TINY-13461: should handle script tags', () => {
    const html = '<div>before</div><script>alert("test")</script><div>after</div>';
    const fragment = SugarFragment.fromHtml(html);
    const children = Traverse.children(fragment);

    Assert.eq('Should have 3 children', children.length, 3);
    Assert.eq('Middle should be script', SugarNode.name(children[1]), 'script');
  });

  it('TINY-13461: should handle comments', () => {
    const html = '<div>content</div><!-- comment --><span>more</span>';
    const fragment = SugarFragment.fromHtml(html);
    const children = Traverse.children(fragment);

    Assert.eq('Should include comment node', children.length, 3);
    Assert.eq('Middle should be comment', SugarNode.isComment(children[1]), true);
  });

  it('TINY-13461: should handle HTML entities', () => {
    const html = '<div>&lt;span&gt;&amp;&copy;</div>';
    const fragment = SugarFragment.fromHtml(html);
    const children = Traverse.children(fragment);

    Assert.eq('Should decode entities', TextContent.get(children[0]), '<span>&©');
  });

  it('TINY-13461: should handle special characters', () => {
    const html = '<div>Hello "world" & \'test\'</div>';
    const fragment = SugarFragment.fromHtml(html);
    const children = Traverse.children(fragment);

    Assert.eq('Should preserve special chars', TextContent.get(children[0]), 'Hello "world" & \'test\'');
  });

  it('TINY-13461: should handle inline styles', () => {
    const html = '<div style="color: red; font-size: 14px;">styled</div>';
    const fragment = SugarFragment.fromHtml(html);
    const children = Traverse.children(fragment);

    Assert.eq('Should preserve style attribute', Attribute.has(children[0], 'style'), true);
  });
});
