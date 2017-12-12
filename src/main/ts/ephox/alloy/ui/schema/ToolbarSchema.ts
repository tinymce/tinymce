import Behaviour from '../../api/behaviour/Behaviour';
import Replacing from '../../api/behaviour/Replacing';
import SketchBehaviours from '../../api/component/SketchBehaviours';
import PartType from '../../parts/PartType';
import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

var schema = [
  FieldSchema.defaulted('shell', true),
  SketchBehaviours.field('toolbarBehaviours', [ Replacing ])
];

// TODO: Dupe with Toolbar
var enhanceGroups = function (detail) {
  return {
    behaviours: Behaviour.derive([
      Replacing.config({ })
    ])
  };
};

var partTypes = [
  // Note, is the container for putting all the groups in, not a group itself.
  PartType.optional({
    name: 'groups',
    overrides: enhanceGroups
  })
];

export default <any> {
  name: Fun.constant('Toolbar'),
  schema: Fun.constant(schema),
  parts: Fun.constant(partTypes)
};