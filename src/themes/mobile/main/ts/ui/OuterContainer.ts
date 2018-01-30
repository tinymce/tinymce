import { Behaviour, Container, Gui, GuiFactory, Swapping } from '@ephox/alloy';
import { Fun } from '@ephox/katamari';

import Styles from '../style/Styles';

const READ_ONLY_MODE_CLASS = Fun.constant(Styles.resolve('readonly-mode'));
const EDIT_MODE_CLASS = Fun.constant(Styles.resolve('edit-mode'));

export default function (spec) {
  const root = GuiFactory.build(
    Container.sketch({
      dom: {
        classes: [ Styles.resolve('outer-container') ].concat(spec.classes)
      },

      containerBehaviours: Behaviour.derive([
        Swapping.config({
          alpha: READ_ONLY_MODE_CLASS(),
          omega: EDIT_MODE_CLASS()
        })
      ])
    })
  );

  return Gui.takeover(root);
}