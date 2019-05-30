import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { Replacing } from '../../api/behaviour/Replacing';
import * as PartType from '../../parts/PartType';
import * as Behaviour from '../../api/behaviour/Behaviour';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';

const schema: () => FieldProcessorAdt[] = Fun.constant([
  FieldSchema.defaulted('shell', false),
  FieldSchema.strict('makeItem'),
  FieldSchema.defaulted('setupItem', Fun.noop),
  SketchBehaviours.field('listBehaviours', [ Replacing ])
]);

const customListDetail = (detail) => {
  return {
    behaviours: Behaviour.derive([
      Replacing.config({ })
    ])
  };
};

const itemsPart = PartType.optional({
  name: 'items',
  overrides: customListDetail
});

const parts: () => PartType.PartTypeAdt[] = Fun.constant([
  itemsPart
]);

const name = Fun.constant('CustomList');

export {
  name,
  schema,
  parts
};