asynctest(
  'ExpandableFormTest',
 
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.ExpandableForm',
    'ephox.alloy.api.ui.Form',
    'ephox.alloy.api.ui.FormField',
    'ephox.alloy.api.ui.HtmlSelect',
    'ephox.alloy.api.ui.Input',
    'ephox.alloy.test.GuiSetup',
    'ephox.compass.Obj',
    'ephox.peanut.Fun'
  ],
 
  function (Assertions, Step, GuiFactory, Representing, Button, ExpandableForm, Form, FormField, HtmlSelect, Input, GuiSetup, Obj, Fun) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {

      var minimal = {
        dom: {
          tag: 'div',
          classes: [ 'minimal-form', 'form-section' ]
        },
        components: [
          Form.parts('form.ant')
        ],
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
                },
                behaviours: {
                  tabstopping: true
                }
              },
              label: { dom: { tag: 'label', innerHtml: 'a' }, components: [ ] }
            }
          })
        }
      };

      var extra = {
        dom: {
          tag: 'div',
          classes: [ 'extra-form', 'form-section' ]
        },
        components: [
          { uiType: 'container', dom: { tag: 'div', styles: { 'height': '100px', 'width': '100px', 'background': 'green' } }},
          Form.parts('form.bull')
        ],
        parts: {
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
                behaviours: {
                  tabstopping: true
                },                
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
        }
      };

      var self = GuiFactory.build(
        ExpandableForm.build({
          dom: {
            tag: 'div'
          },

          parts: {
            minimal: minimal,
            extra: extra,
            expander: {
              dom: {
                tag: 'button',
                innerHtml: '+'
              },
              components: [ ],
              behaviours: {
                tabstopping: true
              }
            },
            controls: {
              dom: {
                tag: 'div',
                classes: [ 'form-controls' ]
              },
              components: [ ]
            }
          },
          components: [
            ExpandableForm.parts().minimal(),
            ExpandableForm.parts().expander(),
            ExpandableForm.parts().extra(),

            Button.build({
              dom: {
                tag: 'button',
                innerHtml: 'Shrink!'
              },
              action: function (button) {
                ExpandableForm.collapseFormImmediately(self);
              },
              behaviours: {
                tabstopping: true
              }
            }),

            ExpandableForm.parts().controls()
          ],

          behaviours: {
            keying: {
              mode: 'cyclic',
              visibilitySelector: '.form-section'
            }
          },

          markers: {
            closedStyle: 'expandable-closed',
            openStyle: 'expandable-open',
            shrinkingStyle: 'expandable-shrinking',
            growingStyle: 'expandable-growing',

            expandedClass: 'expandable-expanded',
            collapsedClass: 'expandable-collapsed'
          }
        })
      );

      return self;

    }, function (doc, body, gui, component, store) {
      // FIX: Dupe with BasicFormTest
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

      return [
        GuiSetup.mAddStyles(doc, [
          '.expandable-collapsed .extra-form { visibility: hidden; opacity: 0; }',
          '.expandable-expanded .extra-form { visibility: visible, opacity: 1; }',
          '.expandable-growing .extra-form { transition: height 0.3s ease, opacity 0.2s linear 0.1s; }',
          '.expandable-shrinking .extra-form { transition: opacity 0.3s ease, height 0.2s linear 0.1s, visibility 0s linear 0.3s; }'
        ]),
        sAssertRep({
          'form.ant': {
            value: 'init',
            text: 'Init'
          },
          'form.bull': {
            value: 'select-b-init',
            text: 'Select-b-init'
          }
        }),
        Step.fail('done'),

        GuiSetup.mRemoveStyles
      ];
    }, function () { success(); }, failure);

  }
);