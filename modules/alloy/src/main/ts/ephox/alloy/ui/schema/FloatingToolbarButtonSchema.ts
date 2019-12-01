import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { Fun, Option } from '@ephox/katamari';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { Focusing } from '../../api/behaviour/Focusing';
import { Keying } from '../../api/behaviour/Keying';
import { Toggling } from '../../api/behaviour/Toggling';
import * as SystemEvents from '../../api/events/SystemEvents';
import { Toolbar } from '../../api/ui/Toolbar';
import * as Fields from '../../data/Fields';
import * as AlloyParts from '../../parts/AlloyParts';
import * as PartType from '../../parts/PartType';
import * as AnchorLayouts from '../../positioning/mode/AnchorLayouts';
import { ButtonSpec } from '../types/ButtonTypes';
import { FloatingToolbarButtonDetail } from '../types/FloatingToolbarButtonTypes';
import { ToolbarSpec } from '../types/ToolbarTypes';
import * as ToolbarSchema from './ToolbarSchema';

const schema: () => FieldProcessorAdt[] = Fun.constant([
  Fields.markers([ 'toggledClass' ]),
  FieldSchema.strict('lazySink'),
  FieldSchema.strictFunction('fetch'),
  FieldSchema.optionFunction('getBounds'),
  FieldSchema.optionObjOf('fireDismissalEventInstead', [
    FieldSchema.defaulted('event', SystemEvents.dismissRequested())
  ]),
  AnchorLayouts.schema()
]);

const parts: () => PartType.PartTypeAdt[] = Fun.constant([
  PartType.external<FloatingToolbarButtonDetail, ButtonSpec>({
    name: 'button',
    overrides: (detail) => {
      return {
        dom: {
          attributes: {
            'aria-haspopup': 'true'
          }
        },
        buttonBehaviours: Behaviour.derive([
          Toggling.config({
            toggleClass: detail.markers.toggledClass,
            aria: {
              mode: 'expanded'
            },
            toggleOnExecute: false
          })
        ])
      };
    }
  }),

  PartType.external<FloatingToolbarButtonDetail, ToolbarSpec>({
    factory: Toolbar,
    schema: ToolbarSchema.schema(),
    name: 'toolbar',
    overrides (detail) {
      return {
        toolbarBehaviours: Behaviour.derive([
          Keying.config({
            mode: 'cyclic',
            onEscape: (comp) => {
              AlloyParts.getPart(comp, detail, 'button').each(Focusing.focus);
              // Don't return true here, as we need to allow the sandbox to handle the escape to close the overflow
              return Option.none();
            }
          })
        ])
      };
    }
  })
]);

export { schema, parts };
