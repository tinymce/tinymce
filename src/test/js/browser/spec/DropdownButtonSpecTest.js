asynctest(
  'DropdownButtonSpecTest',
 
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.agar.api.Waiter',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.NavigationUtils',
    'ephox.alloy.test.Sinks',
    'ephox.knoch.future.Future'
  ],
 
  function (Assertions, FocusTools, Keyboard, Keys, Step, UiFinder, Waiter, GuiFactory, GuiSetup, NavigationUtils, Sinks, Future) {
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
        Keyboard.sKeydown(doc, Keys.enter(), {}),
        store.sAssertEq('after executing item: gamma', [ 'gamma' ]),
        store.sClear,

        function () { }
      ];
    }, function () { success(); }, failure);

  }
);