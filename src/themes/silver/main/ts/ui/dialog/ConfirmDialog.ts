import { Focusing, GuiFactory, Memento, ModalDialog } from '@ephox/alloy';
import { renderFooterButton } from 'tinymce/themes/silver/ui/general/Button';
import * as Dialogs from './Dialogs';

export const setup = (extras) => {
  const sharedBackstage = {
    getSink: extras.backstage.shared.getSink,
    translate: extras.backstage.shared.translate
  };
  // FIX: Extreme dupe with Alert dialog
  const open = (message: string, callback: (state: boolean) => void) => {

    const closeDialog = (dialog, state) => {
      ModalDialog.hide(dialog);
      callback(state);
    };

    const memFooterYes = Memento.record(
      renderFooterButton({
        name: 'yes',
        text: 'Yes',
        primary: true
      }, 'submit', sharedBackstage)
    );

    const footerNo = renderFooterButton({
      name: 'no',
      text: 'No',
      primary: true
    }, 'cancel', sharedBackstage);

    const confirmDialog = GuiFactory.build(
      Dialogs.renderDialog({
        lazySink: () => sharedBackstage.getSink(),
        partSpecs: {
          title: Dialogs.pUntitled(),
          close: Dialogs.pClose(() => {
            closeDialog(confirmDialog, false);
          }),
          body: Dialogs.pBodyMessage(message),
          footer: Dialogs.pFooter([
            memFooterYes.asSpec(),
            footerNo
          ])
        },
        onCancel: () => closeDialog(confirmDialog, false),
        onSubmit: () => closeDialog(confirmDialog, true),
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