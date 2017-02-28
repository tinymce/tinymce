asynctest(
  'Browser Test: api.ForeignGuiTest',

  [
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.system.ForeignGui',
    'ephox.alloy.construct.EventHandler',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Html'
  ],

  function (Mouse, Pipeline, Step, SystemEvents, ForeignGui, EventHandler, Option, Insert, Body, Element, Html) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var root = Element.fromTag('div');
    Html.set(root, '<span class="clicker">A</span> and <span class="clicker">B</span>');

    Insert.append(Body.body(), root);

    var connection = ForeignGui.imbue({
      element: root,
      insertion: function (system) {
        Insert.append(root, system.element());
      },
      dynamics: [
        {
          getTarget: function () { return Option.none(); },
          config: {
            behaviours: {
              toggling: {
                toggleClass: 'selected'
              }
            },
            events: {
              click: EventHandler.nu({
                run: function (component, simulatedEvent) {
                  component.getSystem().triggerEvent(SystemEvents.execute(), simulatedEvent.event().target(), simulatedEvent.event());
                }
              })
            }
          }
        }
      ]
    });

    Pipeline.async({}, [
      Mouse.sClickOn(root, 'span.clicker:first'),

      Step.debugging
    ], function () { success(); }, failure);
  }
);
