/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Types } from '@ephox/bridge';
import { Option } from '@ephox/katamari';

import { UiFactoryBackstage } from '../../backstage/Backstage';
import { renderIframeBody } from './SilverDialogBody';
import { SilverDialogEvents } from './SilverDialogEvents';
import { renderModalFooter } from './SilverDialogFooter';
import { getUrlDialogApi } from './SilverUrlDialogInstanceApi';
import { getEventExtras, getHeader, renderModalDialog, WindowExtra } from './SilverDialogCommon';

const renderUrlDialog = (internalDialog: Types.UrlDialog.UrlDialog, extra: WindowExtra<any>, backstage: UiFactoryBackstage) => {
  const header = getHeader(internalDialog.title, backstage);
  const body = renderIframeBody(internalDialog);
  const footer = internalDialog.buttons.bind((buttons) => {
    // Don't render a footer if no buttons are specified
    if (buttons.length === 0) {
      return Option.none();
    } else {
      return Option.some(renderModalFooter({ buttons }, backstage.shared.providers));
    }
  });

  const dialogEvents = SilverDialogEvents.initUrlDialog(() => instanceApi, getEventExtras(() => dialog, extra));

  // Add the styles for the modal width/height
  const styles = {
    ...internalDialog.height.fold(() => ({}), (height) => ({ 'height': height + 'px', 'max-height': height + 'px' })),
    ...internalDialog.width.fold(() => ({}), (width) => ({ 'width': width + 'px', 'max-width': width + 'px' })),
  };

  // Default back to using a large sized dialog, if no dimensions are specified
  const classes = internalDialog.width.isNone() && internalDialog.height.isNone() ? [ 'tox-dialog--width-lg' ] : [];

  const dialog = renderModalDialog(internalDialog, dialogEvents, backstage, header, body, footer, classes, styles);

  const instanceApi = getUrlDialogApi(dialog);

  return {
    dialog,
    instanceApi
  };
};

export {
  renderUrlDialog
};