import { Attachment, Gui, GuiFactory } from '@ephox/alloy';
import { Fun, Optional } from '@ephox/katamari';
import { SelectorFind } from '@ephox/sugar';

import * as Inputs from 'tinymce/themes/mobile/ui/Inputs';
import * as SerialisedDialog from 'tinymce/themes/mobile/ui/SerialisedDialog';
import * as UiDomFactory from 'tinymce/themes/mobile/util/UiDomFactory';

export default () => {
  const ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();

  const form = SerialisedDialog.sketch({
    onExecute: Fun.noop,
    getInitialValue: () => {
      return Optional.some({
        alpha: 'Alpha',
        beta: '',
        gamma: '',
        delta: ''
      });
    },
    fields: [
      Inputs.field('alpha', 'placeholder-alpha'),
      Inputs.field('beta', 'placeholder-beta'),
      Inputs.field('gamma', 'placeholder-gamma'),
      Inputs.field('delta', 'placeholder-delta')
    ]
  });

  const gui = Gui.create();
  Attachment.attachSystem(ephoxUi, gui);

  const container = GuiFactory.build({
    dom: UiDomFactory.dom('<div class="${prefix}-outer-container ${prefix}-fullscreen-maximized"></div>'),
    components: [
      {
        dom: UiDomFactory.dom('<div class="${prefix}-toolstrip"></div>'),
        components: [
          {
            dom: UiDomFactory.dom('<div class="${prefix}-toolbar ${prefix}-context-toolbar"></div>'),
            components: [
              {
                dom: UiDomFactory.dom('<div class="${prefix}-toolbar-group"></div>'),
                components: [
                  form
                ]
              }
            ]
          }
        ]
      }
    ]
  });

  gui.add(container);
};
