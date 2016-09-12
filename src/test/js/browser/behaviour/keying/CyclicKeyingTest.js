asynctest(
  'Cyclic Keying Test',
 
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.test.GuiSetup',
    'ephox.sugar.api.DomEvent'
  ],
 
  function (Assertions, FocusTools, Keyboard, Keys, Step, GuiFactory, GuiSetup, DomEvent) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build({
        uiType: 'custom',
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
        keying: {
          mode: 'cyclic'
        },
        components: [
          { uiType: 'button', action: store.adder('button1.clicked'), text: 'Button1' },
          { uiType: 'button', action: store.adder('button2.clicked'), text: 'Button2' },
          {
            uiType: 'custom',
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
            tabstopping: true,
            focusing: true
          }
        ]
      });

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