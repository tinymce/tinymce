import { Objects } from '@ephox/boulder';
import { Arr } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Node } from '@ephox/sugar';
import { Attr } from '@ephox/sugar';

var updatePressed = function (component, ariaInfo, status) {
  Attr.set(component.element(), 'aria-pressed', status);
  if (ariaInfo.syncWithExpanded()) updateExpanded(component, ariaInfo, status);
};

var updateSelected = function (component, ariaInfo, status) {
  Attr.set(component.element(), 'aria-selected', status);
};

var updateChecked = function (component, ariaInfo, status) {
  Attr.set(component.element(), 'aria-checked', status);
};

var updateExpanded = function (component, ariaInfo, status) {
  Attr.set(component.element(), 'aria-expanded', status);
};

// INVESTIGATE: What other things can we derive?
var tagAttributes = {
  button: [ 'aria-pressed' ],
  'input:checkbox': [ 'aria-checked' ]
};

var roleAttributes = {
  'button': [ 'aria-pressed' ],
  'listbox': [ 'aria-pressed', 'aria-expanded' ],
  'menuitemcheckbox': [ 'aria-checked' ]
};

var detectFromTag = function (component) {
  var elem = component.element();
  var rawTag = Node.name(elem);
  var suffix = rawTag === 'input' && Attr.has(elem, 'type') ? ':' + Attr.get(elem, 'type') : '';
  return Objects.readOptFrom(tagAttributes, rawTag + suffix);
};

var detectFromRole = function (component) {
  var elem = component.element();
  if (! Attr.has(elem, 'role')) return Option.none();
  else {
    var role = Attr.get(elem, 'role');
    return Objects.readOptFrom(roleAttributes, role);
  }
};

var updateAuto = function (component, ariaInfo, status) {
  // Role has priority
  var attributes = detectFromRole(component).orThunk(function () {
    return detectFromTag(component);
  }).getOr([ ]);
  Arr.each(attributes, function (attr) {
    Attr.set(component.element(), attr, status);
  });
};

export default <any> {
  updatePressed: updatePressed,
  updateSelected: updateSelected,
  updateChecked: updateChecked,
  updateExpanded: updateExpanded,
  updateAuto: updateAuto
};