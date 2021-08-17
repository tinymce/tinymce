/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

export interface UserEmojiEntry {
  readonly keywords?: string[];
  readonly char: string;
  readonly category?: string;
}

const DEFAULT_ID = 'tinymce.plugins.emoticons';

const getEmoticonDatabase = (editor: Editor): string =>
  editor.getParam('emoticons_database', 'emojis', 'string');

const getEmoticonDatabaseUrl = (editor: Editor, pluginUrl: string): string => {
  const database = getEmoticonDatabase(editor);
  return editor.getParam('emoticons_database_url', `${pluginUrl}/js/${database}${editor.suffix}.js`, 'string');
};

const getEmoticonDatabaseId = (editor: Editor): string =>
  editor.getParam('emoticons_database_id', DEFAULT_ID, 'string');

const getAppendedEmoticons = (editor: Editor): Record<string, UserEmojiEntry> =>
  editor.getParam('emoticons_append', {}, 'object');

const getEmotionsImageUrl = (editor: Editor): string =>
  editor.getParam('emoticons_images_url', 'https://twemoji.maxcdn.com/v/13.0.1/72x72/', 'string');

export {
  getEmoticonDatabase,
  getEmoticonDatabaseUrl,
  getEmoticonDatabaseId,
  getAppendedEmoticons,
  getEmotionsImageUrl
};
