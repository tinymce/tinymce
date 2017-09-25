asynctest(
  'TypeaheadTest',

  [
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiControls',
    'ephox.agar.api.UiFinder',
    'ephox.agar.api.Waiter',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.events.AlloyTriggers',
    'ephox.alloy.api.events.NativeEvents',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.TieredMenu',
    'ephox.alloy.api.ui.Typeahead',
    'ephox.alloy.test.dropdown.DropdownAssertions',
    'ephox.alloy.test.dropdown.TestDropdownMenu',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.NavigationUtils',
    'ephox.alloy.test.Sinks',
    'ephox.alloy.test.TestBroadcasts',
    'ephox.alloy.test.typeahead.TestTypeaheadSteps',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Result',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Value',
    'ephox.sugar.api.search.SelectorFind',
    'global!Math'
  ],

  function (
    FocusTools, Keyboard, Keys, Mouse, Step, UiControls, UiFinder, Waiter, GuiFactory, AlloyTriggers, NativeEvents, Container, TieredMenu, Typeahead, DropdownAssertions,
    TestDropdownMenu, GuiSetup, NavigationUtils, Sinks, TestBroadcasts, TestTypeaheadSteps, Arr, Future, Merger, Result, Attr, Value, SelectorFind, Math
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
          ]
        })
      );

    }, function (doc, body, gui, component, store) {

      var item = function (key) {
        return {
          selector: '.selected-item[data-value="' + key + '"]',
          label: key
        };
      };

      var typeahead = gui.getByUid('test-type').getOrDie();

      var steps = TestTypeaheadSteps(doc, gui, typeahead);

      return [
        FocusTools.sSetFocus('Focusing typeahead', gui.element(), 'input'),

        GuiSetup.mAddStyles(doc, [
          '.selected-item { background-color: #cadbee; }'
        ]),

        steps.sAssertValue('Initial value of typeahead', 'initial-value'),
        UiControls.sSetValue(typeahead.element(), 'peo'),

        // check that the typeahead is not open.
        steps.sWaitForNoMenu('Should be no menu initially'),

        Keyboard.sKeydown(doc, Keys.down(), { }),
        steps.sAssertFocusOnTypeahead('Focus stays on typeahead after pressing Down'),
        steps.sWaitForMenu('Down to activate menu'),

        // On typeaheads, there should be a width property that is approximately
        // the same size as the input field
        DropdownAssertions.sSameWidth('Typeahead', gui, typeahead, '.menu'),

        NavigationUtils.highlights(gui.element(), Keys.down(), {}, [
          item('peo2'),
          item('peo1'),
          item('peo2')
        ]),

        Keyboard.sKeydown(doc, Keys.enter(), { }),
        steps.sAssertValue('Value after <enter>', 'peo2'),
        steps.sAssertFocusOnTypeahead('Focus after <enter>'),

        steps.sWaitForNoMenu('No menu after <enter>'),

        UiControls.sSetValue(typeahead.element(), 'new-value'),
        Keyboard.sKeydown(doc, Keys.down(), {}),

        steps.sAssertFocusOnTypeahead('After pressing Down after Enter'),
        steps.sWaitForMenu('After pressing Down after Enter'),
        NavigationUtils.highlights(gui.element(), Keys.down(), {}, [
          item('new-value2'),
          item('new-value1')
        ]),

        Keyboard.sKeydown(doc, Keys.escape(), { }),
        steps.sAssertValue('After pressing ESC', 'new-value1'),
        steps.sAssertFocusOnTypeahead('After pressing ESC'),
        steps.sWaitForNoMenu('After pressing ESC'),

        Keyboard.sKeydown(doc, Keys.down(), {}),
        steps.sAssertFocusOnTypeahead('ESC > Down'),
        steps.sWaitForMenu('ESC > Down'),

        NavigationUtils.highlights(gui.element(), Keys.down(), {}, [
          item('new-value12'),
          item('new-value11')
        ]),

        Mouse.sClickOn(gui.element(), '.item[data-value="new-value12"]'),
        steps.sWaitForNoMenu('After clicking on item'),
        steps.sAssertValue('After clicking on item', 'new-value12'),

        // check dismissing popups
        Keyboard.sKeydown(doc, Keys.down(), { }),
        steps.sWaitForMenu('Pressing down to check for dismissing popups'),
        steps.sAssertFocusOnTypeahead('Pressing down to check for dismissing popups'),
        TestBroadcasts.sDismissOn(
          'typeahead input: should not close',
          gui,
          'input'
        ),
        steps.sWaitForMenu('Broadcasting on input should not dismiss popup'),

        TestBroadcasts.sDismissOn(
          'typeahead list option: should not close',
          gui,
          '.item[data-value="new-value122"]'
        ),
        steps.sWaitForMenu('Broadcasting on item should not dismiss popup'),

        TestBroadcasts.sDismiss(
          'outer gui element: should close',
          gui,
          gui.element()
        ),
        steps.sWaitForNoMenu('Broadcasting dismiss on outer gui context should close popup'),

        // Trigger menu again
        UiControls.sSetValue(typeahead.element(), 'neo'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        steps.sWaitForMenu('Waiting for menu to appear for "neo"'),
        NavigationUtils.highlights(gui.element(), Keys.down(), {}, [
          item('neo2')
        ]),

        TestDropdownMenu.mStoreMenuUid(component),
        UiControls.sSetValue(typeahead.element(), 'neo'),
        Step.sync(function () {
          AlloyTriggers.emit(typeahead, NativeEvents.input());
        }),
        TestDropdownMenu.mWaitForNewMenu(component),
        Waiter.sTryUntil(
          'Selection should stay on neo2 if possible',
          UiFinder.sExists(gui.element(), item('neo2').selector),
          100,
          1000
        ),

        GuiSetup.mRemoveStyles

      ];
    }, function () { success(); }, failure);

  }
);