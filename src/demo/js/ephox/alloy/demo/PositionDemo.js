define(
  'ephox.alloy.demo.PositionDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.demo.DemoContent',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.photon.Writer',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert'
  ],

  function (Gui, GuiFactory, EventHandler, DemoContent, HtmlDisplay, Writer, Class, Css, DomEvent, Element, Insert) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Css.set(gui.element(), 'direction', 'rtl');
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

      gui.add(sink);

      var popup = GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div'
        },
        components: [
          {
            uiType: 'custom',
            dom: {
              tag: 'div',
              styles: {
                'padding': '10px',
                background: 'white',
                border: '2px solid black'
              }
            },
            components: [
              { text: 'This is a popup' }
            ]
          }
        ]
      });

      var section1 = HtmlDisplay.section(
        gui,
        'Position anchoring to button',
        {
          uiType: 'button',
          eventOrder: {
            'alloy.execute': [ 'toggling', 'alloy.base.behaviour' ]
          },
          action: function (comp) {
            if (comp.apis().isSelected()) {
              sink.apis().addContainer(popup);
              sink.apis().position({
                anchor: 'hotspot',
                hotspot: comp
              }, popup);
            } else {
              sink.apis().removeContainer(popup);
            }
          },
          text: 'Toggle Popup',
          toggling: {
            toggleClass: 'demo-selected'
          }
        }
      );

      var section2 = HtmlDisplay.section(
        gui,
        'Position anchoring to menu',
        {
          uiType: 'custom',
          dom: {
            tag: 'ol',
            styles: {
              'list-style-type': 'none'
            }
          },
          components: [
            {
              uiType: 'custom',
              dom: {
                tag: 'li',
                innerHtml: 'Hover over me',
                styles: {
                  border: '1px solid gray',
                  width: '100px'
                }
              },
              events: {
                mouseover: EventHandler.nu({
                  run: function (item) {
                    sink.apis().addContainer(popup);
                    sink.apis().position({
                      anchor: 'submenu',
                      item: item
                    }, popup);
                  }
                })
              }
            }
          ]
        }
      );

      var section3 = HtmlDisplay.section(
        gui,
        'Position anchoring to text selection',
        {
          uiType: 'custom',
          dom: {
            tag: 'div'
          },
          components: [
            {
              uiType: 'custom',
              dom: {
                tag: 'div',
                attributes: {
                  'contenteditable': 'true'
                },
                styles: {
                  border: '1px solid green',
                  width: '300px',
                  height: '200px',
                  'overflow-y': 'scroll',
                  display: 'inline-block'
                },
                innerHtml: DemoContent.generate(20)
              },
              uid: 'text-editor'
            },
            {
              uiType: 'button',
              text: 'Show popup at cursor',
              action: function (button) {
                sink.apis().addContainer(popup);
                sink.apis().position({
                  anchor: 'selection',
                  root: button.getSystem().getByUid('text-editor').getOrDie(
                    'Could not find text editor'
                  ).element()
                }, popup);
              }
            }
          ]
        }
      );

      // Maybe make a component.
      var frame = Element.fromTag('iframe');
      var onLoad = DomEvent.bind(frame, 'load', function () {
        onLoad.unbind();

        var html = '<!doctype html><html><body contenteditable="true">' + DemoContent.generate(20) + '</body></html>';
        Writer.write(frame, html);
      });

      var section4 = HtmlDisplay.section(
        gui,
        'Position anchoring to text selection [iframe]',
        {
          uiType: 'custom',
          dom: {
            tag: 'div'
          },
          components: [
            {
              external: {
                element: frame,
                uid: 'frame-editor'
              }
            },
            {
              uiType: 'button',
              text: 'Show popup at cursor',
              action: function (button) {
                sink.apis().addContainer(popup);
                sink.apis().position({
                  anchor: 'selection',
                  root: Element.fromDom(frame.dom().contentWindow.document.body)
                }, popup);
              }
            }
          ]
        }
      );
    };
  }
);