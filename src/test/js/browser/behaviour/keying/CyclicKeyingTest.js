asynctest(
  'Cyclic Keying Test',
 
  [
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Tabstopping',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.test.GuiSetup',
    'ephox.boulder.api.Objects'
  ],
 
  function (FocusTools, Keyboard, Keys, GuiFactory, Behaviour, Focusing, Keying, Tabstopping, Button, Container, GuiSetup, Objects) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      var makeButton = function (v, t) {
        return Button.sketch({
          dom: { tag: 'button', innerHtml: t },
          action: store.adder(v + '.clicked'),
          buttonBehaviours: {
            tabstopping: true
          }
        });
      };

      return GuiFactory.build(
        Container.sketch({
          dom: {
            tag: 'div',
            classes: [ 'cyclic-keying-test'],
            styles: {
              background: 'blue',
              width: '200px',
              height: '200px'
            }
          },
          uid: 'custom-uid',
          containerBehaviours: Behaviour.derive([
            Keying.config({
              mode: 'cyclic'
            })
          ]),
          components: [
            makeButton('button1', 'Button1'),
            makeButton('button2', 'Button2'),
            Container.sketch({
              dom: {
                tag: 'span',
                classes: [ 'focusable-span' ],
                styles: {
                  'display': 'inline-block',
                  'width': '200px',
                  'border': '1px solid green',
                  background: 'white',
                  height: '20px'
                }
              },
              containerBehaviours: Objects.wrapAll([
                Tabstopping.config({ }),
                Focusing.config({ })
              ])
            })
          ]
        })
      );

    }, function (doc, body, gui, component, store) {
      return [
        GuiSetup.mSetupKeyLogger(body),
        FocusTools.sSetFocus(
          'Setting focus on first button',
          gui.element(),
          'button'
        ),
        FocusTools.sTryOnSelector(
          'Focus should be on button 1',
          doc,
          'button:contains("Button1")'
        ),
        Keyboard.sKeydown(doc, Keys.tab(), {}),
        FocusTools.sTryOnSelector(
          'Focus should move from button 1 to button 2',
          doc,
          'button:contains("Button2")'
        ),
        Keyboard.sKeydown(doc, Keys.tab(), {}),
        FocusTools.sTryOnSelector(
          'Focus should move from button 2 to span',
          doc,
          'span.focusable-span'
        ),

        Keyboard.sKeydown(doc, Keys.tab(), {}),
        FocusTools.sTryOnSelector(
          'Focus should move from span to button 1',
          doc,
          'button:contains("Button1")'
        ),

        Keyboard.sKeydown(doc, Keys.tab(), { shift: true }),
        FocusTools.sTryOnSelector(
          'Focus should move from button1 to span',
          doc,
          'span.focusable-span'
        ),

        Keyboard.sKeydown(doc, Keys.tab(), { shift: true }),
        FocusTools.sTryOnSelector(
          'Focus should move from span to button 2',
          doc,
          'button:contains("Button2")'
        ),

        Keyboard.sKeydown(doc, Keys.tab(), { shift: true }),
        FocusTools.sTryOnSelector(
          'Focus should move from button2 to button 1',
          doc,
          'button:contains("Button1")'
        ),
        GuiSetup.mTeardownKeyLogger(body, [ ])
      ];
    }, function () {
      success();
    }, failure);
  }
);