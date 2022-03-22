import { AlloyEvents, Focusing, GuiFactory, Memento, ModalDialog } from '@ephox/alloy';
import { Optional } from '@ephox/katamari';

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
        buttonType: Optional.some('primary'),
        align: 'end',
        enabled: true,
        icon: Optional.none()
      }, 'cancel', extras.backstage)
    );

    const titleSpec = Dialogs.pUntitled();
    const closeSpec = Dialogs.pClose(closeDialog, sharedBackstage.providers);

    const alertDialog = GuiFactory.build(
      Dialogs.renderDialog({
        lazySink: () => sharedBackstage.getSink(),
        header: Dialogs.hiddenHeader(titleSpec, closeSpec),
        body: Dialogs.pBodyMessage(message, sharedBackstage.providers),
        footer: Optional.some(Dialogs.pFooter(Dialogs.pFooterGroup([], [
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
