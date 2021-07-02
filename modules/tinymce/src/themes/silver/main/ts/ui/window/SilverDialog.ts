/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, Composing, ModalDialog } from '@ephox/alloy';
import { Dialog, DialogManager } from '@ephox/bridge';
import { Fun, Optional } from '@ephox/katamari';

import { UiFactoryBackstage } from '../../backstage/Backstage';
import { renderModalBody } from './SilverDialogBody';
import * as SilverDialogCommon from './SilverDialogCommon';
import { SilverDialogEvents } from './SilverDialogEvents';
import { renderModalFooter } from './SilverDialogFooter';
import { getDialogApi } from './SilverDialogInstanceApi';

const getDialogSizeClasses = (size: Dialog.DialogSize): string[] => {
  switch (size) {
    case 'large':
      return [ 'tox-dialog--width-lg' ];
    case 'medium':
      return [ 'tox-dialog--width-md' ];
    default:
      return [];
  }
};

const renderDialog = <T>(dialogInit: DialogManager.DialogInit<T>, extra: SilverDialogCommon.WindowExtra, backstage: UiFactoryBackstage) => {
  const header = SilverDialogCommon.getHeader(dialogInit.internalDialog.title, backstage);

  const body = renderModalBody({
    body: dialogInit.internalDialog.body
  }, backstage);

  const storagedMenuButtons = SilverDialogCommon.mapMenuButtons(dialogInit.internalDialog.buttons);

  const objOfCells = SilverDialogCommon.extractCellsToObject(storagedMenuButtons);

  const footer = renderModalFooter({
    buttons: storagedMenuButtons
  }, backstage);

  const dialogEvents = SilverDialogEvents.initDialog(
    () => instanceApi,
    SilverDialogCommon.getEventExtras(() => dialog, backstage.shared.providers, extra),
    backstage.shared.getSink
  );

  const dialogSize = getDialogSizeClasses(dialogInit.internalDialog.size);

  const spec = {
    header,
    body,
    footer: Optional.some(footer),
    extraClasses: dialogSize,
    extraBehaviours: [],
    extraStyles: {}
  };

  const dialog = SilverDialogCommon.renderModalDialog(spec, dialogInit, dialogEvents, backstage);

  const modalAccess = (() => {
    const getForm = (): AlloyComponent => {
      const outerForm = ModalDialog.getBody(dialog);
      return Composing.getCurrent(outerForm).getOr(outerForm);
    };

    return {
      getRoot: Fun.constant(dialog),
      getBody: () => ModalDialog.getBody(dialog),
      getFooter: () => ModalDialog.getFooter(dialog),
      getFormWrapper: getForm
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
