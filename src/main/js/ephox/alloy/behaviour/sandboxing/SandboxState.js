import BehaviourState from '../common/BehaviourState';
import { Cell } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';

var init = function () {
  var contents = Cell(Option.none());

  var readState = Fun.constant('not-implemented');

  var isOpen = function () {
    return contents.get().isSome();
  };

  var set = function (c) {
    contents.set(Option.some(c));
  };

  var get = function (c) {
    return contents.get();
  };

  var clear = function () {
    contents.set(Option.none());
  };

  return BehaviourState({
    readState: readState,
    isOpen: isOpen,
    clear: clear,
    set: set,
    get: get
  });
};

export default <any> {
  init: init
};