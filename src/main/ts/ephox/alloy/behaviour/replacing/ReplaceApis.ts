import AriaFocus from '../../alien/AriaFocus';
import Attachment from '../../api/system/Attachment';
import { Arr } from '@ephox/katamari';
import { Compare } from '@ephox/sugar';
import { Insert } from '@ephox/sugar';

var set = function (component, replaceConfig, replaceState, data) {
  Attachment.detachChildren(component);

  // NOTE: we may want to create a behaviour which allows you to switch
  // between predefined layouts, which would make a noop detection easier.
  // Until then, we'll just use AriaFocus like redesigning does.
  AriaFocus.preserve(function () {
    var children = Arr.map(data, component.getSystem().build);

    Arr.each(children, function (l) {
      Attachment.attach(component, l);
    });
  }, component.element());
};

var insert = function (component, replaceConfig, insertion, childSpec) {
  var child = component.getSystem().build(childSpec);
  Attachment.attachWith(component, child, insertion);
};

var append = function (component, replaceConfig, replaceState, appendee) {
  insert(component, replaceConfig, Insert.append, appendee);
};

var prepend = function (component, replaceConfig, replaceState, prependee) {
  insert(component, replaceConfig, Insert.prepend, prependee);
};

// NOTE: Removee is going to be a component, not a spec.
var remove = function (component, replaceConfig, replaceState, removee) {
  var children = contents(component, replaceConfig);
  var foundChild = Arr.find(children, function (child) {
    return Compare.eq(removee.element(), child.element());
  });

  foundChild.each(Attachment.detach);
};

// TODO: Rename
var contents = function (component, replaceConfig/*, replaceState */) {
  return component.components();
};

export default <any> {
  append: append,
  prepend: prepend,
  remove: remove,
  set: set,
  contents: contents
};