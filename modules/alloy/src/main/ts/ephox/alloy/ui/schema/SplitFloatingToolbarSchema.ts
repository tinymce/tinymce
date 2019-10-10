import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { Fun, Option } from '@ephox/katamari';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { Focusing } from '../../api/behaviour/Focusing';
import { Keying } from '../../api/behaviour/Keying';
import { Toggling } from '../../api/behaviour/Toggling';
import { Toolbar } from '../../api/ui/Toolbar';
import * as SplitToolbarBase from '../common/SplitToolbarBase';
import * as Fields from '../../data/Fields';
import * as AlloyParts from '../../parts/AlloyParts';
import * as PartType from '../../parts/PartType';
import { SplitFloatingToolbarDetail } from '../types/SplitFloatingToolbarTypes';
import * as ToolbarSchema from './ToolbarSchema';

const schema: () => FieldProcessorAdt[] = Fun.constant([
  Fields.markers([ 'overflowToggledClass' ]),
  FieldSchema.strict('getAnchor'),
  FieldSchema.optionFunction('getOverflowBounds'),
  FieldSchema.strict('lazySink')
].concat(
  SplitToolbarBase.schema()
));

const parts: () => PartType.PartTypeAdt[] = Fun.constant([
  PartType.required({
    factory: Toolbar,
    schema: ToolbarSchema.schema(),
    name: 'primary'
  }),

  PartType.external({
    factory: Toolbar,
    schema: ToolbarSchema.schema(),
    name: 'overflow',
    overrides (detail: SplitFloatingToolbarDetail) {
      return {
        toolbarBehaviours: Behaviour.derive([
          Keying.config({
            mode: 'cyclic',
            onEscape: (comp) => {
              AlloyParts.getPart(comp, detail, 'overflow-button').each(Focusing.focus);
              // Don't return true here, as we need to allow the sandbox to handle the escape to close the overflow
              return Option.none();
            }
          })
        ])
      };
    }
  }),

  PartType.external({
    name: 'overflow-button',
    overrides: (detail: SplitFloatingToolbarDetail) => {
      return {
        dom: {
          attributes: {
            'aria-haspopup': 'true'
          }
        },
        buttonBehaviours: Behaviour.derive([
          Toggling.config({
            toggleClass: detail.markers.overflowToggledClass,
            aria: {
              mode: 'expanded'
            },
            toggleOnExecute: false
          })
        ])
      };
    }
  }),

  PartType.external({
    name: 'overflow-group'
  })
]);

const name = Fun.constant('SplitFloatingToolbar');

export {
  name,
  schema,
  parts
};
