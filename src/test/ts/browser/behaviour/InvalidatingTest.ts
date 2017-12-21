import { ApproxStructure } from '@ephox/agar';
import { Assertions } from '@ephox/agar';
import { Chain } from '@ephox/agar';
import { GeneralSteps } from '@ephox/agar';
import { Guard } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { UiControls } from '@ephox/agar';
import { Waiter } from '@ephox/agar';
import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Invalidating from 'ephox/alloy/api/behaviour/Invalidating';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import Container from 'ephox/alloy/api/ui/Container';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import { Cell } from '@ephox/katamari';
import { Future } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Result } from '@ephox/katamari';
import { Value } from '@ephox/sugar';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('InvalidatingTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  var root = Cell(Option.none());

  GuiSetup.setup(function (store, doc, body) {
    return GuiFactory.build(
      Container.sketch({
        dom: {
          tag: 'input'
        },
        containerBehaviours: Behaviour.derive([
          Invalidating.config({
            invalidClass: 'test-invalid',
            getRoot: root.get,
            validator: {
              validate: function (input) {
                var value = Value.get(input.element());
                var res = value === 'good-value' ? Result.value('good-value') : Result.error('bad value: ' + value);
                return Future.pure(res);
              },
              onEvent: 'custom.test.validate'
            }
          })
        ])
      })
    );
  }, function (doc, body, gui, component, store) {

    // This will be used for the other root.
    var other = GuiFactory.build({
      dom: {
        tag: 'input'
      }
    });
    gui.add(other);

    var sCheckValidOf = function (label, comp) {
      return Logger.t(
        label,
        Step.control(

          Assertions.sAssertStructure(
            'Checking structure after marking valid',
            ApproxStructure.build(function (s, str, arr) {
              return s.element('input', {
                classes: [
                  arr.not('test-invalid')
                ]
              });
            }),
            comp.element()
          ),
          Guard.tryUntil('valid', 100, 1000)
        )
      );
    };

    var sCheckInvalidOf = function (label, comp) {
      return Logger.t(
        label,
        Step.control(
          Assertions.sAssertStructure(
            'Checking structure after marking invalid',
            ApproxStructure.build(function (s, str, arr) {
              return s.element('input', {
                classes: [
                  arr.has('test-invalid')
                ]
              });
            }),
            comp.element()
          ),
          Guard.tryUntil('invalid', 100, 100)
        )
      );
    };

    var sCheckValid = function (label) {
      return sCheckValidOf(label, component);
    };

    var sCheckInvalid = function (label) {
      return sCheckInvalidOf(label, component);
    };

    var sValidate = GeneralSteps.sequence([
      Step.sync(function () {
        AlloyTriggers.emit(component, 'custom.test.validate');
      }),
      // It is future based, so give it a bit of time. The rest of the assertions should all
      // repeat until as well to stop this being fragile. I just don't want it to pass incorrectly
      // because the validation hasn't finished yet.
      Step.wait(100)
    ]);


    var cQueryApi = Chain.on(function (value, next, die) {
      Invalidating.query(component).get(function (res) {
        next(Chain.wrap(res));
      });
    });

    var cRunApi = Chain.on(function (value, next, die) {
      Invalidating.run(component).get(function (res) {
        next(Chain.wrap(res));
      });
    });

    var cCheckValidationFails = function (label, expected) {
      return Chain.op(function (res) {
        res.fold(function (err) {
          Assertions.assertEq(label, expected, err);
        }, function (val) {
          throw new Error(label + ': Unexpected value: ' + val);
        });
      });
    };

    var cCheckValidationPasses = function (label, expected) {
      return Chain.op(function (res) {
        res.fold(function (err) {
          throw new Error(label + ': Unexpected error: ' + err);
        }, function (val) {
          Assertions.assertEq(label, expected, val);
        });
      });
    };

    return [
      GuiSetup.mAddStyles(doc, [
        '.test-invalid { outline: 3px solid red; }'
      ]),
      
      // Wait for the first thing to be invalid
      Waiter.sTryUntil(
        'A validation on load is configured, so wait for the first failure',
        sCheckInvalid('Should be invalid on load'),
        100,
        4000
      ),

      Step.sync(function () {
        Invalidating.markValid(component);
      }),

      sCheckValid('after 1xmarkValid, should be valid'),

      Step.sync(function () {
        Invalidating.markInvalid(component);
      }),

      sCheckInvalid('after markInvalid, should be invalid'),

      UiControls.sSetValueOn(gui.element(), 'input', 'good-value'),
      sValidate,
      sCheckValid('validation should have fixed it (eventually... because future based)'),

      UiControls.sSetValueOn(gui.element(), 'input', 'bad-value'),
      sValidate,
      sCheckInvalid('validation should fail (eventually... because future based)'),

      Chain.asStep({ }, [
        cQueryApi,
        cCheckValidationFails('Querying "bad-value"', 'bad value: bad-value')
      ]),
      sCheckInvalid('validation should fail (eventually... because future based)'),

      UiControls.sSetValueOn(gui.element(), 'input', 'good-value'),
      Chain.asStep({ }, [
        cQueryApi,
        cCheckValidationPasses('Querying "good-value"', 'good-value')
      ]),
      sCheckInvalid('the query API should not change the classes on the input'),

      Chain.asStep({ }, [
        cRunApi,
        cCheckValidationPasses('Running on "good-value"', 'good-value')
      ]),
      sCheckValid('run API should update classes on the input to success'),

      UiControls.sSetValueOn(gui.element(), 'input', 'bad-value'),
      Chain.asStep({ }, [
        cRunApi,
        cCheckValidationFails('Running on "bad-value"', 'bad value: bad-value')
      ]),
      sCheckInvalid('run API should update classes on the input to failure'),

      Step.sync(function () {
        Invalidating.markValid(component);
      }),
      sCheckValid('Before changing getRoot, everything should be valid again'),

      sCheckValidOf('Other should initially be valid', other),
      Step.sync(function () {
        root.set(Option.some(other.element()));
      }),

      Chain.asStep({ }, [
        cRunApi,
        cCheckValidationFails('Running on "bad-value"', 'bad value: bad-value')
      ]),
      sCheckInvalidOf('After running validation, the "other" should be invalid now', other),
      sCheckValid('The first input should stay valid the whole time'),

      UiControls.sSetValueOn(gui.element(), 'input', 'good-value'),
      Chain.asStep({ }, [
        cRunApi,
        cCheckValidationPasses('Running on "good-value"', 'good-value')
      ]),
      sCheckValidOf('After running validation, the "other" should be valid now', other),
      sCheckValid('The first input should stay valid the whole time'),

      Step.sync(function () {
        Invalidating.markInvalid(component);
      }),
      sCheckInvalidOf('After running markInvalid, the "other" should be invalid again', other),
      sCheckValid('The first input should stay valid the whole time'),

      Step.sync(function () {
        Invalidating.markValid(component);
      }),
      sCheckValidOf('After running markValid, the "other" should be valid again', other),
      sCheckValid('The first input should stay valid the whole time'),

      GuiSetup.mRemoveStyles
    ];
  }, function () { success(); }, failure);
});

