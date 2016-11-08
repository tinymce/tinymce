define(
  'ephox.alloy.demo.InlinesDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.GuiTemplate',
    'ephox.alloy.api.behaviour.Sandboxing',
    'ephox.alloy.api.ui.InlineApis',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.demo.DemoTemplates',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.knoch.future.Future',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.perhaps.Result',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Value',
    'global!document',
    'text!dom-templates/demo.menu.html'
  ],

  function (Gui, GuiFactory, GuiTemplate, Sandboxing, InlineApis, EventHandler, DemoTemplates, HtmlDisplay, Future, Fun, Option, Result, Class, DomEvent, Element, Insert, Value, document, TemplateMenu) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

      var sink = GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div',
          styles: {
            'background': 'green',
            margin: '10px',
            border: '1px solid blue',
            'min-height': '10px'
          }
        },
        positioning: {
          useFixed: true
        }
      });


      var lazySink = function () {
        return Result.value(sink);
      };

      // Note, this should not in the GUI. It will be connected
      // when it opens.
      var inlineComp = GuiFactory.build({
        uiType: 'inline',
        uid: 'inline-comp',
        lazySink: Fun.constant(Result.value(sink))
      });

      var inlineMenu = GuiFactory.build({
        uiType: 'inline-view',
        dom: {
          tag: 'div'
        },

        fetch: function () {
          return Future.pure({
            uiType: 'container'
          });
        },

        onExecute: function () {
          console.log('here', arguments);
        },

        lazySink: lazySink,

        view: {
          style: 'layered',
          markers: {
            item: 'alloy-item',
            selectedItem: 'alloy-selected-item',
            menu: 'alloy-menu',
            selectedMenu: 'alloy-selected-menu'
          },
        
          members: {
            menu: {
              munge: function (spec) {
                return GuiTemplate.use(
                  Option.none(),
                  TemplateMenu,
                  { },
                  {
                    fields: {
                      'aria-label': spec.textkey
                    }
                  }
                );
              }
            },
            item: {
              munge: function (spec) {
                return DemoTemplates.item(spec);
              }
            }
            // menu: GuiTempalte.use(TemplateMenu)
            // dom: {
            //   tag: 'div'  
            // },
            // itemDefn: { }            
          },
          scaffold: Fun.identity
        }
      });

      gui.add(sink);      

      var onMousedown = DomEvent.bind(Element.fromDom(document), 'mousedown', function (evt) {
        gui.broadcastOn([ 'dismiss.popups' ], {
          target: evt.target()
        });
      });

      HtmlDisplay.section(
        gui,
        'This inline menu component is a context menu. Right click inside the yellow area',
        {
          uiType: 'custom',
          dom: {
            tag: 'div',
            styles: {
              background: '#ffff33',
              height: '100px'
            }
          },
          events: {
            contextmenu: EventHandler.nu({
              run: function (component, simulatedEvent) {
                simulatedEvent.event().kill();
                InlineApis.setAnchor(inlineMenu, {
                  anchor: 'makeshift',
                  x: simulatedEvent.event().x(),
                  y: simulatedEvent.event().y()
                });
                Sandboxing.showSandbox(
                  inlineMenu, 
                  Future.pure({
                    expansions: { },
                    menus: {
                      dog: {
                        items: [
                          { type: 'item', value: 'alpha', text: 'Alpha', 'item-class': 'alpha' },
                          { type: 'item', value: 'beta', text: 'Beta', 'item-class': 'beta' },
                          { type: 'item', value: 'gamma', text: 'Gamma', 'item-class': 'gamma' },
                          { type: 'item', value: 'delta', text: 'Delta', 'item-class': 'delta' }

                        ],
                        textkey: 'Dog'
                      }
                    },
                    primary: 'dog'
                  })
                ).get(Fun.identity);
              }
            })
          }
        }
      );
      

      HtmlDisplay.section(
        gui,
        'This inline toolbar shows up when you click in the second input field. Note, ' + 
        'how when you focus an empty input, it will attach at the end of the field, and ' +
        'when you focus a non-empty input, it will attach below',
        {
          uiType: 'custom',
          dom: {
            tag: 'div'
          },
          keying: {
            mode: 'cyclic',
            selector: 'input'
          },
          components: [
            {
              uiType: 'input',
              dom: {
                styles: { display: 'block', 'margin-bottom': '50px' }
              }
            },
            {
              uiType: 'input',
              dom: {
                styles: { display: 'block' }
              },
              events: {
                // Want DOM focus. Focusing behaviour uses alloy focus.
                focusin: EventHandler.nu({
                  run: function (input) {
                    var emptyAnchor = {
                      anchor: 'submenu',
                      item: input
                    };

                    var nonEmptyAnchor = {
                      anchor: 'selection',
                      root: gui.element()
                    };

                    var anchor = Value.get(input.element()).length > 0 ? nonEmptyAnchor : emptyAnchor;
                    InlineApis.setAnchor(inlineComp, anchor);
                    Sandboxing.showSandbox(
                      inlineComp, 
                      Future.pure({
                        uiType: 'custom',
                        dom: {
                          tag: 'div'
                        },
                        keying: {
                          mode: 'flow',
                          selector: 'button'
                        },
                        components: [
                          {
                            uiType: 'button',
                            dom: {
                              tag: 'button',
                              innerHtml: 'B'
                            },
                            action: function () { console.log('inline bold'); }
                          },
                          {
                            uiType: 'button',
                            dom: {
                              tag: 'button',
                              innerHtml: 'I'
                            },
                            action: function () { console.log('inline italic'); }
                          },
                          {
                            uiType: 'button',
                            dom: {
                              tag: 'button',
                              innerHtml: 'U'
                            },
                            action: function () { console.log('inline underline'); }
                          }
                        ]
                      })
                    ).get(function () { });
                  }
                })
              }
            }

          ]
        }
      );
    };
  }
);