import { getSkinUrl, isSkinDisabled } from '../../api/Settings';
import { Editor } from 'tinymce/core/api/Editor';
import SkinLoaded from './SkinLoaded';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import { Fun } from '@ephox/katamari';

const loadSkin = (isInline: boolean, editor: Editor, args) => {
  const skinUrl = getSkinUrl(editor);
  if (skinUrl) {
    args.skinUiCss = skinUrl + '/skin.min.css';
    editor.contentCSS.push(skinUrl + (isInline ? '/content.inline' : '/content') + '.min.css');
  }

  // In Modern Inline, this is explicitly called in editor.on('focus', ...) as well as in render().
  // Seems to work without, but adding a note in case things break later
  if (isSkinDisabled(editor) === false && args.skinUiCss) {
    DOMUtils.DOM.styleSheetLoader.load(args.skinUiCss, SkinLoaded.fireSkinLoaded(editor));
  } else {
    SkinLoaded.fireSkinLoaded(editor)();
  }
};

const iframe = Fun.curry(loadSkin, false);
const inline = Fun.curry(loadSkin, true);

export {
  iframe,
  inline
};