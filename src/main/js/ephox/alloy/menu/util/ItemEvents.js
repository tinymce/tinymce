import Focusing from '../../api/behaviour/Focusing';
import AlloyTriggers from '../../api/events/AlloyTriggers';
import { Fun } from '@ephox/katamari';
import { Focus } from '@ephox/sugar';

var hoverEvent = 'alloy.item-hover';
var focusEvent = 'alloy.item-focus';

var onHover = function (item) {
  // Firstly, check that the focus isn't already inside the item. This
  // is to handle situations like widgets where the widget is inside the item
  // and it has the focus, so as you slightly adjust the mouse, you don't
  // want to lose focus on the widget. Note, that because this isn't API based
  // (i.e. we are manually searching for focus), it may not be that flexible.
  if (Focus.search(item.element()).isNone() || Focusing.isFocused(item)) {
    if (! Focusing.isFocused(item)) Focusing.focus(item);
    AlloyTriggers.emitWith(item, hoverEvent, { item: item });
  }
};

var onFocus = function (item) {
  AlloyTriggers.emitWith(item, focusEvent, { item: item });
};

export default <any> {
  hover: Fun.constant(hoverEvent),
  focus: Fun.constant(focusEvent),

  onHover: onHover,
  onFocus: onFocus
};