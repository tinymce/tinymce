import { Objects } from '@ephox/boulder';
import { Id } from '@ephox/katamari';

var attrName = Id.generate('dom-data');
// This module stores information on the DOM node directly. This is so that it is automatically
// garbage collected rather than stored in a separate list that needs to be in sync with the DOM.
// We don't want people to use this very often (it's used for ForeignGui), and we especially don't
// want to try and store more than one thing on the DOM node, so the attribute name is hard-coded.
var getOrCreate = function (element, f) {
  var existing = Objects.readOptFrom(element.dom(), attrName);
  var data = existing.getOrThunk(f);
  element.dom()[attrName] = data;
  return data;
};

export default <any> {
  getOrCreate: getOrCreate
};