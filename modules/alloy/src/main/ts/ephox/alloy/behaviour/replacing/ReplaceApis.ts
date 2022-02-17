import { Arr, Optional } from '@ephox/katamari';
import { Compare, Insert, SugarElement } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloySpec } from '../../api/component/SpecTypes';
import * as Attachment from '../../api/system/Attachment';
import * as Patching from '../../dom/Patching';
import * as InternalAttachment from '../../system/InternalAttachment';
import { Stateless } from '../common/BehaviourState';
import { withoutReuse, withReuse } from './ReplacingAll';
import { ReplacingConfig } from './ReplacingTypes';

const virtualReplace = (component: AlloyComponent, replacee: AlloyComponent, replaceeIndex: number, childSpec: AlloySpec) => {
  InternalAttachment.virtualDetach(replacee);
  const child = Patching.patchSpecChild(component.element, replaceeIndex, childSpec, component.getSystem().buildOrPatch);
  InternalAttachment.virtualAttach(component, child);
  component.syncComponents();
};

const insert = (component: AlloyComponent, insertion: (p: SugarElement<Node>, c: SugarElement<Node>) => void, childSpec: AlloySpec): void => {
  const child = component.getSystem().build(childSpec);
  Attachment.attachWith(component, child, insertion);
};

const replace = (component: AlloyComponent, replacee: AlloyComponent, replaceeIndex: number, childSpec: AlloySpec) => {
  Attachment.detach(replacee);
  insert(component, (p, c) => Insert.appendAt(p, c, replaceeIndex), childSpec);
};

const set = (component: AlloyComponent, replaceConfig: ReplacingConfig, replaceState: Stateless, data: AlloySpec[]): void => {
  const replacer = replaceConfig.reuseDom ? withReuse : withoutReuse;
  return replacer(component, data);
};

const append = (component: AlloyComponent, replaceConfig: ReplacingConfig, replaceState: Stateless, appendee: AlloySpec): void => {
  insert(component, Insert.append, appendee);
};

const prepend = (component: AlloyComponent, replaceConfig: ReplacingConfig, replaceState: Stateless, prependee: AlloySpec): void => {
  insert(component, Insert.prepend, prependee);
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
    replacer.fold(
      () => Attachment.detach(replacee),
      (r) => {
        const replacer = replaceConfig.reuseDom ? virtualReplace : replace;
        replacer(component, replacee, replaceeIndex, r);
      }
    );
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
