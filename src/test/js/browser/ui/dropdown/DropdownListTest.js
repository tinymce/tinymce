asynctest(
  'Dropdown List',
 
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.UiFinder',
    'ephox.agar.api.Waiter',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.component.Memento',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.Dropdown',
    'ephox.alloy.api.ui.TieredMenu',
    'ephox.alloy.test.dropdown.DropdownAssertions',
    'ephox.alloy.test.dropdown.TestDropdownMenu',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.NavigationUtils',
    'ephox.alloy.test.TestBroadcasts',
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Result'
  ],
 
  function (
    ApproxStructure, Assertions, FocusTools, Keyboard, Keys, Logger, Mouse, UiFinder, Waiter, Behaviour, Positioning, GuiFactory, Memento, Container, Dropdown,
    TieredMenu, DropdownAssertions, TestDropdownMenu, GuiSetup, NavigationUtils, TestBroadcasts, Future, Result
  ) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var sink = Memento.record(
      Container.sketch({
        containerBehaviours: Behaviour.derive([
          Positioning.config({
            useFixed: true
          })
        ])
      })
    );

    GuiSetup.setup(function (store, doc, body) {
      var c = GuiFactory.build(
        Dropdown.sketch({
          dom: {
            tag: 'button'
          },

          components: [
            {
              dom: {
                tag: 'span',
                innerHtml: 'hi'
              }  
            }
          ],

          lazySink: function () {
            return Result.value(sink.get(c));
          },

          toggleClass: 'alloy-selected',

          matchWidth: true,

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
              return TieredMenu.simpleData('test', 'Test', f);
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
        // Add more information to this.
        Assertions.sAssertStructure(
          'Initial structure of dropdown button',
          ApproxStructure.build(function (s, str, arr) {
            return s.element('button', {
              attrs: {
                role: str.is('button')
              }
            });
          }),
          component.element()
        ),

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

        DropdownAssertions.sSameWidth('Dropdown List', gui, component, '.menu'),

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