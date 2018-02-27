import { Arr } from '@ephox/katamari';
import { Compare, Insert } from '@ephox/sugar';

import * as AriaFocus from '../../alien/AriaFocus';
import * as Attachment from '../../api/system/Attachment';

const set = function (component, replaceConfig, replaceState, data) {
  Attachment.detachChildren(component);

  // NOTE: we may want to create a behaviour which allows you to switch
  // between predefined layouts, which would make a noop detection easier.
  // Until then, we'll just use AriaFocus like redesigning does.
  AriaFocus.preserve(function () {
    const children = Arr.map(data, component.getSystem().build);

    Arr.each(children, function (l) {
      Attachment.attach(component, l);
    });
  }, component.element());
};

const insert = function (component, replaceConfig, insertion, childSpec) {
  const child = component.getSystem().build(childSpec);
  Attachment.attachWith(component, child, insertion);
};

const append = function (component, replaceConfig, replaceState, appendee) {
  insert(component, replaceConfig, Insert.append, appendee);
};

const prepend = function (component, replaceConfig, replaceState, prependee) {
  insert(component, replaceConfig, Insert.prepend, prependee);
};

// NOTE: Removee is going to be a component, not a spec.
const remove = function (component, replaceConfig, replaceState, removee) {
  const children = contents(component, replaceConfig);
  const foundChild = Arr.find(children, function (child) {
    return Compare.eq(removee.element(), child.element());
  });

  foundChild.each(Attachment.detach);
};

// TODO: Rename
const contents = function (component, replaceConfig/*, replaceState */) {
  return component.components();
};

export {
  append,
  prepend,
  remove,
  set,
  contents
};