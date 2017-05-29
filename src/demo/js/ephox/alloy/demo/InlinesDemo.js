define(
  'ephox.alloy.demo.InlinesDemo',

  [
    'ephox.alloy.api.behaviour.AddEventsBehaviour',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.events.NativeEvents',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.InlineView',
    'ephox.alloy.api.ui.Input',
    'ephox.alloy.api.ui.TieredMenu',
    'ephox.alloy.demo.DemoSink',
    'ephox.alloy.demo.forms.DemoRenders',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Result',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.properties.Value',
    'global!console',
    'global!document'
  ],

  function (
    AddEventsBehaviour, Behaviour, Keying, Positioning, GuiFactory, AlloyEvents, NativeEvents, Attachment, Gui, Button, Container, InlineView, Input, TieredMenu,
    DemoSink, DemoRenders, HtmlDisplay, Arr, Fun, Option, Result, Element, Class, Value, console, document
  ) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Attachment.attachSystem(body, gui);

      var sink = DemoSink.make();


      var lazySink = function () {
        return Result.value(sink);
      };

      // Note, this should not in the GUI. It will be connected
      // when it opens.
      var inlineComp = GuiFactory.build(
        InlineView.sketch({
          uid: 'inline-comp',
          dom: {
            tag: 'div'
          },
          lazySink: Fun.constant(Result.value(sink))
        })
      );

      var inlineMenu = TieredMenu.sketch({
        dom: {
          tag: 'div'
        },

        onEscape: function () {
          console.log('inline.menu.escape');
          return Option.some(true);
        },

        onExecute: function () {
          console.log('inline.menu.execute');
        },

        onOpenMenu: function (sandbox, menu) {
          // handled by inline view itself
        },

        onOpenSubmenu: function (sandbox, item, submenu) {
          var sink = lazySink().getOrDie();
          Positioning.position(sink, {
            anchor: 'submenu',
            item: item,
            bubble: Option.none()
          }, submenu);

        },

        data: {
          expansions: {
            'gamma': 'gamma-menu'
          },
          menus: {
            dog: DemoRenders.menu({
              value: 'dog',
              items: Arr.map([
                { type: 'item', data: { value: 'alpha', text: 'Alpha', 'item-class': 'alpha' } },
                { type: 'item', data: { value: 'beta', text: 'Beta', 'item-class': 'beta' } },
                { type: 'item', data: { value: 'gamma', text: 'Gamma', 'item-class': 'gamma' } },
                { type: 'item', data: { value: 'delta', text: 'Delta', 'item-class': 'delta' } }

              ], DemoRenders.item),
              textkey: 'Dog'
            }),
            'gamma-menu': DemoRenders.menu({
              value: 'gamma-menu',
              items: Arr.map([
                { type: 'item', data: { value: 'gamma-1', text: 'Gamma-1', 'item-class': 'gamma-1' } },
                { type: 'item', data: { value: 'gamma-2', text: 'Gamma-2', 'item-class': 'gamma-2' } }
              ], DemoRenders.item),
              textkey: 'gamma-menu'
            })
          },
          primary: 'dog'
        },

        markers: DemoRenders.tieredMarkers()
      });

      gui.add(sink);

      HtmlDisplay.section(
        gui,
        'This inline menu component is a context menu. Right click inside the yellow area',
        Container.sketch({
          dom: {
            styles: {
              background: '#ffff33',
              height: '100px'
            }
          },
          events: AlloyEvents.derive([
            AlloyEvents.run(NativeEvents.contextmenu(), function (component, simulatedEvent) {
              simulatedEvent.event().kill();
              console.log('inlineMenu', inlineMenu);
              InlineView.showAt(inlineComp, {
                anchor: 'makeshift',
                x: simulatedEvent.event().x(),
                y: simulatedEvent.event().y()
              }, inlineMenu);
            })
          ])
        })
      );


      HtmlDisplay.section(
        gui,
        'This inline toolbar shows up when you click in the second input field. Note, ' +
        'how when you focus an empty input, it will attach at the end of the field, and ' +
        'when you focus a non-empty input, it will attach below',
        Container.sketch({
          containerBehaviours: Behaviour.derive([
            Keying.config({
              mode: 'cyclic',
              selector: 'input'
            })
          ]),
          components: [
            Input.sketch({
              dom: {
                styles: { display: 'block', 'margin-bottom': '50px' }
              }
            }),
            Input.sketch({
              dom: {
                styles: { display: 'block' }
              },

              inputBehaviours: Behaviour.derive([
                AddEventsBehaviour.config('adhoc-show-popup', [
                  AlloyEvents.run(NativeEvents.focusin(), function (input) {
                    var emptyAnchor = {
                      anchor: 'submenu',
                      item: input
                    };

                    var nonEmptyAnchor = {
                      anchor: 'selection',
                      root: gui.element()
                    };

                    var anchor = Value.get(input.element()).length > 0 ? nonEmptyAnchor : emptyAnchor;
                    InlineView.showAt(inlineComp, anchor, Container.sketch({
                      containerBehaviours: Behaviour.derive([
                        Keying.config({
                          mode: 'flow',
                          selector: 'button'
                        })
                      ]),
                      components: [
                        Button.sketch({
                          dom: {
                            tag: 'button',
                            innerHtml: 'B'
                          },
                          action: function () { console.log('inline bold'); }
                        }),
                        Button.sketch({
                          dom: {
                            tag: 'button',
                            innerHtml: 'I'
                          },
                          action: function () { console.log('inline italic'); }
                        }),
                        Button.sketch({
                          dom: {
                            tag: 'button',
                            innerHtml: 'U'
                          },
                          action: function () { console.log('inline underline'); }
                        })
                      ]

                    }));
                  })
                ])
              ])
            })
          ]
        })
      );
    };
  }
);