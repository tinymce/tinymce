import { ApproxStructure } from '@ephox/agar';
import { Assertions } from '@ephox/agar';
import { Step } from '@ephox/agar';
import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Composing from 'ephox/alloy/api/behaviour/Composing';
import Replacing from 'ephox/alloy/api/behaviour/Replacing';
import Representing from 'ephox/alloy/api/behaviour/Representing';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import Container from 'ephox/alloy/api/ui/Container';
import DataField from 'ephox/alloy/api/ui/DataField';
import FormChooser from 'ephox/alloy/api/ui/FormChooser';
import FormCoupledInputs from 'ephox/alloy/api/ui/FormCoupledInputs';
import FormField from 'ephox/alloy/api/ui/FormField';
import HtmlSelect from 'ephox/alloy/api/ui/HtmlSelect';
import Input from 'ephox/alloy/api/ui/Input';
import RepresentPipes from 'ephox/alloy/test/behaviour/RepresentPipes';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('FieldsTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  var renderChoice = function (choiceSpec) {
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

  var labelSpec = {
    dom: {
      tag: 'label',
      innerHtml: 'Label'
    },
    components: [ ]
  };

  GuiSetup.setup(function (store, doc, body) {
    var inputA = FormField.sketch({
      uid: 'input-a',
      dom: {
        tag: 'div'
      },
      components: [
        FormField.parts().field({
          factory: Input,
          data: 'init'
        }),
        FormField.parts().label(labelSpec)
      ]
    });

    var selectB = FormField.sketch({
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

    var chooserC = FormChooser.sketch({
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

    var coupledDText = {
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

    var coupledD = FormCoupledInputs.sketch({
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

      onLockedChange: function (current, other) {
        Representing.setValueFrom(other, current);
      },
      markers: {
        lockClass: 'coupled-lock'
      }
    });

    var dataE = DataField.sketch({
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

  }, function (doc, body, gui, component, store) {

    var inputA = component.getSystem().getByUid('input-a').getOrDie();
    var selectB = component.getSystem().getByUid('select-b').getOrDie();
    var chooserC = component.getSystem().getByUid('chooser-c').getOrDie();
    var dataE = component.getSystem().getByUid('data-e').getOrDie();

    return [
      GuiSetup.mAddStyles(doc, [
        '.test-selected-choice, .coupled-lock { background: #cadbee }'
      ]),

      RepresentPipes.sAssertValue('Checking input-a value', 'init', inputA),

      Assertions.sAssertStructure('Check the input-a DOM', ApproxStructure.build(function (s, str, arr) {
        return s.element('div', {
          children: [
            s.element('input', { }),
            s.element('label', { })
          ]
        });
      }), inputA.element()),

      Assertions.sAssertStructure('Check the select-b dom', ApproxStructure.build(function (s, str, arr) {
        return s.element('div', {
          children: [
            s.element('label', { }),
            s.element('select', { })
          ]
        });
      }), selectB.element()),

      Assertions.sAssertStructure('Check the chooser-c dom', ApproxStructure.build(function (s, str, arr) {
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

      Step.sync(function () {
        var val = Representing.getValue(chooserC).getOrDie();
        Assertions.assertEq('Checking chooser-c value', 'choice1', val);

        Representing.setValue(chooserC, 'choice3');
        var val2 = Representing.getValue(chooserC).getOrDie();
        Assertions.assertEq('Checking chooser-c value after set', 'choice3', val2);
      }),


      Assertions.sAssertStructure('Checking the data field (E)', ApproxStructure.build(function (s, str, arr) {
        return s.element('span', { children: [ ] });
      }), dataE.element()),

      Step.sync(function () {
        var val = Representing.getValue(dataE);
        Assertions.assertEq('Checking data-e value', 'data-e-init', val);

        Representing.setValue(dataE, 'data-e-new');
        Assertions.assertEq('Checking data-e value after set', 'data-e-new', Representing.getValue(dataE));

        // Remove it from the container
        Replacing.remove(component, dataE);

        // Add it back the the container
        Replacing.append(component, GuiFactory.premade(dataE));
        Assertions.assertEq('Checking data-e value was reset when added back to DOM', 'data-e-init', Representing.getValue(dataE));
      }),


      GuiSetup.mRemoveStyles
    ];
  }, function () { success(); }, failure);
});

