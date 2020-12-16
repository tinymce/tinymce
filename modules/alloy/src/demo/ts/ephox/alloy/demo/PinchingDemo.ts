import { Css, Height, SelectorFind, SugarElement, Width } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Pinching } from 'ephox/alloy/api/behaviour/Pinching';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';

export default (): void => {
  const ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();

  // Naive resize handler
  const resize = (element: SugarElement, changeX: number, changeY: number) => {
    const width = Css.getRaw(element, 'width').map((w) => parseInt(w, 10)).getOrThunk(() => Width.get(element));

    const height = Css.getRaw(element, 'height').map((h) => parseInt(h, 10)).getOrThunk(() => Height.get(element));

    Css.set(element, 'width', (width + changeX) + 'px');
    Css.set(element, 'height', (height + changeY) + 'px');
  };

  const box = GuiFactory.build({
    dom: {
      tag: 'div',
      classes: [ 'demo-pinch-box' ],
      styles: {
        width: '200px',
        height: '200px',
        background: 'black'
      }
    },
    behaviours: Behaviour.derive([
      Pinching.config({
        onPinch: (span, changeX, changeY) => {
          resize(span, changeX, changeY);
        },
        onPunch: (span, changeX, changeY) => {
          resize(span, changeX, changeY);
        }
      })
    ])
  });

  const gui = Gui.create();
  gui.add(box);

  Attachment.attachSystem(ephoxUi, gui);
};
