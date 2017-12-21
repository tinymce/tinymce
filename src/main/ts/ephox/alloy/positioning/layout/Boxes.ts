import OuterPosition from '../../frame/OuterPosition';
import Bounds from './Bounds';
import { Element } from '@ephox/sugar';
import { Height } from '@ephox/sugar';
import { Scroll } from '@ephox/sugar';
import { Width } from '@ephox/sugar';

// NOTE: We used to use AriaFocus.preserve here, but there is no reason to do that now that
// we are not changing the visibility of the element. Hopefully (2015-09-29).
var absolute = function (element) {
  var position = OuterPosition.find(element);
  var width = Width.getOuter(element);
  var height = Height.getOuter(element);
  return Bounds(position.left(), position.top(), width, height);
};

var view = function () {
  var width = window.innerWidth;
  var height = window.innerHeight;
  var doc = Element.fromDom(document);
  var scroll = Scroll.get(doc);
  return Bounds(scroll.left(), scroll.top(), width, height);
};

export default <any> {
  absolute: absolute,
  view: view
};