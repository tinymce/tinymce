import { Fun } from '@ephox/katamari';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { Representing } from '../../api/behaviour/Representing';
import * as PartType from '../../parts/PartType';

const owner = Fun.constant('item-widget');

const parts = Fun.constant([
  PartType.required({
    name: 'widget',
    overrides (detail) {
      return {
        behaviours: Behaviour.derive([
          Representing.config({
            store: {
              mode: 'manual',
              getValue (component) {
                return detail.data();
              },
              setValue () { }
            }
          })
        ])
      };
    }
  })
]);

export {
  owner,
  parts
};