/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Focusing, GuiFactory, Memento, ModalDialog } from '@ephox/alloy';
import { renderFooterButton } from 'tinymce/themes/silver/ui/general/Button';
import * as Dialogs from './Dialogs';
import { UiFactoryBackstage } from '../../backstage/Backstage';
import { Option } from '@ephox/katamari';

export interface ConfirmDialogSetup {
    backstage: UiFactoryBackstage;
}
export const setup = (extras: ConfirmDialogSetup) => {
  const sharedBackstage = extras.backstage.shared;
  // FIX: Extreme dupe with Alert dialog
  const open = (message: string, callback: (state: boolean) => void) => {

    const closeDialog = (state: boolean) => {
      ModalDialog.hide(confirmDialog);
      callback(state);
    };

    const memFooterYes = Memento.record(
      renderFooterButton({
        name: 'yes',
        text: 'Yes',
        primary: true,
        align: 'end',
        disabled: false,
        icon: Option.none()
      }, 'submit', sharedBackstage.providers)
    );

    const footerNo = renderFooterButton({
      name: 'no',
      text: 'No',
      primary: true,
      align: 'end',
      disabled: false,
      icon: Option.none()
    }, 'cancel', sharedBackstage.providers);

    const confirmDialog = GuiFactory.build(
      Dialogs.renderDialog({
        lazySink: () => sharedBackstage.getSink(),
        headerOverride: Option.some(Dialogs.hiddenHeader),
        partSpecs: {
          title: Dialogs.pUntitled(),
          close: Dialogs.pClose(() => {
            closeDialog(false);
          }, sharedBackstage.providers),
          body: Dialogs.pBodyMessage(message, sharedBackstage.providers),
          footer: Dialogs.pFooter(Dialogs.pFooterGroup([], [
            footerNo,
            memFooterYes.asSpec()
          ]))
        },
        onCancel: () => closeDialog(false),
        onSubmit: () => closeDialog(true),
        extraClasses: [ 'tox-confirm-dialog' ]
      })
    );

    ModalDialog.show(confirmDialog);
    const footerYesButton = memFooterYes.get(confirmDialog);
    Focusing.focus(footerYesButton);
  };

  return {
    open
  };
};
