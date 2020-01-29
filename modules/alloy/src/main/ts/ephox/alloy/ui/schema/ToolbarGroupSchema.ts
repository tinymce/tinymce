import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

import { Keying } from '../../api/behaviour/Keying';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import * as Fields from '../../data/Fields';
import * as PartType from '../../parts/PartType';
import { ToolbarGroupDetail, ToolbarGroupSpec } from '../types/ToolbarGroupTypes';

const schema: () => FieldProcessorAdt[]  = Fun.constant([
  FieldSchema.strict('items'),
  Fields.markers([ 'itemSelector' ]),
  SketchBehaviours.field('tgroupBehaviours', [ Keying ])
]);

const parts: () => PartType.PartTypeAdt[] = Fun.constant([
  PartType.group<ToolbarGroupDetail, ToolbarGroupSpec>({
    name: 'items',
    unit: 'item'
  })
]);

const name = Fun.constant('ToolbarGroup');

export {
  name,
  schema,
  parts
};
