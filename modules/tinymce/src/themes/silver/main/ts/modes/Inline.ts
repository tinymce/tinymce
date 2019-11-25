/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, Attachment, Docking } from '@ephox/alloy';
import { Option } from '@ephox/katamari';
import { Body, Css, Element, Height, Location, Width } from '@ephox/sugar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import { getMaxWidthSetting, getToolbarDrawer, getUiContainer, isStickyToolbar, ToolbarDrawer, useFixedContainer } from '../api/Settings';
import { UiFactoryBackstage } from '../backstage/Backstage';
import { setupReadonlyModeSwitch } from '../ReadOnly';
import { ModeRenderInfo, RenderArgs, RenderUiComponents, RenderUiConfig } from '../Render';
import OuterContainer from '../ui/general/OuterContainer';
import { identifyMenus } from '../ui/menus/menubar/Integration';
import * as EditorSize from '../ui/sizing/EditorSize';
import Utils from '../ui/sizing/Utils';
import { inline as loadInlineSkin } from './../ui/skin/Loader';
import { setToolbar } from './Toolbars';

const render = (editor: Editor, uiComponents: RenderUiComponents, rawUiConfig: RenderUiConfig, backstage: UiFactoryBackstage, args: RenderArgs): ModeRenderInfo => {
  let floatContainer;
  const DOM = DOMUtils.DOM;
  const useFixedToolbarContainer = useFixedContainer(editor);
  const isSticky = isStickyToolbar(editor);
  const targetElm = Element.fromDom(args.targetNode);
  const editorMaxWidthOpt = getMaxWidthSetting(editor).or(EditorSize.getWidth(editor));

  const splitSetting = getToolbarDrawer(editor);
  const split = splitSetting === ToolbarDrawer.sliding || splitSetting === ToolbarDrawer.floating;

  loadInlineSkin(editor);

  const updateChromePosition = (toolbar: Option<AlloyComponent>) => {
    // Calculate the toolbar offset when using a split toolbar drawer
    const offset = split ? toolbar.fold(() => 0, (tbar) => {
      // If we have an overflow toolbar, we need to offset the positioning by the height of the overflow toolbar
      return tbar.components().length > 1 ? Height.get(tbar.components()[1].element()) : 0;
    }) : 0;

    // The float container/editor may not have been rendered yet, which will cause it to have a non integer based positions
    // so we need to round this to account for that.
    const location = Location.absolute(targetElm);
    const top = location.top() - Height.get(floatContainer.element()) + offset;
    Css.setAll(uiComponents.outerContainer.element(), {
      position: 'absolute',
      top: Math.round(top) + 'px',
      left: Math.round(location.left()) + 'px'
    });

    // Update the max width of the inline toolbar
    const maxWidth = editorMaxWidthOpt.getOrThunk(() => {
      // No max width, so use the body width, minus the left pos as the maximum
      const bodyMargin = Utils.parseToInt(Css.get(Body.body(), 'margin-left')).getOr(0);
      return Width.get(Body.body()) - location.left() + bodyMargin;
    });
    Css.set(floatContainer.element(), 'max-width', maxWidth + 'px');
  };

  const updateChromeUi = (resetDocking: boolean = false) => {
    // Handles positioning, docking and SplitToolbar (more drawer) behaviour. Modes:
    // 1. Basic inline: does positioning and docking
    // 2. Inline + more drawer: does positioning, docking and SplitToolbar
    // 3. Inline + fixed_toolbar_container: does nothing
    // 4. Inline + fixed_toolbar_container + more drawer: does SplitToolbar

    // Refresh split toolbar
    if (split) {
      OuterContainer.refreshToolbar(uiComponents.outerContainer);
    }

    // Positioning
    if (!useFixedToolbarContainer) {
      const toolbar = OuterContainer.getToolbar(uiComponents.outerContainer);
      updateChromePosition(toolbar);
    }

    // Docking
    if (isSticky) {
      resetDocking ? Docking.reset(floatContainer) : Docking.refresh(floatContainer);
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

    floatContainer = OuterContainer.getHeader(uiComponents.outerContainer).getOrDie();

    const uiContainer = getUiContainer(editor);
    Attachment.attachSystem(uiContainer, uiComponents.mothership);
    Attachment.attachSystem(uiContainer, uiComponents.uiMothership);

    setToolbar(editor, uiComponents, rawUiConfig, backstage);

    OuterContainer.setMenubar(
      uiComponents.outerContainer,
      identifyMenus(editor, rawUiConfig)
    );

    // Initialise the toolbar - set initial positioning then show
    show();

    editor.on('activate', show);
    editor.on('deactivate', hide);

    editor.on('NodeChange SkinLoaded ResizeWindow', () => {
      if (!editor.hidden) {
        updateChromeUi(true);
      }
    });

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

export default { render };
