/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Types } from '@ephox/bridge';
import Editor from 'tinymce/core/api/Editor';
import VersionPanel from '../ui/VersionPanel';

const getVersionPanel = function (editor: Editor): Types.Dialog.BodyComponentApi {
  return editor.getParam('help_version', VersionPanel.defaultPanel, 'function')();
};

export default {
  getVersionPanel,
};