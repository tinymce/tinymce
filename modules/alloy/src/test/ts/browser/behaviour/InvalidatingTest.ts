import { ApproxStructure, Assertions, Chain, GeneralSteps, Guard, Logger, Step, UiControls, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Future, Result, Singleton } from '@ephox/katamari';
import { SugarElement, Value } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Invalidating } from 'ephox/alloy/api/behaviour/Invalidating';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';

UnitTest.asynctest('InvalidatingTest', (success, failure) => {

  const root = Singleton.value<SugarElement<Element>>();

  GuiSetup.setup((_store, _doc, _body) => GuiFactory.build({
    dom: {
      tag: 'input'
    },
    behaviours: Behaviour.derive([
      Invalidating.config({
        invalidClass: 'test-invalid',
        getRoot: root.get,
        notify: {},
        validator: {
          validate: (input) => {
            const value = Value.get(input.element);
            const res = value === 'good-value' ? Result.value('good-value') : Result.error('bad value: ' + value);
            return Future.pure(res);
          },
          onEvent: 'custom.test.validate'
        }
      })
    ])
  }
  ), (doc, _body, gui, component, _store) => {

    // This will be used for the other root.
    const other = GuiFactory.build({
      dom: {
        tag: 'input'
      }
    });
    gui.add(other);

    const sCheckValidOf = (label: string, comp: AlloyComponent) => Logger.t(
      label,
      Step.control(

        Assertions.sAssertStructure(
          'Checking structure after marking valid',
          ApproxStructure.build((s, _str, arr) => s.element('input', {
            classes: [
              arr.not('test-invalid')
            ]
          })),
          comp.element
        ),
        Guard.tryUntil('valid')
      )
    );

    const sCheckInvalidOf = (label: string, comp: AlloyComponent) => Logger.t(
      label,
      Step.control(
        Assertions.sAssertStructure(
          'Checking structure after marking invalid',
          ApproxStructure.build((s, _str, arr) => s.element('input', {
            classes: [
              arr.has('test-invalid')
            ]
          })),
          comp.element
        ),
        Guard.tryUntil('invalid')
      )
    );

    const sCheckValid = (label: string) => sCheckValidOf(label, component);

    const sCheckInvalid = (label: string) => sCheckInvalidOf(label, component);

    const sCheckIsInvalidOf = (label: string, comp: AlloyComponent, expected: boolean) => Logger.t(
      label,
      Step.control(
        Step.sync(() => {
          Assertions.assertEq(
            'Checking invalid status is: ' + expected,
            expected,
            Invalidating.isInvalid(comp)
          );
        }),
        Guard.tryUntil('invalid status was not: ' + expected)
      )
    );

    const sCheckIsValid = (label: string) => sCheckIsInvalidOf(label, component, false);

    const sCheckIsInvalid = (label: string) => sCheckIsInvalidOf(label, component, true);

    const sCheckHasAriaInvalidOf = (label: string, comp: AlloyComponent) => Logger.t(
      label,
      Step.control(
        Assertions.sAssertStructure(
          'Checking structure after marking invalid',
          ApproxStructure.build((s, str, _arr) => s.element('input', {
            attrs: {
              'aria-invalid': str.is('true')
            }
          })),
          comp.element
        ),
        Guard.tryUntil('valid')
      )
    );

    const sCheckHasNoAriaInvalidOf = (label: string, comp: AlloyComponent) => Logger.t(
      label,
      Step.control(
        Assertions.sAssertStructure(
          'Checking structure after marking valid',
          ApproxStructure.build((s, str, _arr) => s.element('input', {
            attrs: {
              'aria-invalid': str.is('false')
            }
          })),
          comp.element
        ),
        Guard.tryUntil('invalid')
      )
    );

    const sCheckHasAriaInvalid = (label: string) => sCheckHasAriaInvalidOf(label, component);

    const sCheckHasNoAriaInvalid = (label: string) => sCheckHasNoAriaInvalidOf(label, component);

    const sValidate = GeneralSteps.sequence([
      Step.sync(() => {
        AlloyTriggers.emit(component, 'custom.test.validate');
      }),
      // It is future based, so give it a bit of time. The rest of the assertions should all
      // repeat until as well to stop this being fragile. I just don't want it to pass incorrectly
      // because the validation hasn't finished yet.
      Step.wait(100)
    ]);

    const cQueryApi = Chain.async((_value, next, _die) => {
      Invalidating.query(component).get((res) => {
        next(res);
      });
    });

    const cRunApi = Chain.async((_value, next, _die) => {
      Invalidating.run(component).get((res) => {
        next(res);
      });
    });

    const cCheckValidationFails = (label: string, expected: string) => Chain.op((res: Result<any, any>) => {
      res.fold((err) => {
        Assertions.assertEq(label, expected, err);
      }, (val) => {
        throw new Error(label + ': Unexpected value: ' + val);
      });
    });

    const cCheckValidationPasses = (label: string, expected: string) => Chain.op((res: Result<any, any>) => {
      res.fold((err) => {
        throw new Error(label + ': Unexpected error: ' + err);
      }, (val) => {
        Assertions.assertEq(label, expected, val);
      });
    });

    return [
      GuiSetup.mAddStyles(doc, [
        '.test-invalid { outline: 3px solid red; }'
      ]),

      // Wait for the first thing to be invalid
      Waiter.sTryUntil(
        'A validation on load is configured, so wait for the first failure',
        sCheckInvalid('Should be invalid on load'),
        10,
        4000
      ),

      Step.sync(() => {
        Invalidating.markValid(component);
      }),

      sCheckValid('after 1xmarkValid, should be valid'),
      sCheckIsValid('the isInvalid API should return false'),
      sCheckHasNoAriaInvalid('the field should no longer have aria-invalid'),

      Step.sync(() => {
        Invalidating.markInvalid(component, 'programmatic bad value');
      }),

      sCheckInvalid('after markInvalid, should be invalid'),
      sCheckIsInvalid('the isInvalid API should return true'),
      sCheckHasAriaInvalid('the field should have aria-invalid'),

      UiControls.sSetValueOn(gui.element, 'input', 'good-value'),
      sValidate,
      sCheckValid('validation should have fixed it (eventually... because future based)'),

      UiControls.sSetValueOn(gui.element, 'input', 'bad-value'),
      sValidate,
      sCheckInvalid('validation should fail (eventually... because future based)'),
      sCheckHasAriaInvalid('the field should have aria-invalid'),

      Chain.asStep({ }, [
        cQueryApi,
        cCheckValidationFails('Querying "bad-value"', 'bad value: bad-value')
      ]),
      sCheckInvalid('validation should fail (eventually... because future based)'),

      UiControls.sSetValueOn(gui.element, 'input', 'good-value'),
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

      UiControls.sSetValueOn(gui.element, 'input', 'bad-value'),
      Chain.asStep({ }, [
        cRunApi,
        cCheckValidationFails('Running on "bad-value"', 'bad value: bad-value')
      ]),
      sCheckInvalid('run API should update classes on the input to failure'),

      Step.sync(() => {
        Invalidating.markValid(component);
      }),
      sCheckValid('Before changing getRoot, everything should be valid again'),

      sCheckValidOf('Other should initially be valid', other),
      Step.sync(() => {
        root.set(other.element);
      }),

      Chain.asStep({ }, [
        cRunApi,
        cCheckValidationFails('Running on "bad-value"', 'bad value: bad-value')
      ]),
      sCheckInvalidOf('After running validation, the "other" should be invalid now', other),
      sCheckValid('The first input should stay valid the whole time'),

      UiControls.sSetValueOn(gui.element, 'input', 'good-value'),
      Chain.asStep({ }, [
        cRunApi,
        cCheckValidationPasses('Running on "good-value"', 'good-value')
      ]),
      sCheckValidOf('After running validation, the "other" should be valid now', other),
      sCheckValid('The first input should stay valid the whole time'),

      Step.sync(() => {
        Invalidating.markInvalid(component, 'programmatic bad value');
      }),
      sCheckInvalidOf('After running markInvalid, the "other" should be invalid again', other),
      sCheckValid('The first input should stay valid the whole time'),

      Step.sync(() => {
        Invalidating.markValid(component);
      }),
      sCheckValidOf('After running markValid, the "other" should be valid again', other),
      sCheckValid('The first input should stay valid the whole time'),

      GuiSetup.mRemoveStyles
    ];
  }, success, failure);
});
