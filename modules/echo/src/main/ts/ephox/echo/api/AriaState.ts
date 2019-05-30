import { Arr } from '@ephox/katamari';
import { Attr } from '@ephox/sugar';

var expanded = function (element) {
  Attr.set(element, 'aria-expanded', 'true');
};

var collapsed = function (element) {
  Attr.set(element, 'aria-expanded', 'false');
};

var checked = function (element, state) {
  Attr.set(element, 'aria-checked', String(state));
};

/* aria-pressed */
var setPressed = function (element, isPressed) {
  Attr.set(element, 'aria-pressed', isPressed ? 'true' : 'false');
};

var press = function (element) {
  setPressed(element, true);
};

var release = function (element) {
  setPressed(element, false);
};

var pressed = function (button) {
  setPressed(button.element(), button.selected());
};

var enable = function (element) {
  Attr.set(element, 'aria-disabled', 'false');
};

var disable = function (element) {
  Attr.set(element, 'aria-disabled', 'true');
};

var tabSelected = function (on, offs) {
  Attr.setAll(on, {
    'aria-selected': 'true',    // JAWS
    'aria-pressed': 'true'      // VoiceOver
  });

  Arr.each(offs, function (off) {
    Attr.setAll(off, {
      'aria-selected': 'false', // JAWS
      'aria-pressed': 'false'   // VoiceOver
    });
  });
};

var showPanel = function (element) {
  Attr.set(element, 'aria-selected', 'true');
  Attr.set(element, 'aria-hidden', 'false');
};

var hidePanel = function (element) {
  Attr.set(element, 'aria-selected', 'false');
  Attr.set(element, 'aria-hidden', 'true');
};

export default <any> {
  expanded: expanded,
  collapsed: collapsed,
  checked: checked,
  setPressed: setPressed,
  press: press,
  release: release,
  pressed: pressed,
  enable: enable,
  disable: disable,
  tabSelected: tabSelected,
  showPanel: showPanel,
  hidePanel: hidePanel
};