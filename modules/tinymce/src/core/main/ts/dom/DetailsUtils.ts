import { Optional } from '@ephox/katamari';

import type DOMUtils from '../api/dom/DOMUtils';

import * as NodeType from './NodeType';

const getClosestDetails = (dom: DOMUtils, node: Node): Optional<HTMLDetailsElement> =>
  Optional.from(dom.getParent(node, NodeType.isDetails));

export {
  getClosestDetails
};
