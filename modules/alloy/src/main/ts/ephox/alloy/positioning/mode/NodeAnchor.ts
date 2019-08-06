import { FieldSchema } from '@ephox/boulder';
import { Option } from '@ephox/katamari';

import { AlloyComponent } from '../../api/component/ComponentApi';
import * as Fields from '../../data/Fields';
import * as Origins from '../layout/Origins';
import { NodeAnchor, Anchoring } from './Anchoring';
import * as ContainerOffsets from './ContainerOffsets';
import * as AnchorLayouts from './AnchorLayouts';
import ContentAnchorCommon from './ContentAnchorCommon';

const placement = (component: AlloyComponent, anchorInfo: NodeAnchor, origin: Origins.OriginAdt): Option<Anchoring> => {
  const rootPoint = ContainerOffsets.getRootPoint(component, origin, anchorInfo);

  return anchorInfo.node.bind((target) => {
    const rect = target.dom().getBoundingClientRect();
    const nodeBox = ContentAnchorCommon.capRect(rect.left, rect.top, rect.width, rect.height);
    const elem = anchorInfo.node.getOr(component.element());
    return ContentAnchorCommon.calcNewAnchor(nodeBox, rootPoint, anchorInfo, origin, elem);
  });
};

export default [
  FieldSchema.strict('node'),
  FieldSchema.strict('root'),
  FieldSchema.option('bubble'),
  AnchorLayouts.schema(),
  // chiefly MaxHeight.expandable()
  FieldSchema.defaulted('overrides', {}),
  FieldSchema.defaulted('showAbove', false),
  Fields.output('placement', placement)
];
