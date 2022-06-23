import { Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { ApplyFormat } from 'tinymce/core/fmt/FormatTypes';
import * as Preview from 'tinymce/core/fmt/Preview';

describe('browser.tinymce.core.fmt.PreviewTest', () => {
  it('Preview.parseSelector', () => {
    assert.deepEqual(Preview.parseSelector('li.class1.class2#id1[attr1="1"]:disabled'), [
      {
        name: 'li',
        selector: 'li.class1.class2#id1[attr1="1"]:disabled',
        classes: [ 'class1', 'class2' ],
        attrs: {
          id: 'id1',
          attr1: '1',
          disabled: 'disabled'
        }
      }
    ], 'li.class1.class2#id1 ok');

    assert.deepEqual(Preview.parseSelector('ul.parent1 > li.class1.class2#id1'), [
      {
        name: 'li',
        selector: 'li.class1.class2#id1',
        classes: [ 'class1', 'class2' ],
        attrs: {
          id: 'id1'
        }
      },
      {
        name: 'ul',
        selector: 'ul.parent1',
        classes: [ 'parent1' ],
        attrs: {}
      }
    ], 'ul.parent1 > li.class1.class2#id1 ok');

    assert.deepEqual(Preview.parseSelector('div.class1 > ol.class2 + ul > li:hover'), [
      {
        name: 'li',
        selector: 'li:hover',
        classes: [],
        attrs: {}
      },
      {
        name: 'ul',
        selector: 'ul',
        classes: [],
        attrs: {},
        siblings: [
          {
            name: 'ol',
            selector: 'ol.class2',
            classes: [ 'class2' ],
            attrs: {}
          }
        ]
      },
      {
        name: 'div',
        selector: 'div.class1',
        classes: [ 'class1' ],
        attrs: {}
      }
    ], 'div.class1 > ol.class2 + ul > li:hover ok');

    assert.deepEqual(Preview.parseSelector('.class > *'), [
      {
        name: 'div',
        selector: '*',
        attrs: {},
        classes: []
      },
      {
        name: 'div',
        selector: '.class',
        classes: [ 'class' ],
        attrs: {}
      }
    ], '.class > * ok');

    assert.deepEqual(Preview.parseSelector('p + *'), [
      {
        name: 'div',
        selector: '*',
        attrs: {},
        classes: [],
        siblings: [
          {
            name: 'p',
            selector: 'p',
            attrs: {},
            classes: []
          }
        ]
      }
    ], 'p + * ok');

    assert.deepEqual(Preview.parseSelector('*.test'), [
      {
        name: '*',
        selector: '*.test',
        attrs: {},
        classes: [ 'test' ]
      }
    ], '*.test ok');
  });

  it('Preview.selectorToHtml', () => {
    const trimSpaces = (str: string) => str.replace(/>\s+</g, '><').replace(/^\s*|\s*$/g, '');

    const selectorToHtml = (selector: string) => Preview.selectorToHtml(selector).outerHTML;

    assert.equal(selectorToHtml('ul > li.class1'), trimSpaces([
      '<div>',
      '<ul>',
      '<li class="class1"></li>',
      '</ul>',
      '</div>'
    ].join('')), 'ul > li.class1 ok');

    assert.equal(selectorToHtml('ol + ul#id1 > li.class1[title="Some Title"]'), trimSpaces([
      '<div>',
      '<div>',
      '<ol></ol>',
      '<ul id="id1">',
      '  <li class="class1" title="Some Title"></li>',
      '</ul>',
      '</div>',
      '</div>'
    ].join('')), 'ol + ul#id1 > li.class1[title="Some Title"] ok');

    assert.equal(selectorToHtml('tr > th + td'), trimSpaces([
      '<div>',
      '<table>',
      '<tbody>',
      '<tr>',
      '<th></th>',
      '<td></td>',
      '</tr>',
      '</tbody>',
      '</table>',
      '</div>'
    ].join('')), 'tr > th + td (required parental structure properly rebuilt) ok');

    assert.equal(selectorToHtml('p li[title="Some Title"][alt="Some Alt"]'), trimSpaces([
      '<div>',
      '<p>',
      '<ul>',
      '<li title="Some Title" alt="Some Alt"></li>',
      '</ul>',
      '</p>',
      '</div>'
    ].join('')), 'p li[title="Some Title"][alt="Some Alt"] (test multiple spaced attributes) ok');
  });

  context('Preview.getCssText', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      add_unload_trigger: false,
      disable_nodechange: true,
      custom_elements: '~custom',
      extended_valid_elements: 'custom',
      entities: 'raw',
      indent: false,
      content_style: (
        'table .preview {' +
        'color: rgb(0, 255, 0);' + // green
        '}' +

        'ol .preview {' +
        'color: rgb(0, 0, 255);' + // blue
        '}' +

        '.preview {' +
        'color: rgb(255, 0, 0);' + // red
        '}'
      ),
      base_url: '/project/tinymce/js/tinymce'
    }, [], true);

    it('Check initial styles were loaded', () => {
      const editor = hook.editor();
      editor.setContent('<p class="preview">x</p>');
      return Waiter.pTryUntil(
        'Expected styles were not loaded',
        () => {
          const color = editor.dom.getStyle(editor.dom.select('p')[0], 'color', true);
          assert.include(color, '255', 'Did not get a color value of 255');
        });
    });

    it('Get preview css text for formats', () => {
      const editor = hook.editor();
      const getCssText = (format: string | ApplyFormat) => {
        return Preview.getCssText(editor, format);
      };

      assert.isTrue(/font-weight:(bold|700)/.test(getCssText('bold')),
        'Bold not found in preview style');

      assert.isTrue(/font-weight:(bold|700)/.test(getCssText({ inline: 'b' })),
        'Bold not found in preview style');

      assert.isFalse(/font-weight:(bold|700)/.test(getCssText({ inline: 'b', preview: 'font-size' })),
        'Bold should not be when we only preview font-size');

      assert.isTrue(/color:rgb\(255, 0, 0\)/.test(getCssText({ inline: 'custom', styles: { color: '#ff0000' }})),
        'Test preview of a custom element.');

      assert.isTrue(/color:rgb\(255, 0, 0\)/.test(getCssText({ inline: 'invalid', styles: { color: '#ff0000' }})),
        `Test preview of an invalid element shouldn't crash the editor .`);

      assert.isTrue(/color:rgb\(0, 255, 0\)/.test(getCssText({ selector: 'tr', classes: [ 'preview' ] })),
        'Style is properly inherited in preview for partial element (like TR).');

      assert.isTrue(/color:rgb\(255, 0, 0\)/.test(getCssText({ selector: 'li', classes: [ 'preview' ] })),
        'For LI element default required parent is UL.');

      assert.isTrue(/color:rgb\(0, 0, 255\)/.test(getCssText({ selector: 'ol li', classes: [ 'preview' ] })),
        'Parent explicitly present in the selector will have preference.');

      assert.isTrue(/color:rgb\(0, 0, 255\)/.test(getCssText({ selector: 'ol > li', classes: [ 'preview' ] })),
        'ol > li previewed properly.');

      assert.isTrue(/color:rgb\(0, 0, 255\)/.test(getCssText({
        selector: 'ol.someClass > li#someId[title="someTitle"]',
        classes: [ 'preview' ]
      })),
      'ol.someClass > li#someId[title="someTitle"] previewed properly.');

      assert.isTrue(/color:rgb\(0, 0, 255\)/.test(getCssText({
        selector: 'ul + ol.someClass > li#someId',
        classes: [ 'preview' ]
      })),
      'ul + ol.someClass > li#someId previewed properly.');

      assert.isTrue(/color:rgb\(0, 0, 255\)/.test(getCssText({ selector: 'ul li ol li', classes: [ 'preview' ] })),
        'ul li ol li previewed properly.');

      assert.isTrue(/color:rgb\(0, 255, 0\)/.test(getCssText({
        inline: 'span',
        styles: { color: '#00ff00' },
        attributes: {
          'lang': '%value',
          'data-mce-lang': Fun.constant(null)
        }
      })), 'Format with variable attribute values');
    });
  });
});
