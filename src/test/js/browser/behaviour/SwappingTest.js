import { ApproxStructure } from '@ephox/agar';
import { Assertions } from '@ephox/agar';
import { Step } from '@ephox/agar';
import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Swapping from 'ephox/alloy/api/behaviour/Swapping';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import Container from 'ephox/alloy/api/ui/Container';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('SwappingTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  var ALPHA_CLS = Fun.constant('i-am-the-alpha');
  var OMEGA_CLS = Fun.constant('and-the-omega');

  GuiSetup.setup(function (store, doc, body) {
    return GuiFactory.build(
      Container.sketch({
        dom: {
          tag: 'div',
          styles: {
            background: 'steelblue',
            height: '200px',
            width: '200px'
          }
        },
        uid: 'wat-uid',
        containerBehaviours: Behaviour.derive([
          Swapping.config({
            alpha: ALPHA_CLS(),
            omega: OMEGA_CLS()
          })
        ])
      })
    );
  }, function (doc, body, gui, component, store) {
    /// string -> [string] -> [string] -> ()
    var assertClasses = function (label, has, not) {
      Assertions.assertStructure(
        'Asserting structure after: ' + label,
        ApproxStructure.build(function (s, str, arr) {
          return s.element('div', {
            classes: Arr.map(has, arr.has).concat(Arr.map(not, arr.not)),
            attrs: {
              'data-alloy-id': str.is('wat-uid')
            }
          })
        }),
        component.element()
      )
    };

    var testHasNoClass = function (label) {
      return Step.sync(function () {
        assertClasses(label, [], [ ALPHA_CLS(), OMEGA_CLS() ]);
      });
    };

    var testHasAlpha = function (label) {
      return Step.sync(function () {
        assertClasses(label, [ALPHA_CLS()], [OMEGA_CLS()]);
      });
    };

    var testHasOmega = function (label) {
      return Step.sync(function () {
        assertClasses(label, [OMEGA_CLS()], [ALPHA_CLS()]);
      });
    };

    var testPredicates = function (label, isAlpha, isOmega) {
      return Step.sync(function () {
        Assertions.assertEq(label, isAlpha, Swapping.isAlpha(component));
        Assertions.assertEq(label, isOmega, Swapping.isOmega(component));
      });
    };

    var sAlpha = Step.sync(function () {
      Swapping.toAlpha(component);
    });

    var sOmega = Step.sync(function () {
      Swapping.toOmega(component);
    });

    var sClear = Step.sync(function () {
      Swapping.clear(component);
    });

    return [
      testHasNoClass('no initial class'),
      testPredicates('isAlpha, isOmega', false, false),

      sAlpha,
      testHasAlpha('initial alpha class'),
      testPredicates('isAlpha, isOmega', true, false),

      sOmega,
      testHasOmega('swap to omega class'),
      testPredicates('isAlpha, isOmega', false, true),

      sAlpha,
      testHasAlpha('swap back to alpha class'),
      testPredicates('isAlpha, isOmega', true, false),

      sClear,
      testHasNoClass('clear classes'),
      testPredicates('isAlpha, isOmega', false, false),

      sOmega,
      testHasOmega('initial omega class'),
      testPredicates('isAlpha, isOmega', false, true),

      sAlpha,
      testHasAlpha('swap to alpha class'),
      testPredicates('isAlpha, isOmega', true, false),

      sOmega,
      testHasOmega('swap back to omega class'),
      testPredicates('isAlpha, isOmega', false, true),

      sClear,
      testHasNoClass('clear classes'),
      testPredicates('isAlpha, isOmega', false, false)
    ];
  }, success, failure);
});

