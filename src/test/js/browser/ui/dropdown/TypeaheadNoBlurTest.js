asynctest(
  'Browser Test: .ui.dropdown.TypeaheadNoBlurTest',

  [
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Step',
    'ephox.agar.api.Waiter',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.TieredMenu',
    'ephox.alloy.api.ui.Typeahead',
    'ephox.alloy.test.dropdown.TestDropdownMenu',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.Sinks',
    'ephox.alloy.test.TestBroadcasts',
    'ephox.alloy.test.typeahead.TestTypeaheadSteps',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Result',
    'ephox.sugar.api.dom.Focus',
    'ephox.sugar.api.properties.Value'
  ],

  function (
    FocusTools, Keyboard, Keys, Step, Waiter, Behaviour, Focusing, GuiFactory, Container, TieredMenu, Typeahead, TestDropdownMenu, GuiSetup, Sinks, TestBroadcasts,
    TestTypeaheadSteps, Arr, Future, Result, Focus, Value
  ) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      var sink = Sinks.relativeSink();

      return GuiFactory.build(
        Container.sketch({
          components: [
            GuiFactory.premade(sink),

            Typeahead.sketch({
              dismissOnBlur: false,

              minChars: 2,
              uid: 'test-type',
              markers: {
                // TODO: Test this
                openClass: 'test-typeahead-open'
              },

              dom: {
                tag: 'input'
              },
              data: {
                value: 'initial-value',
                text: 'initial-value'
              },

              fetch: function (input) {
                var text = Value.get(input.element());
                var future = Future.pure([
                  { type: 'item', data: { value: text + '1', text: text + '1' } },
                  { type: 'item', data: { value: text + '2', text: text + '2' } }
                ]);

                return future.map(function (f) {
                  // TODO: Test this.
                  var items = text === 'no-data' ? [
                    { type: 'separator', text: 'No data' }
                  ] : f;
                  var menu = TestDropdownMenu.renderMenu({
                    value: 'blah',
                    items: Arr.map(items, TestDropdownMenu.renderItem)
                  });
                  return TieredMenu.singleData('blah.overall', menu);
                });
              },

              lazySink: function () { return Result.value(sink); },

              parts: {
                menu: TestDropdownMenu.part(store)
              }
            })
          ],

          containerBehaviours: Behaviour.derive([
            Focusing.config({ })
          ])
        })
      );

    }, function (doc, body, gui, component, store) {

      var typeahead = gui.getByUid('test-type').getOrDie();

      var steps = TestTypeaheadSteps(doc, gui, typeahead);

      return [
        GuiSetup.mAddStyles(doc, [
          '.selected-item { background-color: #cadbee; }'
        ]),
        FocusTools.sSetFocus('Focusing typeahead', gui.element(), 'input'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        steps.sWaitForMenu('Down to activate menu'),

        TestBroadcasts.sDismiss(
          'outer gui element: should close',
          gui,
          gui.element()
        ),
        steps.sWaitForNoMenu('Broadcasting dismiss on outer gui context should close popup'),

        Keyboard.sKeydown(doc, Keys.down(), { }),
        steps.sWaitForMenu('Down to activate menu'),
        // Focus something else.
        Step.sync(function () {
          Focus.focus(component.element());
        }),
        Step.wait(1000),
        steps.sWaitForMenu('Blurring should NOT dismiss popup due to setting'),

        Step.sync(function () {
          Focus.focus(typeahead.element());
        }),
        Keyboard.sKeydown(doc, Keys.escape(), { }),
        steps.sWaitForNoMenu('Escape should still dismiss regardless of setting'),
        GuiSetup.mRemoveStyles
      ];
    }, success, failure);
  }
);
