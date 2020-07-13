/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const DEFAULT_ID = 'tinymce.plugins.emoticons';

const getSetting = <T>(name: string, defaultValue?: T, type?: string) => (editor: Editor): T =>
  editor.getParam(name, defaultValue, type);

const getEmoticonDatabaseUrl = (editor: Editor, pluginUrl: string): string => editor.getParam('emoticons_database_url', `${pluginUrl}/js/emojis${editor.suffix}.js`);

const getEmoticonDatabaseId = getSetting('emoticons_database_id', DEFAULT_ID, 'string');

const getAppendedEmoticons = getSetting<Record<string, any>>('emoticons_append', {}, 'object');

export {
  getEmoticonDatabaseUrl,
  getEmoticonDatabaseId,
  getAppendedEmoticons
};
