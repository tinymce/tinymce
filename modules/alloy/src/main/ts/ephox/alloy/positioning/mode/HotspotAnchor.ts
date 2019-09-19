import { FieldSchema } from '@ephox/boulder';
import { Option } from '@ephox/katamari';

import * as Fields from '../../data/Fields';
import * as Bubble from '../layout/Bubble';
import * as Layout from '../layout/Layout';
import * as Origins from '../layout/Origins';
import { nu as NuAnchor, HotspotAnchor, Anchoring } from './Anchoring';
import * as AnchorLayouts from './AnchorLayouts';
import { AlloyComponent } from '../../api/component/ComponentApi';

const placement = (component: AlloyComponent, anchorInfo: HotspotAnchor, origin: Origins.OriginAdt): Option<Anchoring> => {
  const hotspot = anchorInfo.hotspot;
  const anchorBox = Origins.toBox(origin, hotspot.element());

  const layouts = AnchorLayouts.get(component.element(), anchorInfo, Layout.belowOrAbove(), Layout.belowOrAboveRtl());

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
