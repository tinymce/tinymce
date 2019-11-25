/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloyTriggers, Behaviour, Boxes, Docking, GuiFactory, HotspotAnchorSpec, InlineView, Keying, MakeshiftAnchorSpec, ModalDialog, NodeAnchorSpec, SelectionAnchorSpec, SystemEvents, } from '@ephox/alloy';
import { Processor, ValueSchema } from '@ephox/boulder';
import { DialogManager, Types } from '@ephox/bridge';
import { Option, Singleton } from '@ephox/katamari';
import { Body, Element } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import * as Settings from '../../api/Settings';
import { UiFactoryBackstage } from '../../backstage/Backstage';

import { formCancelEvent } from '../general/FormEvents';
import { renderDialog } from '../window/SilverDialog';
import { renderInlineDialog } from '../window/SilverInlineDialog';
import { renderUrlDialog } from '../window/SilverUrlDialog';
import * as AlertDialog from './AlertDialog';
import * as ConfirmDialog from './ConfirmDialog';

export interface WindowManagerSetup {
  backstage: UiFactoryBackstage;
  editor: Editor;
}

type InlineDialogAnchor = HotspotAnchorSpec | MakeshiftAnchorSpec | NodeAnchorSpec | SelectionAnchorSpec;

const validateData = <T extends Types.Dialog.DialogData>(data: T, validator: Processor) => {
  return ValueSchema.getOrDie(ValueSchema.asRaw('data', validator, data));
};

const inlineAdditionalBehaviours = (editor: Editor, isStickyToolbar: boolean): Behaviour.NamedConfiguredBehaviour<any, any>[] => {
  // When using sticky toolbars it already handles the docking behaviours so applying docking would
  // do nothing except add additional processing when scrolling, so we don't want to include it here
  if (isStickyToolbar) {
    return [ ];
  } else {
    return [
      Docking.config({
        contextual: {
          lazyContext: () => Option.some(Boxes.box(Element.fromDom(editor.getContentAreaContainer()))),
          fadeInClass: 'tox-dialog-dock-fadein',
          fadeOutClass: 'tox-dialog-dock-fadeout',
          transitionClass: 'tox-dialog-dock-transition'
        },
        leftAttr: 'data-dock-left',
        topAttr: 'data-dock-top',
        positionAttr: 'data-dock-pos',
        modes: [ 'top' ]
      })
    ];
  }
};

