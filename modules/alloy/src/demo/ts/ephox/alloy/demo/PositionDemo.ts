import { Class, Css, DomEvent, SugarElement, Traverse } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Positioning } from 'ephox/alloy/api/behaviour/Positioning';
import { Toggling } from 'ephox/alloy/api/behaviour/Toggling';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import * as NativeEvents from 'ephox/alloy/api/events/NativeEvents';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import { Button } from 'ephox/alloy/api/ui/Button';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as DemoContent from 'ephox/alloy/demo/DemoContent';
import * as DemoSink from 'ephox/alloy/demo/DemoSink';
import * as HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';

import * as Frames from './frames/Frames';

export default (): void => {
  const gui = Gui.create();
  const body = SugarElement.fromDom(document.body);
  Css.set(gui.element, 'direction', 'rtl');
  Class.add(gui.element, 'gui-root-demo-container');
  Attachment.attachSystem(body, gui);

  const sink = DemoSink.make();

  gui.add(sink);

  const popup = GuiFactory.build(
    Container.sketch({
      components: [
        Container.sketch({
          dom: {
            styles: {
              padding: '10px',
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

  HtmlDisplay.section(
    gui,
    'SugarPosition anchoring to button',
    Button.sketch({
      dom: {
        tag: 'button',
        innerHtml: 'Toggle Popup'
      },
      eventOrder: {
        'alloy.execute': [ 'toggling', 'alloy.base.behaviour' ]
      },
      action: (comp) => {
        if (Toggling.isOn(comp)) {
          Attachment.attach(sink, popup);
          Positioning.position(sink, popup, {
            anchor: {
              type: 'hotspot',
              hotspot: comp
            }
          });
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

  HtmlDisplay.section(
    gui,
    'SugarPosition anchoring to menu',
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
            AlloyEvents.run(NativeEvents.mouseover(), (item) => {
              Attachment.attach(sink, popup);
              Positioning.position(sink, popup, {
                anchor: {
                  type: 'submenu',
                  item
                }
              });
            })
          ])
        })
      ]
    })
  );

  HtmlDisplay.section(
    gui,
    'SugarPosition anchoring to text selection',
    Container.sketch({
      dom: {
        tag: 'div'
      },
      components: [
        Container.sketch({
          dom: {
            attributes: {
              contenteditable: 'true'
            },
            styles: {
              'border': '1px solid green',
              'width': '300px',
              'height': '200px',
              'overflow-y': 'scroll',
              'display': 'inline-block'
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
          action: (button) => {
            Attachment.attach(sink, popup);
            Positioning.position(sink, popup, {
              anchor: {
                type: 'selection',
                root: button.getSystem().getByUid('text-editor').getOrDie().element
              }
            });
          }
        })
      ]
    })
  );

  // Maybe make a component.
  const frame = SugarElement.fromTag('iframe');
  const onLoad = DomEvent.bind(frame, 'load', () => {
    onLoad.unbind();

    const html = '<!doctype html><html><body contenteditable="true">' + DemoContent.generate(20) + '</body></html>';
    Frames.write(frame, html);
  });

  HtmlDisplay.section(
    gui,
    'SugarPosition anchoring to text selection [iframe]',
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
          action: (_button) => {
            Attachment.attach(sink, popup);
            Positioning.position(sink, popup, {
              anchor: {
                type: 'selection',
                root: SugarElement.fromDom(Traverse.defaultView(frame).dom.document.body)
              }
            });
          }
        })
      ]
    })
  );
};
