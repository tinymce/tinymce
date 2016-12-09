asynctest(
  'Fields Ui',
 
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.ui.FormField',
    'ephox.alloy.api.ui.HtmlSelect',
    'ephox.alloy.api.ui.Input',
    'ephox.alloy.test.GuiSetup',
    'ephox.peanut.Fun'
  ],
 
  function (Assertions, Step, GuiFactory, Representing, FormField, HtmlSelect, Input, GuiSetup, Fun) {
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

      return GuiFactory.build(
        {
          uiType: 'container',
          components: [
            inputA,
            selectB
          ]
        }
      );

    }, function (doc, body, gui, component, store) {

      var inputA = component.getSystem().getByUid('input-a').getOrDie();
      var selectB = component.getSystem().getByUid('select-b').getOrDie();

      return [
        Step.sync(function () {
          var val = Representing.getValue(inputA);
          Assertions.assertEq('Checking input-a value', 'init', val.value);
          Assertions.assertEq('Checking input-a text', 'Init', val.text);
        }),

        Step.sync(function () {
          var val = Representing.getValue(selectB);
          Assertions.assertEq('Checking select-b value', 'select-b-init', val.value);
          Assertions.assertEq('Checking select-b text', 'Select-b-init', val.text);
        }),


        Step.fail('done')
      ];
    }, function () { success(); }, failure);

  }
);