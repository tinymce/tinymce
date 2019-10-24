/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyEvents, Focusing, GuiFactory, Memento, ModalDialog } from '@ephox/alloy';
import { Option } from '@ephox/katamari';
import { renderFooterButton } from '../general/Button';
import { formCancelEvent, FormCancelEvent } from '../general/FormEvents';
import * as Dialogs from './Dialogs';

export const setup = (extras) => {
  const sharedBackstage = extras.backstage.shared;

  const open = (message: string, callback: () => void) => {

    const closeDialog = () => {
      ModalDialog.hide(alertDialog);
      callback();
    };

    const memFooterClose = Memento.record(
      renderFooterButton({
        name: 'close-alert',
        text: 'OK',
        primary: true,
        align: 'end',
        disabled: false,
        icon: Option.none()
      }, 'cancel', extras.backstage)
    );

    const titleSpec = Dialogs.pUntitled();
    const closeSpec = Dialogs.pClose(closeDialog, sharedBackstage.providers);

    const alertDialog = GuiFactory.build(
      Dialogs.renderDialog({
        lazySink: () => sharedBackstage.getSink(),
        header: Dialogs.hiddenHeader(titleSpec, closeSpec),
        body: Dialogs.pBodyMessage(message, sharedBackstage.providers),
        footer: Option.some(Dialogs.pFooter(Dialogs.pFooterGroup([], [
          memFooterClose.asSpec()
        ]))),
        onEscape: closeDialog,
        extraClasses: [ 'tox-alert-dialog' ],
        extraBehaviours: [ ],
        extraStyles: { },
        dialogEvents: [
          AlloyEvents.run<FormCancelEvent>(formCancelEvent, closeDialog)
        ],
        eventOrder: { }
      })
    );

    ModalDialog.show(alertDialog);
    const footerCloseButton = memFooterClose.get(alertDialog);
    Focusing.focus(footerCloseButton);
  };

  return {
    open
  };
};
