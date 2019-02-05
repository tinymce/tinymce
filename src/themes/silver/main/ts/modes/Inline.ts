/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

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

  const setPosition = () => {
    const isDocked = Css.getRaw(floatContainer.element(), 'position').is('fixed');
    if (!isDocked) {
      // We need to update the toolbar location if the window has resized while the toolbar is position absolute
      // Not sure if we should always set this, or if it's worth checking against the current position
      Css.setAll(floatContainer.element(), {
        top: Location.absolute(Element.fromDom(editor.getBody())).top() - Height.get(floatContainer.element()) + 'px',
        left: Location.absolute(Element.fromDom(editor.getBody())).left() + 'px'
      });
    }
    // Let docking handle fixed <-> absolute transitions, etc.
    Docking.refresh(floatContainer);
  };

  const show = () => {
    Css.set(uiComponents.outerContainer.element(), 'display', 'flex');
    DOM.addClass(editor.getBody(), 'mce-edit-focus');
    setPosition();
    Docking.refresh(floatContainer);
  };

  const hide = () => {
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
      identifyMenus(editor, rawUiConfig)
    );

    // initialise the toolbar - initial positioning, refresh docking, then show
    Css.setAll(floatContainer.element(), {
      position: 'absolute',
      top: Location.absolute(Element.fromDom(editor.getBody())).top() - Height.get(floatContainer.element()) + 'px',
      left: Location.absolute(Element.fromDom(editor.getBody())).left() + 'px'
    });
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

const getBehaviours = (editor: Editor) => {
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