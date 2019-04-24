import Editor from 'tinymce/core/api/Editor';
import Settings from './Settings';

const get = (editor: Editor) => {
  const addTabs = (newTabs) => {
    const tabs = Settings.getExtraTabs(editor);
    Settings.setExtraTabs(editor, tabs.concat(newTabs));
  };

  return {
    addTabs
  };
};

export {
  get
};