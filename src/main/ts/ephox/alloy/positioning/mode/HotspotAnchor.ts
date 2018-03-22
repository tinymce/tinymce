import { FieldSchema } from '@ephox/boulder';
import { Fun, Option } from '@ephox/katamari';

import * as Fields from '../../data/Fields';
import Bubble from '../layout/Bubble';
import * as Layout from '../layout/Layout';
import * as Origins from '../layout/Origins';
import Anchoring from './Anchoring';
import * as AnchorLayouts from './AnchorLayouts';

const placement = function (component, posInfo, anchorInfo, origin) {
  const hotspot = anchorInfo.hotspot();
  const anchorBox = Origins.toBox(origin, hotspot.element());

  const layouts = AnchorLayouts.get(component, anchorInfo, Layout.all(), Layout.allRtl());

  return Option.some(
    Anchoring({
      anchorBox: Fun.constant(anchorBox),
      bubble: Fun.constant(Bubble(0, 0)),
      // maxHeightFunction: Fun.constant(MaxHeight.available()),
      overrides: Fun.constant({ }),
      layouts: Fun.constant(layouts),
      placer: Option.none
    })
  );
};

export default <any> [
  FieldSchema.strict('hotspot'),
  AnchorLayouts.schema(),
  Fields.output('placement', placement)
];