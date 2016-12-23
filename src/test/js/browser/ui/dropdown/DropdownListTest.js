asynctest(
  'Dropdown List',
 
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.UiFinder',
    'ephox.agar.api.Waiter',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.Memento',
    'ephox.alloy.api.ui.Dropdown',
    'ephox.alloy.api.ui.menus.MenuData',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.NavigationUtils',
    'ephox.alloy.test.TestBroadcasts',
    'ephox.alloy.test.dropdown.TestDropdownMenu',
    'ephox.knoch.future.Future',
    'ephox.perhaps.Result',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.TextContent',
    'ephox.sugar.api.Width'
  ],
 
  function (Assertions, Chain, FocusTools, Keyboard, Keys, Logger, Mouse, UiFinder, Waiter, GuiFactory, Memento, Dropdown, MenuData, GuiSetup, NavigationUtils, TestBroadcasts, TestDropdownMenu, Future, Result, Css, TextContent, Width) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var sink = Memento.record({
      uiType: 'container',
      behaviours: {
        positioning: {
          useFixed: true
        }
      }
    });

    GuiSetup.setup(function (store, doc, body) {


      var displayer = Memento.record({
        uiType: 'custom',
        dom: {
          tag: 'span'
        },
        behaviours: {
          representing: {
            initialValue: 'hi',
            onSet: function (button, val) {
              TextContent.set(button.element(), val);
            }
          }
        }
      });

      var c = GuiFactory.build(
        Dropdown.build({
          dom: {
            tag: 'button'
          },

          components: [
            displayer.asSpec()
          ],

          lazySink: function () {
            return Result.value(sink.get(c));
          },

          toggleClass: 'alloy-selected',

          parts: {
            menu: TestDropdownMenu(store)
          },
      
          fetch: function () { 
            var future = Future.pure([
              { type: 'item', data: { value: 'alpha', text: 'Alpha' } },
              { type: 'item', data: { value: 'beta', text: 'Beta' } },
              { type: 'item', data: { value: 'gamma', text: 'Gamma' } },
              { type: 'item', data: { value: 'delta', text: 'Delta' } }
            ]);

            return future.map(function (f) {
              return MenuData.simple('test', 'Test', f);
            });
          }
        })
      );

      return c;

    }, function (doc, body, gui, component, store) {
      gui.add(
        GuiFactory.build(sink.asSpec())
      );

      var focusables = {
        button: { label: 'dropdown-button', 'selector': 'button' },
        alpha: { label: 'alpha-item', selector: 'li:contains("Alpha")' },
        beta: { label: 'beta-item', selector: 'li:contains("Beta")' },
        gamma: { label: 'gamma-item', selector: 'li:contains("Gamma")' },
        delta: { label: 'delta-item', selector: 'li:contains("Delta")' }
      };

      return [
        Mouse.sClickOn(gui.element(), focusables.button.selector),

        FocusTools.sTryOnSelector('Focus should be on alpha', doc, 'li:contains("Alpha")'),

        Keyboard.sKeydown(doc, Keys.escape(), { }),
        Waiter.sTryUntil(
          'Waiting for menu to disappear',
          FocusTools.sTryOnSelector('Focus should be back on button', doc, 'button'),
          100,
          1000
        ),

        UiFinder.sNotExists(gui.element(), '.menu'),
        Keyboard.sKeydown(doc, Keys.enter(), { }),

        Waiter.sTryUntil(
          'Wait until dropdown content loads',
          UiFinder.sExists(gui.element(), '.menu'),
          100,
          1000
        ),

        FocusTools.sTryOnSelector(
          '1. focus should start on alpha',
          doc,
          focusables.alpha.selector
        ),

        // TODO: Reinstate
        // On dropdown buttons, there should be a width property that is approximately
        // the same size as the button
        // Logger.t(
        //   'Checking that the button width is passed onto the menu width',
        //   Chain.asStep(gui.element(), [
        //     UiFinder.cFindIn('.menu'),
        //     Chain.op(function (menu) {
        //       var buttonWidth = Width.get(component.element());
        //       var menuWidth = parseInt(
        //         Css.getRaw(menu, 'width').getOrDie('Menu must have a width property'),
        //         10
        //       );
        //       Assertions.assertEq(
        //         'Check that the menu width is approximately the same as the button width',
        //         true,
        //         Math.abs(menuWidth - buttonWidth) < 20
        //       );
        //     })
        //   ])
        // ),

        NavigationUtils.sequence(doc, Keys.down(), {}, [
          focusables.beta, focusables.gamma, focusables.delta, focusables.alpha
        ]),
        NavigationUtils.sequence(doc, Keys.up(), {}, [
          focusables.delta, focusables.gamma, focusables.beta, focusables.alpha
        ]),
        NavigationUtils.sequence(doc, Keys.right(), {}, [
          focusables.alpha, focusables.alpha
        ]),
        NavigationUtils.sequence(doc, Keys.left(), {}, [
          focusables.alpha, focusables.alpha
        ]),
        NavigationUtils.sequence(doc, Keys.tab(), {}, [
          focusables.beta, focusables.gamma, focusables.delta, focusables.alpha
        ]),
        NavigationUtils.sequence(doc, Keys.tab(), { shift: true }, [
          focusables.delta, focusables.gamma, focusables.beta, focusables.alpha
        ]),

        Keyboard.sKeydown(doc, Keys.down(), {}),
        store.sAssertEq('nothing has been executed', [ ]),
        Keyboard.sKeydown(doc, Keys.enter(), {}),
        store.sAssertEq('after executing item: beta', [ 'dropdown.menu.execute: beta' ]),
        store.sClear,

        Keyboard.sKeydown(doc, Keys.down(), {}),
        Keyboard.sKeydown(doc, Keys.space(), {}),
        store.sAssertEq('after executing item: gamma', [ 'dropdown.menu.execute: gamma' ]),
        store.sClear,

        Mouse.sClickOn(gui.element(), focusables.alpha.selector),
        store.sAssertEq('after executing item: alpha', [ 'dropdown.menu.execute: alpha' ]),
        store.sClear,

        Keyboard.sKeydown(doc, Keys.escape(), {}),
        FocusTools.sTryOnSelector(
          'Focus should have moved back to the dropdown',
          doc,
          focusables.button.selector
        ),

        Mouse.sClickOn(gui.element(), focusables.button.selector),

        FocusTools.sTryOnSelector(
          '2. focus should start on alpha',
          doc,
          focusables.alpha.selector
        ),

        TestBroadcasts.sDismiss(
          'button: should not close',
          gui,
          component.element()
        ),

        FocusTools.sIsOnSelector(
          'focus should stay on alpha',
          doc,
          focusables.alpha.selector
        ),

        TestBroadcasts.sDismissOn(
          'item: should not close',
          gui,
          focusables.alpha.selector
        ),

        FocusTools.sIsOnSelector(
          'focus should stay on alpha after firing dismiss on alpha',
          doc,
          focusables.alpha.selector
        ),

        TestBroadcasts.sDismiss(
          'outer element: should close',
          gui,
          gui.element()
        ),

        Logger.t(
          'After broadcasting dismiss popup on a non popup element, the menu should not longer exist in the DOM',
          UiFinder.sNotExists(gui.element(), '.menu')
        )
      ];
    }, function () { success(); }, failure);

  }
);