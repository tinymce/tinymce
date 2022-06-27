import { Arr, Obj, Optional } from '@ephox/katamari';
import { Attribute, SugarNode } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { AriaTogglingConfig } from './TogglingTypes';

const updatePressed = (component: AlloyComponent, ariaInfo: AriaTogglingConfig, status: boolean): void => {
  Attribute.set(component.element, 'aria-pressed', status);
  if (ariaInfo.syncWithExpanded) {
    updateExpanded(component, ariaInfo, status);
  }
};

const updateSelected = (component: AlloyComponent, ariaInfo: AriaTogglingConfig, status: boolean): void => {
  Attribute.set(component.element, 'aria-selected', status);
};

const updateChecked = (component: AlloyComponent, ariaInfo: AriaTogglingConfig, status: boolean): void => {
  Attribute.set(component.element, 'aria-checked', status);
};

const updateExpanded = (component: AlloyComponent, ariaInfo: AriaTogglingConfig, status: boolean): void => {
  Attribute.set(component.element, 'aria-expanded', status);
};

// INVESTIGATE: What other things can we derive?
const tagAttributes: Record<string, string[]> = {
  'button': [ 'aria-pressed' ],
  'input:checkbox': [ 'aria-checked' ]
};

const roleAttributes: Record<string, string[]> = {
  button: [ 'aria-pressed' ],
  listbox: [ 'aria-pressed', 'aria-expanded' ],
  menuitemcheckbox: [ 'aria-checked' ],
  menuitemradio: [ 'aria-checked' ]
};

const detectFromTag = (component: AlloyComponent): Optional<string[]> => {
  const elem = component.element;
  const rawTag = SugarNode.name(elem);
  const suffix = rawTag === 'input' && Attribute.has(elem, 'type') ? ':' + Attribute.get(elem, 'type') : '';
  return Obj.get(tagAttributes, rawTag + suffix);
};

const detectFromRole = (component: AlloyComponent): Optional<string[]> => {
  const elem = component.element;
  return Attribute.getOpt(elem, 'role').bind((role) => Obj.get(roleAttributes, role));
};

const updateAuto = (component: AlloyComponent, _ariaInfo: void, status: boolean): void => {
  // Role has priority
  const attributes = detectFromRole(component).orThunk(() => detectFromTag(component)).getOr([ ]);
  Arr.each(attributes, (attr) => {
    Attribute.set(component.element, attr, status);
  });
};

export {
  updatePressed,
  updateSelected,
  updateChecked,
  updateExpanded,
  updateAuto
};
