import { Fun, Merger } from '@ephox/katamari';
import { Element, Node, PredicateFilter, Text, Traverse } from '@ephox/sugar';
import Jsc from '@ephox/wrap-jsverify';

export interface SelectionExclusions {
  containers: (container: Element) => boolean;
}

const defaultExclusions: SelectionExclusions = {
  containers: Fun.constant(false)
  /* Maybe support offsets later if it makes sense to do so */
};

const getEnd = function (target: Element) {
  // Probably do this more efficiently
  return Node.isText(target) ? Text.get(target).length : Traverse.children(target).length;
};

const gChooseIn = function (target: Element) {
  const offsets = getEnd(target);
  return Jsc.integer(0, offsets).generator.map(function (offset: number) {
    return { element: target, offset };
  });
};

const gChooseFrom = function (root: Element, exclusions: SelectionExclusions) {
  const self = exclusions.containers(root) ? [] : [root];
  const everything = PredicateFilter.descendants(root, Fun.not(exclusions.containers)).concat(self);
  return Jsc.elements(everything.length > 0 ? everything : [root]).generator.flatMap(gChooseIn);
};

const selection = function (root: Element, rawExclusions: SelectionExclusions) {
  const exclusions: SelectionExclusions = Merger.deepMerge(defaultExclusions, rawExclusions);
  return gChooseFrom(root, exclusions).flatMap(function (start) {
    return gChooseFrom(root, exclusions).map(function (finish) {
      return {
        start: Fun.constant(start.element),
        soffset: Fun.constant(start.offset),
        finish: Fun.constant(finish.element),
        foffset: Fun.constant(finish.offset)
      };
    });
  });
};

export default {
  selection
};
