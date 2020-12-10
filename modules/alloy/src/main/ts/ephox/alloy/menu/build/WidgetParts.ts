import { Fun } from '@ephox/katamari';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { Representing } from '../../api/behaviour/Representing';
import * as PartType from '../../parts/PartType';
import { WidgetItemDetail } from '../../ui/types/ItemTypes';

const owner = Fun.constant('item-widget');

const parts: () => PartType.PartTypeAdt[] = Fun.constant([
  PartType.required({
    name: 'widget',
    overrides: (detail: WidgetItemDetail) => {
      return {
        behaviours: Behaviour.derive([
          Representing.config({
            store: {
              mode: 'manual',
              getValue: (_component) => {
                return detail.data;
              },
              setValue: Fun.noop
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
