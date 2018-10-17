import { FieldSchema } from '@ephox/boulder';
import { Fun, Option } from '@ephox/katamari';

import * as Fields from '../../data/Fields';
import * as Bubble from '../layout/Bubble';
import * as Layout from '../layout/Layout';
import * as Origins from '../layout/Origins';
import { nu as NuAnchor } from './Anchoring';
import * as AnchorLayouts from './AnchorLayouts';

const placement = (component, anchorInfo, origin) => {
  const hotspot = anchorInfo.hotspot();
  const anchorBox = Origins.toBox(origin, hotspot.element());

  const layouts = AnchorLayouts.get(component.element(), anchorInfo, Layout.all(), Layout.allRtl());

  return Option.some(
    NuAnchor({
      anchorBox: Fun.constant(anchorBox),
      bubble: Fun.constant(Bubble.fallback()),
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