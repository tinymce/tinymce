import Editor from './api/Editor';
import { fireError } from './api/Events';
import I18n from './api/util/I18n';

const displayNotification = (editor: Editor, message: string) => {
  editor.notificationManager.open({
    type: 'error',
    text: message
  });
};

const displayError = (editor: Editor, message: string): void => {
  if (editor._skinLoaded) {
    displayNotification(editor, message);
  } else {
    editor.on('SkinLoaded', () => {
      displayNotification(editor, message);
    });
  }
};

const uploadError = (editor: Editor, message: string): void => {
  displayError(editor, I18n.translate([ 'Failed to upload image: {0}', message ]));
};

const logError = (editor: Editor, errorType: string, msg: string): void => {
  fireError(editor, errorType, { message: msg });
  // eslint-disable-next-line no-console
  console.error(msg);
};

const createLoadError = (type: string, url: string, name?: string): string => name ?
  `Failed to load ${type}: ${name} from url ${url}` :
  `Failed to load ${type} url: ${url}`;

const pluginLoadError = (editor: Editor, url: string, name?: string): void => {
  logError(editor, 'PluginLoadError', createLoadError('plugin', url, name));
};

const iconsLoadError = (editor: Editor, url: string, name?: string): void => {
  logError(editor, 'IconsLoadError', createLoadError('icons', url, name));
};

const languageLoadError = (editor: Editor, url: string, name: string): void => {
  logError(editor, 'LanguageLoadError', createLoadError('language', url, name));
};

const themeLoadError = (editor: Editor, url: string, name: string): void => {
  logError(editor, 'ThemeLoadError', createLoadError('theme', url, name));
};

const modelLoadError = (editor: Editor, url: string, name: string): void => {
  logError(editor, 'ModelLoadError', createLoadError('model', url, name));
};

const pluginInitError = (editor: Editor, name: string, err: any): void => {
  const message = I18n.translate([ 'Failed to initialize plugin: {0}', name ]);
  fireError(editor, 'PluginLoadError', { message });
  initError(message, err);
  displayError(editor, message);
};

const initError = (message: string, ...x: any[]): void => {
  const console = window.console;
  if (console) { // Skip test env
    if (console.error) {
      console.error(message, ...x);
    } else {
      console.log(message, ...x);
    }
  }
};

export {
  pluginLoadError,
  iconsLoadError,
  languageLoadError,
  themeLoadError,
  modelLoadError,
  pluginInitError,
  uploadError,
  displayError,
  initError
};
