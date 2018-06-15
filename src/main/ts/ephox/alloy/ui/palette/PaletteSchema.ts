import { FieldSchema, DslType, FieldProcessorAdt } from '@ephox/boulder';
import { Cell, Fun } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import { Keying } from '../../api/behaviour/Keying';
import { Representing } from '../../api/behaviour/Representing';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import { RgbaColour } from '@ephox/acid';

const isTouch = PlatformDetection.detect().deviceType.isTouch();

const PaletteSchema : FieldProcessorAdt[] = [
  FieldSchema.defaulted('onChange', Fun.noop),
  FieldSchema.defaulted('onInit', Fun.noop),
  FieldSchema.defaulted('onDragStart', Fun.noop),
  FieldSchema.defaulted('onDragEnd', Fun.noop),
  FieldSchema.state('value', function (spec) { return Cell({x: 0, y: 0}); }),
  FieldSchema.state('colour', function (spec) { return Cell(RgbaColour.rgbaColour(0, 0, 0, 1)); }),
  SketchBehaviours.field('paletteBehaviours', [ Keying, Representing ])
].concat(! isTouch ? [
  // Only add if not on a touch device
  FieldSchema.state('mouseIsDown', function () { return Cell(false); })
] : [ ]);

export {
  PaletteSchema
};
