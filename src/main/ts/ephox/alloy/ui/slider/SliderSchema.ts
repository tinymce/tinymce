import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { Cell, Fun } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import { Keying } from '../../api/behaviour/Keying';
import { Representing } from '../../api/behaviour/Representing';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';

const isTouch = PlatformDetection.detect().deviceType.isTouch();

const SliderSchema: FieldProcessorAdt[] = [
  FieldSchema.strict('min'),
  FieldSchema.strict('max'),
  FieldSchema.defaulted('stepSize', 1),
  FieldSchema.defaulted('onChange', Fun.noop),
  FieldSchema.defaulted('onInit', Fun.noop),
  FieldSchema.defaulted('onDragStart', Fun.noop),
  FieldSchema.defaulted('onDragEnd', Fun.noop),
  FieldSchema.defaulted('snapToGrid', false),
  FieldSchema.option('snapStart'),
  FieldSchema.strict('getInitialValue'),
  SketchBehaviours.field('sliderBehaviours', [ Keying, Representing ]),

  FieldSchema.state('value', (spec) => { return Cell(spec.min); })
].concat(! isTouch ? [
  // Only add if not on a touch device
  FieldSchema.state('mouseIsDown', () => { return Cell(false); })
] : [ ]);

export {
  SliderSchema
};
