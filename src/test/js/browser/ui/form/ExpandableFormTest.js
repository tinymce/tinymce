asynctest(
  'ExpandableFormTest',
 
  [
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.ui.ExpandableForm',
    'ephox.alloy.api.ui.Form',
    'ephox.alloy.api.ui.FormField',
    'ephox.alloy.api.ui.HtmlSelect',
    'ephox.alloy.api.ui.Input',
    'ephox.alloy.test.GuiSetup',
    'ephox.peanut.Fun'
  ],
 
  function (Step, GuiFactory, ExpandableForm, Form, FormField, HtmlSelect, Input, GuiSetup, Fun) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        ExpandableForm.build({
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
        Step.fail('done')
      ];
    }, function () { success(); }, failure);

  }
);