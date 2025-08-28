import { Id } from '@ephox/katamari';

import { Dialog } from 'tinymce/core/api/ui/Ui';

import { CustomTabSpecs } from '../Plugin';

export interface Api {
  readonly addTab: (spec: Dialog.TabSpec) => void;
}

const get = (customTabs: CustomTabSpecs): Api => {
  const addTab = (spec: Dialog.TabSpec): void => {
    const name = spec.name ?? Id.generate('tab-name');
    const currentCustomTabs = customTabs.get();
    currentCustomTabs[name] = spec;
    customTabs.set(currentCustomTabs);
  };

  return {
    addTab
  };
};

export { get };
