import { console, setTimeout } from '@ephox/dom-globals';
import { SelectorFind } from '@ephox/sugar';

import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import { SlotContainer } from 'ephox/alloy/api/ui/SlotContainer';
import { Button } from 'ephox/alloy/api/ui/Button';

export default (): void => {
  const ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();

  const box = GuiFactory.build(
    SlotContainer.sketch((parts) => ({
      dom: {
        tag: 'div',
        classes: [ 'demo-slot-container' ],
        styles: {
          border: '1px solid black',
          background: 'yellow',
          height: '100px'
        }
      },
      components: [
        GuiFactory.text('The button will soon disappear, and then reappear'),
        parts.slot(
          'button',
          Button.sketch({
            dom: {
              tag: 'button',
              styles: {
                padding: '10px'
              },
              innerHtml: 'Inconsistent Button'
            },
            action: (_btn) => {
              // tslint:disable-next-line:no-console
              console.log('clicking on action');
            }
          })
        )
      ]
    }))
  );

  const gui = Gui.create();
  gui.add(box);

  Attachment.attachSystem(ephoxUi, gui);

  setTimeout(() => {
    SlotContainer.hideSlot(box, 'button');
    setTimeout(() => {
      SlotContainer.showSlot(box, 'button');
    }, 3000);
  }, 3000);
};
