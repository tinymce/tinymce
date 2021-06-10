import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Height, SugarElement, Width } from '@ephox/sugar';

import * as Fields from '../../data/Fields';

export default [
  FieldSchema.required('closedClass'),
  FieldSchema.required('openClass'),
  FieldSchema.required('shrinkingClass'),
  FieldSchema.required('growingClass'),

  // Element which shrinking and growing animations
  FieldSchema.option('getAnimationRoot'),

  Fields.onHandler('onShrunk'),
  Fields.onHandler('onStartShrink'),
  Fields.onHandler('onGrown'),
  Fields.onHandler('onStartGrow'),
  FieldSchema.defaulted('expanded', false),
  FieldSchema.requiredOf('dimension', ValueSchema.choose(
    'property', {
      width: [
        Fields.output('property', 'width'),
        Fields.output('getDimension', (elem: SugarElement) => Width.get(elem) + 'px')
      ],
      height: [
        Fields.output('property', 'height'),
        Fields.output('getDimension', (elem: SugarElement) => Height.get(elem) + 'px')
      ]
    }
  ))

];
