import { AlloyComponent, Behaviour, Channels, Disabling, Receiving } from '@ephox/alloy';
import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Arr } from '@ephox/katamari';
import { SelectorFind } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import * as Options from './api/Options';
import { ReadyUiReferences } from './modes/UiReferences';

export const ReadOnlyChannel = 'silver.readonly';

export interface ReadOnlyData {
  readonly: boolean;
}

const ReadOnlyDataSchema = StructureSchema.objOf([
  FieldSchema.requiredBoolean('readonly')
]);

const broadcastReadonly = (uiRefs: ReadyUiReferences, readonly: boolean): void => {
  const outerContainer = uiRefs.mainUi.outerContainer;
  const target = outerContainer.element;

  const motherships = [ uiRefs.mainUi.mothership, ...uiRefs.uiMotherships ];
  if (readonly) {
    Arr.each(motherships, (m) => {
      m.broadcastOn([ Channels.dismissPopups() ], { target });
    });
  }

  Arr.each(motherships, (m) => {
    m.broadcastOn([ ReadOnlyChannel ], { readonly });
  });
};

const setupReadonlyModeSwitch = (editor: Editor, uiRefs: ReadyUiReferences): void => {
  editor.on('init', () => {
    // Force an update of the ui components disabled states if in readonly mode
    if (editor.mode.isReadOnly()) {
      broadcastReadonly(uiRefs, true);
    }
  });

  editor.on('SwitchMode', () => broadcastReadonly(uiRefs, editor.mode.isReadOnly()));

  if (Options.isReadOnly(editor)) {
    editor.mode.set('readonly');
  }
};

const createReceivingConfig = (onReceive: (comp: AlloyComponent, data: ReadOnlyData) => void): Behaviour.NamedConfiguredBehaviour<any, any> => Receiving.config({
  channels: {
    [ReadOnlyChannel]: {
      schema: ReadOnlyDataSchema,
      onReceive
    }
  }
});

const receivingConfig = (): Behaviour.NamedConfiguredBehaviour<any, any> =>
  createReceivingConfig((comp, data: ReadOnlyData) => Disabling.set(comp, data.readonly));

const receivingEnableParentConfig = (parentSelector: string): Behaviour.NamedConfiguredBehaviour<any, any> =>
  createReceivingConfig((comp, data: ReadOnlyData) => {
    if (data.readonly) {
      SelectorFind.ancestor(comp.element, parentSelector).each((parent) =>
        comp.getSystem().getByDom(parent).each((parentComp) => Disabling.set(parentComp, false)));
    }
  });

export {
  ReadOnlyDataSchema,
  setupReadonlyModeSwitch,
  receivingConfig,
  receivingEnableParentConfig,
  broadcastReadonly
};
