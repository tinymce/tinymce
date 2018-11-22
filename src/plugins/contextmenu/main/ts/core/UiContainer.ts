/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import { Editor } from 'tinymce/core/api/Editor';
import { HTMLElement } from '@ephox/dom-globals';

const getUiContainer = (editor: Editor): HTMLElement => {
  return DOMUtils.DOM.select(editor.settings.ui_container)[0];
};

export {
  getUiContainer
};
