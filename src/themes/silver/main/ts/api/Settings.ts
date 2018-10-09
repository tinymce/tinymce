import { Option } from '@ephox/katamari';
import { Editor } from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
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

const defaultMinEditorSize = 150;
const getMinWidthSetting = (editor): number => editor.getParam('min_width', defaultMinEditorSize, 'number');
const getMinHeightSetting = (editor): number => editor.getParam('min_height', defaultMinEditorSize, 'number');
const getOptMaxWidthSetting = (editor): Option<number> => Option.from(editor.getParam('max_width'));
const getOptMaxHeightSetting = (editor): Option<number> => Option.from(editor.getParam('max_height'));

export { getSkinUrl, isSkinDisabled, defaultMinEditorSize, getMinWidthSetting, getMinHeightSetting, getOptMaxWidthSetting, getOptMaxHeightSetting };
