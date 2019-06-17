import { Universe } from '@ephox/boss';
import { Fun } from '@ephox/katamari';
import { InjectPosition } from '../api/data/InjectPosition';
import * as Split from '../api/general/Split';

const insertAtText = function <E, D>(universe: Universe<E, D>, element: E, offset: number) {
  const split = Split.split(universe, element, offset);
  const position = Split.position(universe, split);
  return position.fold(function () {
    return InjectPosition.invalid(element, offset);
  }, InjectPosition.before, (before, _after) => InjectPosition.after(before), InjectPosition.after);
};

const insertAtElement = function <E, D>(universe: Universe<E, D>, parent: E, offset: number) {
  const children = universe.property().children(parent);
  const isEmptyTag = universe.property().isEmptyTag(parent);

  if (isEmptyTag) return InjectPosition.before(parent);
  else if (offset === children.length) return InjectPosition.last(parent);
  else if (offset < children.length) return InjectPosition.rest(children[offset]);
  else return InjectPosition.invalid(parent, offset);
};

/*
 * The injection rules: 
 *
 * If a text node:
 *   - split it at the offset if not at edge.
 *     - if at start of node, insert before that node.
 *     - if at end of node, insert after that node.
 *     - else: insert after the before part of the split.
 * Else:
 *   - if beyond the last child (last cursor position), append to the parent.
 *   - if a valid child, insert before the child.
 *   - if invalid .... invalid case.
 */
const atStartOf = function <E, D>(universe: Universe<E, D>, element: E, offset: number, injection: E) {
  const insertion = universe.property().isText(element) ? insertAtText : insertAtElement;
  const position = insertion(universe, element, offset);

  const onLast = function (p: E) {
    universe.insert().append(p, injection);
  };

  const onBefore = function (m: E) {
    universe.insert().before(m, injection);
  };

  const onAfter = function (m: E) {
    universe.insert().after(m, injection);
  };

  const onRest = onBefore;
  const onInvalid = Fun.noop;

  position.fold(onBefore, onAfter, onRest, onLast, onInvalid);
};

export {
  atStartOf
};