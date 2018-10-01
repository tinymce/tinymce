import { Focusing, GuiFactory, Memento, ModalDialog } from '@ephox/alloy';
import { renderFooterButton } from 'tinymce/themes/silver/ui/general/Button';
import * as Dialogs from './Dialogs';
import { Fun } from '@ephox/katamari';

export const setup = (extras) => {
  const getSink = extras.backstage.shared.getSink;

  const open = (message: string, callback: () => void) => {

    const closeDialog = (dialog) => {
      ModalDialog.hide(dialog);
      callback();
    };

    const memFooterClose = Memento.record(
      renderFooterButton({
        name: 'close-alert',
        text: 'Ok',
        primary: true
      }, 'cancel')
    );

    const alertDialog = GuiFactory.build(
      Dialogs.renderDialog({
        lazySink: () => getSink(),
        partSpecs: {
          title: Dialogs.pUntitled(),
          close: Dialogs.pClose(() => {
            closeDialog(alertDialog);
          }),
          body: Dialogs.pBodyMessage(message),
          footer: Dialogs.pFooter([
            memFooterClose.asSpec()
          ])
        },
        onCancel: () => closeDialog(alertDialog),
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