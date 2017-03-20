asynctest(
  'Browser Test: events.AttachingEventTest',

  [
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.RawAssertions',
    'ephox.agar.api.Step',
    'ephox.alloy.alien.EventRoot',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.test.TestStore',
    'ephox.boulder.api.Objects',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.search.Traverse'
  ],

  function (Pipeline, RawAssertions, Step, EventRoot, GuiFactory, SystemEvents, Attachment, Gui, Container, EventHandler, TestStore, Objects, Body, Attr, Traverse) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var gui = Gui.takeover(
      GuiFactory.build(
        Container.sketch({
          dom: {
            classes: [ 'outer-container' ]
          }
        })
      )
    );

    var store = TestStore();

    var wrapper = GuiFactory.build({
      dom: {
        tag: 'div',
        classes: [ 'main-container' ],
        styles: {
          width: '100px',
          height: '100px'
        }
      },
      components: [
        Container.sketch({
          events: Objects.wrapAll([
            {
              key: SystemEvents.attachedToDom(),
              value: EventHandler.nu({
                run: function (comp, simulatedEvent) {
                  if (EventRoot.isSource(comp, simulatedEvent)) {
                    simulatedEvent.stop();
                    var parent = Traverse.parent(comp.element()).getOrDie(
                      'At attachedToDom, a DOM parent must exist'
                    );
                    store.adder('attached-to:' + Attr.get(parent, 'class'))();
                  }
                }
              })
            },
            {
              key: SystemEvents.detachedFromDom(),
              value: EventHandler.nu({
                run: function (comp, simulatedEvent) {
                  if (EventRoot.isSource(comp, simulatedEvent)) {
                    simulatedEvent.stop();
                    var parent = Traverse.parent(comp.element()).getOrDie(
                      'At detachedFromDom, a DOM parent must exist'
                    );
                    store.adder('detached-from:' + Attr.get(parent, 'class'))();
                  }
                }
              })
            },
            {
              key: SystemEvents.systemInit(),
              value: EventHandler.nu({
                run: function (comp, simulatedEvent) {
                  if (EventRoot.isSource(comp, simulatedEvent)) {
                    simulatedEvent.stop();
                    store.adder('init')();
                  }
                }
              })
            }
          ])
        

        })
      ]
    });

    Pipeline.async({}, [
      Step.sync(function () {
        RawAssertions.assertEq(
          'Checking that the component has no size',
          0, 
          wrapper.element().dom().getBoundingClientRect().width
        );
      }),

      store.sAssertEq('Nothing has fired yet', [ ]),

      Step.sync(function () {
        gui.add(wrapper);
        store.assertEq('After adding to system, init should have fired', [ 'init' ]);
      }),

      Step.wait(500),

      Step.sync(function () {
        RawAssertions.assertEq(
          'Even though added to system, not added to DOM yet so still size 0',
          0, 
          wrapper.element().dom().getBoundingClientRect().width
        );
      }),
      store.sAssertEq('After adding to system and waiting, still only init should have fired', [ 'init' ]),
      store.sClear,

      Step.sync(function () {
        Attachment.attachSystem(Body.body(), gui);
      }),

      Step.sync(function () {
        RawAssertions.assertEq(
          'Now added to the DOM, so should have size 100',
          100, 
          wrapper.element().dom().getBoundingClientRect().width
        );
      }),

      store.sAssertEq('After adding to the DOM, should have fired attached', [ 'attached-to:main-container' ]),
      store.sClear,

      Step.sync(function () {
        Attachment.detachSystem(gui);
      }),

      store.sAssertEq('After detaching from the DOM, should have fired detached', [ 'detached-from:main-container' ])
    ], function () { success(); }, failure);
  }
);
