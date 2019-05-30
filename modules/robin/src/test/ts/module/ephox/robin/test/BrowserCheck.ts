import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { Insert } from '@ephox/sugar';
import { Remove } from '@ephox/sugar';
import { SelectorFind } from '@ephox/sugar';
import { Traverse } from '@ephox/sugar';

var getNode = function (container) {
  return SelectorFind.descendant(container, '.me').fold(function () {
    return SelectorFind.descendant(container, '.child').bind(Traverse.firstChild);
  }, function (v) {
    return Option.some(v);
  }).getOrDie();
};

var run = function (input, f) {
  var body = SelectorFind.first('body').getOrDie();
  var container = Element.fromTag('div');
  Insert.append(body, container);
  container.dom().innerHTML = input;
  var node = getNode(container);
  f(node);
  Remove.remove(container);
};

export default <any> {
  run: run
};