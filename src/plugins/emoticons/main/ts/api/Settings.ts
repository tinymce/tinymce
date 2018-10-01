import { Editor } from 'tinymce/core/api/Editor';

const getEmoticonDatabaseUrl = function (editor: Editor, pluginUrl: string): string {
  return editor.getParam('emoticons_database_url', `${pluginUrl}/json/emojis.js`);
};

export default {
  getEmoticonDatabaseUrl
};