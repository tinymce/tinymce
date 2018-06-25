import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { Cell, Fun } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import { Keying } from '../../api/behaviour/Keying';
import { Representing } from '../../api/behaviour/Representing';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import { SliderSpec } from '../../ui/types/SliderTypes';

const isTouch = PlatformDetection.detect().deviceType.isTouch();

const SliderSchema: FieldProcessorAdt[] = [
  FieldSchema.strict('minX'),
  FieldSchema.strict('maxX'),
  FieldSchema.defaulted('minY', 0),
  FieldSchema.defaulted('maxY', 100),
  FieldSchema.defaulted('stepSize', 1),
  FieldSchema.defaulted('onChange', Fun.noop),
  FieldSchema.defaulted('onInit', Fun.noop),
  FieldSchema.defaulted('onDragStart', Fun.noop),
  FieldSchema.defaulted('onDragEnd', Fun.noop),
  FieldSchema.defaulted('snapToGrid', false),
  FieldSchema.option('snapStart'),
  FieldSchema.strict('getInitialValue'),
  SketchBehaviours.field('sliderBehaviours', [ Keying, Representing ]),

  FieldSchema.state('value', (spec: SliderSpec) => { 
    return Cell({
      x: spec.minX,
      y: spec.minY
    });
  }),
  FieldSchema.defaulted('axisHorizontal', true),
  FieldSchema.defaulted('axisVertical', false),
  FieldSchema.defaulted('rounded', true)
].concat(! isTouch ? [
  // Only add if not on a touch device
  FieldSchema.state('mouseIsDown', () => Cell(false))
] : [ ]);

export {
  SliderSchema
};
