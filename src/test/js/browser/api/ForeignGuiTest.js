asynctest(
  'Browser Test: api.ForeignGuiTest',

  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.system.ForeignGui',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.test.GuiSetup',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.properties.Html',
    'global!document'
  ],

  function (
    ApproxStructure, Assertions, Mouse, Pipeline, Step, SystemEvents, ForeignGui, EventHandler, GuiSetup, Option, Insert, Remove, Body, Element, Node, Html,
    document
  ) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var root = Element.fromTag('div');
    Html.set(root, '<span class="clicker">A</span> and <span class="clicker">B</span>');

    Insert.append(Body.body(), root);

    var connection = ForeignGui.engage({
      root: root,
      insertion: function (parent, system) {
        Insert.append(parent, system.element());
      },
      dynamics: [
        {
          getTarget: function (elem) { return Node.name(elem) === 'span' ? Option.some(elem) : Option.none(); },
          config: {
            behaviours: {
              toggling: {
                toggleClass: 'selected'
              }
            },
            events: {
              click: EventHandler.nu({
                run: function (component, simulatedEvent) {
                  // We have to remove the proxy first, because we are during a proxied event (click)
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
      GuiSetup.mAddStyles(Element.fromDom(document), [
        '.selected { color: white; background: black; }'
      ]),
      Assertions.sAssertStructure(
        'Checking initial struture ... nothing is selected',
        ApproxStructure.build(function (s, str, arr) {
          return s.element('div', {
            children: [
              s.element('span', {
                classes: [ arr.not('selected') ]
              }),
              s.text( str.is(' and ')),
              s.element('span', {
                classes: [ arr.not('selected') ]
              }),
              s.element('div', {
                attrs: {
                  'data-alloy-id': str.startsWith('uid_')
                }
              })
            ]
          }); 
        }),
        root
      ),
      Mouse.sClickOn(root, 'span.clicker:first'),


      Assertions.sAssertStructure(
        'Checking struture after the first span is clicked',
        ApproxStructure.build(function (s, str, arr) {
          return s.element('div', {
            children: [
              s.element('span', {
                attrs: {
                  'data-alloy-id': str.none()
                },
                classes: [ arr.has('selected') ]
              }),
              s.text( str.is(' and ')),
              s.element('span', {
                classes: [ arr.not('selected') ]
              }),
              s.element('div', {
                attrs: {
                  'data-alloy-id': str.startsWith('uid_')
                }
              })
            ]
          }); 
        }),
        root
      ),

      Step.sync(function () {
        connection.disengage();
        Remove.remove(root);
      })
    ], function () { success(); }, failure);
  }
);
