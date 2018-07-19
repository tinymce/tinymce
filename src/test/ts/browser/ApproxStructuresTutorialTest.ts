import { UnitTest } from '@ephox/bedrock';
import { Element } from '@ephox/sugar';
import * as ApproxStructure from 'ephox/agar/api/ApproxStructure';
import * as Assertions from 'ephox/agar/api/Assertions';

UnitTest.test('Approx Structures Tutorial Test', function () {
  const html = '<div data-key="test-1" selected="double" class="test1 root" style="display: block;">' +
    '<div selected="true">' +
    '<span data-ephox-id="blah" class="disabled">span</span>' +
    '</div>' +
    'words' +
    '</div>';

  const check = function (expected, input) {
    const target = Element.fromHtml(input);
    Assertions.assertStructure('Test', expected, target);
  };

  const structure = ApproxStructure.build(function (s, str, arr) {
    return s.element('div', {
      classes: [
        arr.has('test1'),
        arr.hasPrefix('tes')
      ],
      attrs: {
        selected: str.is('double'),
        car: str.none('Car should not be there')
      },
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
                arr.has('disabled'),
                arr.not('enabled')
              ],
              html: str.is('span')
            })
          ]
        }),
        s.text(str.is('words'))
      ]
    });
  });

  check(structure, html);
});

