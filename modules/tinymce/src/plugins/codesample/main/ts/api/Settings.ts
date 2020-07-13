/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const getSetting = <T>(name: string, defaultValue?: T, type?: string) => (editor: Editor): T =>
  editor.getParam(name, defaultValue, type);

const getLanguages = getSetting<{ text: string; value: string}[]>('codesample_languages');

const useGlobalPrismJS = getSetting('codesample_global_prismjs', false, 'boolean');

export {
  getLanguages,
  useGlobalPrismJS
};
