import { Editor } from './EditorTypes';

const get = <R>(editor: Editor, name: string): R => {
  if (editor.options) {
    return editor.options.get(name);
  } else {
    return editor.getParam(name);
  }
};

const set = <T>(editor: Editor, name: string, value: T): void => {
  if (editor.options) {
    editor.options.set(name, value);
  } else if (editor.settings) {
    editor.settings[name] = value;
  }
};

const unset = (editor: Editor, name: string): void => {
  if (editor.options) {
    editor.options.unset(name);
  } else if (editor.settings) {
    delete editor.settings[name];
  }
};

export {
  get,
  set,
  unset
};
