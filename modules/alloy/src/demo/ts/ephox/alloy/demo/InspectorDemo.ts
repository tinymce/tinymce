import { console } from '@ephox/dom-globals';
import { Body } from '@ephox/sugar';

import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import { Button } from 'ephox/alloy/api/ui/Button';
import { Form } from 'ephox/alloy/api/ui/Form';
import { Input } from 'ephox/alloy/api/ui/Input';
import * as Debugging from 'ephox/alloy/debugging/Debugging';
import * as HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';
import { FormParts } from 'ephox/alloy/ui/types/FormTypes';

// tslint:disable:no-console

export default (): void => {
  const gui = Gui.create();

  const body = Body.body();
  Attachment.attachSystem(body, gui);

  Debugging.registerInspector('inspector-demo', gui);

  HtmlDisplay.section(gui,
    '<p>Inspect away! "Alloy" will appear in the elements panel in Chrome Developer Tools</p>' +
    '<p>Note, the inspector is not publically available yet.</p>',
    {
      dom: {
        tag: 'div'
      },
      components: [
        GuiFactory.text('This is just some text'),
        Button.sketch({
          dom: {
            tag: 'button',
            innerHtml: 'Button'
          },
          action() {
            console.log('clicked on a button');
          }
        }),
        Form.sketch((parts: FormParts) => ({
          dom: {
            tag: 'div'
          },
          components: [
            parts.field('alpha', Input.sketch({ }))
          ]
        }))
      ]
    }
  );
};
