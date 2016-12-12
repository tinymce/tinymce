asynctest(
  'Basic Form',
 
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
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
 
  function (ApproxStructure, Assertions, Keyboard, Keys, Logger, Step, GuiFactory, Representing, Form, FormField, HtmlSelect, Input, EventHandler, GuiSetup, Obj, Fun) {
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
      return [
        Step.sync(function () {
          var val = Representing.getValue(component);
          Assertions.assertEq(
            'Checking form value',
            {
              'form.ant': { value: 'init', text: 'Init' },
              'form.bull': { value: 'select-b-init', text: 'Select-b-init' }
            },

            Obj.map(val, function (v, k) {
              return v.getOrDie(k + ' field is "None"'); 
            })
          );
        }),

        Step.sync(function () {
          Representing.setValue(component, {
            'form.ant': { value: 'ant-value', text: 'Ant-value' }
          });
        }),

        Step.sync(function () {
          var val = Representing.getValue(component);
          Assertions.assertEq(
            'Checking form value after setting (form.ant)',
            {
              'form.ant': { value: 'ant-value', text: 'Ant-value' },
              'form.bull': { value: 'select-b-init', text: 'Select-b-init' }
            },

            Obj.map(val, function (v, k) {
              return v.getOrDie(k + ' field is "None"'); 
            })
          );
        }),

        Logger.t(
          'Setting multiple values where select value is not a valid value',
          Step.sync(function () {
            Representing.setValue(component, {
              'form.ant': { value: 'ant-value', text: 'Ant-value' },
              'form.bull': { value: 'select-b-not-there', text: 'Select-b-not-there' }
            });
          })
        ),

        Step.sync(function () {
          Assertions.assertStructure(
            'Checking that HTML select and text input have right contents',
            ApproxStructure.build(function (s, str, arr) {
              return s.element('div', {
                children: [
                  s.element('div', {
                    children: [
                      s.element('input', { value: str.is('Ant-value') }),
                      s.element('label', {})
                    ]
                  }),
                  s.element('div', {
                    children: [
                      s.element('select', { value: str.is('select-b-init') }),
                      s.element('label', { })
                    ]
                  })
                ]
              });
            }),
            component.element()
          );
        }),


        Step.sync(function () {
          var val = Representing.getValue(component);
          Assertions.assertEq(
            'Checking form value after setting (form.ant and form.bull)',
            {
              'form.ant': { value: 'ant-value', text: 'Ant-value' },
              'form.bull': { value: 'select-b-init', text: 'Select-b-init' }
            },

            Obj.map(val, function (v, k) {
              return v.getOrDie(k + ' field is "None"'); 
            })
          );
        }),

        Step.fail('Basic form demo')
      ];
    }, function () { success(); }, failure);

  }
);