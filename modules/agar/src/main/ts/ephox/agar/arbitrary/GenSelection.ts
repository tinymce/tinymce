import { Fun, Merger } from '@ephox/katamari';
import { Element, Node, PredicateFilter, Text, Traverse } from '@ephox/sugar';
import Jsc from '@ephox/wrap-jsverify';

export interface SelectionExclusions {
  containers: (container: Element<any>) => boolean;
}

const defaultExclusions: SelectionExclusions = {
  containers: Fun.constant(false)
  /* Maybe support offsets later if it makes sense to do so */
};

const getEnd = (target: Element<any>): number =>
  // Probably do this more efficiently
  Node.isText(target) ? Text.get(target).length : Traverse.children(target).length;

const gChooseIn = (target: Element<any>): any => {
  const offsets = getEnd(target);
  return Jsc.integer(0, offsets).generator.map((offset: number) => ({ element: target, offset }));
};

const gChooseFrom = (root: Element<any>, exclusions: SelectionExclusions) => {
  const self = exclusions.containers(root) ? [] : [ root ];
  const everything = PredicateFilter.descendants(root, Fun.not(exclusions.containers)).concat(self);
  return Jsc.elements(everything.length > 0 ? everything : [ root ]).generator.flatMap(gChooseIn);
};

const selection = (root: Element<any>, rawExclusions: SelectionExclusions) => {
  const exclusions: SelectionExclusions = Merger.deepMerge(defaultExclusions, rawExclusions);
  return gChooseFrom(root, exclusions).flatMap((start) => gChooseFrom(root, exclusions).map((finish) => ({
    start: Fun.constant(start.element),
    soffset: Fun.constant(start.offset),
    finish: Fun.constant(finish.element),
    foffset: Fun.constant(finish.offset)
  })));
};

export {
  selection
};
