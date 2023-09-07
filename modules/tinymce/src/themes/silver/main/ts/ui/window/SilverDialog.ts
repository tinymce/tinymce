import { AlloyComponent, Composing, ModalDialog, Reflecting } from '@ephox/alloy';
import { Dialog, DialogManager } from '@ephox/bridge';
import { Arr, Fun, Id, Optional, Optionals } from '@ephox/katamari';
import { Class, Classes, SugarElement } from '@ephox/sugar';

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

  const largeDialogClass = 'tox-dialog--width-lg';
  const mediumDialogClass = 'tox-dialog--width-md';

  const getDialogSizeClasses = (size: Dialog.DialogSize): Optional<string> => {
    switch (size) {
      case 'large':
        return Optional.some(largeDialogClass);
      case 'medium':
        return Optional.some(mediumDialogClass);
      default:
        return Optional.none();
    }
  };

  const dialogSize = getDialogSizeClasses(internalDialog.size);

  const updateState = (comp: AlloyComponent, incoming: DialogManager.DialogInit<T>) => {
    getDialogSizeClasses(incoming.internalDialog.size).map((dialogSizeClass) => {
      const sugarBody = SugarElement.fromDom(comp.element.dom);
      if (!Classes.hasAny(sugarBody, [ dialogSizeClass ])) {
        const classes = Classes.get(sugarBody);
        const currentSizeClass = Arr.find(classes, (c) => c === largeDialogClass || c === mediumDialogClass);
        currentSizeClass.map((c) => Classes.remove(sugarBody, [ c ]));
        Classes.add(sugarBody, [ dialogSizeClass ]);
      }
    });
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
    extraClasses: dialogSize.toArray(),
    extraBehaviours: [
      // Because this doesn't define `renderComponents`, all this does is update the state.
      // We use the state for the initialData. The other parts (body etc.) render the
      // components based on what reflecting receives.
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
      const fullscreenClass = 'tox-dialog--fullscreen';
      const sugarBody = SugarElement.fromDom(dialog.element.dom);

      if (!Class.has(sugarBody, fullscreenClass)) {
        dialogSize.map((sizeClass) => Classes.remove(sugarBody, [ sizeClass ]));
        Class.add(sugarBody, fullscreenClass);
      } else {
        Class.remove(sugarBody, fullscreenClass);
        dialogSize.map((sizeClass) => Classes.add(sugarBody, [ sizeClass ]));
      }
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
