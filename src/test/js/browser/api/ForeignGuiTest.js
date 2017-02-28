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
      root: root,
      insertion: function (parent, system) {
        Insert.append(parent, system.element());
      },
      dynamics: [
        {
          getTarget: function (elem) { return Option.some(elem); },
          config: {
            behaviours: {
              toggling: {
                toggleClass: 'selected'
              }
            },
            events: {
              click: EventHandler.nu({
                run: function (component, simulatedEvent) {
                  // We have to remove the proxy first, because we are during a proxied event
                  connection.unproxy(component);
                  connection.dispatchTo(SystemEvents.execute(), simulatedEvent.event());
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
