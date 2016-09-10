asynctest(
  'DropdownButtonSpecTest',
 
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.agar.api.Waiter',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.NavigationUtils',
    'ephox.alloy.test.Sinks',
    'ephox.alloy.test.TestBroadcasts',
    'ephox.knoch.future.Future',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Width',
    'global!Error',
    'global!Math',
    'global!parseInt'
  ],
 
  function (Assertions, Chain, FocusTools, GeneralSteps, Keyboard, Keys, Logger, Mouse, Step, UiFinder, Waiter, GuiFactory, GuiSetup, NavigationUtils, Sinks, TestBroadcasts, Future, Css, Width, Error, Math, parseInt) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      var sink = Sinks.relativeSink();

      return GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div'
        }, 
        components: [
          { built: sink },
          {
            uiType: 'dropdown',
            text: 'Dropdown',
            uid: 'test-dropdown',
            fetchItems: function () {
              return Future.pure([
                { value: 'alpha', text: 'Alpha' },
                { value: 'beta', text: 'Beta' },
                { value: 'gamma', text: 'Gamma' },
                { value: 'delta', text: 'Delta' }
              ]);
            },
            onExecute: function (dropdown, item, itemValue) {
              return store.adder(itemValue)();
            },
            sink: sink,
            desc: 'demo-dropdown'
          }
        ]
      });
    }, function (doc, body, gui, component, store) {
      var dropdown = component.getSystem().getByUid('test-dropdown').getOrDie();

      var components = {
        button: { label: 'dropdown-button', 'selector': 'button' },
        alpha: { label: 'alpha-item', selector: '[data-alloy-item-value="alpha"]' },
        beta: { label: 'beta-item', selector: '[data-alloy-item-value="beta"]' },
        gamma: { label: 'gamma-item', selector: '[data-alloy-item-value="gamma"]' },
        delta: { label: 'delta-item', selector: '[data-alloy-item-value="delta"]' }
      };

      return [
        Step.sync(function () {
          dropdown.apis().focus();
        }),
        UiFinder.sNotExists(gui.element(), '[data-alloy-item-value]'),
        Keyboard.sKeydown(doc, Keys.enter(), { }),

        Waiter.sTryUntil(
          'Wait until dropdown content loads',
          UiFinder.sExists(gui.element(), '[data-alloy-item-value]'),
          100,
          1000
        ),

        FocusTools.sTryOnSelector(
          'focus should start on alpha',
          doc,
          '[data-alloy-item-value="alpha"]'
        ),

        // On dropdown buttons, there should be a width property that is approximately
        // the same size as the button
        Logger.t(
          'Checking that the button width is passed onto the menu width',
          Chain.asStep(gui.element(), [
            UiFinder.cFindIn('[data-alloy-menu-value]'),
            Chain.op(function (menu) {
              var buttonWidth = Width.get(dropdown.element());
              var menuWidth = parseInt(
                Css.getRaw(menu, 'width').getOrDie('Menu must have a width property'),
                10
              );
              Assertions.assertEq(
                'Check that the menu width is approximately the same as the button width',
                true,
                Math.abs(menuWidth - buttonWidth) < 20
              );
            })
          ])
        ),

        NavigationUtils.sequence(doc, Keys.down(), {}, [
          components.beta, components.gamma, components.delta, components.alpha
        ]),
        NavigationUtils.sequence(doc, Keys.up(), {}, [
          components.delta, components.gamma, components.beta, components.alpha
        ]),
        NavigationUtils.sequence(doc, Keys.right(), {}, [
          components.alpha, components.alpha
        ]),
        NavigationUtils.sequence(doc, Keys.left(), {}, [
          components.alpha, components.alpha
        ]),
        NavigationUtils.sequence(doc, Keys.tab(), {}, [
          components.beta, components.gamma, components.delta, components.alpha
        ]),
        NavigationUtils.sequence(doc, Keys.tab(), { shift: true }, [
          components.delta, components.gamma, components.beta, components.alpha
        ]),

        Keyboard.sKeydown(doc, Keys.down(), {}),
        store.sAssertEq('nothing has been executed', [ ]),
        Keyboard.sKeydown(doc, Keys.enter(), {}),
        store.sAssertEq('after executing item: beta', [ 'beta' ]),
        store.sClear,

        Keyboard.sKeydown(doc, Keys.down(), {}),
        Keyboard.sKeydown(doc, Keys.space(), {}),
        store.sAssertEq('after executing item: gamma', [ 'gamma' ]),
        store.sClear,

        Mouse.sClickOn(gui.element(), components.alpha.selector),
        store.sAssertEq('after executing item: alpha', [ 'alpha' ]),
        store.sClear,

        Keyboard.sKeydown(doc, Keys.escape(), {}),
        FocusTools.sTryOnSelector(
          'Focus should have moved back to the dropdown',
          doc,
          components.button.selector
        ),

        Mouse.sClickOn(gui.element(), components.button.selector),

        Keyboard.sKeydown(doc, Keys.enter(), { }),
        FocusTools.sTryOnSelector(
          'focus should start on alpha',
          doc,
          '[data-alloy-item-value="alpha"]'
        ),

        TestBroadcasts.sDismiss(
          'button: should not close',
          gui,
          dropdown.element()
        ),

        FocusTools.sIsOnSelector(
          'focus should stay on alpha',
          doc,
          '[data-alloy-item-value="alpha"]'
        ),

        TestBroadcasts.sDismissOn(
          'item: should not close',
          gui,
          components.alpha.selector
        ),

        FocusTools.sIsOnSelector(
          'focus should stay on alpha',
          doc,
          '[data-alloy-item-value="alpha"]'
        ),

        TestBroadcasts.sDismiss(
          'outer element: should close',
          gui,
          gui.element()
        ),

        Logger.t(
          'After broadcasting dismiss popup on a non popup element, the menu should not longer exist in the DOM',
          UiFinder.sNotExists(gui.element(), '[data-alloy-item-value]')
        )
      ];
    }, function () { success(); }, failure);

  }
);