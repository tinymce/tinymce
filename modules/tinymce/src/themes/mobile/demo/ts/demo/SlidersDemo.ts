import { Attachment, Container, Gui, GuiFactory } from '@ephox/alloy';
import { Fun } from '@ephox/katamari';
import { SelectorFind } from '@ephox/sugar';

import ColorSlider from 'tinymce/themes/mobile/ui/ColorSlider';
import * as FontSizeSlider from 'tinymce/themes/mobile/ui/FontSizeSlider';
import * as UiDomFactory from 'tinymce/themes/mobile/util/UiDomFactory';

export default function () {
  const ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();

  const fontSlider = Container.sketch({
    dom: UiDomFactory.dom('<div class="${prefix}-toolbar ${prefix}-context-toolbar"></div>'),
    components: [
      {
        dom: UiDomFactory.dom('<div class="${prefix}-toolbar-group"></div>'),
        components: FontSizeSlider.makeItems({
          onChange: Fun.noop,
          getInitialValue: Fun.constant(2)
        })
      }
    ]
  });

  const colorSlider = Container.sketch({
    dom: UiDomFactory.dom('<div class="${prefix}-toolbar ${prefix}-context-toolbar"></div>'),
    components: [
      {
        dom: UiDomFactory.dom('<div class="${prefix}-toolbar-group"></div>'),
        components: ColorSlider.makeItems({
          onChange: Fun.noop,
          getInitialValue: Fun.constant(-1)
        })
      }
    ]
  });

  const gui = Gui.create();
  Attachment.attachSystem(ephoxUi, gui);

  const container = GuiFactory.build({
    dom: UiDomFactory.dom('<div class="{prefix}-outer-container ${prefix}-fullscreen-maximized"></div>'),
    components: [
      {
        dom: UiDomFactory.dom('<div class="${prefix}-toolstrip"></div>'),
        components: [ fontSlider ]
      },
      {
        dom: UiDomFactory.dom('<div class="${prefix}-toolstrip"></div>'),
        components: [ colorSlider ]
      }
    ]
  });

  gui.add(container);
}