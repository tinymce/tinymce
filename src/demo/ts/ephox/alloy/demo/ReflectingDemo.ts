import { Class, Element } from '@ephox/sugar';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Replacing } from 'ephox/alloy/api/behaviour/Replacing';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';
import { document, setTimeout } from '@ephox/dom-globals';
import { Reflecting } from '../../../../../main/ts/ephox/alloy/api/behaviour/Reflecting';
import { Arr } from '@ephox/katamari';

export default (): void => {
  const gui = Gui.create();
  const body = Element.fromDom(document.body);
  Class.add(gui.element(), 'gui-root-demo-container');
  Attachment.attachSystem(body, gui);

  const list = HtmlDisplay.section(
    gui,
    'This list will change after three seconds (when the square is added to the page)',
    Container.sketch({
      dom: {
        tag: 'ol'
      },
      components: [ ],

      containerBehaviours: Behaviour.derive([
        Reflecting.config({
          channel: 'reflecting-channel',
          renderComponents: (data: { items: string [] }) => {
            return Arr.map(data.items, (d) => {
              return {
                dom: { tag: 'li', innerHtml: d }
              };
            });
          }
        })
      ])
    })
  );

  const square = GuiFactory.build({
    dom: {
      tag: 'div',
      styles: {
        position: 'absolute',
        width: '20px',
        height: '20px',
        background: 'black'
      }
    },

    events: AlloyEvents.derive([
      AlloyEvents.runOnAttached((sq, simulatedEvent) => {
        simulatedEvent.stop();
        Replacing.append(list, {
          dom: {
            tag: 'li',
            innerHtml: 'The square has been attached to the DOM: ' + new Date().getSeconds()
          }
        });
      }),

      AlloyEvents.runOnInit((sq, simulatedEvent) => {
        simulatedEvent.stop();
        Replacing.append(list, {
          dom: {
            tag: 'li',
            innerHtml: 'The square has been added to the system: ' + new Date().getSeconds()
          }
        });
      })
    ])
  });

  setTimeout(() => {
    list.getSystem().broadcastOn([ 'reflecting-channel' ], {
      items: [ 'alpha', 'beta', 'gamma' ]
    })
  }, 2000);

};