import { FieldSchema } from '@ephox/boulder';
import { Fun, Optional } from '@ephox/katamari';

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

const schema = Fun.constant([
  Fields.markers([ 'toggledClass' ]),
  FieldSchema.required('lazySink'),
  FieldSchema.requiredFunction('fetch'),
  FieldSchema.optionFunction('getBounds'),
  FieldSchema.optionObjOf('fireDismissalEventInstead', [
    FieldSchema.defaulted('event', SystemEvents.dismissRequested())
  ]),
  AnchorLayouts.schema(),
  Fields.onHandler('onToggled'),
]);

const parts: () => PartType.PartTypeAdt[] = Fun.constant([
  PartType.external<FloatingToolbarButtonDetail, ButtonSpec>({
    name: 'button',
    overrides: (detail) => ({
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
          toggleOnExecute: false,
          /**
           * For FloatingToolbars, we can hook up our `onToggled` handler directly to the Toggling
           * because we don't have to worry about any animations.
           *
           * Unfortunately, for SlidingToolbars, Toggling is more directly hooked into the animation for growing,
           * so to have an event `onToggled` that doesn't care about the animation, we can't just hook into the Toggling config.
           */
          onToggled: detail.onToggled
        })
      ])
    })
  }),

  PartType.external<FloatingToolbarButtonDetail, ToolbarSpec>({
    factory: Toolbar,
    schema: ToolbarSchema.schema(),
    name: 'toolbar',
    overrides: (detail) => {
      return {
        toolbarBehaviours: Behaviour.derive([
          Keying.config({
            mode: 'cyclic',
            onEscape: (comp) => {
              AlloyParts.getPart(comp, detail, 'button').each(Focusing.focus);
              // Don't return true here, as we need to allow the sandbox to handle the escape to close the overflow
              return Optional.none();
            }
          })
        ])
      };
    }
  })
]);

export { schema, parts };
