/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, Composing, ModalDialog } from '@ephox/alloy';
import { DialogManager } from '@ephox/bridge';
import { Option } from '@ephox/katamari';

import { UiFactoryBackstage } from '../../backstage/Backstage';
import { renderModalBody } from './SilverDialogBody';
import { SilverDialogEvents } from './SilverDialogEvents';
import { renderModalFooter } from './SilverDialogFooter';
import { getDialogApi } from './SilverDialogInstanceApi';
import { getEventExtras, getHeader, renderModalDialog, WindowExtra } from './SilverDialogCommon';

const renderDialog = <T>(dialogInit: DialogManager.DialogInit<T>, extra: WindowExtra<T>, backstage: UiFactoryBackstage) => {
  const header = getHeader(dialogInit.internalDialog.title, backstage);

  const body = renderModalBody({
    body: dialogInit.internalDialog.body
  }, backstage);

  const footer = renderModalFooter({
    buttons: dialogInit.internalDialog.buttons
  }, backstage.shared.providers);

  const dialogEvents = SilverDialogEvents.initDialog(() => instanceApi, getEventExtras(() => dialog, extra));

  const dialogSize = dialogInit.internalDialog.size !== 'normal'
    ? dialogInit.internalDialog.size === 'large'
      ? [ 'tox-dialog--width-lg' ]
      : [ 'tox-dialog--width-md' ]
    : [];

  const spec = {
    header,
    body,
    footer: Option.some(footer),
    extraClasses: dialogSize,
    extraBehaviours: [],
    extraStyles: {}
  };

  const dialog = renderModalDialog(spec, dialogInit, dialogEvents, backstage);

  const modalAccess = (() => {
    const getForm = (): AlloyComponent => {
      const outerForm = ModalDialog.getBody(dialog);
      return Composing.getCurrent(outerForm).getOr(outerForm);
    };

    return {
      getRoot: () => dialog,
      getBody: () => ModalDialog.getBody(dialog),
      getFooter: () => ModalDialog.getFooter(dialog),
      getFormWrapper: getForm
    };
  })();

  // TODO: Get the validator from the dialog state.
  const instanceApi = getDialogApi<T>(modalAccess, extra.redial);

  return {
    dialog,
    instanceApi
  };
};

export {
  renderDialog
};
