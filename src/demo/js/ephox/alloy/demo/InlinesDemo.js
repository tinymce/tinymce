define(
  'ephox.alloy.demo.InlinesDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.knoch.future.Future',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Value',
    'global!document'
  ],

  function (Gui, GuiFactory, EventHandler, HtmlDisplay, Future, Class, DomEvent, Element, Insert, Value, document) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

      var sink = GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div'
        },
        positioning: {
          useFixed: true
        }
      });

      // Note, this should not in the GUI. It will be connected
      // when it opens.
      var inlineComp = GuiFactory.build({
        uiType: 'inline',
        uid: 'inline-comp',
        sink: sink
      });

      gui.add(sink);      

      var onMousedown = DomEvent.bind(Element.fromDom(document), 'mousedown', function (evt) {
        gui.broadcastOn([ 'dismiss.popups' ], {
          target: evt.target()
        });
      });

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
                    inlineComp.apis().setAnchor(anchor);
                    inlineComp.apis().showSandbox(
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
                            buttonType: {
                              mode: 'text',
                              text: 'B'
                            },
                            action: function () { console.log('inline bold'); }
                          },
                          {
                            uiType: 'button',
                            buttonType: {
                              mode: 'text',
                              text: 'I'
                            },
                            action: function () { console.log('inline italic'); }
                          },
                          {
                            uiType: 'button',
                            buttonType: {
                              mode: 'text',
                              text: 'U'
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