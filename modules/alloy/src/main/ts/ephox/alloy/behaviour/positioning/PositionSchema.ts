import { FieldSchema, ValueType, StructureSchema } from '@ephox/boulder';
import { Arr, Fun, Result } from '@ephox/katamari';

import AnchorSchema from '../../positioning/mode/AnchorSchema';

const TransitionSchema = [
  FieldSchema.requiredArrayOf('classes', ValueType.string),
  FieldSchema.defaultedStringEnum('mode', 'all', [ 'all', 'layout', 'placement' ])
];

export const PositionSchema = [
  FieldSchema.defaultedOf(
    'usePositioningType',
    Fun.constant('relative'),
    StructureSchema.valueOf((val) =>
      Arr.contains([ 'fixed', 'relative', 'absolute' ], val())
        ? Result.value(val)
        : Result.error('Invalid value for usePositioningType'))),

  FieldSchema.option('getBounds')
];

export const PlacementSchema = [
  FieldSchema.requiredOf('anchor', AnchorSchema),
  FieldSchema.optionObjOf('transition', TransitionSchema)
];
