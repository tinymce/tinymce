/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

type CustomCharMap = [number, string][] | (() => [number, string][]);

const getSetting = <T>(name: string, defaultValue?: T, type?: string) => (editor: Editor): T =>
  editor.getParam(name, defaultValue, type);

const getCharMap = getSetting<CustomCharMap>('charmap');

const getCharMapAppend = getSetting<CustomCharMap>('charmap_append');

export {
  getCharMap,
  getCharMapAppend
};
