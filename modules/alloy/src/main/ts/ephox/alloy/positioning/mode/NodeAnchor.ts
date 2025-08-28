import { FieldSchema } from '@ephox/boulder';
import type { Optional } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';

import type { AlloyComponent } from '../../api/component/ComponentApi';
import * as Fields from '../../data/Fields';
import type * as Origins from '../layout/Origins';

import type { Anchoring, NodeAnchor } from './Anchoring';
import * as AnchorLayouts from './AnchorLayouts';
import * as ContainerOffsets from './ContainerOffsets';
import * as ContentAnchorCommon from './ContentAnchorCommon';

const placement = (component: AlloyComponent, anchorInfo: NodeAnchor, origin: Origins.OriginAdt): Optional<Anchoring> => {
  const rootPoint = ContainerOffsets.getRootPoint(component, origin, anchorInfo);

  return anchorInfo.node
    // Ensure the node is still attached, otherwise we can't get a valid client rect for a detached node
    .filter(SugarBody.inBody)
    .bind((target) => {
      const rect = target.dom.getBoundingClientRect();
      const nodeBox = ContentAnchorCommon.getBox(rect.left, rect.top, rect.width, rect.height);
      const elem = anchorInfo.node.getOr(component.element);
      return ContentAnchorCommon.calcNewAnchor(nodeBox, rootPoint, anchorInfo, origin, elem);
    });
};

export default [
  FieldSchema.required('node'),
  FieldSchema.required('root'),
  FieldSchema.option('bubble'),
  AnchorLayouts.schema(),
  // chiefly MaxHeight.expandable()
  FieldSchema.defaulted('overrides', {}),
  FieldSchema.defaulted('showAbove', false),
  Fields.output('placement', placement)
];
