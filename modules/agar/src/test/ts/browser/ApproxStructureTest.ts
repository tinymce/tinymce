import { UnitTest } from '@ephox/bedrock-client';
import { InsertAll, SugarElement } from '@ephox/sugar';

import * as ApproxStructure from 'ephox/agar/api/ApproxStructure';
import * as Assertions from 'ephox/agar/api/Assertions';

UnitTest.asynctest('ApproxStructureTest', (success, _failure) => {

  const html = '<div data-key="test-1" selected="double" class="test1 root" style="display: block;">' +
    '<div selected="true">' +
    '<span data-ephox-id="blah" class="disabled">span</span>' +
    '</div>' +
    'words' +
    '<span></span>' +
    '</div>';

  const check = (expected, input) => {
    const target = SugarElement.fromHtml(input);
    Assertions.assertStructure('Test', expected, target);
  };

  check(ApproxStructure.build((s, str, arr) =>
    s.element('div', {
      attrs: {
        'selected': str.is('double'),
        'car': str.none('no car attribute'),
        'data-key': str.contains('test')
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
    })), html);

  check(ApproxStructure.fromHtml(html), html);

  check(ApproxStructure.build((s, str, _arr) =>
    s.element('div', {
      children: [
        s.element('div', {
          attrs: {
            selected: str.is('true')
          }
        }),
        s.theRest()
      ]
    })), html);

  const struct1 = ApproxStructure.build((s, str, arr) =>
    s.either([
      s.element('span', {
        classes: [
          arr.has('hello'),
          arr.not('fizzbuzz')
        ]
      }),
      s.element('div', {
        classes: [
          arr.has('fizzbuzz'),
          arr.not('hello')
        ]
      })
    ]));

  check(struct1, '<span class="hello"></span>');
  check(struct1, '<div class="fizzbuzz"></span>');

  const struct2 = ApproxStructure.build((s, str, arr) =>
    s.element('div', {
      children: [
        s.oneOrMore(s.element('span', {
          classes: [
            arr.has('hello')
          ]
        })),
        s.element('div', {}),
        s.zeroOrOne(s.element('span', {
          classes: [
            arr.has('bye')
          ]
        }))
      ]
    }));

  check(struct2, '<div><span class="hello"></span><div></div></div>');
  check(struct2, '<div><span class="hello"></span><div></div><span class="bye"></span></div>');
  check(struct2, '<div><span class="hello"></span><span class="hello"></span><span class="hello"></span><span class="hello"></span><div></div><span class="bye"></span></div>');

  const container = SugarElement.fromTag('div');
  InsertAll.append(container, [
    SugarElement.fromText('hello'),
    SugarElement.fromText(' '),
    SugarElement.fromText('world')
  ]);

  Assertions.assertStructure('Test', ApproxStructure.build((s, str, _arr) =>
    s.element('div', {
      children: [
        s.text(str.is('hello world'), true)
      ]
    })), container);

  Assertions.assertStructure('Test', ApproxStructure.build((s, str, _arr) =>
    s.element('div', {
      children: [
        s.text(str.is('hello'), false),
        s.text(str.is(' world'), true)
      ]
    })), container);

  success();
});
