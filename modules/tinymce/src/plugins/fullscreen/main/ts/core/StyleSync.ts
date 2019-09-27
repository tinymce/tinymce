import { window } from '@ephox/dom-globals';
import { Attr, Css, Element, Class } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { SugarElement } from 'tinymce/themes/mobile/alien/TypeDefinitions';

const attr = 'mce-touch-fullscreen-style';

const backupstyles = (element: SugarElement) => {
  const styles = Attr.get(element, 'style');
  const backup = styles === undefined ? 'no-styles' : styles.trim();
  Attr.set(element, attr, backup);
};

const setStyles = (element: SugarElement, value) => {
  Css.setAll(element, {
    'background-color': value,
    'padding': '100px 0'
  });
};

const styleSync = (editor: Editor) => {
  const contentBody = Element.fromDom(editor.getBody());
  const contentBgColor = Css.get(contentBody, 'background-color');

  // const docBody = Element.fromDom(window.document.body);
  // backupstyles(docBody);
  // setStyles(docBody, contentBgColor);

  const docElement = Element.fromDom(window.document.documentElement);
  backupstyles(docElement);
  setStyles(docElement, contentBgColor);

};

const onTouchMove = (e) => {
  if (Class.has(e.target(), 'tox-statusbar__path')) {
    e.prevent();
  }
};

export { styleSync, onTouchMove };
