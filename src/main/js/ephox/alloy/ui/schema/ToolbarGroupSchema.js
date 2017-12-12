import Keying from '../../api/behaviour/Keying';
import SketchBehaviours from '../../api/component/SketchBehaviours';
import Fields from '../../data/Fields';
import PartType from '../../parts/PartType';
import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

var schema = [
  FieldSchema.strict('items'),
  Fields.markers([ 'itemClass' ]),
  SketchBehaviours.field('tgroupBehaviours', [ Keying ])
];

var partTypes = [
  PartType.group({
    name: 'items',
    unit: 'item',
    overrides: function (detail) {
      return {
        domModification: {
          classes: [ detail.markers().itemClass() ]
        }
      };
    }
  })
];

export default <any> {
  name: Fun.constant('ToolbarGroup'),
  schema: Fun.constant(schema),
  parts: Fun.constant(partTypes)
};