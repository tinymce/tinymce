asynctest(
  'FieldsTest',
 
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.FormChooser',
    'ephox.alloy.api.ui.FormCoupledInputs',
    'ephox.alloy.api.ui.FormField',
    'ephox.alloy.api.ui.HtmlSelect',
    'ephox.alloy.api.ui.Input',
    'ephox.alloy.test.GuiSetup',
    'ephox.peanut.Fun'
  ],
 
  function (ApproxStructure, Assertions, Step, GuiFactory, Representing, Container, FormChooser, FormCoupledInputs, FormField, HtmlSelect, Input, GuiSetup, Fun) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var labelSpec = {
      dom: {
        tag: 'label',
        innerHtml: 'Label'
      },
      components: [ ]
    };

    GuiSetup.setup(function (store, doc, body) {

      var inputA = FormField.build(Input, {
        uid: 'input-a',
        dom: {
          tag: 'div'
        },
        components: [
          FormField.parts(Input).field(),
          FormField.parts(Input).label()
        ],
        parts: {
          field: {
            data: {
              value: 'init',
              text: 'Init'
            }
          },
          label: labelSpec
        }
      });

      var selectB = FormField.build(HtmlSelect, {
        uid: 'select-b',
        dom: {
          tag: 'div'
        },
        components: [
          // TODO: Do not recalculate
          FormField.parts(HtmlSelect).label(),
          FormField.parts(HtmlSelect).field()
        ],
        parts: {
          field: {
            options: [
              { value: 'select-b-init', text: 'Select-b-init' }
            ],
            members: {
              option: {
                munge: Fun.identity
              }
            }
          },
          label: labelSpec
        }
      });

      var chooserC = FormChooser.build({
        uid: 'chooser-c',
        dom: {
          tag: 'div'
        },
        components: [
          FormChooser.parts().legend(),
          FormChooser.parts().choices()
        ],
        members: {
          choice: {
            munge: function (choiceSpec) {
              return Container.build({
                dom: {
                  tag: 'span',
                  innerHtml: choiceSpec.text,
                  attributes: {
                    'data-value': choiceSpec.value
                  }
                },
                components: [ ]
              });
            }
          }
        },
        markers: {
          choiceClass: 'test-choice',
          selectedClass: 'test-selected-choice'
        },
        choices: [
          { value: 'choice1', text: 'Choice1' },
          { value: 'choice2', text: 'Choice2' },
          { value: 'choice3', text: 'Choice3' }
        ],
        parts: {
          legend: { },
          choices: { }
        }
      });

      var coupledDText = {
        dom: {
          tag: 'div'
        },
        components: [
          FormField.parts(Input).label(),
          FormField.parts(Input).field()
        ],
        parts: {
          field: { },
          label: labelSpec
        }
      };

      var coupledD = FormCoupledInputs.build({
        dom: {
          tag: 'div',
          classes: [ 'coupled-group' ]
        },
        components: [
          FormCoupledInputs.parts().field1(),
          FormCoupledInputs.parts().field2(),
          FormCoupledInputs.parts().lock()
        ],

        onLockedChange: function (current, other) {
          Representing.setValueFrom(other, current);
        },
        markers: {
          lockClass: 'coupled-lock'
        },
        parts: {
          field1: coupledDText,
          field2: coupledDText,
          lock: {
            dom: {
              tag: 'button',
              innerHtml: '+'
            }
          }
        }
      });

      return GuiFactory.build(
        Container.build({
          components: [
            inputA,
            selectB,
            chooserC,
            coupledD
          ]
        })
      );

    }, function (doc, body, gui, component, store) {

      var inputA = component.getSystem().getByUid('input-a').getOrDie();
      var selectB = component.getSystem().getByUid('select-b').getOrDie();
      var chooserC = component.getSystem().getByUid('chooser-c').getOrDie();

      return [
        GuiSetup.mAddStyles(doc, [
          '.test-selected-choice, .coupled-lock { background: #cadbee }'
        ]),
        Step.sync(function () {
          var val = Representing.getValue(inputA);
          Assertions.assertEq('Checking input-a value', 'init', val.value);
          Assertions.assertEq('Checking input-a text', 'Init', val.text);
        }),

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

        Step.sync(function () {
          var val = Representing.getValue(selectB);
          Assertions.assertEq('Checking select-b value', 'select-b-init', val.value);
          Assertions.assertEq('Checking select-b text', 'Select-b-init', val.text);
        }),

        Step.sync(function () {
          var val = Representing.getValue(chooserC).getOrDie();
          Assertions.assertEq('Checking chooser-c value', 'choice1', val);

          Representing.setValue(chooserC, 'choice3');
          var val2 = Representing.getValue(chooserC).getOrDie();
          Assertions.assertEq('Checking chooser-c value after set', 'choice3', val2);
        }),

        GuiSetup.mRemoveStyles
      ];
    }, function () { success(); }, failure);

  }
);