import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { Replacing } from '../../api/behaviour/Replacing';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import * as PartType from '../../parts/PartType';
import { ToolbarDetail } from '../types/ToolbarTypes';

const schema: () => FieldProcessorAdt[] = Fun.constant([
  FieldSchema.strict('dom'),
  FieldSchema.defaulted('shell', true),
  SketchBehaviours.field('toolbarBehaviours', [ Replacing ])
]);

// TODO: Dupe with Toolbar
const enhanceGroups = () => {
  return {
    behaviours: Behaviour.derive([
      Replacing.config({ })
    ])
  };
};

const parts: () => PartType.PartTypeAdt[] = Fun.constant([
  // Note, is the container for putting all the groups in, not a group itself.
  PartType.optional<ToolbarDetail>({
    name: 'groups',
    overrides: enhanceGroups
  })
]);

const name = Fun.constant('Toolbar');

export {
  name,
  schema,
  parts
};
