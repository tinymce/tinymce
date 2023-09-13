import { AlloyComponent, Composing, ModalDialog, Reflecting } from '@ephox/alloy';
import { Dialog, DialogManager } from '@ephox/bridge';
import { Cell, Fun, Id, Optional, Optionals } from '@ephox/katamari';

import { UiFactoryBackstage } from '../../backstage/Backstage';
import { dialogChannel } from './DialogChannels';
import { renderModalBody } from './SilverDialogBody';
import * as SilverDialogCommon from './SilverDialogCommon';
import * as SilverDialogEvents from './SilverDialogEvents';
import { renderModalFooter } from './SilverDialogFooter';
import { DialogAccess, getDialogApi } from './SilverDialogInstanceApi';

interface RenderedDialog<T extends Dialog.DialogData> {
  readonly dialog: AlloyComponent;
  readonly instanceApi: Dialog.DialogInstanceApi<T>;
}

const renderDialog = <T extends Dialog.DialogData>(dialogInit: DialogManager.DialogInit<T>, extra: SilverDialogCommon.WindowExtra<T>, backstage: UiFactoryBackstage): RenderedDialog<T> => {
  const dialogId = Id.generate('dialog');
  const internalDialog = dialogInit.internalDialog;
  const header = SilverDialogCommon.getHeader(internalDialog.title, dialogId, backstage);

  const dialogSize = Cell<Dialog.DialogSize>(internalDialog.size);

  const dialogSizeClasses = SilverDialogCommon.getDialogSizeClass(dialogSize.get()).toArray();

  const updateState = (comp: AlloyComponent, incoming: DialogManager.DialogInit<T>) => {
    dialogSize.set(incoming.internalDialog.size);
    SilverDialogCommon.updateDialogSizeClass(incoming.internalDialog.size, comp);
    return Optional.some(incoming);
  };

  const body = renderModalBody({
    body: internalDialog.body,
    initialData: internalDialog.initialData
  }, dialogId, backstage);

  const storedMenuButtons = SilverDialogCommon.mapMenuButtons(internalDialog.buttons);

  const objOfCells = SilverDialogCommon.extractCellsToObject(storedMenuButtons);

  const footer = Optionals.someIf(
    storedMenuButtons.length !== 0,
    renderModalFooter({ buttons: storedMenuButtons }, dialogId, backstage)
  );

  const dialogEvents = SilverDialogEvents.initDialog<T>(
    () => instanceApi,
    SilverDialogCommon.getEventExtras(() => dialog, backstage.shared.providers, extra),
    backstage.shared.getSink
  );

  const spec: SilverDialogCommon.DialogSpec = {
    id: dialogId,
    header,
    body,
    footer,
    extraClasses: dialogSizeClasses,
    extraBehaviours: [
      Reflecting.config({
        channel: `${dialogChannel}-${dialogId}`,
        updateState,
        initialData: dialogInit
      }),
    ],
    extraStyles: {}
  };

  const dialog: AlloyComponent = SilverDialogCommon.renderModalDialog(spec, dialogEvents, backstage);

  const modalAccess = ((): DialogAccess => {
    const getForm = (): AlloyComponent => {
      const outerForm = ModalDialog.getBody(dialog);
      return Composing.getCurrent(outerForm).getOr(outerForm);
    };

    const toggleFullscreen = (): void => {
      SilverDialogCommon.toggleFullscreen(dialog, dialogSize.get());
    };

    return {
      getId: Fun.constant(dialogId),
      getRoot: Fun.constant(dialog),
      getBody: () => ModalDialog.getBody(dialog),
      getFooter: () => ModalDialog.getFooter(dialog),
      getFormWrapper: getForm,
      toggleFullscreen
    };
  })();

  // TODO: Get the validator from the dialog state.
  const instanceApi = getDialogApi<T>(modalAccess, extra.redial, objOfCells);

  return {
    dialog,
    instanceApi
  };
};

export {
  renderDialog
};
