import { Fun, Merger } from '@ephox/katamari';
import { PredicateFilter, SimRange, SugarElement, SugarNode, SugarText, Traverse } from '@ephox/sugar';
import * as fc from 'fast-check';

export interface SelectionExclusions {
  containers: (container: SugarElement<Node>) => boolean;
}

const defaultExclusions: SelectionExclusions = {
  containers: Fun.never
  /* Maybe support offsets later if it makes sense to do so */
};

const getEnd = (target: SugarElement<Node>): number =>
  // Probably do this more efficiently
  SugarNode.isText(target) ? SugarText.get(target).length : Traverse.children(target).length;

const gChooseIn = <T extends Node>(target: SugarElement<T>): fc.Arbitrary<{ element: SugarElement<T>; offset: number }> => {
  const offsets = getEnd(target);
  return fc.integer({ min: 0, max: offsets }).map((offset) => ({ element: target, offset }));
};

const gChooseFrom = (root: SugarElement<Node>, exclusions: SelectionExclusions) => {
  const self = exclusions.containers(root) ? [] : [ root ];
  const everything = PredicateFilter.descendants(root, Fun.not(exclusions.containers)).concat(self);
  return fc.constantFrom(...(everything.length > 0 ? everything : [ root ])).chain(gChooseIn);
};

const selection = (root: SugarElement<Node>, rawExclusions: SelectionExclusions): fc.Arbitrary<SimRange> => {
  const exclusions: SelectionExclusions = Merger.deepMerge(defaultExclusions, rawExclusions);
  return gChooseFrom(root, exclusions).chain((start) => gChooseFrom(root, exclusions).map((finish): SimRange => ({
    start: start.element,
    soffset: start.offset,
    finish: finish.element,
    foffset: finish.offset
  })));
};

export {
  selection
};
