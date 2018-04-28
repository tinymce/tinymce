import { Objects } from '@ephox/boulder';
import EditorManager from 'tinymce/core/api/EditorManager';

const derive = function (editor) {
  const base = Objects.readOptFrom(editor.settings, 'skin_url').fold(function () {
    return EditorManager.baseURL + '/skins/' + 'lightgray';
  }, function (url) {
    return url;
  });

  return {
    content: base + '/content.mobile.min.css',
    ui: base + '/skin.mobile.min.css'
  };
};

export default {
  derive
};