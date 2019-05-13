/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, Channels, Disabling, Receiving } from '@ephox/alloy';
import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Selectors } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import * as Settings from './api/Settings';
import { RenderUiComponents } from './Render';
import { Option } from '@ephox/katamari';

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

  uiComponents.mothership.broadcastOn([ ReadOnlyChannel ], { readonly });
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

export const setupReadonlyModeSwitch = (editor: Editor, uiComponents: RenderUiComponents) => {
  editor.on('init', () => {
    // Force an update of the ui components disabled states if in readonly mode
    if (editor.readonly) {
      toggleToReadOnly(uiComponents, true);
    }
  });

  editor.on('SwitchMode', () => toggleToReadOnly(uiComponents, editor.readonly));

  if (Settings.isReadOnly(editor)) {
    editor.setMode('readonly');
  }
};

export const createReadonlyReceivingForOverflow = (getOverflow: (comp: AlloyComponent) => Option<AlloyComponent>) => {
  return Receiving.config({
    channels: {
      [ReadOnlyChannel]: {
        schema: ReadOnlyDataSchema,
        onReceive: (comp, data: ReadOnlyData) => {
          getOverflow(comp).each((toolbar) => {
            setDisabledAll(toolbar, data.readonly);
          });
        }
      }
    }
  });
};
