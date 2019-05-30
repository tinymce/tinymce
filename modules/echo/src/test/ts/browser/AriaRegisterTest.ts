import { Assertions, ApproxStructure } from '@ephox/agar';
import { UnitTest, assert } from '@ephox/bedrock';
import { Fun } from '@ephox/katamari';
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

  var checkLabelledField = function (expectedDom, field, name, labelText) {
    var element = AriaRegister.labelledField(field, name, labelText);
    assert.eq('function', typeof(element.element), 'expecting element method');
    assert.eq('function', typeof(element.field), 'expecting field method');
    Assertions.assertStructure('Checking labelledField structure',
      expectedDom,
      element.element());
  };

  var pair = function(store: object, key: string, baseAssertion, buildAssertion) {
    var strAssert = function (label, actual) {
      baseAssertion.strAssert(label, actual);
      if (store.hasOwnProperty(key)) {
        store[key].strAssert(label, actual);
      } else {
        store[key] = buildAssertion(actual);
      }
    };

    var arrAssert = function(label, array) {
      baseAssertion.arrAssert(label, array);
      if (store.hasOwnProperty(key)) {
        store[key].arrAssert(label, array);
      } else {
        store[key] = buildAssertion(array);
      }
    }

    return {
      show: Fun.constant('pair("' + key + '", ' + baseAssertion.show() + ')'),
      strAssert: strAssert,
      arrAssert: arrAssert
    };
  }

  checkLabelledField(
    ApproxStructure.build(
    function (s, str, arr) {
      var store = {};
      return s.element('div', {
        attrs: {'role': str.is('presentation')},
        children: [ 
          s.element('label', { 
              attrs: {
                'for': pair(store, 'field-id', str.startsWith('bob_'), str.is),
                'id': pair(store, 'label-id', str.startsWith('label_'), str.is)
              },
              html: str.is('Bob Text')
            }), 
          s.element('input', {
              attrs: {
                'id': pair(store, 'field-id', str.startsWith('bob_'), str.is),
                'aria-labelledby': pair(store, 'label-id', str.startsWith('label_'), str.is)
              }
            })
          ]
        }
      );
    }),
    Element.fromTag('input'), 'bob', 'Bob Text');

  checkLabelledField(
    ApproxStructure.build(
    function (s, str, arr) {
      var store = {};
      return s.element('div', {
        attrs: {'role': str.is('presentation')},
        children: [ 
          s.element('label', { 
            attrs: {
              'for': pair(store, 'field-id', str.startsWith('rob_'), str.is),
              'id': pair(store, 'label-id', str.startsWith('label_'), str.is)
            },
            html: str.is('Rob Text')
          }), 
          s.element('select', {
            attrs: {
              'id': pair(store, 'field-id', str.startsWith('rob_'), str.is),
              'aria-labelledby': pair(store, 'label-id', str.startsWith('label_'), str.is)
            } 
          })
          ]
        }
      );
    }),
    Element.fromTag('select'), 'rob', 'Rob Text');
});

