import { GuiFactory } from '@ephox/alloy';
import { Attachment } from '@ephox/alloy';
import { Gui } from '@ephox/alloy';
import { Option } from '@ephox/katamari';
import { SelectorFind } from '@ephox/sugar';
import Inputs from 'tinymce/themes/mobile/ui/Inputs';
import SerialisedDialog from 'tinymce/themes/mobile/ui/SerialisedDialog';
import UiDomFactory from 'tinymce/themes/mobile/util/UiDomFactory';



export default <any> function () {
  var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();

  var form = SerialisedDialog.sketch({
    onExecute: function () { },
    getInitialValue: function () {
      return Option.some({
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

  var gui = Gui.create();
  Attachment.attachSystem(ephoxUi, gui);

  var container = GuiFactory.build({
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