/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

import { LanguageSpec } from '../core/Languages';

const getLanguages = (editor: Editor): LanguageSpec[] | undefined =>
  editor.getParam('codesample_languages');

const useGlobalPrismJS = (editor: Editor): boolean =>
  editor.getParam('codesample_global_prismjs', false, 'boolean');

export {
  getLanguages,
  useGlobalPrismJS
};
