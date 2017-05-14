asynctest(
  'Basic Form',

  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Step',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.Form',
    'ephox.alloy.api.ui.FormField',
    'ephox.alloy.api.ui.HtmlSelect',
    'ephox.alloy.api.ui.Input',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.form.TestForm',
    'ephox.katamari.api.Fun'
  ],

  function (ApproxStructure, Assertions, GeneralSteps, Logger, Step, GuiFactory, Form, FormField, HtmlSelect, Input, GuiSetup, TestForm, Fun) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        Form.sketch({
          dom: {
            tag: 'div'
          },
          parts: {
            'form.ant': FormField.sketch(Input, {
              uid: 'input-ant',
              dom: {
                tag: 'div'
              },
              components: [
                FormField.parts(Input).field(),
                FormField.parts(Input).label()
              ],
              parts: {
                field: {
                  data: 'Init'
                },
                label: { dom: { tag: 'label', innerHtml: 'a' }, components: [ ] }
              }
            }),

            'form.bull': FormField.sketch(HtmlSelect, {
              uid: 'select-bull',
              dom: {
                tag: 'div'
              },
              components: [
                FormField.parts(HtmlSelect).field(),
                FormField.parts(HtmlSelect).label()
              ],
              parts: {
                field: {
                  options: [
                    { value: 'select-b-init', text: 'Select-b-init' },
                    { value: 'select-b-other', text: 'Select-b-other' }
                  ]
                },
                label: { dom: { tag: 'label', innerHtml: 'a' }, components: [ ] }
              }
            })
          },
          components: [
            Form.parts('form.ant'),
            Form.parts('form.bull')
          ]
        })
      );

    }, function (doc, body, gui, component, store) {
      var helper = TestForm.helper(component);

      var sAssertDisplay = function (inputText, selectValue) {
        return Step.sync(function () {
          Assertions.assertStructure(
            'Checking that HTML select and text input have right contents',
            ApproxStructure.build(function (s, str, arr) {
              return s.element('div', {
                children: [
                  s.element('div', {
                    children: [
                      s.element('input', { value: str.is(inputText) }),
                      s.element('label', {})
                    ]
                  }),
                  s.element('div', {
                    children: [
                      s.element('select', { value: str.is(selectValue) }),
                      s.element('label', { })
                    ]
                  })
                ]
              });
            }),
            component.element()
          );
        });
      };

      return [
        Logger.t(
          'Initial values',
          GeneralSteps.sequence([
            helper.sAssertRep({
              'form.ant': 'Init',
              'form.bull': 'select-b-init'
            }),
            sAssertDisplay('Init', 'select-b-init')
          ])
        ),

        Logger.t(
          'Setting "form.ant" to ant-value',
          GeneralSteps.sequence([
            helper.sSetRep({
              'form.ant': 'ant-value'
            }),

            helper.sAssertRep({
              'form.ant': 'ant-value',
              'form.bull': 'select-b-init'
            }),

            sAssertDisplay('ant-value', 'select-b-init')
          ])
        ),

        Logger.t(
          'Setting multiple values but the select value is invalid',
          GeneralSteps.sequence([
            helper.sSetRep({
              'form.ant': 'ant-value',
              'form.bull': 'select-b-not-there'
            }),

            helper.sAssertRep({
              'form.ant': 'ant-value',
              'form.bull':'select-b-init'
            }),

            sAssertDisplay('ant-value', 'select-b-init')
          ])
        ),

        Logger.t(
          'Setting "form.ant" and "form.bull" to valid values',
          GeneralSteps.sequence([
            helper.sSetRep({
              'form.ant': 'ant-value',
              'form.bull':'select-b-other'
            }),

            helper.sAssertRep({
              'form.ant': 'ant-value',
              'form.bull': 'select-b-other'
            }),

            sAssertDisplay('ant-value', 'select-b-other')
          ])
        )
      ];
    }, function () { success(); }, failure);

  }
);