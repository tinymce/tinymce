/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Attachment, Docking, Focusing } from '@ephox/alloy';
import { Obj, Option } from '@ephox/katamari';
import { Attr, Css, Element, Height, Location } from '@ephox/sugar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import { getToolbarDrawer, getUiContainer, ToolbarDrawer, useFixedContainer } from '../api/Settings';
import { UiFactoryBackstage } from '../backstage/Backstage';
import { setupReadonlyModeSwitch } from '../ReadOnly';
import { ModeRenderInfo, RenderArgs, RenderUiComponents, RenderUiConfig } from '../Render';
import OuterContainer from '../ui/general/OuterContainer';
import { identifyMenus } from '../ui/menus/menubar/Integration';
import { inline as loadInlineSkin } from './../ui/skin/Loader';
import { setToolbar } from './Toolbars';

interface Position {
  top: number;
  left: number;
}

const render = (editor: Editor, uiComponents: RenderUiComponents, rawUiConfig: RenderUiConfig, backstage: UiFactoryBackstage, args: RenderArgs): ModeRenderInfo => {
  let floatContainer;
  const DOM = DOMUtils.DOM;
  const useFixedToolbarContainer = useFixedContainer(editor);

  const splitSetting = getToolbarDrawer(editor);
  const split = splitSetting === ToolbarDrawer.sliding || splitSetting === ToolbarDrawer.floating;

  loadInlineSkin(editor);

  const calcPosition = (offset: number = 0): Position => {
    // Note: The float container/editor may not have been rendered yet, which will cause it to have a non integer based positions
    // so we need to round this to account for that.
    const location = Location.absolute(Element.fromDom(editor.getBody()));
    return {
      top: Math.round(location.top() - Height.get(floatContainer.element())) + offset,
      left: Math.round(location.left())
    };
  };

  const setChromePosition = (toolbar) => {
    const isDocked = Css.getRaw(floatContainer.element(), 'position').is('fixed');
    // We need to always recalculate the toolbar's position so Docking switches between fixed and
    // absolute correctly. Only recalculating when position: absolute breaks transition on window
    // resize behaviour (chrome gets stuck fixed to the top of the viewport).
    const offset = split ? toolbar.fold(() => 0, (tbar) => {
      // If we have an overflow toolbar, we need to offset the positioning by the height of the overflow toolbar
      return tbar.components().length > 1 ? Height.get(tbar.components()[1].element()) : 0;
    }) : 0;
    const position = calcPosition(offset);

    // If we're docked then we need to update the dock attributes instead, so that when it transitions back to absolute it has the correct position
    if (isDocked) {
      Attr.setAll(floatContainer.element(), Obj.tupleMap(position, (value, key) => ({ k: `data-dock-${key}`, v: value })));
    } else {
      Css.setAll(floatContainer.element(), Obj.map(position, (value) => value + 'px'));
    }

    // Let Docking handle fixed <-> absolute transitions, etc.
    Docking.refresh(floatContainer);
  };

  const updateChromeUi = () => {
    // Handles positioning, Docking and SplitToolbar (more drawer) behaviour. Modes:
    // 1. Basic inline: does positioning and Docking
    // 2. Inline + more drawer: does positioning, Docking and SplitToolbar
    // 3. Inline + fixed_toolbar_container: does nothing
    // 4. Inline + fixed_toolbar_container + more drawer: does SplitToolbar

    const toolbar = OuterContainer.getToolbar(uiComponents.outerContainer);

    // SplitToolbar
    if (split) {
      OuterContainer.refreshToolbar(uiComponents.outerContainer);
    }

    // Positioning and Docking
    if (!useFixedToolbarContainer) {
      setChromePosition(toolbar);
    }
  };

  const show = () => {
    Css.set(uiComponents.outerContainer.element(), 'display', 'flex');
    DOM.addClass(editor.getBody(), 'mce-edit-focus');
    Css.remove(uiComponents.uiMothership.element(), 'display');
    updateChromeUi();
  };

  const hide = () => {
    if (uiComponents.outerContainer) {
      Css.set(uiComponents.outerContainer.element(), 'display', 'none');
      DOM.removeClass(editor.getBody(), 'mce-edit-focus');
    }
    Css.set(uiComponents.uiMothership.element(), 'display', 'none');
  };

  const render = () => {
    if (floatContainer) {
      show();
      return;
    }

    floatContainer = uiComponents.outerContainer;

    const uiContainer = getUiContainer(editor);
    Attachment.attachSystem(uiContainer, uiComponents.mothership);
    Attachment.attachSystem(uiContainer, uiComponents.uiMothership);

    setToolbar(editor, uiComponents, rawUiConfig, backstage);

    OuterContainer.setMenubar(
      uiComponents.outerContainer,
      identifyMenus(editor, rawUiConfig)
    );

    if (!useFixedToolbarContainer) {
      // Do not set position if using fixed_toolbar_container
      Css.set(floatContainer.element(), 'position', 'absolute');
    }

    // Initialise the toolbar - set initial positioning then show
    updateChromeUi();
    show();

    editor.on('NodeChange ResizeWindow', updateChromeUi);
    editor.on('activate', show);
    editor.on('deactivate', hide);

    editor.nodeChanged();
  };

  editor.on('focus', render);
  editor.on('blur hide', hide);

  editor.on('init', () => {
    if (editor.hasFocus()) {
      render();
    }
  });

  setupReadonlyModeSwitch(editor, uiComponents);

  return {
    editorContainer: uiComponents.outerContainer.element().dom()
  };
};

const getBehaviours = (editor: Editor) => {
  return useFixedContainer(editor) ? [] : [
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