import DOMUtils from '../../api/dom/DOMUtils';
import { PathRange, resolvePathRange } from './PathRange';
import * as Utils from './Utils';

export interface Marker {
  readonly prefix: string;
  readonly start: Node;
  readonly end: Node;
}

const newMarker = (dom: DOMUtils, id: string): HTMLSpanElement =>
  dom.create('span', { 'data-mce-type': 'bookmark', id });

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
  const startParentNode = textStart.parentNode as Node;
  const endParentNode = textEnd.parentNode as Node;
  return {
    prefix: markerPrefix,
    end: endParentNode.insertBefore(newMarker(dom, markerPrefix + '-end'), textEnd),
    start: startParentNode.insertBefore(newMarker(dom, markerPrefix + '-start'), textStart)
  };
};

const removeMarker = (dom: DOMUtils, marker: Marker, isRoot: (node: Node) => boolean): void => {
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
