asynctest(
  'Browser Test: .behaviour.AttachingTest',

  [
    'ephox.agar.api.RawAssertions',
    'ephox.agar.api.Step',
    'ephox.agar.api.Waiter',
    'ephox.alloy.alien.EventRoot',
    'ephox.alloy.api.behaviour.Attaching',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.events.EventSource',
    'ephox.alloy.test.GuiSetup',
    'ephox.boulder.api.Objects',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.search.Traverse'
  ],

  function (
    RawAssertions, Step, Waiter, EventRoot, Attaching, Behaviour, GuiFactory, SystemEvents, Container, EventHandler, EventSource, GuiSetup, Objects, Insert,
    Attr, Traverse
  ) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];


    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        Container.sketch({
          dom: {
            classes: [ 'main-container' ]
          }
        })
      );
    }, function (doc, body, gui, component, store) {

      var subject = GuiFactory.build({
        dom: {
          tag: 'div',
          styles: {
            width: '100px',
            height: '100px'
          }
        },
        behaviours: Behaviour.derive([
          Attaching.config({ })
        ]),

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
          }
        ])
      });

      return [
        Step.sync(function () {
          RawAssertions.assertEq(
            'Checking that the component has no size',
            0, 
            subject.element().dom().getBoundingClientRect().width
          );
        }),

        store.sAssertEq('Checking attached has not fired yet', [ ]),

        Step.sync(function () {
          component.getSystem().addToWorld(subject);
          Insert.append(component.element(), subject.element());
        }),

        Step.sync(function () {
          RawAssertions.assertEq(
            'Checking that the component has 100 width now that it is in the DOM',
            100, 
            subject.element().dom().getBoundingClientRect().width
          );
        }),

        Waiter.sTryUntil(
          'Waiting for attached to fire',
          store.sAssertEq('Checking attached has now fired', [ 'attached-to:main-container' ]),
          100,
          1000
        )
      ];

    }, function () { success(); }, failure);
  }
);
