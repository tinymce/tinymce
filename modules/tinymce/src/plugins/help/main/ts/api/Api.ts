import { Dialog } from 'tinymce/core/api/ui/Ui';

import { CustomTabSpecs } from '../Plugin';

export interface Api {
  readonly addTab: (spec: Dialog.TabSpec) => void;
}

const get = (customTabs: CustomTabSpecs): Api => {
  const addTab = (spec: Dialog.TabSpec): void => {
    const currentCustomTabs = customTabs.get();
    currentCustomTabs[spec.name] = spec;
    customTabs.set(currentCustomTabs);
  };

  return {
    addTab
  };
};

export { get };
