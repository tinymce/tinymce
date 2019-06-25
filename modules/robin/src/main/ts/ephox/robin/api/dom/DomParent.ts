import { DomUniverse } from '@ephox/boss';
import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { BrokenPath, LeftRight } from '../../parent/Breaker';
import Parent from '../general/Parent';

const universe = DomUniverse();

const sharedOne = function (look: (e: Element) => Option<Element>, elements: Element[]) {
  return Parent.sharedOne(universe, function (_universe, element) {
    return look(element);
  }, elements);
};

const subset = function (start: Element, finish: Element) {
  return Parent.subset(universe, start, finish);
};

const ancestors = function (start: Element, finish: Element, isRoot?: (x: Element) => boolean) {
  return Parent.ancestors(universe, start, finish, isRoot);
};

const breakToLeft = function (parent: Element, child: Element) {
  return Parent.breakToLeft(universe, parent, child);
};

const breakToRight = function (parent: Element, child: Element) {
  return Parent.breakToRight(universe, parent, child);
};

const breakPath = function (child: Element, isTop: (e: Element) => boolean, breaker: (parent: Element, child: Element) => Option<LeftRight<Element>>): BrokenPath<Element> {
  return Parent.breakPath(universe, child, isTop, function (u, p, c) {
    return breaker(p, c);
  });
};

export default {
  sharedOne,
  subset,
  ancestors,
  breakToLeft,
  breakToRight,
  breakPath
};