import { FieldSchema } from '@ephox/boulder';
import { Optional } from '@ephox/katamari';

import { bounds } from '../../alien/Boxes';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as Fields from '../../data/Fields';
import * as Bubble from '../layout/Bubble';
import * as Layout from '../layout/Layout';
import * as Origins from '../layout/Origins';
import { MakeshiftAnchor, nu as NuAnchoring } from './Anchoring';
import * as AnchorLayouts from './AnchorLayouts';

const placement = (component: AlloyComponent, anchorInfo: MakeshiftAnchor, origin: Origins.OriginAdt) => {
  const pos = Origins.translate(origin, anchorInfo.x, anchorInfo.y);
  const anchorBox = bounds(pos.left, pos.top, anchorInfo.width, anchorInfo.height);

  const layouts = AnchorLayouts.get(
    component.element,
    anchorInfo,
    Layout.all(),
    Layout.allRtl(),
    // No default bottomToTop layouts currently needed
    Layout.all(),
    Layout.allRtl(),
    Optional.none()
  );

  return Optional.some(
    NuAnchoring({
      anchorBox,
      bubble: anchorInfo.bubble,
      overrides: anchorInfo.overrides,
      layouts
    })
  );
};

export default [
  FieldSchema.required('x'),
  FieldSchema.required('y'),
  FieldSchema.defaulted('height', 0),
  FieldSchema.defaulted('width', 0),
  FieldSchema.defaulted('bubble', Bubble.fallback()),
  FieldSchema.defaulted('overrides', { }),
  AnchorLayouts.schema(),
  Fields.output('placement', placement)
];
