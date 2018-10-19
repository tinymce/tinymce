import { Option, Type } from '@ephox/katamari';
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

const getHeightSetting = (editor): number => editor.getParam('height', Math.max(editor.getElement().offsetHeight, 200), 'number');
const getMinWidthSetting = (editor): Option<number> => Option.from(editor.settings.min_width).filter(Type.isNumber);
const getMinHeightSetting = (editor): Option<number> => Option.from(editor.settings.min_height).filter(Type.isNumber);
const getMaxWidthSetting = (editor): Option<number> => Option.from(editor.getParam('max_width')).filter(Type.isNumber);
const getMaxHeightSetting = (editor): Option<number> => Option.from(editor.getParam('max_height')).filter(Type.isNumber);

export { getSkinUrl, isSkinDisabled, getHeightSetting, getMinWidthSetting, getMinHeightSetting, getMaxWidthSetting, getMaxHeightSetting };
