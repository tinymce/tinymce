import Behaviour from '../../api/behaviour/Behaviour';
import Representing from '../../api/behaviour/Representing';
import PartType from '../../parts/PartType';
import { Fun } from '@ephox/katamari';

var owner = 'item-widget';

var partTypes = [
  PartType.required({
    name: 'widget',
    overrides: function (detail) {
      return {
        behaviours: Behaviour.derive([
          Representing.config({
            store: {
              mode: 'manual',
              getValue: function (component) {
                return detail.data();
              },
              setValue: function () { }
            }
          })
        ])
      };
    }
  })
];

export default <any> {
  owner: Fun.constant(owner),
  parts: Fun.constant(partTypes)
};