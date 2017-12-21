import Composing from '../../api/behaviour/Composing';
import Representing from '../../api/behaviour/Representing';
import SketchBehaviours from '../../api/component/SketchBehaviours';
import PartType from '../../parts/PartType';
import { FieldSchema } from '@ephox/boulder';
import { Objects } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

var schema = [
  FieldSchema.defaulted('prefix', 'form-field'),
  SketchBehaviours.field('fieldBehaviours', [ Composing, Representing ])
];

var parts = [
  PartType.optional({
    schema: [ FieldSchema.strict('dom') ],
    name: 'label'
  }),

  PartType.required({
    factory: {
      sketch: function (spec) {
        var excludeFactory = Objects.exclude(spec, [ 'factory' ]);
        return spec.factory.sketch(excludeFactory);
      }
    },
    schema: [ FieldSchema.strict('factory') ],
    name: 'field'
  })
];

export default <any> {
  schema: Fun.constant(schema),
  parts: Fun.constant(parts)
};