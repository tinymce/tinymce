import { FieldSchema, Objects, DslType } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

import { Composing } from '../../api/behaviour/Composing';
import { Representing } from '../../api/behaviour/Representing';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import * as PartType from '../../parts/PartType';

const schema = Fun.constant([
  FieldSchema.defaulted('prefix', 'form-field'),
  SketchBehaviours.field('fieldBehaviours', [ Composing, Representing ])
]);

const parts = Fun.constant([
  PartType.optional({
    schema: [ FieldSchema.strict('dom') ],
    name: 'label'
  }),

  PartType.required({
    factory: {
      sketch (spec) {
        const excludeFactory = Objects.exclude(spec, [ 'factory' ]);
        return spec.factory.sketch(excludeFactory);
      }
    },
    schema: [ FieldSchema.strict('factory') ],
    name: 'field'
  })
]);

export {
  schema,
  parts
};