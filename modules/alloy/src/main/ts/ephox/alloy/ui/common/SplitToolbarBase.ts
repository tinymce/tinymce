import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { Cell, Fun } from '@ephox/katamari';
import { Coupling } from '../../api/behaviour/Coupling';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';

const schema: () => FieldProcessorAdt[] = Fun.constant([
  SketchBehaviours.field('splitToolbarBehaviours', [ Coupling ]),
  FieldSchema.state('builtGroups', () => Cell([ ]))
]);

export { schema };
