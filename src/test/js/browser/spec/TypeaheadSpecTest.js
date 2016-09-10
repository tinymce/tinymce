asynctest(
  'TypeaheadSpecTest',
 
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
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
    'ephox.knoch.future.Future',
    'ephox.sugar.api.Focus'
  ],
 
  function (Assertions, Chain, FocusTools, Keyboard, Keys, NamedChain, RealKeys, Step, UiControls, UiFinder, Waiter, GuiFactory, GuiSetup, NavigationUtils, Sinks, Future, Focus) {
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

        // // check that the typeahead is not open.
        // UiFinder.sNotExists(gui.element(), '[data-alloy-item-value]'),

        // RealKeys.sSendKeysOn(
        //   '.typeahead',
        //   [
        //     RealKeys.text('test-page')
        //   ]
        // ),

        // Waiter.sTryUntil(
        //   'Waiting for content to load',
        //   UiFinder.sExists(gui.element(), '[data-alloy-item-value]'),
        //   100, 3000
        // ),

        // // Focus should still be in the typeahead.
        // FocusTools.sTryOnSelector(
        //   'Focus should be on typeahead, not the list of options',
        //   doc,
        //   '.typeahead'
        // ),
        
        Keyboard.sKeydown(doc, Keys.down(), { }),
        FocusTools.sTryOnSelector(
          'Focus should be on list of options, not typeahead',
          doc,
          '[data-alloy-item-value="peo1"]'
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
        UiFinder.sNotExists(gui.element(), '[data-alloy-item-value]')

      ];
    }, function () { success(); }, failure);

  }
);