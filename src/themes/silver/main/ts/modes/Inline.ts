import { Attachment, Docking } from '@ephox/alloy';
import { Option } from '@ephox/katamari';
import { Body, Css, Element, Height, Location } from '@ephox/sugar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import { Editor } from 'tinymce/core/api/Editor';

import OuterContainer from '../ui/general/OuterContainer';
import { identifyMenus } from '../ui/menus/menubar/Integration';
import { identifyButtons } from '../ui/toolbar/Integration';
import { inline as loadInlineSkin } from './../ui/skin/Loader';

const render = (editor: Editor, uiComponents, rawUiConfig, backstage, targetNode) => {
  loadInlineSkin(editor);

  const floatContainer = uiComponents.outerContainer;
  const DOM = DOMUtils.DOM;

  Attachment.attachSystem(Body.body(), uiComponents.mothership);
  Attachment.attachSystem(Body.body(), uiComponents.uiMothership);

  const setPosition = function () {
    Css.setAll(floatContainer.element(), {
      position: 'absolute',
      top: Location.absolute(Element.fromDom(editor.getBody())).top() - Height.get(floatContainer.element()) + 'px',
      left: Location.absolute(Element.fromDom(editor.getBody())).left() + 'px'
    });
  };

  editor.on('init', () => {
    OuterContainer.setToolbar(
      uiComponents.outerContainer,
      identifyButtons(editor, rawUiConfig, {backstage})
    );

    OuterContainer.setMenubar(
      uiComponents.outerContainer,
      identifyMenus(editor, rawUiConfig, backstage)
    );

    setPosition();
  });

  const show = function () {
    Css.set(uiComponents.outerContainer.element(), 'display', 'flex');
    DOM.addClass(editor.getBody(), 'mce-edit-focus');
    setPosition();
    Docking.refresh(floatContainer);
  };

  const hide = function () {
    if (uiComponents.outerContainer) {
      Css.set(uiComponents.outerContainer.element(), 'display', 'none');
      DOM.removeClass(editor.getBody(), 'mce-edit-focus');
    }
  };

  editor.on('ResizeWindow', setPosition);
  editor.on('activate focus', show);
  editor.on('deactivate blur hide', hide);

  return { };
};

const getBehaviours = (editor) => {
  return [
    Docking.config({
      leftAttr: 'data-dock-left',
      topAttr: 'data-dock-top',
      contextual: {
        lazyContext (_) {
          return Option.from(editor).map((ed) => Element.fromDom(ed.getBody()));
        },
        fadeInClass: 'tox-toolbar-dock-fadein',
        fadeOutClass: 'tox-toolbar-dock-fadeout',
        transitionClass: 'tox-toolbar-dock-transition'
      }
    })
  ];
};

export default { render, getBehaviours };