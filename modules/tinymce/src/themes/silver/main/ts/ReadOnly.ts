import { Behaviour, Channels, Disabling, Receiving } from '@ephox/alloy';
import { FieldSchema, StructureSchema } from '@ephox/boulder';

import Editor from 'tinymce/core/api/Editor';

import * as Options from './api/Options';
import { RenderUiComponents } from './Render';

export const ReadOnlyChannel = 'silver.readonly';

export interface ReadOnlyData {
  readonly: boolean;
}

const ReadOnlyDataSchema = StructureSchema.objOf([
  FieldSchema.requiredBoolean('readonly')
]);

const broadcastReadonly = (uiComponents: RenderUiComponents, readonly: boolean): void => {
  const outerContainer = uiComponents.outerContainer;
  const target = outerContainer.element;

  if (readonly) {
    uiComponents.mothership.broadcastOn([ Channels.dismissPopups() ], { target });
    uiComponents.uiMothership.broadcastOn([ Channels.dismissPopups() ], { target });
  }

  uiComponents.mothership.broadcastOn([ ReadOnlyChannel ], { readonly });
  uiComponents.uiMothership.broadcastOn([ ReadOnlyChannel ], { readonly });
};

const setupReadonlyModeSwitch = (editor: Editor, uiComponents: RenderUiComponents): void => {
  editor.on('init', () => {
    // Force an update of the ui components disabled states if in readonly mode
    if (editor.mode.isReadOnly()) {
      broadcastReadonly(uiComponents, true);
    }
  });

  editor.on('SwitchMode', () => broadcastReadonly(uiComponents, editor.mode.isReadOnly()));

  if (Options.isReadOnly(editor)) {
    editor.mode.set('readonly');
  }
};

const receivingConfig = (): Behaviour.NamedConfiguredBehaviour<any, any> => Receiving.config({
  channels: {
    [ReadOnlyChannel]: {
      schema: ReadOnlyDataSchema,
      onReceive: (comp, data: ReadOnlyData) => {
        Disabling.set(comp, data.readonly);
      }
    }
  }
});

export {
  ReadOnlyDataSchema,
  setupReadonlyModeSwitch,
  receivingConfig,
  broadcastReadonly
};
