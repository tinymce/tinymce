import { Class, Css, Replication, SugarElement } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { DragnDrop } from 'ephox/alloy/api/behaviour/DragnDrop';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import { Button } from 'ephox/alloy/api/ui/Button';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';

export default (): void => {
  const gui = Gui.create();
  const body = SugarElement.fromDom(document.body);
  Class.add(gui.element, 'gui-root-demo-container');
  // Css.set(gui.element, 'direction', 'rtl');

  Attachment.attachSystem(body, gui);
  Css.set(body, 'margin-bottom', '2000px');

  const createDropZone = (dropEffect: string) => Container.sketch({
    dom: {
      tag: 'div',
      innerHtml: `Drop zone that accepts <b>${dropEffect}</b> also accepts files`,
      styles: {
        'margin': '10px 10px 20px 10px',
        'padding': '20px',
        'height': '40px',
        'border': '3px dashed black',
        'text-align': 'center'
      }
    },
    containerBehaviours: Behaviour.derive([
      DragnDrop.config({
        mode: 'drop',
        type: 'text/plain',
        dropEffect,
        onDrop: (_component, dropEvent) => {
          // eslint-disable-next-line no-console
          console.log('onDrop', {
            data: dropEvent.data,
            files: dropEvent.files
          });
        },
        onDrag: (_component, _simulatedEvent) => {
          // console.log('onDrag', simulatedEvent.event().raw().target);
        },
        onDragover: (_component, _simulatedEvent) => {
          // console.log('onDragover', simulatedEvent.event().raw().target);
        },
        onDragenter: (_component, _simulatedEvent) => {
          // console.log('onDragenter', simulatedEvent.event().raw().target);
        },
        onDragleave: (_component, _simulatedEvent) => {
          // console.log('onDragleave', simulatedEvent.event().raw().target);
        }
      })
    ])
  });

  const createDraggable = (effectAllowed: string, data: string) => Button.sketch({
    dom: {
      tag: 'span',
      innerHtml: `${effectAllowed}`,
      styles: {
        padding: '10px',
        margin: '10px',
        border: '1px solid black',
        display: 'inline-block',
        background: 'gray'
      }
    },
    buttonBehaviours: Behaviour.derive([
      DragnDrop.config({
        mode: 'drag',
        type: 'text/plain',
        phoneyTypes: [ '-x-alloy/something' ],
        effectAllowed,
        getData: (_component) => {
          return data;
        },
        getImage: (component) => {
          const clone = Replication.deep<HTMLElement>(component.element);
          Css.set(clone, 'background-color', 'blue');
          return {
            element: clone,
            x: 0,
            y: 0
          };
        },
        canDrag: (_component, _target) =>
        // console.log('canDrag');
          true,
        onDragstart: (_component, _simulatedEvent) => {
          // console.log('onDragstart', component.element.dom);
        },
        onDragover: (_component, _simulatedEvent) => {
          // console.log('onDragover', component.element.dom);
        },
        onDragend: (_component, _simulatedEvent) => {
          // console.log('onDragend', component.element.dom);
        }
      })
    ])
  });

  HtmlDisplay.section(
    gui,
    'Drag the gray boxes into the drop zones and check console log for messages.',
    Container.sketch({
      components: [
        Container.sketch({
          components: [
            createDropZone('copy'),
            createDropZone('link'),
            createDropZone('move')
          ]
        }),

        Container.sketch({
          dom: {
            styles: {
              // Gets inherited by the drag image ghost
              color: 'white'
            }
          },
          components: [
            createDraggable('copy', 'custom data for copy'),
            createDraggable('link', 'custom data for link'),
            createDraggable('move', 'custom data for move'),
            createDraggable('all', 'custom data for all'),
            createDraggable('copyLink', 'custom data for copyLink'),
            createDraggable('linkMove', 'custom data for linkMove'),
            createDraggable('copyMove', 'custom data for copyMove')
          ]
        })
      ]
    })
  );
};
