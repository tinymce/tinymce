asynctest(
  'TypeaheadSpecTest',
 
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.NamedChain',
    'ephox.agar.api.RealKeys',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiControls',
    'ephox.agar.api.UiFinder',
    'ephox.agar.api.Waiter',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.NavigationUtils',
    'ephox.alloy.test.Sinks',
    'ephox.alloy.test.TestBroadcasts',
    'ephox.knoch.future.Future',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Focus',
    'ephox.sugar.api.Width',
    'global!Math'
  ],
 
  function (Assertions, Chain, FocusTools, Keyboard, Keys, Logger, Mouse, NamedChain, RealKeys, Step, UiControls, UiFinder, Waiter, GuiFactory, GuiSetup, NavigationUtils, Sinks, TestBroadcasts, Future, Css, Focus, Width, Math) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      var sink = Sinks.relativeSink();

      return GuiFactory.build({
        uiType: 'custom',
        dom: { tag: 'div' },
        components: [
          { built: sink },
          {
            uiType: 'typeahead',
            minChars: 2,
            sink: sink,
            uid: 'test-type',
            dom: {
              value: 'initial-value'
            },
            fetchItems: function (text) {
              return Future.pure([
                { value: text + '1', text: text + '1' },
                { value: text + '2', text: text + '2' }
              ]);
            },
            desc: 'test-typeahead'
          }
        ]
      });

    }, function (doc, body, gui, component, store) {

      var item = function (key) {
        return {
          selector: '[data-alloy-item-value="' + key + '"]',
          label: key
        };
      };

      var typeahead = gui.getByUid('test-type').getOrDie();
      return [
        Chain.asStep(typeahead.element(), [
          Chain.op(function (t) {
            Focus.focus(t);
          }),
          UiControls.cGetValue,
          Assertions.cAssertEq('Checking initial value of typeahead', 'initial-value')
        ]),
        UiControls.sSetValue(typeahead.element(), 'peo'),

        // check that the typeahead is not open.
        UiFinder.sNotExists(gui.element(), '[data-alloy-item-value]'),
        
        Keyboard.sKeydown(doc, Keys.down(), { }),
        FocusTools.sTryOnSelector(
          'Focus should be on list of options, not typeahead',
          doc,
          '[data-alloy-item-value="peo1"]'
        ),

        // On typeaheads, there should be a width property that is approximately
        // the same size as the input field
        // NOTE: Dupe with Dropdown test.
        Logger.t(
          'Checking that the input width is passed onto the typeahead list width',
          Chain.asStep(gui.element(), [
            UiFinder.cFindIn('[data-alloy-menu-value]'),
            Chain.op(function (menu) {
              var inputWidth = Width.get(typeahead.element());
              var menuWidth = parseInt(
                Css.getRaw(menu, 'width').getOrDie('Menu must have a width property'),
                10
              );
              Assertions.assertEq(
                'Check that the menu width is approximately the same as the input width',
                true,
                Math.abs(menuWidth - inputWidth) < 20
              );
            })
          ])
        ),

        NavigationUtils.sequence(doc, Keys.down(), {}, [
          item('peo2'),
          item('peo1'),
          item('peo2')
        ]),

        NavigationUtils.sequence(doc, Keys.tab(), { shift: true }, [
          item('peo1'),
          item('peo2'),
          item('peo1')
        ]),

        Keyboard.sKeydown(doc, Keys.enter(), { }),
        Chain.asStep(typeahead.element(), [
          UiControls.cGetValue,
          Assertions.cAssertEq('Checking typeahead value matches selection', 'peo1')
        ]),

        FocusTools.sIsOnSelector(
          'Focus should be back on typeahead',
          doc,
          '.typeahead'
        ),
        UiFinder.sNotExists(gui.element(), '[data-alloy-item-value]'),

        UiControls.sSetValue(typeahead.element(), 'new-value'),
        Keyboard.sKeydown(doc, Keys.down(), {}),
        FocusTools.sTryOnSelector(
          'Focus should be on list of options, not typeahead',
          doc,
          '[data-alloy-item-value="new-value1"]'
        ),

        Keyboard.sKeydown(doc, Keys.escape(), { }),
        FocusTools.sTryOnSelector(
          'Focus should be back on the typeahead after ESC',
          doc,
          '.typeahead'
        ),
        Chain.asStep(typeahead.element(), [
          UiControls.cGetValue,
          Assertions.cAssertEq('Checking typeahead value has preserved old value before esc', 'new-value')
        ]),

        UiFinder.sNotExists(gui.element(), '[data-alloy-item-value]'),

        Keyboard.sKeydown(doc, Keys.down(), {}),
        FocusTools.sTryOnSelector(
          'Focus should be on list of options, not typeahead',
          doc,
          '[data-alloy-item-value="new-value1"]'
        ),

        Mouse.sClickOn(gui.element(), '[data-alloy-item-value="new-value2"]'),
        UiFinder.sNotExists(gui.element(), '[data-alloy-item-value]'),
        Chain.asStep(typeahead.element(), [
          UiControls.cGetValue,
          Assertions.cAssertEq('Checking typeahead value matches clicked on value', 'new-value2')
        ]),

        // check dismissing popups
        Keyboard.sKeydown(doc, Keys.down(), { }),
        FocusTools.sTryOnSelector(
          'Wait for typeahead list to show',
          doc,
          '[data-alloy-item-value="new-value21"]'
        ),
        TestBroadcasts.sDismissOn(
          'typeahead input: should not close',
          gui,
          '.typeahead'
        ),
        Logger.t(
          'Broadcasting dismiss on input should not close popup',
          UiFinder.sExists(gui.element(), '[data-alloy-item-value]')
        ),

        TestBroadcasts.sDismissOn(
          'typeahead list option: should not close',
          gui,
          '[data-alloy-item-value="new-value22"]'
        ),
        Logger.t(
          'Broadcasting dismiss on list option should not close popup',
          UiFinder.sExists(gui.element(), '[data-alloy-item-value]')
        ),

         TestBroadcasts.sDismiss(
          'outer gui element: should close',
          gui,
          gui.element()
        ),
        Logger.t(
          'Broadcasting dismiss on outer gui context should close popup',
          UiFinder.sNotExists(gui.element(), '[data-alloy-item-value]')
        )

      ];
    }, function () { success(); }, failure);

  }
);