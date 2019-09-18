import { FieldSchema } from '@ephox/boulder';
import { Option } from '@ephox/katamari';

import * as Fields from '../../data/Fields';
import * as Bubble from '../layout/Bubble';
import * as Layout from '../layout/Layout';
import * as Origins from '../layout/Origins';
import { nu as NuAnchor, HotspotAnchor } from './Anchoring';
import * as AnchorLayouts from './AnchorLayouts';

const belowAbove = () => [ Layout.southeast, Layout.southwest, Layout.northeast, Layout.northwest, Layout.south, Layout.north ];
const belowAboveRtl = () => [ Layout.southwest, Layout.southeast, Layout.northwest, Layout.northeast, Layout.south, Layout.north ];

const placement = (component, anchorInfo: HotspotAnchor, origin) => {
  const hotspot = anchorInfo.hotspot;
  const anchorBox = Origins.toBox(origin, hotspot.element());

  const layouts = AnchorLayouts.get(component.element(), anchorInfo, belowAbove(), belowAboveRtl());

  return Option.some(
    NuAnchor({
      anchorBox,
      bubble: anchorInfo.bubble.getOr(Bubble.fallback()),
      overrides: anchorInfo.overrides,
      layouts,
      placer: Option.none()
    })
  );
};

export default [
  FieldSchema.strict('hotspot'),
  FieldSchema.option('bubble'),
  FieldSchema.defaulted('overrides', { }),
  AnchorLayouts.schema(),
  Fields.output('placement', placement)
];
