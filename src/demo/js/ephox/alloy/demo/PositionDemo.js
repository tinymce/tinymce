define(
  'ephox.alloy.demo.PositionDemo',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.events.NativeEvents',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.demo.DemoContent',
    'ephox.alloy.demo.DemoSink',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.alloy.frame.Writer',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.properties.Css'
  ],

  function (
    Behaviour, Positioning, Toggling, GuiFactory, AlloyEvents, NativeEvents, Attachment, Gui, Button, Container, DemoContent, DemoSink, HtmlDisplay, Writer,
    DomEvent, Element, Class, Css
  ) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Css.set(gui.element(), 'direction', 'rtl');
      Class.add(gui.element(), 'gui-root-demo-container');
      Attachment.attachSystem(body, gui);

      var sink = DemoSink.make();

      gui.add(sink);

      var popup = GuiFactory.build(
        Container.sketch({
          components: [
            Container.sketch({
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
        Button.sketch({
          dom: {
            tag: 'button',
            innerHtml: 'Toggle Popup'
          },
          eventOrder: {
            'alloy.execute': [ 'toggling', 'alloy.base.behaviour' ]
          },
          action: function (comp) {
            if (Toggling.isOn(comp)) {
              Attachment.attach(sink, popup);
              Positioning.position(sink, {
                anchor: 'hotspot',
                hotspot: comp
              }, popup);
            } else {
              Attachment.detach(popup);
            }
          },

          buttonBehaviours: Behaviour.derive([
            Toggling.config({
              toggleClass: 'demo-selected',
              aria: {
                mode: 'pressed'
              }
            })
          ])
        })
      );

      var section2 = HtmlDisplay.section(
        gui,
        'Position anchoring to menu',
        Container.sketch({
          dom: {
            tag: 'ol',
            styles: {
              'list-style-type': 'none'
            }
          },
          components: [
            Container.sketch({
              dom: {
                tag: 'li',
                innerHtml: 'Hover over me',
                styles: {
                  border: '1px solid gray',
                  width: '100px'
                }
              },
              events: AlloyEvents.derive([
                AlloyEvents.run(NativeEvents.mouseover(), function (item) {
                  Attachment.attach(sink, popup);
                  Positioning.position(sink, {
                    anchor: 'submenu',
                    item: item
                  }, popup);
                })
              ])
            })
          ]
        })
      );

      var section3 = HtmlDisplay.section(
        gui,
        'Position anchoring to text selection',
        Container.sketch({
          dom: {
            tag: 'div'
          },
          components: [
            Container.sketch({
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
            Button.sketch({
              dom: {
                tag: 'button',
                innerHtml: 'Show popup at cursor'
              },
              action: function (button) {
                Attachment.attach(sink, popup);
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
        Container.sketch({
          components: [
            GuiFactory.external({
              element: frame,
              uid: 'frame-editor'
            }),
            Button.sketch({
              dom: {
                tag: 'button',
                innerHtml: 'Show popup at cursor'
              },
              action: function (button) {
                Attachment.attach(sink, popup);
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