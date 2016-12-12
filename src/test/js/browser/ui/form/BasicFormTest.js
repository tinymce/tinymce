asynctest(
  'Basic Form',
 
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.ui.Form',
    'ephox.alloy.api.ui.FormField',
    'ephox.alloy.api.ui.HtmlSelect',
    'ephox.alloy.api.ui.Input',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.test.GuiSetup',
    'ephox.compass.Obj',
    'ephox.peanut.Fun'
  ],
 
  function (ApproxStructure, Assertions, GeneralSteps, Keyboard, Keys, Logger, Step, GuiFactory, Representing, Form, FormField, HtmlSelect, Input, EventHandler, GuiSetup, Obj, Fun) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        Form.build({
          dom: {
            tag: 'div'
          },
          parts: {
            'form.ant': FormField.build(Input, {
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
                  data: {
                    value: 'init',
                    text: 'Init'
                  }
                },
                label: { dom: { tag: 'label', innerHtml: 'a' }, components: [ ] }
              }
            }),

            'form.bull': FormField.build(HtmlSelect, {
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
                  ],
                  members: {
                    option: {
                      munge: Fun.identity
                    }
                  }
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
      var sAssertRep = function (expected) {
        return Step.sync(function () {
          var val = Representing.getValue(component);
          Assertions.assertEq(
            'Checking form value',
            expected,

            Obj.map(val, function (v, k) {
              return v.getOrDie(k + ' field is "None"'); 
            })
          );
        });
      };

      var sSetRep = function (newValues) {
        return Step.sync(function () {
          Representing.setValue(component, newValues);
        });
      };

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
            sAssertRep({
              'form.ant': { value: 'init', text: 'Init' },
              'form.bull': { value: 'select-b-init', text: 'Select-b-init' }
            }),
            sAssertDisplay('Init', 'select-b-init')
          ])
        ),

        Logger.t(
          'Setting "form.ant" to (ant-value, Ant-value)',
          GeneralSteps.sequence([
            sSetRep({
              'form.ant': { value: 'ant-value', text: 'Ant-value' }
            }),

            sAssertRep({
              'form.ant': { value: 'ant-value', text: 'Ant-value' },
              'form.bull': { value: 'select-b-init', text: 'Select-b-init' }
            }),

            sAssertDisplay('Ant-value', 'select-b-init')
          ])
        ),

        Logger.t(
          'Setting multiple values but the select value is invalid',
          GeneralSteps.sequence([
            sSetRep({
              'form.ant': { value: 'ant-value', text: 'Ant-value' },
              'form.bull': { value: 'select-b-not-there', text: 'Select-b-not-there' }
            }),

            sAssertRep({
              'form.ant': { value: 'ant-value', text: 'Ant-value' },
              'form.bull': { value: 'select-b-init', text: 'Select-b-init' }
            }),

            sAssertDisplay('Ant-value', 'select-b-init')
          ])
        ),

        Logger.t(
          'Setting "form.ant" and "form.bull" to valid values',
          GeneralSteps.sequence([
            sSetRep({
              'form.ant': { value: 'ant-value', text: 'Ant-value' },
              'form.bull': { value: 'select-b-other', text: 'missing..' }
            }),

            sAssertRep({
              'form.ant': { value: 'ant-value', text: 'Ant-value' },
              'form.bull': { value: 'select-b-other', text: 'Select-b-other' }
            }),

            sAssertDisplay('Ant-value', 'select-b-other')
          ])
        )
      ];
    }, function () { success(); }, failure);

  }
);