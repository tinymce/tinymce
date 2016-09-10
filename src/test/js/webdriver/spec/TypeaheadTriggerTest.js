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
    'ephox.knoch.future.Future',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Focus',
    'ephox.sugar.api.Width',
    'global!Math'
  ],
 
  function (Assertions, Chain, FocusTools, Keyboard, Keys, Logger, Mouse, NamedChain, RealKeys, Step, UiControls, UiFinder, Waiter, GuiFactory, GuiSetup, NavigationUtils, Sinks, Future, Css, Focus, Width, Math) {
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
        UiControls.sSetValue(typeahead.element(), 'a-'),

        // check that the typeahead is not open.
        UiFinder.sNotExists(gui.element(), '[data-alloy-item-value]'),

        RealKeys.sSendKeysOn(
          '.typeahead',
          [
            RealKeys.text('test-page')
          ]
        ),

        Waiter.sTryUntil(
          'Waiting for content to load',
          UiFinder.sExists(gui.element(), '[data-alloy-item-value]'),
          100, 3000
        ),

        // Focus should still be in the typeahead.
        FocusTools.sTryOnSelector(
          'Focus should be on typeahead, not the list of options',
          doc,
          '.typeahead'
        ),

        RealKeys.sSendKeysOn(
          '.typeahead',
          [
            RealKeys.backspace()
          ]
        ),

        // Focus should still be in the typeahead.
        FocusTools.sTryOnSelector(
          'Focus should still be on typeahead, not the list of options',
          doc,
          '.typeahead'
        ),
        
        Keyboard.sKeydown(doc, Keys.down(), { }),
        FocusTools.sTryOnSelector(
          'Focus should be on list of options, not typeahead',
          doc,
          '[data-alloy-item-value="a-test-page1"]'
        )
      ];
    }, function () { success(); }, failure);

  }
);