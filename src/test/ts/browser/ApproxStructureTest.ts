import { UnitTest } from '@ephox/bedrock';
import { Element } from '@ephox/sugar';
import * as ApproxStructure from 'ephox/agar/api/ApproxStructure';
import * as Assertions from 'ephox/agar/api/Assertions';

UnitTest.asynctest('ApproxStructureTest', function (success, failure) {

  const html = '<div data-key="test-1" selected="double" class="test1 root" style="display: block;">' +
    '<div selected="true">' +
    '<span data-ephox-id="blah" class="disabled">span</span>' +
    '</div>' +
    'words' +
    '<span></span>' +
    '</div>';

  const check = function (expected, input) {
    const target = Element.fromHtml(input);
    Assertions.assertStructure('Test', expected, target);
  };

  check(ApproxStructure.build(function (s, str, arr) {
    return s.element('div', {
      attrs: {
        selected: str.is('double'),
        car: str.none('no car attribute'),
        "data-key": str.contains('test')
      },
      classes: [
        arr.has('test1'),
        arr.not('dog'),
        arr.hasPrefix('tes')
      ],
      styles: {
        display: str.is('block')
      },
      children: [
        s.element('div', {
          attrs: {
            selected: str.is('true')
          },
          children: [
            s.element('span', {
              attrs: {
                'data-ephox-id': str.startsWith('bl')
              },
              classes: [
                arr.not('enabled'),
                arr.has('disabled')
              ],
              html: str.is('span')
            })
          ]
        }),
        s.text(
          str.is('words')
        ),
        s.anything()
      ]
    });
  }), html);

  check(ApproxStructure.fromHtml(html), html);

  success();
});

