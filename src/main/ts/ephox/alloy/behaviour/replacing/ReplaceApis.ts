import { Arr } from '@ephox/katamari';
import { Compare, Insert } from '@ephox/sugar';

import * as AriaFocus from '../../alien/AriaFocus';
import * as Attachment from '../../api/system/Attachment';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { AlloySpec } from 'ephox/alloy/api/component/SpecTypes';
import { ReplacingConfig } from 'ephox/alloy/behaviour/replacing/ReplacingTypes';
import { Stateless } from 'ephox/alloy/behaviour/common/NoState';
import { SugarElement } from 'ephox/alloy/alien/TypeDefinitions';

const set = function (component: AlloyComponent, replaceConfig: ReplacingConfig, replaceState: Stateless, data: AlloySpec[]): void {
  Attachment.detachChildren(component);

  // NOTE: we may want to create a behaviour which allows you to switch
  // between predefined layouts, which would make a noop detection easier.
  // Until then, we'll just use AriaFocus like redesigning does.
  AriaFocus.preserve(() => {
    const children = Arr.map(data, component.getSystem().build);

    Arr.each(children, function (l) {
      Attachment.attach(component, l);
    });
  }, component.element());
};

const insert = function (component: AlloyComponent, replaceConfig: ReplacingConfig, insertion: (p: SugarElement, c: SugarElement) => void, childSpec: AlloySpec): void {
  const child = component.getSystem().build(childSpec);
  Attachment.attachWith(component, child, insertion);
};

const append = function (component: AlloyComponent, replaceConfig: ReplacingConfig, replaceState: Stateless, appendee: AlloySpec): void {
  insert(component, replaceConfig, Insert.append, appendee);
};

const prepend = function (component: AlloyComponent, replaceConfig: ReplacingConfig, replaceState: Stateless, prependee: AlloySpec): void {
  insert(component, replaceConfig, Insert.prepend, prependee);
};

// NOTE: Removee is going to be a component, not a spec.
const remove = function (component: AlloyComponent, replaceConfig: ReplacingConfig, replaceState: Stateless, removee: AlloyComponent): void{
  const children = contents(component, replaceConfig);
  const foundChild = Arr.find(children, function (child) {
    return Compare.eq(removee.element(), child.element());
  });

  foundChild.each(Attachment.detach);
};

// TODO: Rename
const contents = function (component: AlloyComponent, replaceConfig: ReplacingConfig/*, replaceState */): AlloyComponent[] {
  return component.components();
};

export {
  append,
  prepend,
  remove,
  set,
  contents
};