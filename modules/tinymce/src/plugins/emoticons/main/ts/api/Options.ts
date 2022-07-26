import Editor from 'tinymce/core/api/Editor';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';

export interface UserEmojiEntry {
  readonly keywords?: string[];
  readonly char: string;
  readonly category?: string;
}

const DEFAULT_ID = 'tinymce.plugins.emoticons';

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K];
  <T>(name: string): (editor: Editor) => T;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const register = (editor: Editor, pluginUrl: string): void => {
  const registerOption = editor.options.register;

  registerOption('emoticons_database', {
    processor: 'string',
    default: 'emojis'
  });

  registerOption('emoticons_database_url', {
    processor: 'string',
    default: `${pluginUrl}/js/${getEmojiDatabase(editor)}${editor.suffix}.js`
  });

  registerOption('emoticons_database_id', {
    processor: 'string',
    default: DEFAULT_ID
  });

  registerOption('emoticons_append', {
    processor: 'object',
    default: {}
  });

  registerOption('emoticons_images_url', {
    processor: 'string',
    default: 'https://twemoji.maxcdn.com/v/13.0.1/72x72/'
  });
};

const getEmojiDatabase = option<string>('emoticons_database');
const getEmojiDatabaseUrl = option<string>('emoticons_database_url');
const getEmojiDatabaseId = option<string>('emoticons_database_id');
const getAppendedEmoji = option<Record<string, UserEmojiEntry>>('emoticons_append');
const getEmojiImageUrl = option('emoticons_images_url');

export {
  register,
  getEmojiDatabase,
  getEmojiDatabaseUrl,
  getEmojiDatabaseId,
  getAppendedEmoji,
  getEmojiImageUrl
};
