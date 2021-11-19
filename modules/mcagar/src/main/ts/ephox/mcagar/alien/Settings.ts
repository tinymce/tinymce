import { Editor } from './EditorTypes';

const getSetting = <R>(editor: Editor, name: string): R => {
  if (editor.options) {
    return editor.options.get(name);
  } else {
    return editor.getParam(name);
  }
};

const setSetting = <T>(editor: Editor, name: string, value: T): void => {
  if (editor.options) {
    editor.options.set(name, value);
  } else {
    editor.settings[name] = value;
  }
};

const deleteSetting = (editor: Editor, name: string): void => {
  if (editor.options) {
    editor.options.unset(name);
  } else {
    delete editor.settings[name];
  }
};

export {
  getSetting,
  setSetting,
  deleteSetting
};
