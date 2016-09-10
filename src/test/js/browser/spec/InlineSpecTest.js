asynctest(
  'InlineSpecTest',
 
  [
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.agar.api.Waiter',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.Sinks',
    'ephox.alloy.test.TestBroadcasts',
    'ephox.knoch.future.Future',
    'ephox.peanut.Fun'
  ],
 
  function (GeneralSteps, Keyboard, Keys, Logger, Mouse, Step, UiFinder, Waiter, GuiFactory, EventHandler, GuiSetup, Sinks, TestBroadcasts, Future, Fun) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      var sink = Sinks.fixedSink();
      return GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div'
        },
        components: [
          { built: sink },
          { 
            uiType: 'custom',
            uid: 'test-box',
            dom: {
              tag: 'span',
              styles: {
                display: 'inline-block',
                border: '1px solid green',
                position: 'absolute',
                left: '300px',
                top: '200px',
                width: '20px',
                height: '20px'
              }
            }
          }
        ]
      });;

    }, function (doc, body, gui, component, store) {
      var sink = gui.getByUid('fixed-sink').getOrDie();
      // Inlines are interesting, in that they aren't initially part 
      // of a context. They are added to the context of the sink when shown
      var inline = GuiFactory.build({
        uiType: 'inline',
        sink: sink
      });

      var box = gui.getByUid('test-box').getOrDie();

      var popup = {
        uiType: 'custom',
        dom: {
          tag: 'div'
        },
        components: [
          { uiType: 'button', uid: 'bold-button', text: 'B', action: store.adder('bold') },
          { uiType: 'button', uid: 'italic-button', text: 'I', action: store.adder('italic') },
          { uiType: 'button', uid: 'underline-button', text: 'U', action: store.adder('underline') },
          {
            uiType: 'dropdown',
            fetchItems: function () {
              return Future.pure([
                { value: 'option-1', text: 'Option-1' },
                { value: 'option-2', text: 'Option-2' }
              ]);
            },
            text: 'Dropdown',
            sink: sink
          }
        ],
        keying: {
          mode: 'cyclic'
        }
      };

      return [
        Step.sync(function () {
          inline.apis().setAnchor({
            anchor: 'hotspot',
            hotspot: box
          });
        }),

        Step.async(function (next, die) {
          inline.apis().openSandbox(
            Future.pure(popup)
          ).get(next);
        }),

        TestBroadcasts.sDismissOn(
          'toolbar: should not close',
          gui,
          'button'
        ),
        Logger.t(
          'Broadcasting dismiss on button should not close inline toolbar',
          UiFinder.sExists(gui.element(), 'button')
        ),

        store.sAssertEq('Check that the store is empty initially', [ ]),
        Mouse.sClickOn(gui.element(), 'button:contains("B")'),
        store.sAssertEq('Check that bold activated', [ 'bold' ]),

      
        /*
        // TODO: Make it not close if the inline toolbar had a dropdown, and the dropdown
        // item was selected. Requires composition of "isPartOf"
        Logger.t(
          'Check that clicking on a dropdown item in the inline toolbar does not dismiss popup',
          GeneralSteps.sequence([
            // Click on the dropdown
            Mouse.sClickOn(gui.element(), 'button:contains(Dropdown)'),
            // Wait until dropdown loads.
            Waiter.sTryUntil(
              'Waiting for dropdown list to appear',
              UiFinder.sExists(gui.element(), '[data-alloy-item-value="option-2"]'),
              100, 1000
            ),
            TestBroadcasts.sDismissOn(
              'dropdown item: should not close',
              gui,
              '[data-alloy-item-value="option-2"]'
            ),
            Logger.t(
              'Broadcasting dismiss on outer gui context should close inline toolbar',
              UiFinder.sExists(gui.element(), 'button')
            )
          ])
        ),
        */

        TestBroadcasts.sDismiss(
          'outer gui element: should close',
          gui,
          gui.element()
        ),
        Logger.t(
          'Broadcasting dismiss on outer gui context should close inline toolbar',
          UiFinder.sNotExists(gui.element(), 'button')
        )
      ];
    }, function () { success(); }, failure);

  }
);