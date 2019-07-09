import { Arr } from '@ephox/katamari';
import { Attr } from '@ephox/sugar';

const expanded = function (element) {
  Attr.set(element, 'aria-expanded', 'true');
};

const collapsed = function (element) {
  Attr.set(element, 'aria-expanded', 'false');
};

const checked = function (element, state) {
  Attr.set(element, 'aria-checked', String(state));
};

/* aria-pressed */
const setPressed = function (element, isPressed) {
  Attr.set(element, 'aria-pressed', isPressed ? 'true' : 'false');
};

const press = function (element) {
  setPressed(element, true);
};

const release = function (element) {
  setPressed(element, false);
};

const pressed = function (button) {
  setPressed(button.element(), button.selected());
};

const enable = function (element) {
  Attr.set(element, 'aria-disabled', 'false');
};

const disable = function (element) {
  Attr.set(element, 'aria-disabled', 'true');
};

const tabSelected = function (on, offs) {
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

const showPanel = function (element) {
  Attr.set(element, 'aria-selected', 'true');
  Attr.set(element, 'aria-hidden', 'false');
};

const hidePanel = function (element) {
  Attr.set(element, 'aria-selected', 'false');
  Attr.set(element, 'aria-hidden', 'true');
};

export default <any> {
  expanded,
  collapsed,
  checked,
  setPressed,
  press,
  release,
  pressed,
  enable,
  disable,
  tabSelected,
  showPanel,
  hidePanel
};
