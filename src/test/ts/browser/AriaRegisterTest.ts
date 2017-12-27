import { Assertions, ApproxStructure } from '@ephox/agar';
import { UnitTest, assert } from '@ephox/bedrock';
import { Element, Html } from '@ephox/sugar';
import AriaRegister from 'ephox/echo/api/AriaRegister';

UnitTest.test('AriaRegisterTest', function() {
  var checkTextButton = function (expectedElement, expectedContent, element, contentElement) {
    AriaRegister.textButton(element, contentElement);
    Assertions.assertStructure(
      'Checking dialog button attributes',
      expectedElement,
      element
    );
    Assertions.assertStructure(
      'Checking dialog button label attributes',
      expectedContent,
      contentElement
    );
  };

  checkTextButton(ApproxStructure.build(
      function (s, str, arr) {
        return s.element('span', { attrs: { 'role': str.is('button') } });
      }),
    ApproxStructure.build(
      function (s, str, arr) {
        return s.element('span', { attrs: { 'role': str.is('presentation') } });
      }),
    Element.fromTag('span'), // representing the button
    Element.fromTag('span')  // representing the label span which normally is inside the button span
  );

  var checkLabelledField = function (expectedDom, expectedHtmlPrefix, field, name, labelText) {
    var element = AriaRegister.labelledField(field, name, labelText);
    assert.eq('function', typeof(element.element), 'expecting element method');
    assert.eq('function', typeof(element.field), 'expecting field method');
    assert.eq(expectedHtmlPrefix, Html.getOuter(element.element()).substr(0,expectedHtmlPrefix.length));
    Assertions.assertStructure('Checking labelledField structure',
      expectedDom,
      element.element());
  };

  checkLabelledField(
    ApproxStructure.build(
    function (s, str, arr) {
      return s.element('div', {
        children: [ 
          s.element('label', { 
              attrs: {'for': str.startsWith('bob_')},
              html: str.is('Bob Text')
            }), 
          s.element('input', { attrs: {'id': str.startsWith('bob_')} })
          ]
        }
      );
    }),
    '<div role="presentation"><label for="bob_',
    Element.fromTag('input'), 'bob', 'Bob Text');

  checkLabelledField(
    ApproxStructure.build(
    function (s, str, arr) {
      return s.element('div', {
        children: [ 
          s.element('label', { 
              attrs: {'for': str.startsWith('rob_')},
              html: str.is('Rob Text')
            }), 
          s.element('select', { attrs: {'id': str.startsWith('rob_')} })
          ]
        }
      );
    }),
    '<div role="presentation"><label for="rob_',
    Element.fromTag('select'), 'rob', 'Rob Text');
});

