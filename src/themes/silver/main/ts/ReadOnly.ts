/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, Disabling, Channels } from '@ephox/alloy';
import { Selectors } from '@ephox/sugar';
import { RenderUiComponents } from './Render';
import { ValueSchema, FieldSchema } from '@ephox/boulder';

export const ReadOnlyChannel = 'silver.readonly';

export interface ReadOnlyData {
  readonly: boolean;
}

export const ReadOnlyDataSchema = ValueSchema.objOf([
  FieldSchema.strictBoolean('readonly')
]);

export const setDisabledAll = (element: AlloyComponent, state: boolean) => {
  Selectors.all('*', element.element()).forEach((elm) => {
    element.getSystem().getByDom(elm).each((comp: AlloyComponent) => {
      if (comp.hasConfigured(Disabling)) {
        Disabling.set(comp, state);
      }
    });
  });
};

const broadcastReadonly = (uiComponents: RenderUiComponents, readonly: boolean) => {
  const outerContainer = uiComponents.outerContainer;
  const target = outerContainer.element();

  if (readonly) {
    uiComponents.mothership.broadcastOn([ Channels.dismissPopups() ], { target });
    uiComponents.uiMothership.broadcastOn([ Channels.dismissPopups() ], { target });
  }

  uiComponents.uiMothership.broadcastOn([ ReadOnlyChannel ], { readonly });
};

export const toggleToReadOnly = (uiComponents: RenderUiComponents, readonly: boolean) => {
  const outerContainer = uiComponents.outerContainer;

  broadcastReadonly(uiComponents, readonly);

  Selectors.all('*', outerContainer.element()).forEach((elm) => {
    outerContainer.getSystem().getByDom(elm).each((comp: AlloyComponent) => {
      if (comp.hasConfigured(Disabling)) {
        Disabling.set(comp, readonly);
      }
    });
  });
};
