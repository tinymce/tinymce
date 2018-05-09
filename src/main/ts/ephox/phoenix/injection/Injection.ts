import { Fun } from '@ephox/katamari';
import InjectPosition from '../api/data/InjectPosition';
import Split from '../api/general/Split';

var insertAtText = function (universe, element, offset) {
  var split = Split.split(universe, element, offset);
  var position = Split.position(universe, split);
  return position.fold(function () {
    return InjectPosition.invalid(element, offset);
  }, InjectPosition.before, InjectPosition.after, InjectPosition.after);
};

var insertAtElement = function (universe, parent, offset) {
  var children = universe.property().children(parent);
  var isEmptyTag = universe.property().isEmptyTag(parent);
  
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
var atStartOf = function (universe, element, offset, injection) {
  var insertion = universe.property().isText(element) ? insertAtText : insertAtElement;
  var position = insertion(universe, element, offset);

  var onLast = function (p) {
    universe.insert().append(p, injection);
  };

  var onBefore = function (m) {
    universe.insert().before(m, injection);
  };

  var onAfter = function (m) {
    universe.insert().after(m, injection);
  };

  var onRest = onBefore;
  var onInvalid = Fun.noop;

  position.fold(onBefore, onAfter, onRest, onLast, onInvalid);
};

export default <any>{
  atStartOf: atStartOf
};