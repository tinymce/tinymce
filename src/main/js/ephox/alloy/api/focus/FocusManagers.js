import Highlighting from '../behaviour/Highlighting';
import { Fun } from '@ephox/katamari';
import { Focus } from '@ephox/sugar';

var dom = function () {
  var get = function (component) {
    return Focus.search(component.element());
  };

  var set = function (component, focusee) {
    component.getSystem().triggerFocus(focusee, component.element());
  };

  return {
    get: get,
    set: set
  };
};

var highlights = function () {
  var get = function (component) {
    return Highlighting.getHighlighted(component).map(function (item) {
      return item.element();
    });
  };

  var set = function (component, element) {
    component.getSystem().getByDom(element).fold(Fun.noop, function (item) {
      Highlighting.highlight(component, item);
    });
  };

  return {
    get: get,
    set: set
  };
};

export default <any> {
  dom: dom,
  highlights: highlights
};