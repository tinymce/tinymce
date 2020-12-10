import { SelectorFind } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Replacing } from 'ephox/alloy/api/behaviour/Replacing';
import { Representing } from 'ephox/alloy/api/behaviour/Representing';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as GuiTemplate from 'ephox/alloy/api/component/GuiTemplate';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import { Button } from 'ephox/alloy/api/ui/Button';
import { Container } from 'ephox/alloy/api/ui/Container';
import { Input } from 'ephox/alloy/api/ui/Input';

export default (): void => {
  const ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();

  // TODO: Change this to match the simplified UI templating model we have now including text

  const page = Container.sketch({
    components: [
      Container.sketch({
        dom: {
          tag: 'p',
          innerHtml: 'Copy your HTML structure into this textarea and press <strong>Convert</strong>'
        }
      }),
      Input.sketch({
        tag: 'textarea',
        inputStyles: {
          width: '90%',
          height: '300px',
          display: 'block'
        },
        data: '<div class="cat dog elephant" data-ephox="this is"><div id="mike">chau</div></div>',
        uid: 'textarea-input'
      }),
      Button.sketch({
        dom: {
          tag: 'button',
          innerHtml: 'Convert'
        },
        action: (button) => {
          const textarea = button.getSystem().getByUid('textarea-input').getOrDie();
          const value = Representing.getValue(textarea);
          const output = GuiTemplate.readHtml(value).getOrDie();
          const display = button.getSystem().getByUid('pre-output').getOrDie();
          const prettyprint = JSON.stringify(output, undefined, 2);

          Replacing.set(display, [ GuiFactory.text(prettyprint) ]);
        }
      }),

      Container.sketch({
        uid: 'pre-output',
        dom: {
          tag: 'pre'
        },
        containerBehaviours: Behaviour.derive([
          Replacing.config({ })
        ])
      })
    ]
  });

  const root = GuiFactory.build(page);
  const gui = Gui.takeover(root);

  Attachment.attachSystem(ephoxUi, gui);

};
