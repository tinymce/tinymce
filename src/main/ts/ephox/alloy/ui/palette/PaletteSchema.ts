import { FieldSchema, DslType } from '@ephox/boulder';
import { Cell, Fun } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import { Keying } from '../../api/behaviour/Keying';
import { Representing } from '../../api/behaviour/Representing';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';

const isTouch = PlatformDetection.detect().deviceType.isTouch();

const PaletteSchema = [
  FieldSchema.defaulted('onChange', Fun.noop),
  FieldSchema.state('value', function (spec) { return Cell(spec.min); })
].concat(! isTouch ? [
  // Only add if not on a touch device
  FieldSchema.state('mouseIsDown', function () { return Cell(false); })
] : [ ]);

export {
  PaletteSchema
};
