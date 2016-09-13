asynctest(
  'InlineDialogTest',
 
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.NavigationUtils',
    'ephox.sugar.api.Focus',
    'ephox.sugar.api.Value'
  ],
 
  function (Assertions, FocusTools, Keyboard, Keys, Step, GuiFactory, GuiSetup, NavigationUtils, Focus, Value) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div',
          classes: [ 'inline-dialog-example'],
          styles: {
            background: 'white',
            border: '1px solid black',
            padding: '5px',
            display: 'inline-block'
          }
        },
        uid: 'uid-dialog',
        keying: {
          mode: 'cyclic',
          onEscape: store.adderH('dialog.escape'),
          onEnter: store.adderH('dialog.execute')
        },
        components: [
          {
            uiType: 'input',
            value: 'initial-value'
          },
          {
            uiType: 'button',
            action: store.adder('button.execute'),
            text: 'Click me'
          }
        ]
      });

    }, function (doc, body, gui, component, store) {

      var identifiers = {
        input: { label: 'input', selector: 'input' },
        button: { label: 'button', selector: 'button:contains("Click me")' }
      };

      return [
        Step.sync(function () {
          component.apis().focusIn();
        }),
        FocusTools.sTryOnSelector(
          'Focus should have started in input',
          doc,
          'input'
        ),
        Step.sync(function () {
          var active = Focus.active(doc).getOrDie();
          var raw = active.dom();
          Assertions.assertEq('Input should be selected from start', 0, raw.selectionStart);
          Assertions.assertEq('Input should be selected from end', 'initial-value'.length, raw.selectionEnd);
          // Input's selection should be 
        }),

        NavigationUtils.sequence(doc, Keys.tab(), {}, [
          identifiers.button,
          identifiers.input,
          identifiers.button
        ]),

        NavigationUtils.sequence(doc, Keys.tab(), { shift: true }, [
          identifiers.input,
          identifiers.button,
          identifiers.input
        ]),

        Keyboard.sKeydown(doc, Keys.enter(), { }),
        store.sAssertEq('Enter in input should have executed dialog', [ 'dialog.execute' ]),

        store.sClear,
        Keyboard.sKeydown(doc, Keys.tab(), { }),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        store.sAssertEq('Enter in button should have executed button', [ 'button.execute' ]),

        store.sClear,
        Keyboard.sKeydown(doc, Keys.tab(), { }),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        store.sAssertEq('Enter in input should have executed dialog (again)', [ 'dialog.execute' ])
      ];
    }, success, failure);
  }
);