asynctest(
  'InlineViewTest',
 
  [
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.agar.api.Waiter',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Dropdown',
    'ephox.alloy.api.ui.InlineView',
    'ephox.alloy.api.ui.menus.MenuData',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.Sinks',
    'ephox.alloy.test.TestBroadcasts',
    'ephox.alloy.test.dropdown.TestDropdownMenu',
    'ephox.knoch.future.Future',
    'ephox.perhaps.Result'
  ],
 
  function (GeneralSteps, Logger, Mouse, Step, UiFinder, Waiter, GuiFactory, Button, Dropdown, InlineView, MenuData, GuiSetup, Sinks, TestBroadcasts, TestDropdownMenu, Future, Result) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return Sinks.relativeSink();
      

    }, function (doc, body, gui, component, store) {
      var inline =  GuiFactory.build(
        InlineView.build({
          dom: {
            tag: 'div',
            classes: [ 'test-inline' ]
          },

          lazySink: function () {
            return Result.value(component);
          }
          // onEscape: store.adderH('inline.escape')
        })
      );

      var sCheckOpen = function (label) {
        return Logger.t(
          label, 
          Waiter.sTryUntil(
            'Test inline should not be DOM',
            UiFinder.sExists(gui.element(), '.test-inline'),
            100,
            1000
          )
        );
      };

      var sCheckClosed = function (label) {
        return Logger.t(
          label, 
          Waiter.sTryUntil(
            'Test inline should not be in DOM',
            UiFinder.sNotExists(gui.element(), '.test-inline'),
            100,
            1000
          )
        );
      };

      return [
        UiFinder.sNotExists(gui.element(), '.test-inline'),
        Step.sync(function () {
          InlineView.showAt(inline, {
            anchor: 'selection',
            root: gui.element()
          }, {
            uiType: 'container',
            dom: {
              innerHtml: 'Inner HTML'
            }
          });
        }),
        sCheckOpen('After show'),

        Step.sync(function () {
          InlineView.hide(inline);
        }),

        sCheckClosed('After hide'),

        Logger.t(
          'Show inline view again, this time with buttons',
          Step.sync(function () {
            InlineView.showAt(inline, {
              anchor: 'selection',
              root: gui.element()
            }, {
              uiType: 'custom',
              dom: {
                tag: 'div'
              },
              components: [
                Button.build({ uid: 'bold-button', dom: { tag: 'button', innerHtml: 'B' }, action: store.adder('bold') }),
                Button.build({ uid: 'italic-button', dom: { tag: 'button', innerHtml: 'I' }, action: store.adder('italic') }),
                Button.build({ uid: 'underline-button', dom: { tag: 'button', innerHtml: 'U' }, action: store.adder('underline') }),
                Dropdown.build({
                  dom: {
                    tag: 'button',
                    innerHtml: '+'
                  },
                  components: [ ],

                  toggleClass: 'alloy-selected',

                  lazySink: function () { return Result.value(component); },
                  parts: {
                    menu: TestDropdownMenu(store)
                  },
                  fetch: function () {
                    var future = Future.pure([
                      { type: 'item', data: { value: 'option-1', text: 'Option-1' } },
                      { type: 'item', data: { value: 'option-2', text: 'Option-2' } }
                    ]);

                    return future.map(function (f) {
                      return MenuData.simple('test', 'Test', f);
                    });
                  }
                })
              ]
            });
          })
        ),

        sCheckOpen('Should still be open with buttons and a dropdown'),

        TestBroadcasts.sDismissOn(
          'toolbar: should not close',
          gui,
          '[data-alloy-id="bold-button"]'
        ),

        sCheckOpen('Broadcasting dismiss on button should not close inline toolbar'),

        store.sAssertEq('Check that the store is empty initially', [ ]),
        Mouse.sClickOn(gui.element(), 'button:contains("B")'),
        store.sAssertEq('Check that bold activated', [ 'bold' ]),


        // TODO: Make it not close if the inline toolbar had a dropdown, and the dropdown
        // item was selected. Requires composition of "isPartOf"
        Logger.t(
          'Check that clicking on a dropdown item in the inline toolbar does not dismiss popup',
          GeneralSteps.sequence([
            // Click on the dropdown
            Mouse.sClickOn(gui.element(), 'button:contains(+)'),
            // Wait until dropdown loads.
            Waiter.sTryUntil(
              'Waiting for dropdown list to appear',
              UiFinder.sExists(gui.element(), 'li:contains("Option-1")'),
              100, 1000
            ),
            TestBroadcasts.sDismissOn(
              'dropdown item: should not close',
              gui,
              'li:contains("Option-2")'
            ),
            sCheckOpen('Broadcasting dismiss on a dropdown item should not close inline toolbar')
          ])
        ),
        
        TestBroadcasts.sDismiss(
          'outer gui element: should close',
          gui,
          gui.element()
        ),

        sCheckClosed('Broadcasting dismiss on a external element should close inline toolbar')

      ];
    }, function () { success(); }, failure);

  }
);