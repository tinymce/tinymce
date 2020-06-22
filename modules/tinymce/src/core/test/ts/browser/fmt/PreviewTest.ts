import { Assertions, Logger, Pipeline, Step, Waiter } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyLoader } from '@ephox/mcagar';
import * as Preview from 'tinymce/core/fmt/Preview';
import Theme from 'tinymce/themes/silver/Theme';
import * as HtmlUtils from '../../module/test/HtmlUtils';

UnitTest.test('browser.tinymce.core.fmt.PreviewTest: Preview.parseSelector', () => {
  Assert.eq('li.class1.class2#id1 ok', [
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
  ], Preview.parseSelector('li.class1.class2#id1[attr1="1"]:disabled'));

  Assert.eq('ul.parent1 > li.class1.class2#id1 ok', [
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
  ], Preview.parseSelector('ul.parent1 > li.class1.class2#id1'));

  Assert.eq('div.class1 > ol.class2 + ul > li:hover ok', [
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
  ], Preview.parseSelector('div.class1 > ol.class2 + ul > li:hover'));

  Assert.eq('.class > * ok', [
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
  ], Preview.parseSelector('.class > *'));

  Assert.eq('p + * ok', [
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
  ], Preview.parseSelector('p + *'));

  Assert.eq('*.test ok', [
    {
      name: '*',
      selector: '*.test',
      attrs: {},
      classes: [ 'test' ]
    }
  ], Preview.parseSelector('*.test'));
});

UnitTest.test('browser.tinymce.core.fmt.PreviewTest: Preview.selectorToHtml', () => {
  const trimSpaces = function (str) {
    return str.replace(/>\s+</g, '><').replace(/^\s*|\s*$/g, '');
  };

  const selectorToHtml = function (selector) {
    return HtmlUtils.normalizeHtml(Preview.selectorToHtml(selector).outerHTML);
  };

  Assert.eq('ul > li.class1 ok', trimSpaces([
    '<div>',
    '<ul>',
    '<li class="class1"></li>',
    '</ul>',
    '</div>'
  ].join('')), selectorToHtml('ul > li.class1'));

  Assert.eq('ol + ul#id1 > li.class1[title="Some Title"] ok', trimSpaces([
    '<div>',
    '<div>',
    '<ol></ol>',
    '<ul id="id1">',
    '  <li class="class1" title="Some Title"></li>',
    '</ul>',
    '</div>',
    '</div>'
  ].join('')), selectorToHtml('ol + ul#id1 > li.class1[title="Some Title"]'));

  Assert.eq('tr > th + td (required parental structure properly rebuilt) ok', trimSpaces([
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
  ].join('')), selectorToHtml('tr > th + td'));

  Assert.eq('p li[title="Some Title"][alt="Some Alt"] (test multiple spaced attributes) ok', trimSpaces([
    '<div>',
    '<p>',
    '<ul>',
    '<li alt="Some Alt" title="Some Title"></li>',
    '</ul>',
    '</p>',
    '</div>'
  ].join('')), selectorToHtml('p li[title="Some Title"][alt="Some Alt"]'));
});

UnitTest.asynctest('browser.tinymce.core.fmt.PreviewTest: Preview.getCssText', function (success, failure) {
  Theme();

  const ok = function (value: boolean, label: string) {
    return Assert.eq(label, true, value);
  };

  const previewStyles = function () {
    return (
      'table .preview {' +
      'color: rgb(0, 255, 0);' + // green
      '}' +

      'ol .preview {' +
      'color: rgb(0, 0, 255);' + // blue
      '}' +

      '.preview {' +
      'color: rgb(255, 0, 0);' + // red
      '}'
    );
  };

  const runTest = (editor) =>
    Logger.t('Get preview css text for formats', Step.sync(() => {
      const getCssText = function (format) {
        return Preview.getCssText(editor, format);
      };

      ok(/font-weight:(bold|700)/.test(getCssText('bold')),
        'Bold not found in preview style');

      ok(/font-weight:(bold|700)/.test(getCssText({ inline: 'b' })),
        'Bold not found in preview style');

      ok(!/font-weight:(bold|700)/.test(getCssText({ inline: 'b', preview: 'font-size' })),
        'Bold should not be when we only preview font-size');

      ok(/color:rgb\(255, 0, 0\)/.test(getCssText({ inline: 'custom', styles: { color: '#ff0000' }})),
        'Test preview of a custom element.');

      ok(/color:rgb\(255, 0, 0\)/.test(getCssText({ inline: 'invalid', styles: { color: '#ff0000' }})),
        `Test preview of an invalid element shouldn't crash the editor .`);

      ok(/color:rgb\(0, 255, 0\)/.test(getCssText({ selector: 'tr', classes: [ 'preview' ] })),
        'Style is properly inherited in preview for partial element (like TR).');

      ok(/color:rgb\(255, 0, 0\)/.test(getCssText({ selector: 'li', classes: [ 'preview' ] })),
        'For LI element default required parent is UL.');

      ok(/color:rgb\(0, 0, 255\)/.test(getCssText({ selector: 'ol li', classes: [ 'preview' ] })),
        'Parent explicitly present in the selector will have preference.');

      ok(/color:rgb\(0, 0, 255\)/.test(getCssText({ selector: 'ol > li', classes: [ 'preview' ] })),
        'ol > li previewed properly.');

      ok(/color:rgb\(0, 0, 255\)/.test(getCssText({
        selector: 'ol.someClass > li#someId[title="someTitle"]',
        classes: [ 'preview' ]
      })),
      'ol.someClass > li#someId[title="someTitle"] previewed properly.');

      ok(/color:rgb\(0, 0, 255\)/.test(getCssText({
        selector: 'ul + ol.someClass > li#someId',
        classes: [ 'preview' ]
      })),
      'ul + ol.someClass > li#someId previewed properly.');

      ok(/color:rgb\(0, 0, 255\)/.test(getCssText({ selector: 'ul li ol li', classes: [ 'preview' ] })),
        'ul li ol li previewed properly.');
    }));

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, Arr.flatten([
      [
        Step.sync(function () {
          editor.setContent('<p class="preview">x</p>');
        }),
        Waiter.sTryUntil(
          'Expected styles were not loaded',
          Step.sync(() => {
            const color = editor.dom.getStyle(editor.dom.select('p'), 'color', true);
            Assertions.assertEq('Did not get a color value of 255', true, color.indexOf('255') !== -1);
          }), 10, 3000),
        runTest(editor)
      ]
    ]), onSuccess, onFailure);
  }, {
    selector: 'textarea',
    add_unload_trigger: false,
    disable_nodechange: true,
    custom_elements: '~custom',
    extended_valid_elements: 'custom',
    entities: 'raw',
    indent: false,
    content_style: previewStyles(),
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
