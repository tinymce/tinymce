import { Arr, Optional } from '@ephox/katamari';
import { Compare, Insert, SugarElement } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloySpec } from '../../api/component/SpecTypes';
import * as Attachment from '../../api/system/Attachment';
import * as AriaFocus from '../../aria/AriaFocus';
import * as InternalAttachment from '../../system/InternalAttachment';
import { Stateless } from '../common/BehaviourState';
import { ReplacingConfig } from './ReplacingTypes';

const set = (component: AlloyComponent, replaceConfig: ReplacingConfig, replaceState: Stateless, data: AlloySpec[]): void => {
  // NOTE: we may want to create a behaviour which allows you to switch
  // between predefined layouts, which would make a noop detection easier.
  // Until then, we'll just use AriaFocus like redesigning does.
  AriaFocus.preserve(() => {
    const newChildren = Arr.map(data, component.getSystem().build);
    InternalAttachment.replaceChildren(component, newChildren);
  }, component.element);
};

const insert = (component: AlloyComponent, replaceConfig: ReplacingConfig, insertion: (p: SugarElement, c: SugarElement) => void, childSpec: AlloySpec): void => {
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
  const foundChild = Arr.find(children, (child) => Compare.eq(removee.element, child.element));

  foundChild.each(Attachment.detach);
};

// TODO: Rename
const contents = (component: AlloyComponent, _replaceConfig: ReplacingConfig): AlloyComponent[] => component.components();

const replaceAt = (component: AlloyComponent, replaceConfig: ReplacingConfig, replaceState: Stateless, replaceeIndex: number, replacer: Optional<AlloySpec>): Optional<AlloyComponent> => {
  const children = contents(component, replaceConfig);
  return Optional.from(children[replaceeIndex]).map((replacee) => {
    // remove it.
    remove(component, replaceConfig, replaceState, replacee);

    replacer.each((r) => {
      insert(component, replaceConfig, (p: SugarElement, c: SugarElement) => {
        Insert.appendAt(p, c, replaceeIndex);
      }, r);
    });
    return replacee;
  });
};

const replaceBy = (component: AlloyComponent, replaceConfig: ReplacingConfig, replaceState: Stateless, replaceePred: (comp: AlloyComponent) => boolean, replacer: Optional<AlloySpec>): Optional<AlloyComponent> => {
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
