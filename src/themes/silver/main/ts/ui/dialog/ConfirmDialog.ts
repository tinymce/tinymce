import { Focusing, GuiFactory, Memento, ModalDialog } from '@ephox/alloy';
import { renderFooterButton } from 'tinymce/themes/silver/ui/general/Button';
import * as Dialogs from './Dialogs';

export const setup = (extras) => {
  const getSink = extras.backstage.shared.getSink;

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
      }, 'submit')
    );

    const footerNo = renderFooterButton({
      name: 'no',
      text: 'No',
      primary: true
    }, 'cancel');

    const confirmDialog = GuiFactory.build(
      Dialogs.renderDialog({
        lazySink: () => getSink(),
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