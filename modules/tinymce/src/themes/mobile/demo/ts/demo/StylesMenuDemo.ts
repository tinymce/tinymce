import { Attachment, Gui, GuiFactory } from '@ephox/alloy';
import { console } from '@ephox/dom-globals';
import { Fun } from '@ephox/katamari';
import { SelectorFind } from '@ephox/sugar';

import * as StylesMenu from 'tinymce/themes/mobile/ui/StylesMenu';
import * as UiDomFactory from 'tinymce/themes/mobile/util/UiDomFactory';

export default function () {
  const ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();

  const menu = StylesMenu.sketch({
    formats: {
      menus: {
        Beta: [
          { title: 'Beta-1', isSelected: Fun.constant(false), getPreview: Fun.constant('') },
          { title: 'Beta-2', isSelected: Fun.constant(false), getPreview: Fun.constant('') },
          { title: 'Beta-3', isSelected: Fun.constant(false), getPreview: Fun.constant('') }
        ]
      },
      expansions: {
        Beta: 'Beta'
      },
      items: [
        { title: 'Alpha', isSelected: Fun.constant(false), getPreview: Fun.constant('') },
        { title: 'Beta', isSelected: Fun.constant(false), getPreview: Fun.constant('') },
        { title: 'Gamma', isSelected: Fun.constant(true), getPreview: Fun.constant('') }
      ]
    },
    handle(format) {
      // tslint:disable-next-line:no-console
      console.log('firing', format);
    }
  });

  const gui = Gui.create();
  Attachment.attachSystem(ephoxUi, gui);

  const container = GuiFactory.build({
    dom: UiDomFactory.dom('<div class="${prefix}-outer-container ${prefix}-fullscreen-maximized"></div>'),
    components: [
      {
        dom: UiDomFactory.dom('<div class="${prefix}-dropup" style="height: 500px;"></div>'),
        components: [
          menu
        ]
      }
    ]
  });

  gui.add(container);
}
