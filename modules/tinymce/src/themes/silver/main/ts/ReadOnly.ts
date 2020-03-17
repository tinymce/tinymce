/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, Channels, Disabling, Receiving, Behaviour } from '@ephox/alloy';
import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Selectors } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import * as Settings from './api/Settings';
import { RenderUiComponents } from './Render';

export const ReadOnlyChannel = 'silver.readonly';

export interface ReadOnlyData {
  readonly: boolean;
}

const ReadOnlyDataSchema = ValueSchema.objOf([
  FieldSchema.strictBoolean('readonly')
]);

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

const toggleToReadOnly = (uiComponents: RenderUiComponents, readonly: boolean) => {
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

const setupReadonlyModeSwitch = (editor: Editor, uiComponents: RenderUiComponents) => {
  editor.on('init', () => {
    // Force an update of the ui components disabled states if in readonly mode
    if (editor.mode.isReadOnly()) {
      toggleToReadOnly(uiComponents, true);
    }
  });

  editor.on('SwitchMode', () => toggleToReadOnly(uiComponents, editor.mode.isReadOnly()));

  if (Settings.isReadOnly(editor)) {
    editor.setMode('readonly');
  }
};

const receivingConfig = (): Behaviour.NamedConfiguredBehaviour<any, any> => {
  return Receiving.config({
    channels: {
      [ReadOnlyChannel]: {
        schema: ReadOnlyDataSchema,
        onReceive(comp, data: ReadOnlyData) {
          Disabling.set(comp, data.readonly);
        }
      }
    }
  });
};

export {
  ReadOnlyDataSchema,
  toggleToReadOnly,
  setupReadonlyModeSwitch,
  receivingConfig
};