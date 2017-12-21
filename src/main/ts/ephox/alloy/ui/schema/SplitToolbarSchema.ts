import Behaviour from '../../api/behaviour/Behaviour';
import Sliding from '../../api/behaviour/Sliding';
import SketchBehaviours from '../../api/component/SketchBehaviours';
import Toolbar from '../../api/ui/Toolbar';
import Fields from '../../data/Fields';
import PartType from '../../parts/PartType';
import { FieldSchema } from '@ephox/boulder';
import { Cell } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';

var schema = [
  Fields.markers([ 'closedClass', 'openClass', 'shrinkingClass', 'growingClass' ]),
  SketchBehaviours.field('splitToolbarBehaviours', [ ]),
  FieldSchema.state('builtGroups', function () {
    return Cell([ ]);
  })
];

var toolbarSchema = [
  FieldSchema.strict('dom')
];

var partTypes = [
  PartType.required({
    factory: Toolbar,
    schema: toolbarSchema,
    name: 'primary'
  }),

  PartType.required({
    factory: Toolbar,
    schema: toolbarSchema,
    name: 'overflow',
    overrides: function (detail) {
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
];

export default <any> {
  name: Fun.constant('SplitToolbar'),
  schema: Fun.constant(schema),
  parts: Fun.constant(partTypes)
};