import { FieldProcessorAdt, FieldSchema, ValueSchema } from '@ephox/boulder';
import { Cell, Fun, Arr } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import { Keying } from '../../api/behaviour/Keying';
import { Representing } from '../../api/behaviour/Representing';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import { SliderSpec } from '../../ui/types/SliderTypes';

const isTouch = PlatformDetection.detect().deviceType.isTouch();

const h = 'horizontal';
const v = 'vertical';
const defaultAxes = [h];
const isHorizontal = (axes: string[]): boolean => Arr.contains(axes, h);
const isVertical = (axes: string[]): boolean => Arr.contains(axes, v);
const isTwoD = (axes: string[]): boolean => isHorizontal(axes) && isVertical(axes);

const SliderSchema: FieldProcessorAdt[] = [
  FieldSchema.defaulted('axes', defaultAxes),
  FieldSchema.defaulted('minX', 0),
  FieldSchema.defaulted('maxX', 100),
  FieldSchema.defaulted('minY', 0),
  FieldSchema.defaulted('maxY', 100),
  FieldSchema.defaulted('stepSize', 1),
  FieldSchema.defaulted('onChange', Fun.noop),
  FieldSchema.defaulted('onInit', Fun.noop),
  FieldSchema.defaulted('onDragStart', Fun.noop),
  FieldSchema.defaulted('onDragEnd', Fun.noop),
  FieldSchema.defaulted('snapToGrid', false),
  FieldSchema.defaulted('rounded', true),
  FieldSchema.option('snapStart'),
  FieldSchema.strict('getInitialValue'),
  SketchBehaviours.field('sliderBehaviours', [Keying, Representing]),

  FieldSchema.state('value', (spec: SliderSpec) => {
    return Cell({
      x: spec.minX,
      y: spec.minY
    });
  })
].concat(!isTouch ? [
  // Only add if not on a touch device
  FieldSchema.state('mouseIsDown', () => Cell(false))
] : []
).concat([
  // Reliant on axes, defaulted true for horizontal
  FieldSchema.state('isHorizontal', (spec: SliderSpec) => {
    return spec.axes !== undefined ? isHorizontal(spec.axes) : true;
  }),
  FieldSchema.state('isVertical', (spec: SliderSpec) => {
    return spec.axes !== undefined ? isVertical(spec.axes) : false;
  }),
  FieldSchema.state('isTwoD', (spec: SliderSpec) => {
    return spec.axes !== undefined ? isTwoD(spec.axes) : false;
  })
]);

export {
  SliderSchema
};
