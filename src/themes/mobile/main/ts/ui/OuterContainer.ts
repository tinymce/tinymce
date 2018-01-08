import { Behaviour } from '@ephox/alloy';
import { Swapping } from '@ephox/alloy';
import { GuiFactory } from '@ephox/alloy';
import { Gui } from '@ephox/alloy';
import { Container } from '@ephox/alloy';
import { Fun } from '@ephox/katamari';
import Styles from '../style/Styles';

var READ_ONLY_MODE_CLASS = Fun.constant(Styles.resolve('readonly-mode'));
var EDIT_MODE_CLASS = Fun.constant(Styles.resolve('edit-mode'));

export default <any> function (spec) {
  var root = GuiFactory.build(
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
};