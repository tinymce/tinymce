import { FieldSchema, FieldProcessorAdt } from '@ephox/boulder';
import { Fun, Option } from '@ephox/katamari';

import * as Fields from '../../data/Fields';
import * as Layout from '../layout/Layout';
import * as Origins from '../layout/Origins';
import { nu as NuAnchor, Anchoring } from './Anchoring';
import { nu as NuBubble } from '../layout/Bubble';
import * as AnchorLayouts from './AnchorLayouts';

const placement = (component, posInfo, anchorInfo, origin) => {
  const hotspot = anchorInfo.hotspot();
  const anchorBox = Origins.toBox(origin, hotspot.element());

  const layouts = AnchorLayouts.get(component, anchorInfo, Layout.all(), Layout.allRtl());

  return Option.some(
    NuAnchor({
      anchorBox: Fun.constant(anchorBox),
      bubble: Fun.constant(NuBubble(0, 0)),
      // maxHeightFunction: Fun.constant(MaxHeight.available()),
      overrides: Fun.constant({ }),
      layouts: Fun.constant(layouts),
      placer: Option.none
    })
  );
};

export default [
  FieldSchema.strict('hotspot'),
  AnchorLayouts.schema(),
  Fields.output('placement', placement)
];