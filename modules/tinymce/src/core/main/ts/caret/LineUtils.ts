import { Obj } from '@ephox/katamari';

import { NodeClientRect } from '../dom/Dimensions';
import * as NodeType from '../dom/NodeType';
import * as ClientRect from '../geom/ClientRect';
import * as ArrUtils from '../util/ArrUtils';

type GeomClientRect = ClientRect.ClientRect;

const isContentEditableFalse = NodeType.isContentEditableFalse;
const distanceToRectLeft = (clientRect: GeomClientRect, clientX: number) => Math.abs(clientRect.left - clientX);
const distanceToRectRight = (clientRect: GeomClientRect, clientX: number) => Math.abs(clientRect.right - clientX);
const isNodeClientRect = (rect: GeomClientRect): rect is NodeClientRect => Obj.hasNonNullableKey((rect as any), 'node');

const findClosestClientRect = <T extends GeomClientRect>(clientRects: T[], clientX: number): T =>
  ArrUtils.reduce(clientRects, (oldClientRect, clientRect) => {
    const oldDistance = Math.min(distanceToRectLeft(oldClientRect, clientX), distanceToRectRight(oldClientRect, clientX));
    const newDistance = Math.min(distanceToRectLeft(clientRect, clientX), distanceToRectRight(clientRect, clientX));

    // cE=false has higher priority
    if (newDistance === oldDistance && isNodeClientRect(clientRect) && isContentEditableFalse(clientRect.node)) {
      return clientRect;
    }

    if (newDistance < oldDistance) {
      return clientRect;
    }

    return oldClientRect;
  });

export {
  findClosestClientRect
};
