import { DslType, FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

import { Keying } from '../../api/behaviour/Keying';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import * as Fields from '../../data/Fields';
import * as PartType from '../../parts/PartType';

const schema = Fun.constant([
  FieldSchema.strict('items'),
  Fields.markers([ 'itemClass' ]),
  SketchBehaviours.field('tgroupBehaviours', [ Keying ])
]);

const parts = Fun.constant([
  PartType.group({
    name: 'items',
    unit: 'item',
    overrides (detail) {
      return {
        domModification: {
          classes: [ detail.markers().itemClass() ]
        }
      };
    }
  })
]);

const name = Fun.constant('ToolbarGroup');

export {
  name,
  schema,
  parts
};