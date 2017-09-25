asynctest(
  'Browser Test: behaviour.KeyingAndFocusingTest',

  [
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.Step',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.component.Memento',
    'ephox.alloy.api.events.AlloyTriggers',
    'ephox.alloy.test.GuiSetup'
  ],

  function (FocusTools, Step, Behaviour, Focusing, Keying, GuiFactory, Memento, AlloyTriggers, GuiSetup) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    // The purpose of this test is to check that when a component has
    // keying and focusing, that the keying behaviour's focusIn fires
    // after the focusing
    GuiSetup.setup(
      function (store, doc, body) {
        var memChild = Memento.record({
          uid: 'child',
          dom: {
            tag: 'span',
            classes: [ 'child' ],
            innerHtml: 'child',
            styles: {
              background: 'black',
              color: 'white',
              padding: '10px'
            }
          },
          behaviours: Behaviour.derive([
            Focusing.config({ })
          ])
        });

        return GuiFactory.build({
          dom: {
            tag: 'div',
            classes: [ 'parent' ],
            styles: {
              background: 'blue',
              padding: '10px',
              width: '400px'
            }
          },
          components: [
            memChild.asSpec()
          ],
          behaviours: Behaviour.derive([
            Focusing.config({ }),
            Keying.config({
              mode: 'special',
              focusIn: function (comp) {
                var child = memChild.get(comp);
                Focusing.focus(child);
              }
            })
          ])
        });
      },
      function (doc, body, gui, component, store) {
        return [
          GuiSetup.mAddStyles(doc, [
            ':focus { outline: 10px solid green; }'
          ]),
          Step.sync(function () {
            AlloyTriggers.dispatchFocus(component, component.element());
          }),
          FocusTools.sTryOnSelector('Focus should be on child span', doc, 'span.child'),
          GuiSetup.mRemoveStyles
        ];
      },
      success, failure
    );
  }
);
