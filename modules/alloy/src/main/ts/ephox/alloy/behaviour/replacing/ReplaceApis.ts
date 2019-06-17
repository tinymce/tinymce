import { Arr, Option } from '@ephox/katamari';
import { Compare, Insert, Element } from '@ephox/sugar';

import * as AriaFocus from '../../alien/AriaFocus';
import * as Attachment from '../../api/system/Attachment';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloySpec } from '../../api/component/SpecTypes';
import { ReplacingConfig } from '../../behaviour/replacing/ReplacingTypes';
import { Stateless } from '../../behaviour/common/BehaviourState';

const set = (component: AlloyComponent, replaceConfig: ReplacingConfig, replaceState: Stateless, data: AlloySpec[]): void => {
  Attachment.detachChildren(component);

  // NOTE: we may want to create a behaviour which allows you to switch
  // between predefined layouts, which would make a noop detection easier.
  // Until then, we'll just use AriaFocus like redesigning does.
  AriaFocus.preserve(() => {
    const children = Arr.map(data, component.getSystem().build);

    Arr.each(children, (l) => {
      Attachment.attach(component, l);
    });
  }, component.element());
};

const insert = (component: AlloyComponent, replaceConfig: ReplacingConfig, insertion: (p: Element, c: Element) => void, childSpec: AlloySpec): void => {
  const child = component.getSystem().build(childSpec);
  Attachment.attachWith(component, child, insertion);
};

const append = (component: AlloyComponent, replaceConfig: ReplacingConfig, replaceState: Stateless, appendee: AlloySpec): void => {
  insert(component, replaceConfig, Insert.append, appendee);
};

const prepend = (component: AlloyComponent, replaceConfig: ReplacingConfig, replaceState: Stateless, prependee: AlloySpec): void => {
  insert(component, replaceConfig, Insert.prepend, prependee);
};

// NOTE: Removee is going to be a component, not a spec.
const remove = (component: AlloyComponent, replaceConfig: ReplacingConfig, replaceState: Stateless, removee: AlloyComponent): void => {
  const children = contents(component, replaceConfig);
  const foundChild = Arr.find(children, (child) => {
    return Compare.eq(removee.element(), child.element());
  });

  foundChild.each(Attachment.detach);
};

// TODO: Rename
const contents = (component: AlloyComponent, replaceConfig: ReplacingConfig/*, replaceState */): AlloyComponent[] => {
  return component.components();
};

const replaceAt = (component: AlloyComponent, replaceConfig: ReplacingConfig, replaceState: Stateless, replaceeIndex: number, replacer: Option<AlloySpec>): Option<AlloyComponent> => {
  const children = contents(component, replaceConfig);
  return Option.from(children[replaceeIndex]).map((replacee) => {
    // remove it.
    remove(component, replaceConfig, replaceState, replacee);

    replacer.each((r) => {
      insert(component, replaceConfig, (p: Element, c: Element) => {
        Insert.appendAt(p, c, replaceeIndex);
      }, r);
    });
    return replacee;
  });
};

const replaceBy = (component: AlloyComponent, replaceConfig: ReplacingConfig, replaceState: Stateless, replaceePred: (comp: AlloyComponent) => boolean, replacer: Option<AlloySpec>): Option<AlloyComponent> => {
  const children = contents(component, replaceConfig);
  return Arr.findIndex(children, replaceePred).bind((replaceeIndex) => replaceAt(component, replaceConfig, replaceState, replaceeIndex, replacer));
};

export {
  append,
  prepend,
  remove,
  replaceAt,
  replaceBy,
  set,
  contents
};