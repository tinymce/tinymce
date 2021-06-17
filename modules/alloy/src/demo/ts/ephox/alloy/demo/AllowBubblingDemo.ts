import { Arr } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as AddEventsBehaviour from 'ephox/alloy/api/behaviour/AddEventsBehaviour';
import { AllowBubbling } from 'ephox/alloy/api/behaviour/AllowBubbling';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { AlloySpec } from 'ephox/alloy/api/component/SpecTypes';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';

const getItemSpec = (): AlloySpec => ({
  dom: {
    tag: 'div',
    classes: [ 'item' ]
  }
});

export default (): void => {
  const gui = Gui.create();
  const body = SugarElement.fromDom(document.body);
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
            // eslint-disable-next-line no-console
            console.log(e.event.raw);
          })
        ])
      ])
    })
  );
};
