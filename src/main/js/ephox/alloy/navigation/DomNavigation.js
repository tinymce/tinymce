import Cycles from '../alien/Cycles';
import DomPinpoint from './DomPinpoint';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';

var horizontal = function (container, selector, current, delta) {
  // I wonder if this will be a problem when the focused element is invisible (shouldn't happen)
  return DomPinpoint.locateVisible(container, current, selector, Fun.constant(true)).bind(function (identified) {
    var index = identified.index();
    var candidates = identified.candidates();
    var newIndex = Cycles.cycleBy(index, delta, 0, candidates.length - 1);
    return Option.from(candidates[newIndex]);
  });
};

export default <any> {
  horizontal: horizontal
};