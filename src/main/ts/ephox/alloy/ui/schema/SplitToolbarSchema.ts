import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { Cell, Fun, Option } from '@ephox/katamari';
import * as Behaviour from '../../api/behaviour/Behaviour';
import { Keying } from '../../api/behaviour/Keying';
import { Sliding } from '../../api/behaviour/Sliding';
import { Toggling } from '../../api/behaviour/Toggling';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import { Toolbar } from '../../api/ui/Toolbar';
import * as Fields from '../../data/Fields';
import { getPart } from '../../parts/AlloyParts';
import * as PartType from '../../parts/PartType';
import { SplitToolbarDetail } from '../../ui/types/SplitToolbarTypes';

const schema: () => FieldProcessorAdt[] = Fun.constant([
  Fields.markers([ 'closedClass', 'openClass', 'shrinkingClass', 'growingClass', 'overflowToggledClass' ]),
  SketchBehaviours.field('splitToolbarBehaviours', [ ]),
  FieldSchema.state('builtGroups', () => {
    return Cell([ ]);
  }),
  FieldSchema.defaulted('overflow', (toolbar) => Option.none()),
  FieldSchema.defaultedBoolean('floating', false)
]);

const toolbarSchema = [
  FieldSchema.strict('dom'),
  FieldSchema.defaulted('overflow', (toolbar) => Option.none()),
  FieldSchema.defaultedBoolean('floating', false)
];

const parts: () => PartType.PartTypeAdt[] = Fun.constant([
  PartType.required({
    factory: Toolbar,
    schema: toolbarSchema,
    name: 'primary'
  }),

  PartType.optional({
    factory: Toolbar,
    schema: toolbarSchema,
    name: 'overflow',
    overrides (detail: SplitToolbarDetail) {
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
          }),
          Keying.config({
            mode: 'cyclic',
            onEscape: (comp) => {
              getPart(comp, detail, 'overflow-button').each(Keying.focusIn);
              return Option.some(true);
            }
          })
        ]),
      };
    }
  }),

  PartType.external({
    name: 'overflow-button',
    overrides: (toolbarDetail) => {
      return {
        buttonBehaviours: Behaviour.derive([
          Toggling.config({ toggleClass: toolbarDetail.markers.overflowToggledClass, aria: { mode: 'pressed' } })
        ])
      };
    }
  }),

  PartType.external({
    name: 'overflow-group'
  })
]);

const name = Fun.constant('SplitToolbar');

export {
  name,
  schema,
  parts
};