import { Attachment, Docking, Focusing } from '@ephox/alloy';
import { Option } from '@ephox/katamari';
import { Body, Css, Element, Height, Location } from '@ephox/sugar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import { Editor } from 'tinymce/core/api/Editor';

import OuterContainer from '../ui/general/OuterContainer';
import { identifyMenus } from '../ui/menus/menubar/Integration';
import { identifyButtons } from '../ui/toolbar/Integration';
import { inline as loadInlineSkin } from './../ui/skin/Loader';
import { RenderUiComponents, RenderUiConfig, RenderArgs, ModeRenderInfo } from '../Render';
import { UiFactoryBackstage } from '../backstage/Backstage';

const render = (editor: Editor, uiComponents: RenderUiComponents, rawUiConfig: RenderUiConfig, backstage: UiFactoryBackstage, args: RenderArgs): ModeRenderInfo => {
  let floatContainer;
  const DOM = DOMUtils.DOM;

  loadInlineSkin(editor);

  const setPosition = function () {
    Css.setAll(floatContainer.element(), {
      position: 'absolute',
      top: Location.absolute(Element.fromDom(editor.getBody())).top() - Height.get(floatContainer.element()) + 'px',
      left: Location.absolute(Element.fromDom(editor.getBody())).left() + 'px'
    });
  };

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

  const render = () => {
    if (floatContainer) {
      show();
      return;
    }

    floatContainer = uiComponents.outerContainer;

    Attachment.attachSystem(Body.body(), uiComponents.mothership);
    Attachment.attachSystem(Body.body(), uiComponents.uiMothership);

    OuterContainer.setToolbar(
      uiComponents.outerContainer,
      identifyButtons(editor, rawUiConfig, {backstage})
    );

    OuterContainer.setMenubar(
      uiComponents.outerContainer,
      identifyMenus(editor, rawUiConfig, backstage)
    );

    setPosition();
    show();

    editor.on('nodeChange ResizeWindow', setPosition);
    editor.on('activate', show);
    editor.on('deactivate', hide);

    editor.nodeChanged();
  };

  editor.on('focus', render);
  editor.on('blur hide', hide);

  return {
    editorContainer: uiComponents.outerContainer.element().dom()
  };
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
    }),
    Focusing.config({ })
  ];
};

export default { render, getBehaviours };