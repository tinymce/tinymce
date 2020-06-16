import { ApproxStructure, Assertions, Chain, Mouse, UiControls, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Result } from '@ephox/katamari';
import { Class } from '@ephox/sugar';
import * as AddEventsBehaviour from 'ephox/alloy/api/behaviour/AddEventsBehaviour';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Representing } from 'ephox/alloy/api/behaviour/Representing';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { AlloySpec } from 'ephox/alloy/api/component/SpecTypes';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import * as AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import * as NativeEvents from 'ephox/alloy/api/events/NativeEvents';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { FormCoupledInputs } from 'ephox/alloy/api/ui/FormCoupledInputs';
import { FormField } from 'ephox/alloy/api/ui/FormField';
import { Input } from 'ephox/alloy/api/ui/Input';

interface MakeConfig {
  className: string;
  locked?: boolean;
  field1Name?: string;
  field2Name?: string;
  coupledFieldBehaviours?: Behaviour.AlloyBehaviourRecord;
}

UnitTest.asynctest('FormCoupledInputsTest', (success, failure) => {

  const labelSpec: AlloySpec = {
    dom: {
      tag: 'label',
      innerHtml: 'Label'
    },
    components: []
  };

  const coupledSpec = (className: string) => ({
    dom: {
      tag: 'div',
      classes: [ className ]
    },
    components: [
      FormField.parts().label(labelSpec),
      FormField.parts().field({ factory: Input })
    ]
  });

  const lockSpec = {
    dom: {
      tag: 'button',
      classes: [ 'lock' ],
      innerHtml: '+'
    }
  };

  const make = (config: MakeConfig) => FormCoupledInputs.sketch({
    dom: {
      tag: 'div',
      classes: [ config.className ]
    },
    components: [
      FormCoupledInputs.parts().field1(coupledSpec('field1')),
      FormCoupledInputs.parts().field2(coupledSpec('field2')),
      FormCoupledInputs.parts().lock(lockSpec)
    ],
    onLockedChange(current, other) {
      Representing.setValueFrom(other, current);
    },
    markers: {
      lockClass: 'coupled-lock'
    },
    locked: config.locked,
    field1Name: config.field1Name,
    field2Name: config.field2Name,
    coupledFieldBehaviours: config.coupledFieldBehaviours
  });

  GuiSetup.setup((store, _doc, _body) => GuiFactory.build(
    {
      dom: {
        tag: 'div'
      },
      components: [
        make({ className: 'default' }),
        make({ className: 'start-locked', locked: true }),
        make({ className: 'renamed-fields', field1Name: 'width', field2Name: 'height' }),
        make({
          className: 'behaviour-tester', coupledFieldBehaviours: Behaviour.derive([
            AddEventsBehaviour.config('test', [
              AlloyEvents.run(NativeEvents.click(), store.adder('click'))
            ])
          ])
        })
      ]
    }
  ), (_doc, _body, _gui, component, store) => {

    const sTestStructure = (selector: string, locked: boolean) => Chain.asStep(component.element(), [
      UiFinder.cFindIn(selector),
      Assertions.cAssertStructure('Checking initial structure',
        ApproxStructure.build((s, str, arr) => {
          const inputStruct = s.element('div', {
            children: [
              s.element('label', { html: str.is('Label') }),
              s.element('input', { attrs: { type: str.is('text') }})
            ]
          });
          return s.element('div', {
            children: [
              inputStruct,
              inputStruct,
              s.element('button', {
                html: str.is('+'),
                classes: [
                  (locked ? arr.has : arr.not)('coupled-lock')
                ]
              })
            ]
          });
        })
      )
    ]);

    const sTestRepresentingSetValue = (selector: string, value: any, field1: string, field2: string) =>
      Chain.asStep(component.element(), [
        Chain.fromParent(
          UiFinder.cFindIn(selector),
          [
            Chain.fromChains([
              Chain.binder((elem) => component.getSystem().getByDom(elem)),
              Chain.op((subcomponent) => {
                Representing.setValue(subcomponent, value);
              })
            ]),
            Chain.fromChains([
              UiFinder.cFindIn('.field1 input'),
              UiControls.cGetValue,
              Assertions.cAssertEq('Field 1 is not correct', field1)
            ]),
            Chain.fromChains([
              UiFinder.cFindIn('.field2 input'),
              UiControls.cGetValue,
              Assertions.cAssertEq('Field 2 is not correct', field2)
            ])
          ]
        )
      ]);

    const sTestCopying = (selector: string, inputSelector: string, valueIn: any, valueOut: any) =>
      Chain.asStep(component.element(), [
        Chain.fromParent(
          UiFinder.cFindIn(selector),
          [
            Chain.fromChains([
              Chain.binder((elem) => component.getSystem().getByDom(elem)),
              Chain.op((subcomponent) => {
                Representing.setValue(subcomponent, valueIn);
              })
            ]),
            Chain.fromChains([
              UiFinder.cFindIn(inputSelector),
              Chain.binder((elem) => component.getSystem().getByDom(elem)),
              Chain.op((input) => AlloyTriggers.emit(input, NativeEvents.input()))
            ]),
            Chain.fromChains([
              Chain.binder((elem) => component.getSystem().getByDom(elem)),
              Chain.mapper((subcomponent) => Representing.getValue(subcomponent)),
              Assertions.cAssertEq('Checking represented data', valueOut)
            ])
          ]
        )
      ]);

    const sTestApi = () =>
      Chain.asStep(component.element(), [
        UiFinder.cFindIn('.default'),
        Chain.fromParent(
          Chain.binder((elem) => component.getSystem().getByDom(elem)),
          [
            Chain.fromChains([
              Chain.binder((comp) => FormCoupledInputs.getField1(comp).fold(() => Result.error('did not find'), Result.value)),
              Chain.op((comp) => {
                Assertions.assertEq('Not field1', true, Class.has(comp.element(), 'field1'));
              })
            ]),
            Chain.fromChains([
              Chain.binder((comp) => FormCoupledInputs.getField2(comp).fold(() => Result.error('did not find'), Result.value)),
              Chain.op((comp) => {
                Assertions.assertEq('Not field2', true, Class.has(comp.element(), 'field2'));
              })
            ]),
            Chain.fromChains([
              Chain.binder((comp) => FormCoupledInputs.getLock(comp).fold(() => Result.error('did not find'), Result.value)),
              Chain.op((comp) => {
                Assertions.assertEq('Not lock', true, Class.has(comp.element(), 'lock'));
              })
            ])
          ])
      ]);

    return [
      sTestStructure('.default', false),
      sTestStructure('.start-locked', true),
      sTestRepresentingSetValue('.default', { field1: 'asdf', field2: 'hjkl' }, 'asdf', 'hjkl'),
      sTestRepresentingSetValue('.renamed-fields', { width: '100px', height: '200px' }, '100px', '200px'),
      sTestCopying('.default', '.field1 input', { field1: 'asdf', field2: '' }, { field1: 'asdf', field2: '' }),
      sTestCopying('.default', '.field2 input', { field1: '', field2: 'dfgh' }, { field1: '', field2: 'dfgh' }),
      sTestCopying('.start-locked', '.field1 input', { field1: 'asdf', field2: '' }, { field1: 'asdf', field2: 'asdf' }),
      sTestCopying('.start-locked', '.field2 input', { field1: '', field2: 'lkjh' }, { field1: 'lkjh', field2: 'lkjh' }),
      Mouse.sClickOn(component.element(), '.default .lock'),
      Mouse.sClickOn(component.element(), '.start-locked .lock'),
      sTestStructure('.default', true),
      sTestStructure('.start-locked', false),
      sTestCopying('.start-locked', '.field1 input', { field1: 'asdf', field2: '' }, { field1: 'asdf', field2: '' }),
      sTestCopying('.start-locked', '.field2 input', { field1: '', field2: 'dfgh' }, { field1: '', field2: 'dfgh' }),
      sTestCopying('.default', '.field1 input', { field1: 'asdf', field2: '' }, { field1: 'asdf', field2: 'asdf' }),
      sTestCopying('.default', '.field2 input', { field1: '', field2: 'lkjh' }, { field1: 'lkjh', field2: 'lkjh' }),
      store.sAssertEq('click', []),
      Mouse.sClickOn(component.element(), '.behaviour-tester'),
      store.sAssertEq('click', [ 'click' ]),
      sTestApi()
    ];
  }, success, failure);
});
