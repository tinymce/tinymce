/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Focusing, GuiFactory, Memento, ModalDialog } from '@ephox/alloy';
import { renderFooterButton } from 'tinymce/themes/silver/ui/general/Button';
import * as Dialogs from './Dialogs';
import { Fun, Option } from '@ephox/katamari';

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

    const alertDialog = GuiFactory.build(
      Dialogs.renderDialog({
        lazySink: () => sharedBackstage.getSink(),
        headerOverride: Option.some(Dialogs.hiddenHeader),
        partSpecs: {
          title: Dialogs.pUntitled(),
          close: Dialogs.pClose(() => {
            closeDialog();
          }, sharedBackstage.providers),
          body: Dialogs.pBodyMessage(message, sharedBackstage.providers),
          footer: Dialogs.pFooter(Dialogs.pFooterGroup([], [
            memFooterClose.asSpec()
          ]))
        },
        onCancel: () => closeDialog(),
        onSubmit: Fun.noop,
        extraClasses: [ 'tox-alert-dialog' ]
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
