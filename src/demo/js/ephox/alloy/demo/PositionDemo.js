import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Positioning from 'ephox/alloy/api/behaviour/Positioning';
import Toggling from 'ephox/alloy/api/behaviour/Toggling';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import NativeEvents from 'ephox/alloy/api/events/NativeEvents';
import Attachment from 'ephox/alloy/api/system/Attachment';
import Gui from 'ephox/alloy/api/system/Gui';
import Button from 'ephox/alloy/api/ui/Button';
import Container from 'ephox/alloy/api/ui/Container';
import DemoContent from 'ephox/alloy/demo/DemoContent';
import DemoSink from 'ephox/alloy/demo/DemoSink';
import HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';
import Writer from 'ephox/alloy/frame/Writer';
import { DomEvent } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Class } from '@ephox/sugar';
import { Css } from '@ephox/sugar';



export default <any> function () {
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