import { Class, Element, Value } from '@ephox/sugar';
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
import { Input } from 'ephox/alloy/api/ui/Input';
import { Streaming } from 'ephox/alloy/api/behaviour/Streaming';
import * as DomFactory from 'ephox/alloy/api/component/DomFactory';

export default (): void => {
  const gui = Gui.create();
  const body = Element.fromDom(document.body);
  Class.add(gui.element(), 'gui-root-demo-container');
  Attachment.attachSystem(body, gui);

  const list = HtmlDisplay.section(
    gui,
    'Change the entries by entering data into the input field. Use a comma delimiter for multiple entries',
    Container.sketch({
      components: [
        Input.sketch({
          inputBehaviours: Behaviour.derive([
            Streaming.config({
              stream: {
                mode: 'throttle',
                delay: 2000
              },
              onStream: (comp) => {
                comp.getSystem().broadcastOn([ 'reflecting-channel' ], {
                  items: Value.get(comp.element()).split(',')
                })
              }
            })
          ]),
          data: 'dog,cat,elephant'
        }),

        {
          dom: DomFactory.fromHtml('<h2>Entries</h2>')
        },
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
              },
              initialData: {
                items: [ 'dog', 'cat', 'elephant' ]
              }
            })
          ])
        })
      ]
    })
  );
};