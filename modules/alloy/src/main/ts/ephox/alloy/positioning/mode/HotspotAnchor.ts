import { FieldSchema } from '@ephox/boulder';
import { Optional } from '@ephox/katamari';

import { AlloyComponent } from '../../api/component/ComponentApi';
import * as Fields from '../../data/Fields';
import * as Bubble from '../layout/Bubble';
import * as Layout from '../layout/Layout';
import * as Origins from '../layout/Origins';
import { Anchoring, HotspotAnchor, nu as NuAnchor } from './Anchoring';
import * as AnchorLayouts from './AnchorLayouts';

const placement = (component: AlloyComponent, anchorInfo: HotspotAnchor, origin: Origins.OriginAdt): Optional<Anchoring> => {
  const hotspot = anchorInfo.hotspot;
  const anchorBox = Origins.toBox(origin, hotspot.element);

  const layouts = AnchorLayouts.get(
    component.element,
    anchorInfo,
    Layout.belowOrAbove(),
    Layout.belowOrAboveRtl(),
    Layout.aboveOrBelow(),
    Layout.aboveOrBelowRtl(),
    Optional.some(anchorInfo.hotspot.element)
  );

  return Optional.some(
    NuAnchor({
      anchorBox,
      bubble: anchorInfo.bubble.getOr(Bubble.fallback()),
      overrides: anchorInfo.overrides,
      layouts
    })
  );
};

export default [
  FieldSchema.required('hotspot'),
  FieldSchema.option('bubble'),
  FieldSchema.defaulted('overrides', { }),
  AnchorLayouts.schema(),
  Fields.output('placement', placement)
];
