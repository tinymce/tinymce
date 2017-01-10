define(
  'ephox.alloy.demo.PositionDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.demo.DemoContent',
    'ephox.alloy.demo.DemoSink',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.photon.Writer',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert'
  ],

  function (Gui, GuiFactory, Positioning, Toggling, Button, Container, EventHandler, DemoContent, DemoSink, HtmlDisplay, Writer, Class, Css, DomEvent, Element, Insert) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Css.set(gui.element(), 'direction', 'rtl');
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

      var sink = DemoSink.make();

      gui.add(sink);

      var popup = GuiFactory.build(
        Container.build({
          components: [
            Container.build({
              dom: {
                styles: {
                  'padding': '10px',
                  background: 'white',
                  border: '2px solid black'
                }
              },
              components: [
                GuiFactory.text('This is a popup')
              ]
            })
          ]
        })
      );

      var section1 = HtmlDisplay.section(
        gui,
        'Position anchoring to button',
        Button.build({
          dom: {
            tag: 'button',
            innerHtml: 'Toggle Popup'
          },
          eventOrder: {
            'alloy.execute': [ 'toggling', 'alloy.base.behaviour' ]
          },
          action: function (comp) {
            if (Toggling.isSelected(comp)) {
              Positioning.addContainer(sink, popup);
              Positioning.position(sink, {
                anchor: 'hotspot',
                hotspot: comp
              }, popup);
            } else {
              Positioning.removeContainer(sink, popup);
            }
          },

          behaviours: {
            toggling: {
              toggleClass: 'demo-selected'
            }
          }
        })
      );

      var section2 = HtmlDisplay.section(
        gui,
        'Position anchoring to menu',
        Container.build({
          dom: {
            tag: 'ol',
            styles: {
              'list-style-type': 'none'
            }
          },
          components: [
            Container.build({
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
                    Positioning.addContainer(sink, popup);
                    Positioning.position(sink, {
                      anchor: 'submenu',
                      item: item
                    }, popup);
                  }
                })
              }
            })
          ]
        })
      );

      var section3 = HtmlDisplay.section(
        gui,
        'Position anchoring to text selection',
        Container.build({
          dom: {
            tag: 'div'
          },
          components: [
            Container.build({
              dom: {
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
            }),
            Button.build({
              dom: {
                tag: 'button',
                innerHtml: 'Show popup at cursor'
              },
              action: function (button) {
                Positioning.addContainer(sink, popup);
                Positioning.position(sink, {
                  anchor: 'selection',
                  root: button.getSystem().getByUid('text-editor').getOrDie(
                    'Could not find text editor'
                  ).element()
                }, popup);
              }
            })
          ]
        })
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
        Container.build({
          components: [
            GuiFactory.external({
              element: frame,
              uid: 'frame-editor'
            }),
            Button.build({
              dom: {
                tag: 'button',
                innerHtml: 'Show popup at cursor'
              },
              action: function (button) {
                Positioning.addContainer(sink, popup);
                Positioning.position(sink, {
                  anchor: 'selection',
                  root: Element.fromDom(frame.dom().contentWindow.document.body)
                }, popup);
              }
            })
          ]
        })
      );
    };
  }
);