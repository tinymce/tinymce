import { Fun, Merger } from '@ephox/katamari';
import { PredicateFilter, SimRange, SugarElement, SugarNode, SugarText, Traverse } from '@ephox/sugar';
import Jsc from '@ephox/wrap-jsverify';

export interface SelectionExclusions {
  containers: (container: SugarElement<any>) => boolean;
}

const defaultExclusions: SelectionExclusions = {
  containers: Fun.never
  /* Maybe support offsets later if it makes sense to do so */
};

const getEnd = (target: SugarElement<any>): number =>
  // Probably do this more efficiently
  SugarNode.isText(target) ? SugarText.get(target).length : Traverse.children(target).length;

const gChooseIn = (target: SugarElement<any>): any => {
  const offsets = getEnd(target);
  return Jsc.integer(0, offsets).generator.map((offset: number) => ({ element: target, offset }));
};

const gChooseFrom = (root: SugarElement<any>, exclusions: SelectionExclusions) => {
  const self = exclusions.containers(root) ? [] : [ root ];
  const everything = PredicateFilter.descendants(root, Fun.not(exclusions.containers)).concat(self);
  return Jsc.elements(everything.length > 0 ? everything : [ root ]).generator.flatMap(gChooseIn);
};

const selection = (root: SugarElement<any>, rawExclusions: SelectionExclusions): SimRange[] => {
  const exclusions: SelectionExclusions = Merger.deepMerge(defaultExclusions, rawExclusions);
  return gChooseFrom(root, exclusions).flatMap((start) => gChooseFrom(root, exclusions).map((finish) => ({
    start: start.element,
    soffset: start.offset,
    finish: finish.element,
    foffset: finish.offset
  })));
};

export {
  selection
};
