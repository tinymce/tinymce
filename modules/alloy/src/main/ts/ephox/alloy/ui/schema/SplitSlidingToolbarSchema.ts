import { Fun, Optional } from '@ephox/katamari';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { Focusing } from '../../api/behaviour/Focusing';
import { Keying } from '../../api/behaviour/Keying';
import { Sliding } from '../../api/behaviour/Sliding';
import { Toggling } from '../../api/behaviour/Toggling';
import { Toolbar } from '../../api/ui/Toolbar';
import * as Fields from '../../data/Fields';
import * as AlloyParts from '../../parts/AlloyParts';
import * as PartType from '../../parts/PartType';
import * as SplitToolbarBase from '../common/SplitToolbarBase';
import { ButtonSpec } from '../types/ButtonTypes';
import { SplitSlidingToolbarDetail } from '../types/SplitSlidingToolbarTypes';
import { ToolbarSpec } from '../types/ToolbarTypes';
import * as ToolbarSchema from './ToolbarSchema';

const schema = Fun.constant([
  Fields.markers([ 'closedClass', 'openClass', 'shrinkingClass', 'growingClass', 'overflowToggledClass' ]),
  Fields.onHandler('onOpened'),
  Fields.onHandler('onClosed'),
  Fields.onHandler('onToggled'),
].concat(
  SplitToolbarBase.schema()
));

const parts: () => PartType.PartTypeAdt[] = Fun.constant([
  PartType.required<SplitSlidingToolbarDetail, ToolbarSpec>({
    factory: Toolbar,
    schema: ToolbarSchema.schema(),
    name: 'primary'
  }),

  PartType.required<SplitSlidingToolbarDetail, ToolbarSpec>({
    factory: Toolbar,
    schema: ToolbarSchema.schema(),
    name: 'overflow',
    overrides: (detail) => {
      return {
        toolbarBehaviours: Behaviour.derive([
          Sliding.config({
            dimension: {
              property: 'height'
            },
            closedClass: detail.markers.closedClass,
            openClass: detail.markers.openClass,
            shrinkingClass: detail.markers.shrinkingClass,
            growingClass: detail.markers.growingClass,
            onShrunk: (comp) => {
              AlloyParts.getPart(comp, detail, 'overflow-button').each((button) => {
                Toggling.off(button);
                Focusing.focus(button);
              });
              detail.onClosed(comp);
            },
            onGrown: (comp) => {
              Keying.focusIn(comp);
              detail.onOpened(comp);
            },
            onStartGrow: (comp) => {
              AlloyParts.getPart(comp, detail, 'overflow-button').each(Toggling.on);
              /**
               * Calling the `onToggled` for the consistency with the `onStartShrink` callback.
               */
              detail.onToggled(true);
            },
            onStartShrink: () => {
              /**
               * Calling the `onToggled` callback here instead of `Toggling` behaviour's configuration,
               * because we want the instant state change.
               * Otherwise the callback is called only after the animation is completed.
               */
              detail.onToggled(false);
            },
          }),
          Keying.config({
            mode: 'acyclic',
            onEscape: (comp) => {
              AlloyParts.getPart(comp, detail, 'overflow-button').each(Focusing.focus);
              return Optional.some<boolean>(true);
            }
          })
        ])
      };
    }
  }),

  PartType.external<SplitSlidingToolbarDetail, ButtonSpec>({
    name: 'overflow-button',
    overrides: (detail) => ({
      buttonBehaviours: Behaviour.derive([
        Toggling.config({
          toggleClass: detail.markers.overflowToggledClass,
          aria: {
            mode: 'pressed'
          },
          toggleOnExecute: false
          /**
           * For FloatingToolbars, we can hook up our `onToggled` handler directly to the Toggling
           * because we don't have to worry about any animations.
           *
           * Unfortunately, for SlidingToolbars, Toggling is more directly hooked into the animation for growing, 
           * so to have an event `onToggled` that doesn't care about the animation, we can't just hook into the Toggling config.
           */
        })
      ])
    })
  }),

  PartType.external<SplitSlidingToolbarDetail>({
    name: 'overflow-group'
  })
]);

const name = Fun.constant('SplitSlidingToolbar');

export {
  name,
  schema,
  parts
};
