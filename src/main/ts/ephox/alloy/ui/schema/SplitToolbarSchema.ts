import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { Cell, Fun } from '@ephox/katamari';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { Sliding } from '../../api/behaviour/Sliding';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import { Toolbar } from '../../api/ui/Toolbar';
import * as Fields from '../../data/Fields';
import * as PartType from '../../parts/PartType';
import { SplitToolbarDetail } from '../../ui/types/SplitToolbarTypes';

const schema: () => FieldProcessorAdt[] = Fun.constant([
  Fields.markers([ 'closedClass', 'openClass', 'shrinkingClass', 'growingClass' ]),
  SketchBehaviours.field('splitToolbarBehaviours', [ ]),
  FieldSchema.state('builtGroups', () => {
    return Cell([ ]);
  })
]);

const toolbarSchema = [
  FieldSchema.strict('dom')
];

const parts: () => PartType.PartTypeAdt[] = Fun.constant([
  PartType.required({
    factory: Toolbar,
    schema: toolbarSchema,
    name: 'primary'
  }),

  PartType.required({
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
            growingClass: detail.markers.growingClass
          })
        ])
      };
    }
  }),

  PartType.external({
    name: 'overflow-button'
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