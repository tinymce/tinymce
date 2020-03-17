import { Arr, Obj, Option } from '@ephox/katamari';
import { Attr, Node } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { AriaTogglingConfig } from './TogglingTypes';

const updatePressed = (component: AlloyComponent, ariaInfo: AriaTogglingConfig, status: boolean): void => {
  Attr.set(component.element(), 'aria-pressed', status);
  if (ariaInfo.syncWithExpanded) {
    updateExpanded(component, ariaInfo, status);
  }
};

const updateSelected = (component: AlloyComponent, ariaInfo: AriaTogglingConfig, status: boolean): void => {
  Attr.set(component.element(), 'aria-selected', status);
};

const updateChecked = (component: AlloyComponent, ariaInfo: AriaTogglingConfig, status: boolean): void => {
  Attr.set(component.element(), 'aria-checked', status);
};

const updateExpanded = (component: AlloyComponent, ariaInfo: AriaTogglingConfig, status: boolean): void => {
  Attr.set(component.element(), 'aria-expanded', status);
};

// INVESTIGATE: What other things can we derive?
const tagAttributes: Record<string, string[]> = {
  'button': [ 'aria-pressed' ],
  'input:checkbox': [ 'aria-checked' ]
};

const roleAttributes: Record<string, string[]> = {
  button: [ 'aria-pressed' ],
  listbox: [ 'aria-pressed', 'aria-expanded' ],
  menuitemcheckbox: [ 'aria-checked' ]
};

const detectFromTag = (component: AlloyComponent): Option<string[]> => {
  const elem = component.element();
  const rawTag = Node.name(elem);
  const suffix = rawTag === 'input' && Attr.has(elem, 'type') ? ':' + Attr.get(elem, 'type') : '';
  return Obj.get(tagAttributes, rawTag + suffix);
};

const detectFromRole = (component: AlloyComponent): Option<string[]> => {
  const elem = component.element();
  if (!Attr.has(elem, 'role')) {
    return Option.none();
  } else {
    const role = Attr.get(elem, 'role');
    return Obj.get(roleAttributes, role);
  }
};

const updateAuto = (component: AlloyComponent, _ariaInfo: void, status: boolean): void => {
  // Role has priority
  const attributes = detectFromRole(component).orThunk(() => detectFromTag(component)).getOr([ ]);
  Arr.each(attributes, (attr) => {
    Attr.set(component.element(), attr, status);
  });
};

export {
  updatePressed,
  updateSelected,
  updateChecked,
  updateExpanded,
  updateAuto
};
