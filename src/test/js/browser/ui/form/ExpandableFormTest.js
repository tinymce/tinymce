asynctest(
  'ExpandableFormTest',

  [
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.agar.api.Waiter',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Tabstopping',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.ExpandableForm',
    'ephox.alloy.api.ui.Form',
    'ephox.alloy.api.ui.FormField',
    'ephox.alloy.api.ui.HtmlSelect',
    'ephox.alloy.api.ui.Input',
    'ephox.alloy.test.form.TestForm',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.PhantomSkipper',
    'ephox.sugar.api.dom.Focus'
  ],

  function (
    FocusTools, GeneralSteps, Keyboard, Keys, Logger, Mouse, Step, UiFinder, Waiter, Behaviour, Keying, Tabstopping, GuiFactory, Button, Container, ExpandableForm,
    Form, FormField, HtmlSelect, Input, TestForm, GuiSetup, PhantomSkipper, Focus
  ) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    // Seems to have stopped working on phantomjs
    if (PhantomSkipper.skip()) return success();


    GuiSetup.setup(function (store, doc, body) {

      var pMinimal = ExpandableForm.parts().minimal(
        Form.sketch(function (parts) {
          return {
            dom: {
              tag: 'div',
              classes: [ 'minimal-form', 'form-section' ]
            },
            components: [
              parts.field('form.ant', FormField.sketch({
                uid: 'input-ant',
                dom: {
                  tag: 'div'
                },
                components: [
                  FormField.parts().field({
                    factory: Input,
                    data: 'init',
                    inputBehaviours: Behaviour.derive([
                      Tabstopping.config({ })
                    ])
                  }),
                  FormField.parts().label({ dom: { tag: 'label', innerHtml: 'a' }, components: [ ] })
                ]
              }))
            ]
          };
        })
      );

      var pExtra = ExpandableForm.parts().extra(
        Form.sketch(function (parts) {
          return {
            dom: {
              tag: 'div',
              classes: [ 'extra-form', 'form-section' ]
            },
            components: [
              Container.sketch({ dom: { styles: { 'height': '100px', 'width': '100px', 'background': 'green' } } }),
              parts.field('form.bull', FormField.sketch({
                uid: 'select-bull',
                dom: {
                  tag: 'div'
                },
                components: [
                  FormField.parts().field({
                    factory: HtmlSelect,
                    selectBehaviours: Behaviour.derive([
                      Tabstopping.config({ })
                    ]),
                    options: [
                      { value: 'select-b-init', text: 'Select-b-init' },
                      { value: 'select-b-set', text: 'Select-b-set' },
                      { value: 'select-b-other', text: 'Select-b-other' }
                    ]
                  }),

                  FormField.parts().label({ dom: { tag: 'label', innerHtml: 'a' }, components: [ ] })
                ]
              }))
            ]
          };
        })
      );

      var me = GuiFactory.build(
        ExpandableForm.sketch({
          dom: {
            tag: 'div'
          },

          components: [
            pMinimal,
            ExpandableForm.parts().expander({
              dom: {
                tag: 'button',
                innerHtml: '+',
                classes: [ 'test-expander-button' ]
              },
              components: [ ],
              buttonBehaviours: Behaviour.derive([
                Tabstopping.config({ })
              ])
            }),
            pExtra,

            Button.sketch({
              dom: {
                tag: 'button',
                innerHtml: 'Shrink!'
              },
              action: function (button) {
                ExpandableForm.collapseFormImmediately(me);
              },
              buttonBehaviours: Behaviour.derive([
                Tabstopping.config({ })
              ])
            }),

            ExpandableForm.parts().controls({
              dom: {
                tag: 'div',
                classes: [ 'form-controls' ]
              },
              components: [ ]
            })
          ],

          expandableBehaviours: Behaviour.derive([
            Keying.config({
              mode: 'cyclic',
              visibilitySelector: '.form-section'
            })
          ]),

          markers: {
            closedClass: 'expandable-closed',
            openClass: 'expandable-open',
            shrinkingClass: 'expandable-shrinking',
            growingClass: 'expandable-growing',

            expandedClass: 'expandable-expanded',
            collapsedClass: 'expandable-collapsed'
          }
        })
      );

      return me;

    }, function (doc, body, gui, component, store) {
      var helper = TestForm.helper(component);

      return [
        GuiSetup.mAddStyles(doc, [
          '.expandable-collapsed .extra-form { visibility: hidden; opacity: 0; }',
          '.expandable-expanded .extra-form { visibility: visible, opacity: 1; }',
          '.expandable-growing .extra-form { transition: height 0.3s ease, opacity 0.2s linear 0.1s; }',
          '.expandable-shrinking .extra-form { transition: opacity 0.3s ease, height 0.2s linear 0.1s, visibility 0s linear 0.3s; }'
        ]),
        helper.sAssertRep({
          'form.ant': 'init',
          'form.bull': 'select-b-init'
        }),

        helper.sSetRep({
          'form.ant': 'first.set',
          'form.bull': 'select-b-set'
        }),

        Logger.t(
          'Checking form after set',
          helper.sAssertRep({
            'form.ant': 'first.set',
            'form.bull': 'select-b-set'
          })
        ),

        Step.sync(function () {
          Keying.focusIn(component);
        }),

        FocusTools.sTryOnSelector('Focus should start on input field', doc, 'input'),
        Keyboard.sKeydown(doc, Keys.tab(), {}),
        FocusTools.sTryOnSelector('Focus should move to expand/collapse button', doc, 'button:contains("+")'),
        Keyboard.sKeydown(doc, Keys.tab(), {}),
        FocusTools.sTryOnSelector('Focus should move to select', doc, 'select'),
        Keyboard.sKeydown(doc, Keys.tab(), {}),
        FocusTools.sTryOnSelector('Focus should move to shrink', doc, 'button:contains("Shrink!")'),

        Keyboard.sKeydown(doc, Keys.enter(), {}),
        Logger.t(
          'Shrinking immediately should not cause any animation',
          UiFinder.sNotExists(gui.element(), '.expandable-shrinking')
        ),
        // Check immediately
        Keyboard.sKeydown(doc, Keys.tab(), {}),
        FocusTools.sTryOnSelector('Focus should start on input field', doc, 'input'),
        Keyboard.sKeydown(doc, Keys.tab(), {}),
        FocusTools.sTryOnSelector('Focus should move to expand/collapse button', doc, 'button:contains("+")'),
        Keyboard.sKeydown(doc, Keys.tab(), {}),
        FocusTools.sTryOnSelector('Focus should skip the collapsed select and jump to shrink', doc, 'button:contains("Shrink!")'),

        Logger.t(
          'Checking the representing value is still the same when collapsed',
          helper.sAssertRep({
            'form.ant': 'first.set',
            'form.bull': 'select-b-set'
          })
        ),

        // Expand the form, focus the part in the extra, and click on expand again and check focus is still in dialog
        Logger.t(
          'Expanding form, focusing part in extra, clicking on expand, and checking focus still in dialog',
          GeneralSteps.sequence([
            Keyboard.sKeydown(doc, Keys.tab(), { shift: true }),
            FocusTools.sTryOnSelector('Focus should move back to expand/collapse button', doc, 'button:contains("+")'),
            Keyboard.sKeydown(doc, Keys.enter(), {}),

            Waiter.sTryUntil(
              'Waiting until it has stopped growing',
              UiFinder.sNotExists(gui.element(), '.expandable-growing'),
              100,
              10000
            ),

            Keyboard.sKeydown(doc, Keys.tab(), {}),
            FocusTools.sTryOnSelector('Focus should move onto select', doc, 'select'),
            Mouse.sClickOn(gui.element(), '.test-expander-button'),

            Waiter.sTryUntil(
              'Waiting until it has stopped shrinking',
              UiFinder.sNotExists(gui.element(), '.expandable-shrinking'),
              100,
              10000
            ),

            Step.async(function (next, die) {
              Focus.search(component.element()).fold(function () {
                die('The focus has not stayed in the form');
              }, next);
            })
          ])
        ),

        Step.sync(function () {
          ExpandableForm.expandForm(component);
        }),
        UiFinder.sExists(gui.element(), '.expandable-growing'),
        Waiter.sTryUntil(
          'Waiting until it has stopped growing',
          UiFinder.sNotExists(gui.element(), '.expandable-growing'),
          100,
          10000
        ),

        Step.sync(function () {
          ExpandableForm.collapseForm(component);
        }),
        UiFinder.sExists(gui.element(), '.expandable-shrinking'),
        Waiter.sTryUntil(
          'Waiting until it has stopped shrinking',
          UiFinder.sNotExists(gui.element(), '.expandable-shrinking'),
          100,
          10000
        ),

        GuiSetup.mRemoveStyles
      ];
    }, function () { success(); }, failure);

  }
);