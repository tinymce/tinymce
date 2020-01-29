import { Assertions, Pipeline, Step, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import * as Preview from 'tinymce/core/fmt/Preview';
import Theme from 'tinymce/themes/silver/Theme';
import HtmlUtils from '../../module/test/HtmlUtils';

UnitTest.asynctest('browser.tinymce.core.fmt.PreviewTest', function (success, failure) {
  const suite = LegacyUnit.createSuite<Editor>();

  Theme();

  const ok = function (value: boolean, label: string) {
    return LegacyUnit.equal(value, true, label);
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

  suite.test('Get preview css text for formats', function (editor) {
    const getCssText = function (format) {
      return Preview.getCssText(editor, format);
    };

    ok(/font-weight\:(bold|700)/.test(getCssText('bold')),
      'Bold not found in preview style');

    ok(/font-weight\:(bold|700)/.test(getCssText({ inline: 'b' })),
      'Bold not found in preview style');

    ok(!/font-weight\:(bold|700)/.test(getCssText({ inline: 'b', preview: 'font-size' })),
      'Bold should not be when we only preview font-size');

    ok(/color\:rgb\(255, 0, 0\)/.test(getCssText({ inline: 'custom', styles: { color: '#ff0000' } })),
      'Test preview of a custom element.');

    ok(/color\:rgb\(255, 0, 0\)/.test(getCssText({ inline: 'invalid', styles: { color: '#ff0000' } })),
      'Test preview of an invalid element shouldn\'t crash the editor .');

    ok(/color\:rgb\(0, 255, 0\)/.test(getCssText({ selector: 'tr', classes: ['preview'] })),
      'Style is properly inherited in preview for partial element (like TR).');

    ok(/color\:rgb\(255, 0, 0\)/.test(getCssText({ selector: 'li', classes: ['preview'] })),
      'For LI element default required parent is UL.');

    ok(/color\:rgb\(0, 0, 255\)/.test(getCssText({ selector: 'ol li', classes: ['preview'] })),
      'Parent explicitly present in the selector will have preference.');

    ok(/color\:rgb\(0, 0, 255\)/.test(getCssText({ selector: 'ol > li', classes: ['preview'] })),
      'ol > li previewed properly.');

    ok(/color\:rgb\(0, 0, 255\)/.test(getCssText({
      selector: 'ol.someClass > li#someId[title="someTitle"]',
      classes: ['preview']
    })),
      'ol.someClass > li#someId[title="someTitle"] previewed properly.');

    ok(/color\:rgb\(0, 0, 255\)/.test(getCssText({
      selector: 'ul + ol.someClass > li#someId',
      classes: ['preview']
    })),
      'ul + ol.someClass > li#someId previewed properly.');

    ok(/color\:rgb\(0, 0, 255\)/.test(getCssText({ selector: 'ul li ol li', classes: ['preview'] })),
      'ul li ol li previewed properly.');
  });

  suite.test('Preview.parseSelector()', function () {
    LegacyUnit.deepEqual(Preview.parseSelector('li.class1.class2#id1[attr1="1"]:disabled'), [
      {
        name: 'li',
        selector: 'li.class1.class2#id1[attr1="1"]:disabled',
        classes: ['class1', 'class2'],
        attrs: {
          id: 'id1',
          attr1: '1',
          disabled: 'disabled'
        }
      }
    ], 'li.class1.class2#id1 ok');

    LegacyUnit.deepEqual(Preview.parseSelector('ul.parent1 > li.class1.class2#id1'), [
      {
        name: 'li',
        selector: 'li.class1.class2#id1',
        classes: ['class1', 'class2'],
        attrs: {
          id: 'id1'
        }
      },
      {
        name: 'ul',
        selector: 'ul.parent1',
        classes: ['parent1'],
        attrs: {}
      }
    ], 'ul.parent1 > li.class1.class2#id1 ok');

    LegacyUnit.deepEqual(Preview.parseSelector('div.class1 > ol.class2 + ul > li:hover'), [
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
            classes: ['class2'],
            attrs: {}
          }
        ]
      },
      {
        name: 'div',
        selector: 'div.class1',
        classes: ['class1'],
        attrs: {}
      }
    ], 'div.class1 > ol.class2 + ul > li:hover ok');

    LegacyUnit.deepEqual(Preview.parseSelector('.class > *'), [
      {
        name: 'div',
        selector: '*',
        attrs: {},
        classes: []
      },
      {
        name: 'div',
        selector: '.class',
        classes: ['class'],
        attrs: {}
      }
    ], '.class > * ok');

    LegacyUnit.deepEqual(Preview.parseSelector('p + *'), [
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

    LegacyUnit.deepEqual(Preview.parseSelector('*.test'), [
      {
        name: '*',
        selector: '*.test',
        attrs: {},
        classes: ['test']
      }
    ], '*.test ok');
  });

  suite.test('Preview.selectorToHtml()', function () {
    const trimSpaces = function (str) {
      return str.replace(/>\s+</g, '><').replace(/^\s*|\s*$/g, '');
    };

    const selectorToHtml = function (selector) {
      return HtmlUtils.normalizeHtml(Preview.selectorToHtml(selector).outerHTML);
    };

    LegacyUnit.equal(selectorToHtml('ul > li.class1'), trimSpaces([
      '<div>',
      '<ul>',
      '<li class="class1"></li>',
      '</ul>',
      '</div>'
    ].join('')), 'ul > li.class1 ok');

    LegacyUnit.equal(selectorToHtml('ol + ul#id1 > li.class1[title="Some Title"]'), trimSpaces([
      '<div>',
      '<div>',
      '<ol></ol>',
      '<ul id="id1">',
      '  <li class="class1" title="Some Title"></li>',
      '</ul>',
      '</div>',
      '</div>'
    ].join('')), 'ol + ul#id1 > li.class1[title="Some Title"] ok');

    LegacyUnit.equal(selectorToHtml('tr > th + td'), trimSpaces([
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

    LegacyUnit.equal(selectorToHtml('p li[title="Some Title"][alt="Some Alt"]'), trimSpaces([
      '<div>',
      '<p>',
      '<ul>',
      '<li alt="Some Alt" title="Some Title"></li>',
      '</ul>',
      '</p>',
      '</div>'
    ].join('')), 'p li[title="Some Title"][alt="Some Alt"] (test multiple spaced attributes) ok');
  });

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, Arr.flatten([
      [
        Step.sync(function () {
          editor.setContent('<p class="preview">x</p>');
        }),
        Waiter.sTryUntil(
          'Expected styles where not loaded',
          Step.sync(function () {
            const color = editor.dom.getStyle(editor.dom.select('p'), 'color', true);
            Assertions.assertEq('Did not get a color value of 255', true, color.indexOf('255') !== -1);
          }
        ), 10, 3000)
      ],
      suite.toSteps(editor)
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
