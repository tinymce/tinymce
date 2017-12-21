import Fields from '../../data/Fields';
import { FieldSchema } from '@ephox/boulder';
import { ValueSchema } from '@ephox/boulder';
import { Height } from '@ephox/sugar';
import { Width } from '@ephox/sugar';



export default <any> [
  FieldSchema.strict('closedClass'),
  FieldSchema.strict('openClass'),
  FieldSchema.strict('shrinkingClass'),
  FieldSchema.strict('growingClass'),

  // Element which shrinking and growing animations
  FieldSchema.option('getAnimationRoot'),

  Fields.onHandler('onShrunk'),
  Fields.onHandler('onStartShrink'),
  Fields.onHandler('onGrown'),
  Fields.onHandler('onStartGrow'),
  FieldSchema.defaulted('expanded', false),
  FieldSchema.strictOf('dimension', ValueSchema.choose(
    'property', {
      width: [
        Fields.output('property', 'width'),
        Fields.output('getDimension', function (elem) {
          return Width.get(elem) + 'px';
        })
      ],
      height: [
        Fields.output('property', 'height'),
        Fields.output('getDimension', function (elem) {
          return Height.get(elem) + 'px';
        })
      ]
    }
  ))

];