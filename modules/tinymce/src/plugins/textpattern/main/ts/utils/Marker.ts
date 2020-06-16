/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node, Range, Text } from '@ephox/dom-globals';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import { PathRange, resolvePathRange } from './PathRange';
import * as Utils from './Utils';

export interface Marker {
  prefix: string;
  start: Node;
  end: Node;
}

const newMarker = (dom: DOMUtils, id: string) => dom.create('span', { 'data-mce-type': 'bookmark', id });

const rangeFromMarker = (dom: DOMUtils, marker: Marker): Range => {
  const rng = dom.createRng();
  rng.setStartAfter(marker.start);
  rng.setEndBefore(marker.end);
  return rng;
};

const createMarker = (dom: DOMUtils, markerPrefix: string, pathRange: PathRange): Marker => {
  // Resolve the path range
  const rng = resolvePathRange(dom.getRoot(), pathRange).getOrDie('Unable to resolve path range');
  const startNode = rng.startContainer as Text;
  const endNode = rng.endContainer as Text;

  // Create the marker
  const textEnd = rng.endOffset === 0 ? endNode : endNode.splitText(rng.endOffset);
  const textStart = rng.startOffset === 0 ? startNode : startNode.splitText(rng.startOffset);
  return {
    prefix: markerPrefix,
    end: textEnd.parentNode.insertBefore(newMarker(dom, markerPrefix + '-end'), textEnd),
    start: textStart.parentNode.insertBefore(newMarker(dom, markerPrefix + '-start'), textStart)
  };
};

const removeMarker = (dom: DOMUtils, marker: Marker, isRoot: (node: Node) => boolean) => {
  // Note: Use dom.get() here instead of marker.end/start, as applying the format/command can
  // clone the nodes meaning the old reference isn't usable
  Utils.cleanEmptyNodes(dom, dom.get(marker.prefix + '-end'), isRoot);
  Utils.cleanEmptyNodes(dom, dom.get(marker.prefix + '-start'), isRoot);
};

export {
  createMarker,
  rangeFromMarker,
  removeMarker
};