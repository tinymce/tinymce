/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

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
