import { Class, Css, Element, Replication, Insert } from '@ephox/sugar';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Unselecting } from 'ephox/alloy/api/behaviour/Unselecting';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import { Button } from 'ephox/alloy/api/ui/Button';
import { Container } from 'ephox/alloy/api/ui/Container';
import { document } from '@ephox/dom-globals';
import * as HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';
import { DragnDrop } from 'ephox/alloy/api/behaviour/DragnDrop';
import { Fun } from '@ephox/katamari';

export default (): void => {
  const gui = Gui.create();
  const body = Element.fromDom(document.body);
  Class.add(gui.element(), 'gui-root-demo-container');
  // Css.set(gui.element(), 'direction', 'rtl');

  Attachment.attachSystem(body, gui);
  Css.set(body, 'margin-bottom', '2000px');

  HtmlDisplay.section(
    gui,
    'This button is a <code>button</code> that can be dragged',
    Container.sketch({
      components: [
        Container.sketch({
          dom: {
            tag: 'div',
            innerHtml: 'Drop zone',
            styles: {
              margin: '10px 10px 20px 10px',
              height: '200px',
              border: '1px dashed black'
            }
          },
          containerBehaviours: Behaviour.derive([
            DragnDrop.config({
              mode: 'drop',
              type: 'text/html',
              onDrop (zone, event) {
                event.kill();
                console.log(event);
              }
            })
          ]),
        }),

        Button.sketch({
          dom: {
            tag: 'span',
            innerHtml: 'Drag me!',
            styles: {
              padding: '10px',
              display: 'inline-block',
              background: '#333',
              color: '#fff'
            }
          },
          buttonBehaviours: Behaviour.derive([
            Unselecting.config({ }),
            DragnDrop.config({
              mode: 'drag',
              type: 'text/html',
              getData (button) {
                return '<button>Hi there</button>';
              },
    
              getImage (button) {
                return {
                  element () {
                    const clone = Replication.deep(button.element());
                    Css.set(clone, 'background-color', 'blue');
                    return clone;
                  },
                  x: Fun.constant(0),
                  y: Fun.constant(0)
                };
              }
            })
          ])
        })
      ]
    })
  );
};