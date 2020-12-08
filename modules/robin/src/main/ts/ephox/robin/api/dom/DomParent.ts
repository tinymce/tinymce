import { DomUniverse } from '@ephox/boss';
import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import { BrokenPath, LeftRight } from '../../parent/Breaker';
import * as Parent from '../general/Parent';

const universe = DomUniverse();

const sharedOne = function (look: (e: SugarElement) => Optional<SugarElement>, elements: SugarElement[]): Optional<SugarElement> {
  return Parent.sharedOne(universe, function (_universe, element) {
    return look(element);
  }, elements);
};

const subset = function (start: SugarElement, finish: SugarElement): Optional<SugarElement[]> {
  return Parent.subset(universe, start, finish);
};

const ancestors = function (start: SugarElement, finish: SugarElement, isRoot?: (x: SugarElement) => boolean): Parent.AncestorsFnResult<SugarElement> {
  return Parent.ancestors(universe, start, finish, isRoot);
};

const breakToLeft = function (parent: SugarElement, child: SugarElement): Optional<LeftRight<SugarElement>> {
  return Parent.breakToLeft(universe, parent, child);
};

const breakToRight = function (parent: SugarElement, child: SugarElement): Optional<LeftRight<SugarElement>> {
  return Parent.breakToRight(universe, parent, child);
};

const breakPath = function (child: SugarElement, isTop: (e: SugarElement) => boolean, breaker: (parent: SugarElement, child: SugarElement) => Optional<LeftRight<SugarElement>>): BrokenPath<SugarElement> {
  return Parent.breakPath(universe, child, isTop, function (u, p, c) {
    return breaker(p, c);
  });
};

export {
  sharedOne,
  subset,
  ancestors,
  breakToLeft,
  breakToRight,
  breakPath
};
