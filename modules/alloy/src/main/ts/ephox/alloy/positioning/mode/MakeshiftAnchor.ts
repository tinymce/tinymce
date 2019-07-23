import { FieldSchema } from '@ephox/boulder';
import { Option } from '@ephox/katamari';

import { bounds } from '../../alien/Boxes';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as Fields from '../../data/Fields';
import * as Bubble from '../layout/Bubble';
import * as Layout from '../layout/Layout';
import { OriginAdt } from '../layout/Origins';
import { MakeshiftAnchor, nu as NuAnchoring } from './Anchoring';
import * as AnchorLayouts from './AnchorLayouts';

const placement = (component: AlloyComponent, anchorInfo: MakeshiftAnchor, origin: OriginAdt) => {
  const anchorBox = bounds(anchorInfo.x, anchorInfo.y, anchorInfo.width, anchorInfo.height);

  const layouts = AnchorLayouts.get(component.element(), anchorInfo, Layout.all(), Layout.allRtl());

  return Option.some(
    NuAnchoring({
      anchorBox,
      bubble: anchorInfo.bubble,
      overrides: anchorInfo.overrides,
      layouts,
      placer: Option.none()
    })
  );
};

export default [
  FieldSchema.strict('x'),
  FieldSchema.strict('y'),
  FieldSchema.defaulted('height', 0),
  FieldSchema.defaulted('width', 0),
  FieldSchema.defaulted('bubble', Bubble.fallback()),
  FieldSchema.defaulted('overrides', { }),
  AnchorLayouts.schema(),
  Fields.output('placement', placement)
];
