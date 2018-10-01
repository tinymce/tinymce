import EditorManager from 'tinymce/core/api/EditorManager';
import { Editor } from 'tinymce/core/api/Editor';

const getSkinUrl = function (editor: Editor): string {
  const settings = editor.settings;
  const skin = settings.skin;
  let skinUrl = settings.skin_url;

  if (skin !== false) {
    const skinName = skin ? skin : 'oxide';

    if (skinUrl) {
      skinUrl = editor.documentBaseURI.toAbsolute(skinUrl);
    } else {
      skinUrl = EditorManager.baseURL + '/skins/' + skinName;
    }
  }

  return skinUrl;
};

const isSkinDisabled = function (editor: Editor) {
  return editor.settings.skin === false;
};

export {
  getSkinUrl,
  isSkinDisabled
};