const setup = (extras: WindowManagerSetup) => {
  const backstage = extras.backstage;
  const editor = extras.editor;
  const isStickyToolbar = Settings.isStickyToolbar(editor);

  const alertDialog = AlertDialog.setup(extras);
  const confirmDialog = ConfirmDialog.setup(extras);

  const open = <T extends Types.Dialog.DialogData>(config: Types.Dialog.DialogApi<T>, params, closeWindow: (dialogApi: Types.Dialog.DialogInstanceApi<T>) => void): Types.Dialog.DialogInstanceApi<T> => {
    if (params !== undefined && params.inline === 'toolbar') {
      return openInlineDialog(config, backstage.shared.anchors.toolbar(), closeWindow, params.ariaAttrs);
    } else if (params !== undefined && params.inline === 'cursor') {
      return openInlineDialog(config, backstage.shared.anchors.cursor(), closeWindow, params.ariaAttrs);
    } else {
      return openModalDialog(config, closeWindow);
    }
  };

  const openUrl = (config: Types.UrlDialog.UrlDialogApi, closeWindow: (dialogApi: Types.UrlDialog.UrlDialogInstanceApi) => void) => {
    return openModalUrlDialog(config, closeWindow);
  };

  const openModalUrlDialog = (config: Types.UrlDialog.UrlDialogApi, closeWindow: (dialogApi: Types.UrlDialog.UrlDialogInstanceApi) => void) => {
    const factory = (contents: Types.UrlDialog.UrlDialog): Types.UrlDialog.UrlDialogInstanceApi => {
      const dialog = renderUrlDialog(
        contents,
        {
          closeWindow: () => {
            ModalDialog.hide(dialog.dialog);
            closeWindow(dialog.instanceApi);
          }
        },
        editor,
        backstage
      );

      ModalDialog.show(dialog.dialog);
      return dialog.instanceApi;
    };

    return DialogManager.DialogManager.openUrl(factory, config);
  };

  const openModalDialog = <T extends Types.Dialog.DialogData>(config: Types.Dialog.DialogApi<T>, closeWindow: (dialogApi: Types.Dialog.DialogInstanceApi<T>) => void): Types.Dialog.DialogInstanceApi<T> => {
    const factory = (contents: Types.Dialog.Dialog<T>, internalInitialData: T, dataValidator: Processor): Types.Dialog.DialogInstanceApi<T> => {
      // We used to validate data here, but it's done by the instanceApi.setData call below.
      const initialData = internalInitialData;

      const dialogInit: DialogManager.DialogInit<T> = {
        dataValidator,
        initialData,
        internalDialog: contents
      };

      const dialog = renderDialog<T>(
        dialogInit,
        {
          redial: DialogManager.DialogManager.redial,
          closeWindow: () => {
            ModalDialog.hide(dialog.dialog);
            closeWindow(dialog.instanceApi);
          }
        },
        backstage
      );

      ModalDialog.show(dialog.dialog);
      dialog.instanceApi.setData(initialData);
      return dialog.instanceApi;
    };

    return DialogManager.DialogManager.open<T>(factory, config);
  };

  const openInlineDialog = <T extends Types.Dialog.DialogData>(config/*: Types.Dialog.DialogApi<T>*/, anchor: InlineDialogAnchor, closeWindow: (dialogApi: Types.Dialog.DialogInstanceApi<T>) => void, ariaAttrs): Types.Dialog.DialogInstanceApi<T> => {
    const factory = (contents: Types.Dialog.Dialog<T>, internalInitialData: T, dataValidator: Processor): Types.Dialog.DialogInstanceApi<T> => {
      const initialData = validateData<T>(internalInitialData, dataValidator);
      const inlineDialog = Singleton.value<AlloyComponent>();

      const dialogInit = {
        dataValidator,
        initialData,
        internalDialog: contents
      };

      const refreshDocking = () => inlineDialog.on((dialog) => {
        Docking.refresh(dialog);
      });

      const dialogUi = renderInlineDialog<T>(
        dialogInit,
        {
          redial: DialogManager.DialogManager.redial,
          closeWindow: () => {
            inlineDialog.on(InlineView.hide);
            editor.off('ResizeEditor', refreshDocking);
            inlineDialog.clear();
            closeWindow(dialogUi.instanceApi);
          }
        },
        backstage, ariaAttrs
      );

      const inlineDialogComp = GuiFactory.build(InlineView.sketch({
        lazySink: backstage.shared.getSink,
        dom: {
          tag: 'div',
          classes: [ ]
        },
        // Fires the default dismiss event.
        fireDismissalEventInstead: { },
        inlineBehaviours: Behaviour.derive([
          AddEventsBehaviour.config('window-manager-inline-events', [
            // Can't just fireDismissalEvent formCloseEvent, because it is on the parent component of the dialog
            AlloyEvents.run(SystemEvents.dismissRequested(), (comp, se) => {
              AlloyTriggers.emit(dialogUi.dialog, formCancelEvent);
            }),
          ]),
          ...inlineAdditionalBehaviours(editor, isStickyToolbar)
        ])
      }));
      inlineDialog.set(inlineDialogComp);

      // Position the inline dialog
      InlineView.showWithin(
        inlineDialogComp,
        anchor,
        GuiFactory.premade(dialogUi.dialog),
        Option.some(Body.body())
      );

      // Refresh the docking position if not using a sticky toolbar
      if (!isStickyToolbar) {
        Docking.refresh(inlineDialogComp);

        // Bind to the editor resize event and update docking as needed. We don't need to worry about
        // 'ResizeWindow` as that's handled by docking already.
        editor.on('ResizeEditor', refreshDocking);
      }

      // Set the initial data in the dialog and focus the first focusable item
      dialogUi.instanceApi.setData(initialData);
      Keying.focusIn(dialogUi.dialog);

      return dialogUi.instanceApi;
    };

    return DialogManager.DialogManager.open<T>(factory, config);
  };

  const confirm = (message: string, callback: (state: boolean) => void) => {
    confirmDialog.open(message, (state) => {
      callback(state);
    });
  };

  const alert = (message: string, callback: () => void) => {
    alertDialog.open(message, () => {
      callback();
    });
  };

  const close = <T extends Types.Dialog.DialogData>(instanceApi: Types.Dialog.DialogInstanceApi<T>) => {
    instanceApi.close();
  };

  return {
    open,
    openUrl,
    alert,
    close,
    confirm
  };
};

export default {
  setup
};
