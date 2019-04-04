import { Class, Css, Element, Replication } from '@ephox/sugar';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
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
            innerHtml: 'Drop zone, drop files, text or draggable elements here and check console for messages',
            styles: {
              margin: '10px 10px 20px 10px',
              padding: '20px',
              height: '200px',
              border: '3px dashed black',
              'text-align': 'center'
            }
          },
          containerBehaviours: Behaviour.derive([
            DragnDrop.config({
              mode: 'drop',
              type: 'text/plain',
              onDrop (component, simulatedEvent) {
                simulatedEvent.event().kill();
                console.log('onDrop', {
                  data: simulatedEvent.data,
                  files: simulatedEvent.files
                });
              },
              onDrag: (component, simulatedEvent) => {
                // console.log('onDrag', simulatedEvent.event().raw().target);
              },
              onDragover: (component, simulatedEvent) => {
                // console.log('onDragover', simulatedEvent.event().raw().target);
              },
              onDragenter: (component, simulatedEvent) => {
                // console.log('onDragenter', simulatedEvent.event().raw().target);
              },
              onDragleave: (component, simulatedEvent) => {
                // console.log('onDragleave', simulatedEvent.event().raw().target);
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
            DragnDrop.config({
              mode: 'drag',
              type: 'text/plain',
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
              },
              canDrag: (component, target) => {
                // console.log('canDrag');
                return true;
              },
              onDragstart: (component) => {
                // console.log('onDragstart', component.element().dom());
              },
              onDragover: (component, simulatedEvent) => {
                // console.log('onDragover', component.element().dom());
              },
              onDragend: (component) => {
                // console.log('onDragend', component.element().dom());
              },
              dropEffect: 'move',
              phoneyTypes: ['-x-alloy/something']
            })
          ])
        })
      ]
    })
  );
};