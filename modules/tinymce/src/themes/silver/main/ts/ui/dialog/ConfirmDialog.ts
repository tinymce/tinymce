import { AlloyEvents, Focusing, GuiFactory, Memento, ModalDialog } from '@ephox/alloy';
import { Optional } from '@ephox/katamari';

import { UiFactoryBackstage } from '../../backstage/Backstage';
import { renderFooterButton } from '../general/Button';
import { formCancelEvent, FormCancelEvent, formSubmitEvent, FormSubmitEvent } from '../general/FormEvents';
import * as Dialogs from './Dialogs';

interface ConfirmDialogApi {
  readonly open: (message: string, callback: (state: boolean) => void) => void;
}

export const setup = (backstage: UiFactoryBackstage): ConfirmDialogApi => {
  const sharedBackstage = backstage.shared;
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
        buttonType: Optional.some('primary'),
        align: 'end',
        enabled: true,
        icon: Optional.none()
      }, 'submit', backstage)
    );

    const footerNo = renderFooterButton({
      name: 'no',
      text: 'No',
      primary: false,
      buttonType: Optional.some('secondary'),
      align: 'end',
      enabled: true,
      icon: Optional.none()
    }, 'cancel', backstage);

    const titleSpec = Dialogs.pUntitled();
    const closeSpec = Dialogs.pClose(() => closeDialog(false), sharedBackstage.providers);

    const confirmDialog = GuiFactory.build(
      Dialogs.renderDialog({
        lazySink: () => sharedBackstage.getSink(),
        header: Dialogs.hiddenHeader(titleSpec, closeSpec),
        body: Dialogs.pBodyMessage(message, sharedBackstage.providers),
        footer: Optional.some(Dialogs.pFooter(Dialogs.pFooterGroup([], [
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
