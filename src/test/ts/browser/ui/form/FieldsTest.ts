import { ApproxStructure, Assertions, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Arr, Fun } from '@ephox/katamari';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Replacing } from 'ephox/alloy/api/behaviour/Replacing';
import { Representing } from 'ephox/alloy/api/behaviour/Representing';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Container } from 'ephox/alloy/api/ui/Container';
import { DataField } from 'ephox/alloy/api/ui/DataField';
import { FormChooser } from 'ephox/alloy/api/ui/FormChooser';
import { FormCoupledInputs } from 'ephox/alloy/api/ui/FormCoupledInputs';
import { FormField } from 'ephox/alloy/api/ui/FormField';
import { HtmlSelect } from 'ephox/alloy/api/ui/HtmlSelect';
import { Input } from 'ephox/alloy/api/ui/Input';
import * as RepresentPipes from 'ephox/alloy/test/behaviour/RepresentPipes';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { input } from 'ephox/alloy/api/events/NativeEvents';
import { Attr, SelectorFind } from '@ephox/sugar';
import * as Tagger from 'ephox/alloy/registry/Tagger';

UnitTest.asynctest('FieldsTest', (success, failure) => {

  const renderChoice = (choiceSpec) => {
    return {
      value: choiceSpec.value,
      dom: {
        tag: 'span',
        innerHtml: choiceSpec.text,
        attributes: {
          'data-value': choiceSpec.value
        }
      },
      components: [ ]
    };
  };

  const labelSpec = {
    dom: {
      tag: 'label',
      innerHtml: 'Label'
    },
    components: [ ]
  };

  GuiSetup.setup((store, doc, body) => {
    const inputA = FormField.sketch({
      uid: 'input-a',
      dom: {
        tag: 'div'
      },
      components: [
        FormField.parts().field({
          factory: Input,
          data: 'init'
        }),
        FormField.parts().label(labelSpec),
        FormField.parts()['aria-descriptor']({
          text: 'help'
        })
      ]
    });

    const selectB = FormField.sketch({
      uid: 'select-b',
      dom: {
        tag: 'div'
      },
      components: [
        // TODO: Do not recalculate
        FormField.parts().label(labelSpec),
        FormField.parts().field({
          factory: HtmlSelect,
          options: [
            { value: 'select-b-init', text: 'Select-b-init' }
          ]
        })
      ]
    });

    const chooserC = FormChooser.sketch({
      uid: 'chooser-c',
      dom: {
        tag: 'div'
      },
      components: [
        FormChooser.parts().legend({ }),
        FormChooser.parts().choices({ })
      ],

      markers: {
        choiceClass: 'test-choice',
        selectedClass: 'test-selected-choice'
      },
      choices: Arr.map([
        { value: 'choice1', text: 'Choice1' },
        { value: 'choice2', text: 'Choice2' },
        { value: 'choice3', text: 'Choice3' }
      ], renderChoice)
    });

    const coupledDText = {
      dom: {
        tag: 'div'
      },
      components: [
        FormField.parts().label(labelSpec),
        FormField.parts().field({
          factory: Input
        })
      ]
    };

    const coupledD = FormCoupledInputs.sketch({
      dom: {
        tag: 'div',
        classes: [ 'coupled-group' ]
      },
      components: [
        FormCoupledInputs.parts().field1(coupledDText),
        FormCoupledInputs.parts().field2(coupledDText),
        FormCoupledInputs.parts().lock({
          dom: {
            tag: 'button',
            innerHtml: '+'
          }
        })
      ],

      onLockedChange (current, other) {
        Representing.setValueFrom(other, current);
      },
      markers: {
        lockClass: 'coupled-lock'
      }
    });

    const dataE = DataField.sketch({
      uid: 'data-e',
      dom: {
        tag: 'span'
      },
      getInitialValue: Fun.constant('data-e-init')
    });

    return GuiFactory.build(
      Container.sketch({
        components: [
          inputA,
          selectB,
          chooserC,
          coupledD,
          dataE
        ],

        containerBehaviours: Behaviour.derive([
          Replacing.config({ })
        ])
      })
    );

  }, (doc, body, gui, component, store) => {

    const inputA = component.getSystem().getByUid('input-a').getOrDie();
    const selectB = component.getSystem().getByUid('select-b').getOrDie();
    const chooserC = component.getSystem().getByUid('chooser-c').getOrDie();
    const dataE = component.getSystem().getByUid('data-e').getOrDie();

    return [
      GuiSetup.mAddStyles(doc, [
        '.test-selected-choice, .coupled-lock { background: #cadbee }'
      ]),

      RepresentPipes.sAssertValue('Checking input-a value', 'init', inputA),

      Assertions.sAssertStructure('Check the input-a DOM', ApproxStructure.build((s, str, arr) => {
        const input = SelectorFind.descendant(inputA.element(), 'input').getOrDie('input element child was not found');
        const span = SelectorFind.descendant(inputA.element(), 'span').getOrDie('span element child was not found');

        const inputID = Attr.get(input, 'id');
        const spanID = Attr.get(span, 'id');
        return s.element('div', {
          children: [
            s.element('input', {
              attrs: {
                'aria-describedby': str.is(spanID)
              }
            }),
            s.element('label', {
              attrs: {
                for: str.is(inputID)
              }
            }),
            s.element('span', { })
          ]
        });
      }), inputA.element()),

      Assertions.sAssertStructure('Check the select-b dom', ApproxStructure.build((s, str, arr) => {
        return s.element('div', {
          children: [
            s.element('label', { }),
            s.element('select', { })
          ]
        });
      }), selectB.element()),

      Assertions.sAssertStructure('Check the chooser-c dom', ApproxStructure.build((s, str, arr) => {
        return s.element('div', {
          children: [
            s.element('legend', { }),
            s.element('span', { attrs: { role: str.is('radio') } }),
            s.element('span', { attrs: { role: str.is('radio') } }),
            s.element('span', { attrs: { role: str.is('radio') } })
          ]
        });
      }), chooserC.element()),

      RepresentPipes.sAssertValue('Checking select-b value', 'select-b-init', selectB),

      Step.sync(() => {
        const val = Representing.getValue(chooserC).getOrDie();
        Assertions.assertEq('Checking chooser-c value', 'choice1', val);

        Representing.setValue(chooserC, 'choice3');
        const val2 = Representing.getValue(chooserC).getOrDie();
        Assertions.assertEq('Checking chooser-c value after set', 'choice3', val2);
      }),

      Assertions.sAssertStructure('Checking the data field (E)', ApproxStructure.build((s, str, arr) => {
        return s.element('span', { children: [ ] });
      }), dataE.element()),

      Step.sync(() => {
        const val = Representing.getValue(dataE);
        Assertions.assertEq('Checking data-e value', 'data-e-init', val);

        Representing.setValue(dataE, 'data-e-new');
        Assertions.assertEq('Checking data-e value after set', 'data-e-new', Representing.getValue(dataE));

        // Remove it from the container
        Replacing.remove(component, dataE);

        // Add it back the the container
        Replacing.append(component, GuiFactory.premade(dataE));
        Assertions.assertEq('Checking data-e value was reset when added back to DOM', 'data-e-init', Representing.getValue(dataE));
      }),

      Step.sync(() => {
        FormField.getField(inputA).fold(() => {
          throw new Error('The input Field could not be found');
        },  (comp) => {
          const alloyId = Tagger.readOrDie(comp.element());
          Assertions.assertEq('FormField should have an api that returns the input field', 'input-a-field', alloyId);
        });

        FormField.getLabel(inputA).fold(() => {
          throw new Error('The input Label could not be found');
        },  (comp) => {
          const alloyId = Tagger.readOrDie(comp.element());
          Assertions.assertEq('FormField should have an api that returns the input Label', 'input-a-label', alloyId);
        });
      }),

      GuiSetup.mRemoveStyles
    ];
  }, () => { success(); }, failure);
});
