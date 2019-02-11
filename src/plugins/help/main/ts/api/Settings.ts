/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Types } from '@ephox/bridge';
import { Editor } from 'tinymce/core/api/Editor';
import VersionTab from '../ui/VersionTab';

const getVersionPanel = function (editor: Editor): Types.Dialog.BodyComponentApi {
  return editor.getParam('help_version', VersionTab.defaultPanel, 'function')();
};

export default {
  getVersionPanel,
};