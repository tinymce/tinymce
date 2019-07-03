import { document, console } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

import { AllowBubbling } from 'ephox/alloy/api/behaviour/AllowBubbling';
import { Behaviour, AlloySpec, AlloyEvents, AddEventsBehaviour } from 'ephox/alloy/api/Main';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';

const getItemSpec  = (): AlloySpec => {
  return {
    dom: {
      tag: 'div',
      classes: [ 'item' ]
    }
  };
};

export default () => {
  const gui = Gui.create();
  const body = Element.fromDom(document.body);
  Attachment.attachSystem(body, gui);

  HtmlDisplay.section(
    gui,
    'Allow Bubbling',
    Container.sketch({
      dom: {
        tag: 'div',
        styles: {
          margin: '10px 10px 20px 10px',
          height: '300px',
          border: '1px solid black',
          overflow: 'scroll'
        }
      },
      components: Arr.range(15, getItemSpec),
      containerBehaviours: Behaviour.derive([
        AllowBubbling.config({
          events: [{
            native: 'scroll',
            simulated: 'bubbled.scroll'
          }]
        }),
        AddEventsBehaviour.config('events', [
          AlloyEvents.run('bubbled.scroll', (comp, e) => {
            // tslint:disable-next-line:no-console
            console.log(e.event().raw());
          })
        ])
      ])
    })
  );
};
