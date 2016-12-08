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
    'ephox.alloy.api.ui.Typeahead',
    'ephox.alloy.api.ui.menus.MenuData',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.NavigationUtils',
    'ephox.alloy.test.Sinks',
    'ephox.alloy.test.TestBroadcasts',
    'ephox.alloy.test.typeahead.TestTypeaheadList',
    'ephox.alloy.test.typeahead.TestTypeaheadSteps',
    'ephox.knoch.future.Future',
    'ephox.perhaps.Result',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Focus',
    'ephox.sugar.api.Value',
    'ephox.sugar.api.Width',
    'global!Math'
  ],
 
  function (Assertions, Chain, FocusTools, Keyboard, Keys, Logger, Mouse, NamedChain, RealKeys, Step, UiControls, UiFinder, Waiter, GuiFactory, Typeahead, MenuData, GuiSetup, NavigationUtils, Sinks, TestBroadcasts, TestTypeaheadList, TestTypeaheadSteps, Future, Result, Css, Focus, Value, Width, Math) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      var sink = Sinks.relativeSink();

      return GuiFactory.build({
        uiType: 'custom',
        dom: { tag: 'div' },
        components: [
          { built: sink },
          Typeahead.build(function (parts) {
            return {
              minChars: 2,
              sink: sink,
              uid: 'test-type',
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
                  return MenuData.simple('blah', 'Blah', items);
                });
              },
              desc: 'test-typeahead',

              lazySink: function () { return Result.value(sink); },

              parts: {
                menu: TestTypeaheadList
              }
            };
          })
        ]
      });

    }, function (doc, body, gui, component, store) {

      var item = function (key) {
        return {
          selector: '.test-typeahead-selected-item[data-value="' + key + '"]',
          label: key
        };
      };

      var typeahead = gui.getByUid('test-type').getOrDie();

      var steps = TestTypeaheadSteps(doc, gui, typeahead);

      return [
        FocusTools.sSetFocus('Focusing typeahead', gui.element(), 'input'),

        GuiSetup.mAddStyles(doc, [
          '.test-typeahead-selected-item { background-color: #cadbee; }'
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
        // NOTE: Dupe with Dropdown test.
        // Logger.t(
        //   'Checking that the input width is passed onto the typeahead list width',
        //   Chain.asStep(gui.element(), [
        //     UiFinder.cFindIn('.test-typeahead-menu'),
        //     Chain.op(function (menu) {
        //       var inputWidth = Width.get(typeahead.element());
        //       var menuWidth = parseInt(
        //         Css.getRaw(menu, 'width').getOrDie('Menu must have a width property'),
        //         10
        //       );
        //       Assertions.assertEq(
        //         'Check that the menu width is approximately the same as the input width',
        //         true,
        //         Math.abs(menuWidth - inputWidth) < 20
        //       );
        //     })
        //   ])
        // ),

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

        Mouse.sClickOn(gui.element(), '.test-typeahead-item[data-value="new-value12"]'),
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
          '.test-typeahead-item[data-value="new-value122"]'
        ),
        steps.sWaitForMenu('Broadcasting on item should not dismiss popup'),

         TestBroadcasts.sDismiss(
          'outer gui element: should close',
          gui,
          gui.element()
        ),
        steps.sWaitForNoMenu('Broadcasting dismiss on outer gui context should close popup'),

        GuiSetup.mRemoveStyles

      ];
    }, function () { success(); }, failure);

  }
);