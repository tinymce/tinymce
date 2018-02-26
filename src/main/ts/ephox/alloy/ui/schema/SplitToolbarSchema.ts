import { FieldSchema } from '@ephox/boulder';
import { Cell, Fun } from '@ephox/katamari';

import Behaviour from '../../api/behaviour/Behaviour';
import Sliding from '../../api/behaviour/Sliding';
import SketchBehaviours from '../../api/component/SketchBehaviours';
import Toolbar from '../../api/ui/Toolbar';
import * as Fields from '../../data/Fields';
import PartType from '../../parts/PartType';

const schema = Fun.constant([
  Fields.markers([ 'closedClass', 'openClass', 'shrinkingClass', 'growingClass' ]),
  SketchBehaviours.field('splitToolbarBehaviours', [ ]),
  FieldSchema.state('builtGroups', function () {
    return Cell([ ]);
  })
]);

const toolbarSchema = [
  FieldSchema.strict('dom')
];

const parts = Fun.constant([
  PartType.required({
    factory: Toolbar,
    schema: toolbarSchema,
    name: 'primary'
  }),

  PartType.required({
    factory: Toolbar,
    schema: toolbarSchema,
    name: 'overflow',
    overrides (detail) {
      return {
        toolbarBehaviours: Behaviour.derive([
          Sliding.config({
            dimension: {
              property: 'height'
            },
            closedClass: detail.markers().closedClass(),
            openClass: detail.markers().openClass(),
            shrinkingClass: detail.markers().shrinkingClass(),
            growingClass: detail.markers().growingClass()
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