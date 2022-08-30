import { FieldSchema, Objects } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

import { Composing } from '../../api/behaviour/Composing';
import { Representing } from '../../api/behaviour/Representing';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import * as PartType from '../../parts/PartType';
import { FormFieldDetail } from '../types/FormFieldTypes';

const schema = Fun.constant([
  FieldSchema.defaulted('prefix', 'form-field'),
  SketchBehaviours.field('fieldBehaviours', [ Composing, Representing ])
]);

const parts: () => PartType.PartTypeAdt[] = Fun.constant([
  PartType.optional<FormFieldDetail>({
    schema: [ FieldSchema.required('dom') ],
    name: 'label'
  }),

  PartType.optional<FormFieldDetail, { text: string }>({
    factory: {
      sketch: (spec) => {
        return {
          uid: spec.uid,
          dom: {
            tag: 'span',
            styles: {
              display: 'none'
            },
            attributes: {
              'aria-hidden': 'true'
            },
            innerHtml: spec.text
          }
        };
      }
    },
    schema: [ FieldSchema.required('text') ],
    name: 'aria-descriptor'
  }),

  PartType.required<FormFieldDetail, { factory: { sketch: (spec: Record<string, any>) => Record<string, any> }}>({
    factory: {
      sketch: (spec) => {
        const excludeFactory = Objects.exclude(spec, [ 'factory' ]);
        return spec.factory.sketch(excludeFactory);
      }
    },
    schema: [ FieldSchema.required('factory') ],
    name: 'field'
  })
]);

export {
  schema,
  parts
};
