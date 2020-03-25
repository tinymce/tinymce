/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyEvents, Focusing, GuiFactory, Memento, ModalDialog } from '@ephox/alloy';
import { Option } from '@ephox/katamari';
import { UiFactoryBackstage } from '../../backstage/Backstage';
import { renderFooterButton } from '../general/Button';
import { formCancelEvent, FormCancelEvent, formSubmitEvent, FormSubmitEvent } from '../general/FormEvents';
import * as Dialogs from './Dialogs';

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
      }, 'submit', extras.backstage)
    );

    const footerNo = renderFooterButton({
      name: 'no',
      text: 'No',
      primary: false,
      align: 'end',
      disabled: false,
      icon: Option.none()
    }, 'cancel', extras.backstage);

    const titleSpec = Dialogs.pUntitled();
    const closeSpec = Dialogs.pClose(() => closeDialog(false), sharedBackstage.providers);

    const confirmDialog = GuiFactory.build(
      Dialogs.renderDialog({
        lazySink: () => sharedBackstage.getSink(),
        header: Dialogs.hiddenHeader(titleSpec, closeSpec),
        body: Dialogs.pBodyMessage(message, sharedBackstage.providers),
        footer: Option.some(Dialogs.pFooter(Dialogs.pFooterGroup([], [
          footerNo,
          memFooterYes.asSpec()
        ]))),
        onEscape: () => closeDialog(false),
        extraClasses: [ 'tox-confirm-dialog' ],
        extraBehaviours: [ ],
        extraStyles: { },
        dialogEvents: [
          AlloyEvents.run<FormCancelEvent>(formCancelEvent, () => closeDialog(false)),
          AlloyEvents.run<FormSubmitEvent>(formSubmitEvent, () => closeDialog(true))
        ],
        eventOrder: { }
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
