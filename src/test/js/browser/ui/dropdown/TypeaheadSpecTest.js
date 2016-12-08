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
    'ephox.knoch.future.Future',
    'ephox.perhaps.Result',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Focus',
    'ephox.sugar.api.Value',
    'ephox.sugar.api.Width',
    'global!Math'
  ],
 
  function (Assertions, Chain, FocusTools, Keyboard, Keys, Logger, Mouse, NamedChain, RealKeys, Step, UiControls, UiFinder, Waiter, GuiFactory, Typeahead, MenuData, GuiSetup, NavigationUtils, Sinks, TestBroadcasts, Future, Result, Css, Focus, Value, Width, Math) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var listMenu = {
      members: {
        menu: {
          munge: function (spec) {
            return {
              dom: {
                tag: 'ol',
                attributes: {
                  'aria-label': spec.text
                },
                classes: [ 'test-typeahead-menu' ]
              },
              shell: true,
              components: [ ]
            };
          }
        },
        item: {
          munge: function (spec) {

            return spec.type === 'separator' ? {
              uiType: 'container',
              dom: {
                tag: 'div',
                innerHtml: spec.data.text
              },
              components: [

              ]
            } : {
              dom: {
                tag: 'li',
                classes: spec.type === 'item' ? [ 'test-typeahead-item' ] : [ ],
                attributes: {
                  'data-value': spec.data.value
                },
                innerHtml: spec.data.text
              },
              components: [

              ]
            };
          }
        }
      },
      markers: {
        item: 'test-typeahead-item',
        selectedItem: 'test-typeahead-selected-item',
        menu: 'test-typeahead-menu',
        selectedMenu: 'test-typeahead-selected-menu',
        'backgroundMenu': 'test-typeahead-background-menu'
      }
    };

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
                  return MenuData.simple('blah', 'Blah', f);
                });
              },
              desc: 'test-typeahead',

              lazySink: function () { return Result.value(sink); },

              parts: {
                menu: listMenu
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

      var sWaitForMenu = function (label) {
        return Logger.t(
          label, 
          Waiter.sTryUntil(
            'Waiting for menu to appear',
            UiFinder.sExists(gui.element(), '.test-typeahead-selected-menu'),
            100,
            1000
          )
        );
      };

      var sWaitForNoMenu = function (label) {
        return Logger.t(
          label,
          Waiter.sTryUntil(
            'Waiting for menu to go away',
            UiFinder.sNotExists(gui.element(),  '.test-typeahead-selected-menu'),
            100,
            1000
          )
        );
      };

      var sAssertFocusOnTypeahead = function (label) {
        return Logger.t(
          label,
          FocusTools.sTryOnSelector(
            'Focus should be on typeahead',
            doc,
            'input'
          )
        );
      };

      var sAssertValue = function (label, expected) {
        return Logger.t(
          label,
          Chain.asStep(typeahead.element(), [
            Chain.op(function (t) {
              Focus.focus(t);
            }),
            UiControls.cGetValue,
            Assertions.cAssertEq('Checking value of typeahead', expected)
          ])
        );
      };

      var typeahead = gui.getByUid('test-type').getOrDie();
      return [
        GuiSetup.mAddStyles(doc, [
          '.test-typeahead-selected-item { background-color: #cadbee; }'
        ]),

        sAssertValue('Initial value of typeahead', 'initial-value'),
        UiControls.sSetValue(typeahead.element(), 'peo'),

        // check that the typeahead is not open.
        sWaitForNoMenu('Should be no menu initially'),
        
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnTypeahead('Focus stays on typeahead after pressing Down'),
        sWaitForMenu('Down to activate menu'),

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
        sAssertValue('Value after <enter>', 'peo2'),
        sAssertFocusOnTypeahead('Focus after <enter>'),

        sWaitForNoMenu('No menu after <enter>'),

        UiControls.sSetValue(typeahead.element(), 'new-value'),
        Keyboard.sKeydown(doc, Keys.down(), {}),

        sAssertFocusOnTypeahead('After pressing Down after Enter'),
        sWaitForMenu('After pressing Down after Enter'),
        NavigationUtils.highlights(gui.element(), Keys.down(), {}, [
          item('new-value2'),
          item('new-value1')
        ]),

        Keyboard.sKeydown(doc, Keys.escape(), { }),
        sAssertValue('After pressing ESC', 'new-value1'),
        sAssertFocusOnTypeahead('After pressing ESC'),
        sWaitForNoMenu('After pressing ESC'),
        
        Keyboard.sKeydown(doc, Keys.down(), {}),
        sAssertFocusOnTypeahead('ESC > Down'),
        sWaitForMenu('ESC > Down'),

        NavigationUtils.highlights(gui.element(), Keys.down(), {}, [
          item('new-value12'),
          item('new-value11')
        ]),

        Mouse.sClickOn(gui.element(), '.test-typeahead-item[data-value="new-value12"]'),
        sWaitForNoMenu('After clicking on item'),
        sAssertValue('After clicking on item', 'new-value12'),

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
        ),

        GuiSetup.mRemoveStyles

      ];
    }, function () { success(); }, failure);

  }
);